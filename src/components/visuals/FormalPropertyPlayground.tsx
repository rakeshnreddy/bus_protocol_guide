import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormalPropertyData, WaveformVisualData } from '../../types/visuals';
import WaveformVisualizer from './WaveformVisualizer';
import './visuals.css';

type FormalEvaluation = {
  violations: NonNullable<WaveformVisualData['violations']>;
  triggerCount: number;
  completedCount: number;
  cancelledCount: number;
  pendingCount: number;
};

type AxiWriteContext = {
  acceptedCycle: number;
  awlen: number;
  expectedBeats: number;
  id: string;
  receivedBeats: number;
};

type AcceptedWriteBeat = {
  cycle: number;
  last: boolean;
};

function parseAwlen(value: string | undefined): number | null {
  if (!value || value === '-' || value === 'INV') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 255 ? parsed : null;
}

// Lightweight, deterministic evaluator for formal-property teaching traces.
export function evaluateFormalProperty(waveform: WaveformVisualData, rule: string): FormalEvaluation {
  const violations: NonNullable<WaveformVisualData['violations']> = [];
  const cycleCount = waveform.cycleCount;
  let triggerCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  let pendingCount = 0;

  if (rule === 'ahb-hready-bounded-liveness') {
    const htrans = waveform.signals.find(s => s.name === 'HTRANS');
    const hready = waveform.signals.find(s => s.name === 'HREADY');
    const hresetn = waveform.signals.find(s => s.name === 'HRESETn');
    
    if (htrans && hready) {
      for (let i = 0; i < cycleCount; i++) {
        const validAddress = htrans.values[i] === 'NONSEQ' || htrans.values[i] === 'SEQ';
        const resetActive = hresetn?.values[i] === '0';
        const acceptedAddress = validAddress && hready.values[i] === '1' && !resetActive;
        if (acceptedAddress) {
          triggerCount++;
          const finalWindowIndex = i + 4;
          let completed = false;
          let cancelled = false;

          // The accepted address enters its data phase on the following cycle.
          // Same-cycle HREADY completed the prior data owner and cannot satisfy it.
          for (let j = i + 1; j <= Math.min(finalWindowIndex, cycleCount - 1); j++) {
            if (hresetn?.values[j] === '0') {
              cancelled = true;
              break;
            }
            if (hready.values[j] === '1') {
              completed = true;
              break;
            }
          }

          if (cancelled) {
            cancelledCount++;
          } else if (completed) {
            completedCount++;
          } else if (finalWindowIndex >= cycleCount) {
            pendingCount++;
          } else {
            violations.push({
              cycle: finalWindowIndex + 1,
              message: `Configured service contract failed: the address accepted at cycle ${i + 1} did not complete in following data-phase cycles ${i + 2}-${finalWindowIndex + 1}.`
            });
          }
        }
      }
    }
  } else if (rule === 'axi-wlast-exact') {
    const awvalid = waveform.signals.find(s => s.name === 'AWVALID');
    const awready = waveform.signals.find(s => s.name === 'AWREADY');
    const awlen = waveform.signals.find(s => s.name === 'AWLEN');
    const awid = waveform.signals.find(s => s.name === 'AWID');
    const wvalid = waveform.signals.find(s => s.name === 'WVALID');
    const wready = waveform.signals.find(s => s.name === 'WREADY');
    const wlast = waveform.signals.find(s => s.name === 'WLAST');

    if (awvalid && awready && awlen && wvalid && wready && wlast) {
      const acceptedAwQueue: AxiWriteContext[] = [];
      const bufferedWQueue: AcceptedWriteBeat[] = [];

      const associateAcceptedWriteData = () => {
        while (acceptedAwQueue.length > 0 && bufferedWQueue.length > 0) {
          const context = acceptedAwQueue[0];
          const beat = bufferedWQueue.shift();
          if (!context || !beat) break;

          context.receivedBeats += 1;
          const isExpectedLast = context.receivedBeats === context.expectedBeats;
          const contextLabel = `AWID ${context.id}, accepted at cycle ${context.acceptedCycle}, AWLEN=${context.awlen}`;

          if (beat.last && !isExpectedLast) {
            violations.push({
              cycle: beat.cycle,
              message: `WLAST is asserted early for ${contextLabel}. This is accepted beat ${context.receivedBeats} of ${context.expectedBeats}.`,
            });
          } else if (!beat.last && isExpectedLast) {
            violations.push({
              cycle: beat.cycle,
              message: `WLAST is missing on accepted beat ${context.expectedBeats} of ${contextLabel}.`,
            });
          }

          if (isExpectedLast) {
            acceptedAwQueue.shift();
            completedCount += 1;
          }
        }
      };

      for (let i = 0; i < cycleCount; i++) {
        if (awvalid.values[i] === '1' && awready.values[i] === '1') {
          triggerCount += 1;
          const parsedAwlen = parseAwlen(awlen.values[i]);

          if (parsedAwlen === null) {
            violations.push({
              cycle: i + 1,
              message: 'An accepted AW transfer needs a numeric AWLEN so its write-data obligation can be evaluated.',
            });
          } else {
            acceptedAwQueue.push({
              acceptedCycle: i + 1,
              awlen: parsedAwlen,
              expectedBeats: parsedAwlen + 1,
              id: awid?.values[i] && !['-', 'INV'].includes(awid.values[i]) ? awid.values[i] : 'untracked',
              receivedBeats: 0,
            });
          }
        }

        if (wvalid.values[i] === '1' && wready.values[i] === '1') {
          bufferedWQueue.push({ cycle: i + 1, last: wlast.values[i] === '1' });
        }

        // AXI4 write data follows accepted write-address order. A subordinate can
        // accept W before AW only if it buffers the beat until this association
        // context exists, which this queue models explicitly.
        associateAcceptedWriteData();
      }

      pendingCount = acceptedAwQueue.length + (bufferedWQueue.length > 0 ? 1 : 0);
    }
  }

  return { violations, triggerCount, completedCount, cancelledCount, pendingCount };
}

