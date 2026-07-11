import { useState } from 'react';
import type { TopologyData } from '../../types/visuals';
import './visuals.css';

export default function TopologyViewer({ data }: { data: TopologyData }) {
  const width = 800;
  const height = 400;
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  // Basic auto-layout
  const masters = data.nodes.filter(n => n.type === 'master');
  const interconnects = data.nodes.filter(n => n.type === 'arbiter' || n.type === 'bridge');
  const slaves = data.nodes.filter(n => n.type === 'slave');
  
  const getX = (index: number, count: number) => {
    const spacing = width / (count + 1);
    return spacing * (index + 1);
  };
  
  const nodePositions = new Map<string, {x: number, y: number}>();
  
  masters.forEach((n, i) => nodePositions.set(n.id, { x: getX(i, masters.length), y: 80 }));
  interconnects.forEach((n, i) => nodePositions.set(n.id, { x: getX(i, interconnects.length), y: 200 }));
  slaves.forEach((n, i) => nodePositions.set(n.id, { x: getX(i, slaves.length), y: 320 }));
  
  // Any unclassified nodes go to middle
  data.nodes.forEach(n => {
    if (!nodePositions.has(n.id)) {
       nodePositions.set(n.id, { x: width/2, y: 200 });
    }
  });
  
  const isHighlighted = (id: string) => {
    return data.highlightedPath?.includes(id);
  };
  
  return (
    <div className="topology-container">
      <h3 className="visual-title">{data.title}</h3>
      <div className="scroll-container">
        <div className="topology-svg-wrapper" style={{ minWidth: '600px' }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="topology-svg">
            {/* Draw edges first so they are under nodes */}
          {data.edges.map(edge => {
             const source = nodePositions.get(edge.source);
             const target = nodePositions.get(edge.target);
             if (!source || !target) return null;
             
             const highlighted = isHighlighted(edge.id);
             return (
                 <g 
                   key={edge.id}
                   onMouseEnter={() => setHoveredElement(edge.id)}
                   onMouseLeave={() => setHoveredElement(null)}
                   onClick={() => setHoveredElement(edge.id)}
                   style={{ cursor: 'pointer' }}
                 >
                   {/* Transparent hit area for easy tapping */}
                   <line 
                     x1={source.x} y1={source.y} 
                     x2={target.x} y2={target.y} 
                     stroke="transparent" 
                     strokeWidth="44"
                   />
                   <line 
                     x1={source.x} y1={source.y} 
                     x2={target.x} y2={target.y} 
                     stroke={highlighted ? '#3b82f6' : '#cbd5e1'} 
                     strokeWidth={highlighted ? 4 : 2}
                     pointerEvents="none"
                   />
                   {edge.label && (
                     <text 
                       x={(source.x + target.x) / 2} 
                       y={(source.y + target.y) / 2 - 10} 
                       textAnchor="middle" 
                       fontSize="12" 
                       fill={highlighted ? '#2563eb' : '#64748b'}
                       fontWeight={highlighted ? 'bold' : 'normal'}
                       pointerEvents="none"
                     >
                       {edge.label}
                     </text>
                   )}
                 </g>
             );
          })}
          
          {/* Draw nodes */}
          {data.nodes.map(node => {
             const pos = nodePositions.get(node.id);
             if (!pos) return null;
             
             const highlighted = isHighlighted(node.id);
             const nodeWidth = 140;
             const nodeHeight = 40;
             const isMaster = node.type === 'master';
             const isSlave = node.type === 'slave';
             const bgColor = highlighted ? '#eff6ff' : (isMaster ? '#f0fdf4' : (isSlave ? '#fef2f2' : '#f8fafc'));
             const strokeColor = highlighted ? '#3b82f6' : (isMaster ? '#22c55e' : (isSlave ? '#ef4444' : '#64748b'));
             
             return (
               <g 
                 key={node.id} 
                 transform={`translate(${pos.x - nodeWidth/2}, ${pos.y - nodeHeight/2})`}
                 onMouseEnter={() => setHoveredElement(node.id)}
                 onMouseLeave={() => setHoveredElement(null)}
                 onClick={() => setHoveredElement(node.id)}
                 style={{ cursor: 'pointer' }}
               >
                 <rect 
                   width={nodeWidth} 
                   height={nodeHeight} 
                   rx={6} 
                   fill={bgColor} 
                   stroke={strokeColor} 
                   strokeWidth={highlighted ? 3 : 2}
                   className="topology-node-rect"
                 />
                 <text 
                   x={nodeWidth/2} 
                   y={nodeHeight/2 + 5} 
                   textAnchor="middle" 
                   fontSize="13" 
                   fontWeight="bold" 
                   fill="#334155"
                   pointerEvents="none"
                 >
                   {node.label}
                 </text>
                 
                 {/* Tooltip hint if it has an annotation */}
                 {data.annotations?.find(a => a.nodeId === node.id) && (
                   <circle cx={nodeWidth} cy={0} r={8} fill="#f59e0b" pointerEvents="none" />
                 )}
                 
                 {/* Invisible touch target overlay for >= 44x44 */}
                 <rect 
                   x={Math.min(0, (nodeWidth - Math.max(nodeWidth, 44)) / 2)}
                   y={Math.min(0, (nodeHeight - Math.max(nodeHeight, 44)) / 2)}
                   width={Math.max(nodeWidth, 44)} 
                   height={Math.max(nodeHeight, 44)} 
                   fill="transparent" 
                 />
               </g>
             );
          })}
        </svg>
        </div>
      </div>
      
      {/* Annotations panel driven by hover state */}
      <div className="topology-info-panel">
        {hoveredElement ? (
          <>
            <div className="panel-header">
              {data.nodes.find(n => n.id === hoveredElement)?.label || data.edges.find(e => e.id === hoveredElement)?.label || 'Info'}
            </div>
            {data.annotations?.find(a => a.nodeId === hoveredElement || a.edgeId === hoveredElement) ? (
              <div className="annotation-text">
                {data.annotations.find(a => a.nodeId === hoveredElement || a.edgeId === hoveredElement)?.message}
              </div>
            ) : (
              <div className="annotation-text empty">No specific notes for this element.</div>
            )}
          </>
        ) : (
          <div className="annotation-text empty">
            Hover or tap a node/edge to see more details.
            {data.annotations && data.annotations.length > 0 && (
               <div style={{ marginTop: '1rem' }}>
                 <strong>Topology Notes:</strong>
                 {data.annotations.map((ann, i) => (
                   <div key={i} style={{ marginTop: '0.5rem' }}>
                     {ann.nodeId ? `(Node: ${data.nodes.find(n => n.id === ann.nodeId)?.label}) ` : ''}
                     {ann.message}
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
