import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FormalPropertyPlayground, { evaluateFormalProperty } from './FormalPropertyPlayground';
import type { FormalPropertyData } from '../../types/visuals';

const mockAhbData: FormalPropertyData = {
  id: 'fp-ahb-test',
  type: 'formal-property',
  title: 'AHB Bounded Liveness Test',
  description: 'Formal interaction description.',
  property: {
    name: 'Bounded Liveness',
    description: 'Test description for bounded liveness.',
    svaString: 'assert property...',
    evaluatorRule: 'ahb-hready-bounded-liveness'
  },
  editableSignals: ['HREADY', 'HRESETn'],
  waveform: {
    id: 'wf-ahb-test',
    type: 'waveform',
    title: 'Base Waveform',
    cycleCount: 7,
    signals: [
      { name: 'HCLK', type: 'clock', values: ['P', 'P', 'P', 'P', 'P', 'P', 'P'] },
      { name: 'HTRANS', type: 'data', values: ['IDLE', 'NONSEQ', 'SEQ', 'IDLE', 'IDLE', 'IDLE', 'IDLE'] },
      { name: 'HRESETn', type: 'control', values: ['1', '1', '1', '1', '1', '1', '1'] },
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
      { name: 'AWVALID', type: 'control', values: ['0', '1', '0', '0', '0', '0'] },
      { name: 'AWREADY', type: 'control', values: ['1', '1', '1', '1', '1', '1'] },
      { name: 'AWLEN', type: 'data', values: ['-', '3', '-', '-', '-', '-'] },
      { name: 'AWID', type: 'data', values: ['-', '7', '-', '-', '-', '-'] },
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
    expect(screen.getByText('Formal interaction description.')).toBeInTheDocument();
    expect(screen.getByText('assert property...')).toBeInTheDocument();
    expect(screen.getByText('Test description for bounded liveness.')).toBeInTheDocument();
  });

  it('initially renders as PASS if no violations exist', () => {
    render(<FormalPropertyPlayground data={mockAhbData} />);
    expect(screen.getByText('PASS (Configured Contract Holds)')).toBeInTheDocument();
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
    it('checks the four following data-phase cycles rather than reusing acceptance-edge HREADY', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);

      // Cycle 2 remains HIGH so the NONSEQ address is accepted. Its data-phase
      // completion window is cycles 3-6; same-edge HREADY belongs to the prior owner.
      fireEvent.click(screen.getByTestId('interaction-HREADY-3'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-4'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-5'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-6'));

      expect(screen.getByText('FAIL (Configured Service-Contract Violation)')).toBeInTheDocument();

      const failedTrace = {
        ...mockAhbData.waveform,
        signals: mockAhbData.waveform.signals.map(signal => signal.name === 'HREADY'
          ? { ...signal, values: ['1', '1', '0', '0', '0', '0', '1'] }
          : signal),
      };
      expect(evaluateFormalProperty(failedTrace, 'ahb-hready-bounded-liveness').violations[0]?.message)
        .toMatch(/accepted at cycle 2.*cycles 3-6/i);
    });

    it('does not start an obligation for a held but unaccepted address phase', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);

      fireEvent.click(screen.getByTestId('interaction-HREADY-2'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-3'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-4'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-5'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-6'));

      expect(screen.getByText('NOT TRIGGERED (No Accepted Address Phase)')).toBeInTheDocument();
    });

    it('cancels an outstanding obligation when reset asserts inside its window', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);

      for (const cycle of [3, 4, 5, 6]) {
        fireEvent.click(screen.getByTestId(`interaction-HREADY-${cycle}`));
      }
      fireEvent.click(screen.getByTestId('interaction-HRESETn-4'));

      expect(screen.getByText('PASS (Obligation Cancelled by Reset)')).toBeInTheDocument();
    });

    it('rejects toggling non-editable signals', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);
      
      fireEvent.click(screen.getByTestId('interaction-HTRANS-2'));
      
      // Still PASS, didn't break anything, and no value actually changed
      expect(screen.getByText('PASS (Configured Contract Holds)')).toBeInTheDocument();
    });

    it('resets to original state when Reset button is clicked', () => {
      render(<FormalPropertyPlayground data={mockAhbData} />);
      
      // Cause a failure
      fireEvent.click(screen.getByTestId('interaction-HREADY-3'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-4'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-5'));
      fireEvent.click(screen.getByTestId('interaction-HREADY-6'));
      expect(screen.getByText('FAIL (Configured Service-Contract Violation)')).toBeInTheDocument();

      // Reset
      fireEvent.click(screen.getByText('Reset to Original'));
      expect(screen.getByText('PASS (Configured Contract Holds)')).toBeInTheDocument();
    });

    it('reports a trigger near the end of a finite trace as inconclusive, not a pass', () => {
      const shortTrace = {
        ...mockAhbData.waveform,
        cycleCount: 3,
        signals: mockAhbData.waveform.signals.map(signal => ({
          ...signal,
          values: signal.name === 'HTRANS'
            ? ['IDLE', 'IDLE', 'NONSEQ']
            : signal.values.slice(0, 3),
        })),
      };

      const result = evaluateFormalProperty(shortTrace, 'ahb-hready-bounded-liveness');
      expect(result).toMatchObject({
        triggerCount: 1,
        completedCount: 0,
        cancelledCount: 0,
        pendingCount: 1,
        violations: [],
      });
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

    it('derives each burst length from its accepted AW and supports W-before-AW buffering', () => {
      const transactionAwareTrace: FormalPropertyData['waveform'] = {
        id: 'wf-axi-transaction-aware',
        type: 'waveform',
        title: 'Two dynamic bursts',
        cycleCount: 8,
        signals: [
          { name: 'AWVALID', type: 'control', values: ['0', '1', '0', '0', '0', '1', '0', '0'] },
          { name: 'AWREADY', type: 'control', values: ['1', '1', '1', '1', '1', '1', '1', '1'] },
          { name: 'AWLEN', type: 'data', values: ['-', '0', '-', '-', '-', '2', '-', '-'] },
          { name: 'AWID', type: 'data', values: ['-', '4', '-', '-', '-', '9', '-', '-'] },
          { name: 'WVALID', type: 'control', values: ['1', '0', '0', '0', '1', '0', '1', '1'] },
          { name: 'WREADY', type: 'control', values: ['1', '1', '1', '1', '1', '1', '1', '1'] },
          { name: 'WLAST', type: 'control', values: ['1', '0', '0', '0', '0', '0', '0', '1'] },
        ],
      };

      expect(evaluateFormalProperty(transactionAwareTrace, 'axi-wlast-exact')).toEqual({
        violations: [],
        triggerCount: 2,
        completedCount: 2,
        cancelledCount: 0,
        pendingCount: 0,
      });
    });

    it('checks exact LAST position separately for each accepted AW-order context', () => {
      const trace = {
        ...mockAxiData.waveform,
        signals: mockAxiData.waveform.signals.map(signal => signal.name === 'AWLEN'
          ? { ...signal, values: ['-', '1', '-', '-', '-', '-'] }
          : signal.name === 'WLAST'
            ? { ...signal, values: ['0', '0', '0', '0', '1', '0'] }
            : signal),
      };

      const result = evaluateFormalProperty(trace, 'axi-wlast-exact');
      expect(result.violations).toEqual([
        expect.objectContaining({ cycle: 3, message: expect.stringMatching(/AWID 7.*AWLEN=1/i) }),
      ]);
      expect(result.pendingCount).toBe(1);
    });

    it('reports accepted write data without a matching AW as inconclusive', () => {
      const trace = {
        ...mockAxiData.waveform,
        signals: mockAxiData.waveform.signals.map(signal => signal.name === 'AWVALID'
          ? { ...signal, values: signal.values.map(() => '0') }
          : signal),
      };

      render(<FormalPropertyPlayground data={{ ...mockAxiData, waveform: trace }} />);
      expect(screen.getByText('INCONCLUSIVE (Write Association or Burst Is Incomplete)')).toBeInTheDocument();
    });
  });
});
