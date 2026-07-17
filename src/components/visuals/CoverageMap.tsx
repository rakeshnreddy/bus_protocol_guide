import React, { useState } from 'react';
import type { CoverageMapData } from '../../types/visuals';
import './visuals.css';

interface CoverageMapProps {
  data: CoverageMapData;
}

const CoverageMap: React.FC<CoverageMapProps> = ({ data }) => {
  const [configurationId, setConfigurationId] = useState(data.configurations?.[0]?.id ?? 'default');
  const [hoveredBin, setHoveredBin] = useState<{x: string, y: string} | null>(null);
  const [selectedBin, setSelectedBin] = useState<{x: string, y: string} | null>(null);

  const activeConfiguration = data.configurations?.find(configuration => configuration.id === configurationId);

  // Helper to get bin state
  const getBin = (x: string, y: string) => {
    return data.bins.find(b => b.x === x && b.y === y);
  };

  const activeKey = hoveredBin ?? selectedBin;
  const activeBin = activeKey ? getBin(activeKey.x, activeKey.y) : null;
  const isIllegal = (bin: CoverageMapData['bins'][number] | undefined) =>
    Boolean(bin && (bin.illegal || activeConfiguration?.illegalRows?.includes(bin.y)));

  return (
    <div className="visual-container">
      <div className="visual-header">
        <h2>{data.title}</h2>
        {data.description && <p className="visual-description">{data.description}</p>}
        {data.configurations && data.configurations.length > 1 && (
          <div className="coverage-configuration">
            <label htmlFor={`${data.id}-configuration`}>Protocol configuration</label>
            <select
              id={`${data.id}-configuration`}
              value={configurationId}
              onChange={event => {
                setConfigurationId(event.target.value);
                setHoveredBin(null);
                setSelectedBin(null);
              }}
            >
              {data.configurations.map(configuration => (
                <option key={configuration.id} value={configuration.id}>{configuration.label}</option>
              ))}
            </select>
            {activeConfiguration?.description && <p>{activeConfiguration.description}</p>}
          </div>
        )}
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
                    } else if (isIllegal(bin)) {
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
                      : isIllegal(bin)
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
            {isIllegal(activeBin)
              ? `Illegal: ${activeBin.tooltip}` 
              : activeBin.hits === 0 
                ? `Coverage Hole: ${activeBin.tooltip}` 
                : `Covered (${activeBin.hits} hits): ${activeBin.tooltip}`
            }
          </p>
          {activeBin.errorBeatHits && (
            <p>
              Error beat position: first {activeBin.errorBeatHits.first}, middle {activeBin.errorBeatHits.middle}, final {activeBin.errorBeatHits.final}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CoverageMap;
