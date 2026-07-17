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
    const wvalid = waveform.signals.find(s => s.name === 'WVALID');
    const wready = waveform.signals.find(s => s.name === 'WREADY');
    const wlast = waveform.signals.find(s => s.name === 'WLAST');
    
    if (wvalid && wready && wlast) {
      let beatCount = 0;
      const totalBeats = 4;
      
      for (let i = 0; i < cycleCount; i++) {
        // Evaluate WLAST only on valid handshakes for simplicity
        if (wvalid.values[i] === '1' && wready.values[i] === '1') {
          triggerCount++;
          beatCount++;
          if (beatCount < totalBeats && wlast.values[i] === '1') {
            violations.push({
              cycle: i + 1,
              message: `WLAST is asserted early. This is beat ${beatCount}, but the burst requires ${totalBeats} beats.`
            });
          } else if (beatCount === totalBeats && wlast.values[i] !== '1') {
            violations.push({
              cycle: i + 1,
              message: `WLAST must be asserted on the final beat (${totalBeats}) of the burst.`
            });
          } else if (beatCount > totalBeats && wlast.values[i] === '1') {
            violations.push({
              cycle: i + 1,
              message: `WLAST asserted after burst completion. Burst already reached ${totalBeats} beats.`
            });
          }
        }
      }
      completedCount = triggerCount;
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
  const hasViolations = evaluation.violations.length > 0;
  const statusText = !isAhbContract
    ? (hasViolations ? 'FAIL (Property Violation)' : 'PASS (Property Holds)')
    : hasViolations
      ? 'FAIL (Configured Service-Contract Violation)'
      : evaluation.pendingCount > 0
        ? 'INCONCLUSIVE (Completion Window Extends Beyond Trace)'
        : evaluation.triggerCount === 0
          ? 'NOT TRIGGERED (No Accepted Address Phase)'
          : evaluation.cancelledCount > 0 && evaluation.completedCount === 0
            ? 'PASS (Obligation Cancelled by Reset)'
            : 'PASS (Configured Contract Holds)';

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
