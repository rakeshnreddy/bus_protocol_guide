import { useState } from 'react';
import type { WaveformVisualData } from '../../types/visuals';
import './visuals.css';

export default function WaveformVisualizer({ 
  data,
  onSignalClick
}: { 
  data: WaveformVisualData;
  onSignalClick?: (signalName: string, cycle: number) => void;
}) {
  const [hoveredCycle, setHoveredCycle] = useState<number | null>(null);
  
  const cycleWidth = 80;
  const rowHeight = 60;
  const labelWidth = 120;
  const svgWidth = labelWidth + (data.cycleCount * cycleWidth);
  const svgHeight = data.signals.length * rowHeight;
  
  const getAnnotationForCycle = (cycle: number) => {
    return data.annotations?.find(a => a.cycle === cycle);
  };
  
  const getViolationForCycle = (cycle: number) => {
    return data.violations?.find(v => v.cycle === cycle);
  };

  const selectCycle = (cycle: number) => setHoveredCycle(cycle);

  const handleKeyboardActivation = (event: React.KeyboardEvent<SVGElement>, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
  
  return (
    <div className="waveform-container">
      <h2 className="visual-title">{data.title}</h2>
      {data.description && <p className="visual-description">{data.description}</p>}
      <div className="waveform-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg width={svgWidth} height={svgHeight} className="waveform-svg">
          {/* Draw grid lines and labels */}
          {Array.from({ length: data.cycleCount + 1 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line 
                x1={labelWidth + i * cycleWidth} y1={0} 
                x2={labelWidth + i * cycleWidth} y2={svgHeight} 
                stroke="var(--grid-line)" strokeDasharray="4 4"
              />
              {i < data.cycleCount && (
                <text
                  x={labelWidth + i * cycleWidth + cycleWidth / 2}
                  y={15}
                  fontSize="10"
                  fill="var(--ink-soft)"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  C{i + 1}
                </text>
              )}
            </g>
          ))}
          
          {/* Cycle background interactions */}
          {Array.from({ length: data.cycleCount }).map((_, i) => {
            const cycle = i + 1;
            const isHovered = hoveredCycle === cycle;
            const violation = getViolationForCycle(cycle);
            return (
              <rect
                key={`cycle-bg-${cycle}`}
                x={labelWidth + i * cycleWidth}
                y={0}
                width={cycleWidth} // 80px, well above 44px min touch target
                height={Math.max(svgHeight, 44)} // Ensure height is at least 44px
                fill={violation ? "var(--danger-soft)" : isHovered ? "var(--control-hover)" : "transparent"}
                onMouseEnter={() => setHoveredCycle(cycle)}
                onMouseLeave={() => setHoveredCycle(null)}
                onClick={() => selectCycle(cycle)}
                onKeyDown={(event) => handleKeyboardActivation(event, () => selectCycle(cycle))}
                role="button"
                tabIndex={0}
                aria-label={`Inspect cycle ${cycle}`}
                aria-pressed={isHovered}
                className="cycle-interaction-rect"
                style={{ cursor: 'pointer' }}
              />
            );
          })}
          
          {/* Draw signals */}
          {data.signals.map((signal, sIdx) => {
            const yOffset = sIdx * rowHeight;
            const color = signal.color || 'var(--signal-default)';
            
            return (
              <g key={`signal-${sIdx}`} transform={`translate(0, ${yOffset})`}>
                <text x={10} y={rowHeight / 2 + 5} className="signal-label" fill={color}>
                  {signal.name}
                </text>
                
                {signal.values.map((val, cIdx) => {
                  const x = labelWidth + cIdx * cycleWidth;
                  const prevVal = cIdx > 0 ? signal.values[cIdx - 1] : val;
                  const cycle = cIdx + 1;
                  
                  const handleSignalClick = () => {
                    if (onSignalClick) {
                      onSignalClick(signal.name, cycle);
                    }
                  };
                  
                  // Interaction overlay for individual signal cell
                  const interactiveOverlay = onSignalClick ? (
                    <rect
                      x={x}
                      y={0}
                      width={cycleWidth}
                      height={rowHeight}
                      fill="transparent"
                      cursor="pointer"
                      onClick={handleSignalClick}
                      onKeyDown={(event) => handleKeyboardActivation(event, handleSignalClick)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${signal.name} cycle ${cycle}, value ${val}. Activate to toggle.`}
                      className="signal-cell-interaction"
                      data-testid={`interaction-${signal.name}-${cycle}`}
                    />
                  ) : null;
                  
                  if (signal.type === 'clock') {
                    // Standard clock pulse: Rising edge at start, high for half cycle, low for half
                    const half = cycleWidth / 2;
                    return (
                      <g key={`val-${cIdx}`}>
                        <path 
                          d={`M ${x} ${rowHeight - 10} L ${x} 10 L ${x + half} 10 L ${x + half} ${rowHeight - 10} L ${x + cycleWidth} ${rowHeight - 10}`}
                          stroke={color} strokeWidth="2" fill="none"
                        />
                        {interactiveOverlay}
                      </g>
                    );
                  }
                  
                  if (signal.type === 'control') {
                    // Boolean 0 or 1
                    const isHigh = val === "1";
                    const wasHigh = prevVal === "1";
                    const y = isHigh ? 10 : rowHeight - 10;
                    const prevY = wasHigh ? 10 : rowHeight - 10;
                    
                    return (
                      <g key={`val-${cIdx}`}>
                        {y !== prevY && (
                          <line x1={x} y1={prevY} x2={x} y2={y} stroke={color} strokeWidth="2" />
                        )}
                        <line x1={x} y1={y} x2={x + cycleWidth} y2={y} stroke={color} strokeWidth="2" />
                        {interactiveOverlay}
                      </g>
                    );
                  }
                  
                  // Data or sideband (categorical)
                  if (val === "INV" || val === "X" || val.toLowerCase() === "invalid") {
                    // Invalid state (simple line in middle)
                    return (
                      <g key={`val-${cIdx}`}>
                        <line x1={x} y1={rowHeight/2} x2={x + cycleWidth} y2={rowHeight/2} stroke={color} strokeWidth="2" />
                        {interactiveOverlay}
                      </g>
                    );
                  }
                  
                  // Valid data box (hexagonal)
                  const transitionWidth = 5;
                  return (
                    <g key={`val-${cIdx}`}>
                      <polygon 
                        points={`
                          ${x},${rowHeight/2} 
                          ${x + transitionWidth},10 
                          ${x + cycleWidth - transitionWidth},10 
                          ${x + cycleWidth},${rowHeight/2} 
                          ${x + cycleWidth - transitionWidth},${rowHeight - 10} 
                          ${x + transitionWidth},${rowHeight - 10}
                        `}
                        fill="var(--waveform-data-fill)"
                        stroke={color}
                        strokeWidth="2"
                      />
                      <text x={x + cycleWidth/2} y={rowHeight/2 + 4} textAnchor="middle" fontSize="12" fill={color} fontWeight="bold">
                        {val}
                      </text>
                      {interactiveOverlay}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Annotation panel */}
      <div className="waveform-info-panel" aria-live="polite">
        {hoveredCycle !== null ? (
          <>
             <div className="panel-header">Cycle {hoveredCycle}</div>
             {getViolationForCycle(hoveredCycle) && (
               <div className="violation-text">⚠️ Protocol Violation: {getViolationForCycle(hoveredCycle)?.message}</div>
             )}
             {getAnnotationForCycle(hoveredCycle) ? (
               <div className="annotation-text">{getAnnotationForCycle(hoveredCycle)?.message}</div>
             ) : (
               <div className="annotation-text empty">No special annotations for this cycle.</div>
             )}
          </>
        ) : (
          <div className="annotation-text empty">Hover, focus, or tap a cycle to inspect phase ownership and sampling.</div>
        )}
      </div>
    </div>
  );
}
