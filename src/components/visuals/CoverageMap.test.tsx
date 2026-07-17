import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CoverageMap from './CoverageMap';
import type { CoverageMapData } from '../../types/visuals';

const mockData: CoverageMapData = {
  id: 'test-cm',
  type: 'coverage-map',
  title: 'Test Coverage',
  description: 'Coverage interaction description.',
  xAxis: {
    label: 'X',
    buckets: ['A', 'B']
  },
  yAxis: {
    label: 'Y',
    buckets: ['C']
  },
  bins: [
    { x: 'A', y: 'C', hits: 5, illegal: false, tooltip: 'A and C works' },
    { x: 'B', y: 'C', hits: 0, illegal: true, tooltip: 'B and C illegal' }
  ]
};

describe('CoverageMap', () => {
  it('renders title and axis labels', () => {
    render(<CoverageMap data={mockData} />);
    expect(screen.getByText('Test Coverage')).toBeInTheDocument();
    expect(screen.getByText('Coverage interaction description.')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
  });

  it('renders table headers and cells', () => {
    const { container } = render(<CoverageMap data={mockData} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    
    // Values 5 and 0 should be rendered in the cells
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Check classes
    const cells = container.querySelectorAll('.coverage-cell');
    expect(cells.length).toBe(2);
    expect(cells[0]).toHaveClass('hit'); // 5 hits
    expect(cells[1]).toHaveClass('illegal'); // illegal bin
  });

  it('provides at least a 44x44px hit area for touch targets', () => {
    const { container } = render(<CoverageMap data={mockData} />);
    const cells = container.querySelectorAll('.coverage-cell-button');
    
    cells.forEach(cell => {
      // We check the inline styles we set to guarantee mobile hit area
      expect(cell).toHaveStyle('min-width: 44px');
      expect(cell).toHaveStyle('min-height: 44px');
    });
  });

  it('shows tooltip on hover', () => {
    render(<CoverageMap data={mockData} />);
    const cell = screen.getByRole('button', { name: /A by C: covered, 5 hits/i });
    
    fireEvent.mouseEnter(cell);
    expect(screen.getByText('A × C')).toBeInTheDocument();
    expect(screen.getByText('Covered (5 hits): A and C works')).toBeInTheDocument();
    
    fireEvent.mouseLeave(cell);
    expect(screen.queryByText('A × C')).not.toBeInTheDocument();
  });

  it('exposes error beat-position coverage instead of collapsing every ERROR into one bin', () => {
    const errorData: CoverageMapData = {
      ...mockData,
      bins: [{
        ...mockData.bins[0],
        errorBeatHits: { first: 2, middle: 3, final: 1 },
      }, mockData.bins[1]],
    };
    render(<CoverageMap data={errorData} />);
    fireEvent.click(screen.getByRole('button', { name: /A by C/i }));
    expect(screen.getByText(/Error beat position: first 2, middle 3, final 1/)).toBeInTheDocument();
  });

  it('supports keyboard focus and persistent selection without relying on color', () => {
    render(<CoverageMap data={mockData} />);
    const hole = screen.getByRole('button', { name: /B by C: illegal combination/i });

    fireEvent.focus(hole);
    expect(screen.getByText('B × C')).toBeInTheDocument();
    fireEvent.blur(hole);
    expect(screen.queryByText('B × C')).not.toBeInTheDocument();

    fireEvent.click(hole);
    expect(hole).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('B × C')).toBeInTheDocument();
  });

  it('applies configuration-derived illegal rows and resets stale selection on mode change', () => {
    const configuredData: CoverageMapData = {
      ...mockData,
      bins: [
        { x: 'A', y: 'C', hits: 0, illegal: false, tooltip: 'Revision-dependent response' },
        { x: 'B', y: 'C', hits: 0, illegal: false, tooltip: 'Revision-dependent response' },
      ],
      configurations: [
        { id: 'lite', label: 'AHB-Lite / AHB5', illegalRows: ['C'] },
        { id: 'original', label: 'Original AHB', description: 'RETRY and SPLIT are legal holes here.' },
      ],
    };

    render(<CoverageMap data={configuredData} />);
    const cell = screen.getByRole('button', { name: /A by C: illegal combination/i });
    fireEvent.click(cell);
    expect(cell).toHaveAttribute('aria-pressed', 'true');

    fireEvent.change(screen.getByLabelText('Protocol configuration'), { target: { value: 'original' } });
    expect(screen.getByText('RETRY and SPLIT are legal holes here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /A by C: coverage hole, zero hits/i }))
      .toHaveAttribute('aria-pressed', 'false');
  });
});
