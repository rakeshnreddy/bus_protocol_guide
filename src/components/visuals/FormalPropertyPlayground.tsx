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
              message: `HREADY must go high within 4 cycles of a NONSEQ transfer (started at cycle ${i + 1}).`
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
    <div className="formal-playground-container" style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <div className="formal-property-header" style={{ marginBottom: '1rem' }}>
        <h3 className="formal-property-title" style={{ marginTop: 0 }}>{data.title}</h3>
        <div className="formal-property-sva" style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '1rem', borderRadius: '4px', margin: '1rem 0' }}>
          <code>{data.property.svaString}</code>
        </div>
        <p className="formal-property-desc">{data.property.description}</p>
        <div className="formal-property-status" style={{ padding: '0.5rem', backgroundColor: hasViolations ? '#fef2f2' : '#f0fdf4', border: `1px solid ${hasViolations ? '#fca5a5' : '#86efac'}`, borderRadius: '4px', display: 'inline-block' }}>
          <strong>Status: </strong>
          {hasViolations ? (
            <span className="status-fail" style={{ color: '#ef4444', fontWeight: 'bold' }}>FAIL (Protocol Violation)</span>
          ) : (
            <span className="status-pass" style={{ color: '#22c55e', fontWeight: 'bold' }}>PASS (Property Holds)</span>
          )}
        </div>
        <div className="formal-property-controls" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="exercise-btn" 
            onClick={handleReset}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            Reset to Original
          </button>
          <span className="hint-text" style={{ fontSize: '0.85rem', color: '#64748b' }}>
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
