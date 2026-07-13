import { describe, expect, it } from 'vitest';
import type { TopologyData } from '../../types/visuals';
import { createTopologyLayout, roundedTopologyPath, wrapTopologyLabel } from './topologyLayout';

describe('topology layout', () => {
  it('wraps explicit and long labels without losing words', () => {
    expect(wrapTopologyLabel('Crossbar\nID Extender and Response Router', 18)).toEqual([
      'Crossbar',
      'ID Extender and',
      'Response Router',
    ]);
  });

  it('moves edge-positioned blocks inside the computed viewBox', () => {
    const data: TopologyData = {
      id: 'bounds', type: 'topology', title: 'Bounds',
      nodes: [
        { id: 'left', label: 'Left edge node', type: 'master', x: 0, y: 0 },
        { id: 'right', label: 'Right edge node', type: 'slave', x: 400, y: 200 },
      ],
      edges: [{ id: 'route', source: 'left', target: 'right' }],
    };
    const layout = createTopologyLayout(data);

    for (const node of layout.nodes) {
      expect(node.x - node.width / 2).toBeGreaterThanOrEqual(0);
      expect(node.y - node.height / 2).toBeGreaterThanOrEqual(0);
      expect(node.x + node.width / 2).toBeLessThanOrEqual(layout.width);
      expect(node.y + node.height / 2).toBeLessThanOrEqual(layout.height);
    }
  });

  it('turns waypoints into orthogonal, rounded routes', () => {
    const data: TopologyData = {
      id: 'route', type: 'topology', title: 'Route',
      nodes: [
        { id: 'a', label: 'A', type: 'master', x: 100, y: 100 },
        { id: 'b', label: 'B', type: 'slave', x: 500, y: 300 },
      ],
      edges: [{ id: 'edge', source: 'a', target: 'b', waypoints: [{ x: 300, y: 100 }, { x: 300, y: 300 }] }],
    };
    const [edge] = createTopologyLayout(data).edges;

    edge.points.slice(0, -1).forEach((point, index) => {
      const next = edge.points[index + 1];
      expect(point.x === next.x || point.y === next.y).toBe(true);
    });
    expect(roundedTopologyPath(edge.points)).toContain(' Q ');
  });
});
