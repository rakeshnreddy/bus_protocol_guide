import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FormalPropertyPlayground from './FormalPropertyPlayground';
import type { FormalPropertyData } from '../../types/visuals';

const mockAhbData: FormalPropertyData = {
  id: 'fp-ahb-test',
  type: 'formal-property',
  title: 'AHB Bounded Liveness Test',
  property: {
    name: 'Bounded Liveness',
    description: 'Test description for bounded liveness.',
    svaString: 'assert property...',
    evaluatorRule: 'ahb-hready-bounded-liveness'
  },
  editableSignals: ['HREADY'],
  waveform: {
    id: 'wf-ahb-test',
    type: 'waveform',
    title: 'Base Waveform',
    cycleCount: 7,
    signals: [
      { name: 'HCLK', type: 'clock', values: ['P', 'P', 'P', 'P', 'P', 'P', 'P'] },
      { name: 'HTRANS', type: 'data', values: ['IDLE', 'NONSEQ', 'SEQ', 'IDLE', 'IDLE', 'IDLE', 'IDLE'] },
      { name: 'HREADY', type: 'control', values: ['1', '1', '1', '1', '1', '1', '1'] }
    ]
  }
};

const mockAxiData: FormalPropertyData = {
  id: 'fp-axi-test',
  type: 'formal-property',
  title: 'AXI WLAST Exact Match Test',
  property: {
    name: 'WLAST Exact',
    description: 'Test description for WLAST.',
    svaString: 'assert property...',
    evaluatorRule: 'axi-wlast-exact'
  },
  editableSignals: ['WLAST'],
  waveform: {
    id: 'wf-axi-test',
    type: 'waveform',
    title: 'Base Waveform',
    cycleCount: 6,
    signals: [
      { name: 'WVALID', type: 'control', values: ['0', '1', '1', '1', '1', '0'] },
      { name: 'WREADY', type: 'control', values: ['1', '1', '1', '1', '1', '1'] },
      { name: 'WLAST', type: 'control', values: ['0', '0', '0', '0', '1', '0'] }
    ]
  }
};

describe('FormalPropertyPlayground', () => {
  it('renders title, SVA string, and description', () => {
    render(<FormalPropertyPlayground data={mockAhbData} />);
    expect(screen.getByText('AHB Bounded Liveness Test')).toBeInTheDocument();
    expect(screen.getByText('assert property...')).toBeInTheDocument();
    expect(screen.getByText('Test description for bounded liveness.')).toBeInTheDocument();
  });

  it('initially renders as PASS if no violations exist', () => {
    render(<FormalPropertyPlayground data={mockAhbData} />);
    expect(screen.getByText('PASS (Property Holds)')).toBeInTheDocument();
  });

  it('provides at least a 44x44px hit area for editable signal touch targets', () => {
    const { container } = render(<FormalPropertyPlayground data={mockAhbData} />);
    // Select the interactive overlays in the waveform
    const interactions = container.querySelectorAll('.signal-cell-interaction');
    expect(interactions.length).toBeGreaterThan(0);
    
    interactions.forEach(rect => {
      const width = parseInt(rect.getAttribute('width') || '0');
      const height = parseInt(rect.getAttribute('height') || '0');
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('AHB Bounded Liveness Evaluator', () => {
    it('handles toggling editable signals and flags a violation if HREADY is held low', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);
      
      // Toggle cycle 2 to 0 (cycle 2 is 1-indexed for the test id)
      fireEvent.click(screen.getByTestId('interaction-HREADY-2'));
      // Toggle cycle 3 to 0
      fireEvent.click(screen.getByTestId('interaction-HREADY-3'));
      // Toggle cycle 4 to 0
      fireEvent.click(screen.getByTestId('interaction-HREADY-4'));
      // Toggle cycle 5 to 0
      fireEvent.click(screen.getByTestId('interaction-HREADY-5'));
      // Toggle cycle 6 to 0
      fireEvent.click(screen.getByTestId('interaction-HREADY-6'));
      
      expect(screen.getByText('FAIL (Property Violation)')).toBeInTheDocument();
    });

    it('rejects toggling non-editable signals', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);
      
      fireEvent.click(screen.getByTestId('interaction-HTRANS-2'));
      
      // Still PASS, didn't break anything, and no value actually changed
      expect(screen.getByText('PASS (Property Holds)')).toBeInTheDocument();
    });

    it('resets to original state when Reset button is clicked', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);
      
      // Cause a failure
      fireEvent.click(screen.getByTestId('interaction-HREADY-2'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-3'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-4'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-5'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-6'));
      expect(screen.getByText('FAIL (Property Violation)')).toBeInTheDocument();

      // Reset
      fireEvent.click(screen.getByText('Reset to Original'));
      expect(screen.getByText('PASS (Property Holds)')).toBeInTheDocument();
    });
  });

  describe('AXI WLAST Exact Match Evaluator', () => {
    it('flags violation if WLAST is toggled early', () => {
      render(<FormalPropertyPlayground data={mockAxiData} />);
      
      // Toggle WLAST high on cycle 3
      fireEvent.click(screen.getByTestId('interaction-WLAST-3'));
      
      expect(screen.getByText('FAIL (Property Violation)')).toBeInTheDocument();
    });

    it('flags violation if WLAST is missing on the last beat', () => {
      render(<FormalPropertyPlayground data={mockAxiData} />);
      
      // Toggle WLAST low on the last beat (cycle 5)
      fireEvent.click(screen.getByTestId('interaction-WLAST-5'));
      
      expect(screen.getByText('FAIL (Property Violation)')).toBeInTheDocument();
    });
  });
});
