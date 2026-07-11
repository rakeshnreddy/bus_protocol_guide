import React, { useState } from 'react';
import type { CoverageMapData } from '../../types/visuals';
import './visuals.css';

interface CoverageMapProps {
  data: CoverageMapData;
}

const CoverageMap: React.FC<CoverageMapProps> = ({ data }) => {
  const [hoveredBin, setHoveredBin] = useState<{x: string, y: string} | null>(null);

  // Helper to get bin state
  const getBin = (x: string, y: string) => {
    return data.bins.find(b => b.x === x && b.y === y);
  };

  const activeBin = hoveredBin ? getBin(hoveredBin.x, hoveredBin.y) : null;

  return (
    <div className="visual-container">
      <div className="visual-header">
        <h4>{data.title}</h4>
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
                <th></th>
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
                    
                    return (
                      <td 
                        key={`${x}-${y}`} 
                        className={`${cellClass} ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredBin({x, y})}
                        onMouseLeave={() => setHoveredBin(null)}
                        onClick={() => setHoveredBin({x, y})}
                        style={{ minWidth: 44, height: 44 }}
                      >
                        {bin?.hits ?? 0}
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
        <div className="annotation-panel">
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
