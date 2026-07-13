import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VisualRenderer from './VisualRenderer';

// We need to mock getVisualById so we can control what it returns
vi.mock('../../lib/visualLoaders', () => ({
  getVisualById: vi.fn((id: string) => {
    if (id === 'wf-1') return { type: 'waveform', title: 'WF' };
    if (id === 'tl-1') return { type: 'timeline', title: 'TL' };
    if (id === 'tp-1') return { type: 'topology', title: 'TP' };
    if (id === 'se-1') return { type: 'signal-explorer', title: 'SE', signals: [] };
    return undefined;
  })
}));

// Mock the child components to simplify testing the renderer logic
vi.mock('./WaveformVisualizer', () => ({
  default: ({ data }: { data: { title: string } }) => <div data-testid="mock-waveform">{data.title}</div>
}));
vi.mock('./TransactionTimeline', () => ({
  default: () => <div data-testid="mock-timeline" />
}));
vi.mock('./TopologyViewer', () => ({
  default: () => <div data-testid="mock-topology" />
}));
vi.mock('./SignalExplorer', () => ({
  default: () => <div data-testid="mock-signal-explorer" />
}));

describe('VisualRenderer', () => {
  it('renders a waveform visual', () => {
    render(<VisualRenderer visualRef={{ id: 'wf-1', type: 'waveform', dataFile: '' }} />);
    expect(screen.getByTestId('mock-waveform')).toBeInTheDocument();
  });

  it('preserves the authored visual title when alt text is provided', () => {
    render(<VisualRenderer visualRef={{ id: 'wf-1', type: 'waveform', dataFile: '' }} altText="Figure caption" />);
    expect(screen.getByTestId('mock-waveform')).toHaveTextContent('WF');
  });

  it('renders a timeline visual', () => {
    render(<VisualRenderer visualRef={{ id: 'tl-1', type: 'timeline', dataFile: '' }} />);
    expect(screen.getByTestId('mock-timeline')).toBeInTheDocument();
  });

  it('renders a topology visual', () => {
    render(<VisualRenderer visualRef={{ id: 'tp-1', type: 'topology', dataFile: '' }} />);
    expect(screen.getByTestId('mock-topology')).toBeInTheDocument();
  });

  it('renders a signal explorer visual', () => {
    render(<VisualRenderer visualRef={{ id: 'se-1', type: 'signal-explorer', dataFile: '' }} />);
    expect(screen.getByTestId('mock-signal-explorer')).toBeInTheDocument();
  });

  it('handles an unknown/missing visual ID gracefully', () => {
    render(<VisualRenderer visualRef={{ id: 'unknown-id', type: 'waveform', dataFile: '' }} />);
    expect(screen.getByText('Visual not found: unknown-id')).toBeInTheDocument();
  });
});
