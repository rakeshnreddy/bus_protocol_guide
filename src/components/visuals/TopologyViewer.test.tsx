import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TopologyViewer from './TopologyViewer';
import type { TopologyData } from '../../types/visuals';

const mockData: TopologyData = {
  id: 'test-tp',
  type: 'topology',
  title: 'Test Topology',
  nodes: [
    { id: 'm1', label: 'CPU', type: 'master' },
    { id: 's1', label: 'Memory', type: 'slave' }
  ],
  edges: [
    { id: 'e1', source: 'm1', target: 's1', label: 'Bus' }
  ],
  highlightedPath: ['m1', 'e1']
};

describe('TopologyViewer', () => {
  it('renders all nodes and edges', () => {
    const { container } = render(<TopologyViewer data={mockData} />);
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getByText('Bus')).toBeInTheDocument();
    
    // Check that edges rendered (line tags) - 2 lines per edge (1 hit area, 1 visible)
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(2);
  });
  
  it('highlights the specified path', () => {
    const { container } = render(<TopologyViewer data={mockData} />);
    
    const lines = container.querySelectorAll('line');
    // Find the visible line (not the transparent hit area)
    const highlightedLine = Array.from(lines).find(l => l.getAttribute('stroke') !== 'transparent');
    
    // The highlighted line should have a thicker stroke and blue color
    expect(highlightedLine).toHaveAttribute('stroke-width', '4');
    expect(highlightedLine).toHaveAttribute('stroke', '#3b82f6');
  });
});
