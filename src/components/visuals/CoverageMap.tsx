import React, { useState } from 'react';
import type { CoverageMapData } from '../../types/visuals';
import './visuals.css';

interface CoverageMapProps {
  data: CoverageMapData;
}

const CoverageMap: React.FC<CoverageMapProps> = ({ data }) => {
  const [hoveredBin, setHoveredBin] = useState<{x: string, y: string} | null>(null);
  const [selectedBin, setSelectedBin] = useState<{x: string, y: string} | null>(null);

  // Helper to get bin state
  const getBin = (x: string, y: string) => {
    return data.bins.find(b => b.x === x && b.y === y);
  };

  const activeKey = hoveredBin ?? selectedBin;
  const activeBin = activeKey ? getBin(activeKey.x, activeKey.y) : null;

  return (
    <div className="visual-container">
      <div className="visual-header">
        <h2>{data.title}</h2>
        {data.description && <p className="visual-description">{data.description}</p>}
        <div className="coverage-legend">
          <span className="legend-item"><span className="legend-color hole"></span> Hole (0 Hits)</span>
          <span className="legend-item"><span className="legend-color hit"></span> Covered</span>
          <span className="legend-item"><span className="legend-color illegal"></span> Illegal</span>
        </div>
      </div>
      
      <div className="scroll-container">
        <div className="coverage-map-wrapper">
          {/* Y Axis Label */}
          <div className="y-axis-label">{data.yAxis.label}</div>
          
          <table className="coverage-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="visually-hidden">Response by burst type</span>
                </th>
                {data.xAxis.buckets.map(x => (
                  <th key={x} className="col-header">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.yAxis.buckets.map(y => (
                <tr key={y}>
                  <th className="row-header">{y}</th>
                  {data.xAxis.buckets.map(x => {
                    const bin = getBin(x, y);
                    let cellClass = 'coverage-cell ';
                    if (!bin) {
                      cellClass += 'unknown';
                    } else if (bin.illegal) {
                      cellClass += 'illegal';
                    } else if (bin.hits === 0) {
                      cellClass += 'hole';
                    } else {
                      cellClass += 'hit';
                    }
                    
                    const isHovered = hoveredBin?.x === x && hoveredBin?.y === y;
                    const isSelected = selectedBin?.x === x && selectedBin?.y === y;
                    const stateLabel = !bin
                      ? 'unknown bin'
                      : bin.illegal
                        ? 'illegal combination'
                        : bin.hits === 0
                          ? 'coverage hole, zero hits'
                          : `covered, ${bin.hits} hits`;
                    
                    return (
                      <td 
                        key={`${x}-${y}`} 
                        className={`${cellClass} ${isHovered || isSelected ? 'hovered' : ''}`}
                      >
                        <button
                          type="button"
                          className="coverage-cell-button"
                          style={{ minWidth: 44, minHeight: 44 }}
                          aria-label={`${x} by ${y}: ${stateLabel}`}
                          aria-pressed={isSelected}
                          onMouseEnter={() => setHoveredBin({x, y})}
                          onMouseLeave={() => setHoveredBin(null)}
                          onFocus={() => setHoveredBin({x, y})}
                          onBlur={() => setHoveredBin(null)}
                          onClick={() => setSelectedBin(isSelected ? null : {x, y})}
                        >
                          {bin?.hits ?? 0}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
        <div className="x-axis-label">{data.xAxis.label}</div>
      </div>

      {activeBin && activeBin.tooltip && (
        <div className="annotation-panel" role="status" aria-live="polite">
          <strong>
            {activeBin.x} × {activeBin.y}
          </strong>
          <p>
            {activeBin.illegal 
              ? `Illegal: ${activeBin.tooltip}` 
              : activeBin.hits === 0 
                ? `Coverage Hole: ${activeBin.tooltip}` 
                : `Covered (${activeBin.hits} hits): ${activeBin.tooltip}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CoverageMap;
