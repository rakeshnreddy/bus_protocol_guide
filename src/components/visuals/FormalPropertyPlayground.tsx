import { useState, useEffect, useCallback } from 'react';
import type { FormalPropertyData, WaveformVisualData } from '../../types/visuals';
import WaveformVisualizer from './WaveformVisualizer';
import './visuals.css';

// Lightweight, deterministic evaluator for formal properties
function evaluateFormalProperty(waveform: WaveformVisualData, rule: string): WaveformVisualData['violations'] {
  const violations: NonNullable<WaveformVisualData['violations']> = [];
  const cycleCount = waveform.cycleCount;

  if (rule === 'ahb-hready-bounded-liveness') {
    const htrans = waveform.signals.find(s => s.name === 'HTRANS');
    const hready = waveform.signals.find(s => s.name === 'HREADY');
    
    if (htrans && hready) {
      for (let i = 0; i < cycleCount; i++) {
        if (htrans.values[i] === 'NONSEQ') {
          let foundHigh = false;
          // Look ahead up to 4 cycles (i to i+4)
          for (let j = i; j <= Math.min(i + 4, cycleCount - 1); j++) {
            if (hready.values[j] === '1') {
              foundHigh = true;
              break;
            }
          }
          if (!foundHigh) {
            // Mark the cycle where the bound expires or waveform ends
            const endCycle = Math.min(i + 4, cycleCount - 1) + 1;
            violations.push({
              cycle: endCycle,
              message: `Configured completion contract failed: HREADY did not go high within 4 cycles of the NONSEQ transfer that started at cycle ${i + 1}.`
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
    }
  }

  return violations;
}

export default function FormalPropertyPlayground({ data }: { data: FormalPropertyData }) {
  const [currentWaveform, setCurrentWaveform] = useState<WaveformVisualData>(data.waveform);

  // Evaluate whenever the waveform data changes
  const evaluateAndSetWaveform = useCallback((waveform: WaveformVisualData) => {
    const violations = evaluateFormalProperty(waveform, data.property.evaluatorRule);
    setCurrentWaveform({
      ...waveform,
      violations
    });
  }, [data.property.evaluatorRule]);

  // Initial evaluation on mount
  useEffect(() => {
    evaluateAndSetWaveform(data.waveform);
  }, [data.waveform, evaluateAndSetWaveform]);

  const handleSignalClick = (signalName: string, cycle: number) => {
    if (!data.editableSignals.includes(signalName)) {
      return;
    }

    const cycleIndex = cycle - 1;
    const newSignals = currentWaveform.signals.map(sig => {
      if (sig.name === signalName) {
        const newValues = [...sig.values];
        const currentVal = newValues[cycleIndex];
        // Only flip booleans
        if (currentVal === '0') newValues[cycleIndex] = '1';
        else if (currentVal === '1') newValues[cycleIndex] = '0';
        return { ...sig, values: newValues };
      }
      return sig;
    });

    const newWaveform = { ...currentWaveform, signals: newSignals };
    evaluateAndSetWaveform(newWaveform);
  };

  const handleReset = () => {
    evaluateAndSetWaveform(data.waveform);
  };

  const hasViolations = currentWaveform.violations && currentWaveform.violations.length > 0;

  return (
    <div className="formal-playground-container">
      <div className="formal-property-header">
        <h2 className="formal-property-title">{data.title}</h2>
        {data.description && <p className="visual-description">{data.description}</p>}
        <div className="formal-property-sva">
          <code>{data.property.svaString}</code>
        </div>
        <p className="formal-property-desc">{data.property.description}</p>
        <div className={`formal-property-status ${hasViolations ? 'has-violations' : 'holds'}`}>
          <strong>Status: </strong>
          {hasViolations ? (
            <span className="status-fail">FAIL (Property Violation)</span>
          ) : (
            <span className="status-pass">PASS (Property Holds)</span>
          )}
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
