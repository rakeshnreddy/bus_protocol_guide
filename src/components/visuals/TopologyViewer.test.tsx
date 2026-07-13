import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TopologyViewer from './TopologyViewer';
import type { TopologyData } from '../../types/visuals';

const mockData: TopologyData = {
  id: 'test-tp',
  type: 'topology',
  title: 'Test Topology',
  description: 'A representative topology.',
  regions: [{ id: 'system', label: 'System', x: 0, y: 0, width: 500, height: 260 }],
  nodes: [
    { id: 'm1', label: 'CPU Master With Long Label', type: 'master', x: 80, y: 120 },
    { id: 's1', label: 'Memory\nSlave', type: 'slave', x: 420, y: 120 },
  ],
  edges: [
    { id: 'e1', source: 'm1', target: 's1', label: 'Request →\nResponse ←', bidirectional: true, tone: 'primary' },
  ],
  highlightedPath: ['m1', 'e1'],
  annotations: [{ nodeId: 'm1', message: 'The CPU initiates the transfer.' }],
};

describe('TopologyViewer', () => {
  it('renders wrapped block labels, routed edges, regions, and a compact legend', () => {
    const { container } = render(<TopologyViewer data={mockData} />);

    expect(screen.getByText('CPU Master With Long', { selector: 'tspan' })).toBeInTheDocument();
    expect(screen.getByText('Label', { selector: 'tspan' })).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Initiator')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(container.querySelector('.topology-edge-visible')).toHaveAttribute('d');
    expect(container.querySelector('.topology-edge.is-highlighted')).toBeInTheDocument();
  });

  it('keeps selection after pointer leave and explains the selected block', () => {
    render(<TopologyViewer data={mockData} />);
    const cpu = screen.getByRole('button', { name: 'Inspect CPU Master With Long Label' });

    fireEvent.click(cpu);
    fireEvent.mouseLeave(cpu);

    expect(cpu).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('The CPU initiates the transfer.')).toBeInTheDocument();
  });

  it('supports keyboard inspection and provides a 44px route hit area', () => {
    const { container } = render(<TopologyViewer data={mockData} />);
    const route = screen.getByRole('button', { name: 'Inspect route Request → Response ←' });

    fireEvent.focus(route);
    fireEvent.keyDown(route, { key: 'Enter' });

    expect(route).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('.topology-edge-hit')).toHaveAttribute('stroke-width', '44');
  });

  it('contains wide diagrams in a named horizontal scroll region', () => {
    const { container } = render(<TopologyViewer data={mockData} />);
    const scroller = screen.getByLabelText('Scrollable diagram: Test Topology');

    expect(scroller).toHaveClass('topology-scroll', 'scroll-container');
    expect(container.querySelector('.topology-stage')).toHaveStyle({ minWidth: '760px' });
  });
});
