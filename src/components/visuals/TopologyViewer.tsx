import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { TopologyData } from '../../types/visuals';
import { createTopologyLayout } from './topologyLayout';
import './visuals.css';

type TopologyNode = TopologyData['nodes'][number];

const nodeTypeLabels: Record<TopologyNode['type'], string> = {
  master: 'Initiator',
  arbiter: 'Interconnect logic',
  bridge: 'Protocol bridge',
  slave: 'Target',
  concept: 'Concept',
  phase: 'Transfer phase',
  state: 'Protocol state',
};

function TspanLines({ lines, x, centerY, lineHeight = 18 }: {
  lines: string[];
  x: number;
  centerY: number;
  lineHeight?: number;
}) {
  const firstY = centerY - ((lines.length - 1) * lineHeight) / 2;
  return (
    <>
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} y={firstY + index * lineHeight}>{line}</tspan>
      ))}
    </>
  );
}

export default function TopologyViewer({ data }: { data: TopologyData }) {
  const layout = useMemo(() => createTopologyLayout(data), [data]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const activeElement = hoveredElement ?? selectedElement;
  const titleId = `${data.id}-topology-title`;
  const descriptionId = `${data.id}-topology-description`;
  const presentNodeTypes = Array.from(new Set(data.nodes.map(node => node.type)));

  const isHighlighted = (id: string) => data.highlightedPath?.includes(id) === true;
  const annotationFor = (id: string) => data.annotations?.find(annotation => annotation.nodeId === id || annotation.edgeId === id);
  const nodeFor = (id: string | null) => data.nodes.find(node => node.id === id);
  const edgeFor = (id: string | null) => data.edges.find(edge => edge.id === id);

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedElement(id);
    }
  };

  const inspectableLabel = (id: string) => {
    const node = nodeFor(id);
    if (node) return node.label.replace(/\n/g, ' ');
    const edge = edgeFor(id);
    return edge?.label?.replace(/\n/g, ' ') || `${edge?.source ?? ''} to ${edge?.target ?? ''}`;
  };

  return (
    <figure className="topology-container" aria-labelledby={titleId} aria-describedby={data.description ? descriptionId : undefined}>
      <figcaption className="topology-heading">
        <div>
          <h2 className="visual-title" id={titleId}>{data.title}</h2>
          {data.description && <p className="visual-description" id={descriptionId}>{data.description}</p>}
        </div>
        <span className="topology-count">{data.nodes.length} blocks · {data.edges.length} routes</span>
      </figcaption>

      <div className="topology-legend" aria-label="Diagram legend">
        {presentNodeTypes.map(type => (
          <span key={type}><i className={`topology-legend-swatch type-${type}`} aria-hidden="true" />{nodeTypeLabels[type]}</span>
        ))}
        <span><i className="topology-legend-route" aria-hidden="true">→</i>Signal or transaction direction</span>
      </div>

      <span className="topology-scroll-hint">Scroll diagram horizontally <span aria-hidden="true">→</span></span>

      <div className="topology-scroll scroll-container" tabIndex={0} aria-label={`Scrollable diagram: ${data.title}`}>
        <div className="topology-stage" style={{ minWidth: `${Math.min(layout.width, 760)}px` }}>
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="topology-svg"
            aria-label={`${data.title}. Interactive block diagram.`}
          >
            <defs>
              <marker id={`${data.id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
              </marker>
            </defs>

            <g className="topology-regions" aria-hidden="true">
              {layout.regions.map(region => (
                <g key={region.id} className={`topology-region tone-${region.tone ?? 'concept'}`}>
                  <rect x={region.x} y={region.y} width={region.width} height={region.height} rx="14" />
                  <text x={region.x + 18} y={region.y + 25}>{region.label}</text>
                </g>
              ))}
            </g>

            <g className="topology-edges">
              {layout.edges.map(({ edge, path, label }) => {
                const highlighted = isHighlighted(edge.id);
                const inspected = activeElement === edge.id;
                return (
                  <g
                    key={edge.id}
                    data-edge-id={edge.id}
                    className={`topology-edge kind-${edge.kind ?? 'relationship'} tone-${edge.tone ?? 'neutral'} ${highlighted ? 'is-highlighted' : ''} ${inspected ? 'is-inspected' : ''}`}
                    onMouseEnter={() => setHoveredElement(edge.id)}
                    onMouseLeave={() => setHoveredElement(null)}
                    onFocus={() => setHoveredElement(edge.id)}
                    onBlur={() => setHoveredElement(null)}
                    onClick={() => setSelectedElement(edge.id)}
                    onKeyDown={event => handleKeyDown(event, edge.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect route ${inspectableLabel(edge.id)}`}
                    aria-pressed={selectedElement === edge.id}
                  >
                    <path d={path} className="topology-edge-hit" fill="none" stroke="transparent" strokeWidth="44" />
                    <path
                      d={path}
                      markerEnd={`url(#${data.id}-arrow)`}
                      markerStart={edge.bidirectional ? `url(#${data.id}-arrow)` : undefined}
                      className="topology-edge-visible"
                      pointerEvents="none"
                    />
                    {label && (
                      <g className="topology-edge-label" pointerEvents="none">
                        <rect x={label.x - label.width / 2} y={label.y - label.height / 2} width={label.width} height={label.height} rx="6" />
                        <text x={label.x} textAnchor="middle">
                          <TspanLines lines={label.lines} x={label.x} centerY={label.y + 4} lineHeight={15} />
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            <g className="topology-nodes">
              {layout.nodes.map(node => {
                const highlighted = isHighlighted(node.id);
                const inspected = activeElement === node.id;
                return (
                  <g
                    key={node.id}
                    data-node-id={node.id}
                    transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
                    className={`topology-node type-${node.type} ${highlighted ? 'is-highlighted' : ''} ${inspected ? 'is-inspected' : ''}`}
                    onMouseEnter={() => setHoveredElement(node.id)}
                    onMouseLeave={() => setHoveredElement(null)}
                    onFocus={() => setHoveredElement(node.id)}
                    onBlur={() => setHoveredElement(null)}
                    onClick={() => setSelectedElement(node.id)}
                    onKeyDown={event => handleKeyDown(event, node.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${node.label.replace(/\n/g, ' ')}`}
                    aria-pressed={selectedElement === node.id}
                  >
                    <rect width={node.width} height={node.height} rx="10" className="topology-node-rect" />
                    <text x={node.width / 2} textAnchor="middle" className="topology-node-label" pointerEvents="none">
                      <TspanLines lines={node.lines} x={node.width / 2} centerY={node.height / 2 + 4} />
                    </text>
                    {annotationFor(node.id) && <circle cx={node.width - 10} cy="10" r="5" className="topology-note-indicator" pointerEvents="none" />}
                    <rect x="-4" y="-4" width={node.width + 8} height={Math.max(node.height + 8, 44)} fill="transparent" />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <div className="topology-info-panel" aria-live="polite">
        {activeElement ? (
          <>
            <div className="panel-header">{inspectableLabel(activeElement)}</div>
            <div className="annotation-text">
              {annotationFor(activeElement)?.message ?? (
                nodeFor(activeElement)
                  ? `${nodeTypeLabels[nodeFor(activeElement)!.type]} block. Follow its connected arrows to trace ownership and return flow.`
                  : 'Follow the arrowhead for forward flow; a second arrowhead marks a return path on the same logical connection.'
              )}
            </div>
          </>
        ) : (
          <div className="annotation-text empty">Select a block or route to inspect its protocol role. On narrow screens, scroll inside the diagram without moving the lesson page.</div>
        )}
      </div>
    </figure>
  );
}
