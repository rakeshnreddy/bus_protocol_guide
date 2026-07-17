import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TopologyViewer from './components/visuals/TopologyViewer';
import { createTopologyLayout } from './components/visuals/topologyLayout';
import { getAllVisuals } from './lib/visualLoaders';
import type { TopologyData } from './types/visuals';

interface Box { left: number; right: number; top: number; bottom: number }

const topologyVisuals = getAllVisuals().filter((visual): visual is TopologyData => visual.type === 'topology');

function nodeBox(node: ReturnType<typeof createTopologyLayout>['nodes'][number], inset = 0): Box {
  return {
    left: node.x - node.width / 2 + inset,
    right: node.x + node.width / 2 - inset,
    top: node.y - node.height / 2 + inset,
    bottom: node.y + node.height / 2 - inset,
  };
}

function boxesOverlap(a: Box, b: Box, gap = 0) {
  return a.left < b.right + gap && a.right + gap > b.left && a.top < b.bottom + gap && a.bottom + gap > b.top;
}

function segmentCrossesBox(start: {x: number; y: number}, end: {x: number; y: number}, box: Box) {
  if (start.x === end.x) {
    const minimumY = Math.min(start.y, end.y);
    const maximumY = Math.max(start.y, end.y);
    return start.x > box.left && start.x < box.right && maximumY > box.top && minimumY < box.bottom;
  }
  if (start.y === end.y) {
    const minimumX = Math.min(start.x, end.x);
    const maximumX = Math.max(start.x, end.x);
    return start.y > box.top && start.y < box.bottom && maximumX > box.left && minimumX < box.right;
  }
  return true;
}

describe('production topology visual integrity', () => {
  it('audits every existing block-diagram asset', () => {
    expect(topologyVisuals.map(visual => visual.id).sort()).toEqual([
      'topo-ahb-apb-bridge',
      'topo-ahb-dv-environment',
      'topo-ahb-multi-master',
      'topo-ahb-security-filter',
      'topo-ahb-terminology-map',
      'topo-axi-ahb-bridge',
      'topo-axi-dv-environment',
      'topo-axi-five-channels',
      'topo-axi-terminology-map',
      'tp-axi-apb-bridge',
      'tp-axi-crossbar',
      'tp-basic-ahb',
      'tp-bus-architectures',
    ]);
  });

  it.each(topologyVisuals.map(visual => [visual.id, visual] as const))('%s has valid, collision-free geometry', (_id, visual) => {
    const nodeIds = new Set(visual.nodes.map(node => node.id));
    const edgeIds = new Set(visual.edges.map(edge => edge.id));
    expect(nodeIds.size).toBe(visual.nodes.length);
    expect(edgeIds.size).toBe(visual.edges.length);
    expect(visual.edges.every(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))).toBe(true);

    const layout = createTopologyLayout(visual);
    layout.nodes.forEach(node => {
      const box = nodeBox(node);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(layout.width);
      expect(box.bottom).toBeLessThanOrEqual(layout.height);
    });

    for (let first = 0; first < layout.nodes.length; first += 1) {
      for (let second = first + 1; second < layout.nodes.length; second += 1) {
        expect(boxesOverlap(nodeBox(layout.nodes[first]), nodeBox(layout.nodes[second]), 12),
          `${layout.nodes[first].id} overlaps ${layout.nodes[second].id}`).toBe(false);
      }
    }

    layout.edges.forEach(({ edge, points }) => {
      points.slice(0, -1).forEach((point, index) => {
        const next = points[index + 1];
        expect(point.x === next.x || point.y === next.y, `${edge.id} contains a diagonal segment`).toBe(true);
        layout.nodes
          .filter(node => node.id !== edge.source && node.id !== edge.target)
          .forEach(node => {
            expect(segmentCrossesBox(point, next, nodeBox(node, 4)), `${edge.id} crosses ${node.id}`).toBe(false);
          });
      });
    });

    const labelBoxes = layout.edges.flatMap(({ edge, label }) => label ? [{
      id: edge.id,
      box: {
        left: label.x - label.width / 2,
        right: label.x + label.width / 2,
        top: label.y - label.height / 2,
        bottom: label.y + label.height / 2,
      },
    }] : []);
    labelBoxes.forEach(label => {
      layout.nodes.forEach(node => {
        expect(boxesOverlap(label.box, nodeBox(node), 3), `${label.id} label overlaps ${node.id}`).toBe(false);
      });
    });
    for (let first = 0; first < labelBoxes.length; first += 1) {
      for (let second = first + 1; second < labelBoxes.length; second += 1) {
        expect(boxesOverlap(labelBoxes[first].box, labelBoxes[second].box, 3),
          `${labelBoxes[first].id} label overlaps ${labelBoxes[second].id}`).toBe(false);
      }
    }
  });

  it.each(topologyVisuals.map(visual => [visual.id, visual] as const))('%s renders readable labels and controls', (_id, visual) => {
    const { container } = render(<TopologyViewer data={visual} />);
    expect(screen.getByRole('heading', { name: visual.title })).toBeInTheDocument();
    expect(screen.getByLabelText(`Scrollable diagram: ${visual.title}`)).toBeInTheDocument();
    expect(container.querySelectorAll('.topology-node')).toHaveLength(visual.nodes.length);
    expect(container.querySelectorAll('.topology-edge')).toHaveLength(visual.edges.length);
    expect(container.querySelectorAll('.topology-edge-hit')).toHaveLength(visual.edges.length);
    expect(container.textContent).not.toContain('undefined');
  });
});
