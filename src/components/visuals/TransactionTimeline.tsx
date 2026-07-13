import { useState } from 'react';
import type { TransactionTimelineData } from '../../types/visuals';
import './visuals.css';

type SelectedPhase = {
  id: string;
  name: string;
  description?: string;
};

export default function TransactionTimeline({ data }: { data: TransactionTimelineData }) {
  const [selectedPhase, setSelectedPhase] = useState<SelectedPhase | null>(null);
  const phases = data.phases ?? [];
  const transactions = data.transactions ?? [];
  const totalCycles = phases.reduce((sum, phase) => sum + phase.durationCycles, 0);
  const lastCycleBoundary = transactions.reduce(
    (maximum, transaction) => transaction.phases.reduce(
      (transactionMaximum, phase) => Math.max(transactionMaximum, phase.endCycle),
      maximum,
    ),
    1,
  );
  const laneCycleCount = Math.max(1, lastCycleBoundary - 1);
  const laneGridStyle = {
    gridTemplateColumns: `140px repeat(${laneCycleCount}, minmax(56px, 1fr))`,
    minWidth: `${140 + laneCycleCount * 72}px`,
  };

  const selectPhase = (phase: SelectedPhase) => setSelectedPhase(phase);

  return (
    <div className="timeline-container">
      <h2 className="visual-title">{data.title}</h2>
      {data.description && <p className="visual-description">{data.description}</p>}
      {data.labels && data.labels.length > 0 && (
        <div className="timeline-labels" aria-label="Timeline phase categories">
          {data.labels.map(label => (
            <span key={label} className="timeline-label">{label}</span>
          ))}
        </div>
      )}

      {transactions.length > 0 ? (
        <div className="scroll-container">
          <div className="transaction-lanes" role="group" aria-label={`${data.title} transaction lanes`}>
            <div className="transaction-lane transaction-cycle-header" style={laneGridStyle}>
              <span>Transaction</span>
              {Array.from({ length: laneCycleCount }, (_, index) => (
                <span key={index}>C{index + 1}</span>
              ))}
            </div>
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-lane" style={laneGridStyle}>
                <strong className="transaction-label">{transaction.label}</strong>
                {transaction.phases.map(phase => {
                  const isSelected = selectedPhase?.id === phase.id;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      className={`transaction-lane-phase ${isSelected ? 'hovered' : ''}`}
                      style={{
                        gridColumn: `${phase.startCycle + 1} / ${phase.endCycle + 1}`,
                        borderColor: transaction.color,
                      }}
                      aria-pressed={isSelected}
                      aria-label={`${transaction.label}: ${phase.name}, cycles ${phase.startCycle} to ${phase.endCycle}`}
                      onMouseEnter={() => selectPhase(phase)}
                      onFocus={() => selectPhase(phase)}
                      onClick={() => selectPhase(phase)}
                    >
                      <span className="phase-name">{phase.name}</span>
                      {phase.endCycle - phase.startCycle > 1 && (
                        <span className="phase-duration">{phase.endCycle - phase.startCycle} cycles</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : phases.length > 0 && totalCycles > 0 ? (
        <div className="scroll-container">
          <div className="timeline-track" style={{ minWidth: '500px' }}>
            {phases.map(phase => {
              const isSelected = selectedPhase?.id === phase.id;
              const flexBasis = `${(phase.durationCycles / totalCycles) * 100}%`;
              return (
                <button
                  key={phase.id}
                  type="button"
                  className={`timeline-phase ${isSelected ? 'hovered' : ''}`}
                  style={{ flexBasis }}
                  aria-pressed={isSelected}
                  onMouseEnter={() => selectPhase(phase)}
                  onFocus={() => selectPhase(phase)}
                  onClick={() => selectPhase(phase)}
                >
                  <span className="phase-name">{phase.name}</span>
                  <span className="phase-duration">{phase.durationCycles} cycle{phase.durationCycles > 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="visual-error" role="status">No timeline phases are available for this visual.</div>
      )}

      <div className="timeline-info-panel" aria-live="polite">
        {selectedPhase ? (
          <>
            <div className="panel-header">{selectedPhase.name} Phase</div>
            {selectedPhase.description && (
              <div className="annotation-text">{selectedPhase.description}</div>
            )}
            {data.annotations?.find(annotation => annotation.phase === selectedPhase.id) && (
              <div className="annotation-text extra">
                💡 {data.annotations.find(annotation => annotation.phase === selectedPhase.id)?.message}
              </div>
            )}
          </>
        ) : (
          <div className="annotation-text empty">Hover, focus, or tap a phase to inspect it.</div>
        )}
      </div>
    </div>
  );
}
