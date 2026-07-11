import { useState } from 'react';
import type { TransactionTimelineData } from '../../types/visuals';
import './visuals.css';

export default function TransactionTimeline({ data }: { data: TransactionTimelineData }) {
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);
  
  const totalCycles = data.phases.reduce((sum, p) => sum + p.durationCycles, 0);
  
  return (
    <div className="timeline-container">
      <h3 className="visual-title">{data.title}</h3>
      <div className="timeline-labels">
        {data.labels?.map((label, i) => (
           <span key={i} className="timeline-label">{label}</span>
        ))}
      </div>
      
      <div className="scroll-container">
        <div className="timeline-track" style={{ minWidth: '500px' }}>
          {data.phases.map((phase) => {
            const isHovered = hoveredPhase === phase.id;
            const flexBasis = `${(phase.durationCycles / totalCycles) * 100}%`;
            
          return (
            <div 
              key={phase.id}
              className={`timeline-phase ${isHovered ? 'hovered' : ''}`}
              style={{ flexBasis }}
              onMouseEnter={() => setHoveredPhase(phase.id)}
              onMouseLeave={() => setHoveredPhase(null)}
              onClick={() => setHoveredPhase(phase.id)}
            >
              <div className="phase-name">{phase.name}</div>
              <div className="phase-duration">{phase.durationCycles} cycle{phase.durationCycles > 1 ? 's' : ''}</div>
            </div>
          );
        })}
        </div>
      </div>
      
      <div className="timeline-info-panel">
        {hoveredPhase !== null ? (
          <>
             <div className="panel-header">
                {data.phases.find(p => p.id === hoveredPhase)?.name} Phase
             </div>
             {data.phases.find(p => p.id === hoveredPhase)?.description && (
               <div className="annotation-text">
                 {data.phases.find(p => p.id === hoveredPhase)?.description}
               </div>
             )}
             {data.annotations?.find(a => a.phase === hoveredPhase) && (
               <div className="annotation-text extra">
                 💡 {data.annotations.find(a => a.phase === hoveredPhase)?.message}
               </div>
             )}
          </>
        ) : (
          <div className="annotation-text empty">Hover over phases to interact.</div>
        )}
      </div>
    </div>
  );
}