export default function FormalPropertyPlayground({ data }: { data: FormalPropertyData }) {
  const [signals, setSignals] = useState(() => data.waveform.signals);

  useEffect(() => {
    setSignals(data.waveform.signals);
  }, [data.waveform]);

  const waveformForEvaluation = useMemo<WaveformVisualData>(
    () => ({ ...data.waveform, signals }),
    [data.waveform, signals],
  );
  const evaluation = useMemo(
    () => evaluateFormalProperty(waveformForEvaluation, data.property.evaluatorRule),
    [data.property.evaluatorRule, waveformForEvaluation],
  );
  const currentWaveform = useMemo<WaveformVisualData>(
    () => ({ ...waveformForEvaluation, violations: evaluation.violations }),
    [evaluation.violations, waveformForEvaluation],
  );

  const handleSignalClick = useCallback((signalName: string, cycle: number) => {
    if (!data.editableSignals.includes(signalName)) {
      return;
    }

    const cycleIndex = cycle - 1;
    setSignals(currentSignals => currentSignals.map(sig => {
      if (sig.name !== signalName) return sig;
      const newValues = [...sig.values];
      const currentVal = newValues[cycleIndex];
      if (currentVal === '0') newValues[cycleIndex] = '1';
      else if (currentVal === '1') newValues[cycleIndex] = '0';
      return { ...sig, values: newValues };
    }));
  }, [data.editableSignals]);

  const handleReset = () => {
    setSignals(data.waveform.signals);
  };

  const isAhbContract = data.property.evaluatorRule === 'ahb-hready-bounded-liveness';
  const isAxiWlastContract = data.property.evaluatorRule === 'axi-wlast-exact';
  const hasViolations = evaluation.violations.length > 0;
  const statusText = isAhbContract
    ? hasViolations
      ? 'FAIL (Configured Service-Contract Violation)'
      : evaluation.pendingCount > 0
        ? 'INCONCLUSIVE (Completion Window Extends Beyond Trace)'
        : evaluation.triggerCount === 0
          ? 'NOT TRIGGERED (No Accepted Address Phase)'
          : evaluation.cancelledCount > 0 && evaluation.completedCount === 0
            ? 'PASS (Obligation Cancelled by Reset)'
            : 'PASS (Configured Contract Holds)'
    : isAxiWlastContract
      ? hasViolations
        ? 'FAIL (Property Violation)'
        : evaluation.pendingCount > 0
          ? 'INCONCLUSIVE (Write Association or Burst Is Incomplete)'
          : evaluation.triggerCount === 0
            ? 'NOT TRIGGERED (No Accepted Write Address)'
            : 'PASS (Property Holds)'
      : hasViolations ? 'FAIL (Property Violation)' : 'PASS (Property Holds)';

  return (
    <div className="formal-playground-container">
      <div className="formal-property-header">
        <h2 className="formal-property-title">{data.title}</h2>
        {data.description && <p className="visual-description">{data.description}</p>}
        <div className="formal-property-sva">
          <code>{data.property.svaString}</code>
        </div>
        <p className="formal-property-desc">{data.property.description}</p>
        <div className={`formal-property-status ${hasViolations ? 'has-violations' : 'holds'}`} role="status" aria-live="polite">
          <strong>Status: </strong>
          <span className={hasViolations ? 'status-fail' : 'status-pass'}>{statusText}</span>
        </div>
        <div className="formal-property-controls">
          <button 
            className="exercise-btn" 
            onClick={handleReset}
          >
            Reset to Original
          </button>
          <span className="hint-text">
            Click cells on editable signals (<strong>{data.editableSignals.join(', ')}</strong>) to toggle their values.
          </span>
        </div>
      </div>
      
      <WaveformVisualizer 
        data={currentWaveform} 
        onSignalClick={handleSignalClick} 
      />
    </div>
  );
}
