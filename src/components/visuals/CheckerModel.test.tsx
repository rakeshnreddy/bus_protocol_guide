import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { getVisualById } from '../../lib/visualLoaders';
import type { CheckerModelData } from '../../types/visuals';
import CheckerModel, { evaluateCheckerStep } from './CheckerModel';

function checker(id: string): CheckerModelData {
  const visual = getVisualById(id);
  if (!visual || visual.type !== 'checker-model') throw new Error(`Missing checker model ${id}`);
  return visual;
}

describe('CheckerModel', () => {
  it('evaluates equality, bounds, membership, and queue-length operators deterministically', () => {
    const step: CheckerModelData['scenarios'][number]['steps'][number] = {
      id: 'operators',
      label: 'Operators',
      event: 'Evaluate retained state',
      state: { exact: 2, queue: ['A', 'B'], flag: true },
      checks: [
        { id: 'eq', label: 'eq', field: 'exact', operator: 'eq', expected: 2, requirementType: 'protocol', evidence: 'exact' },
        { id: 'neq', label: 'neq', field: 'exact', operator: 'neq', expected: 3, requirementType: 'protocol', evidence: 'different' },
        { id: 'lte', label: 'lte', field: 'exact', operator: 'lte', expected: 2, requirementType: 'product-contract', evidence: 'bounded' },
        { id: 'gte', label: 'gte', field: 'exact', operator: 'gte', expected: 1, requirementType: 'product-contract', evidence: 'bounded' },
        { id: 'includes', label: 'includes', field: 'queue', operator: 'includes', expected: 'A', requirementType: 'protocol', evidence: 'owned' },
        { id: 'not-includes', label: 'not includes', field: 'queue', operator: 'not-includes', expected: 'C', requirementType: 'protocol', evidence: 'absent' },
        { id: 'length', label: 'length', field: 'queue', operator: 'length-eq', expected: 2, requirementType: 'product-contract', evidence: 'depth' },
      ],
    };

    expect(evaluateCheckerStep(step).every(result => result.passed)).toBe(true);
  });

  it('executes retained-state steps and resets the model', async () => {
    const user = userEvent.setup();
    render(<CheckerModel data={checker('model-axi-write-checker')} />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Scenario' }), 'axi4-w-first');

    expect(screen.getByText(/WVALID && WREADY accepts D0 before AW/i)).toBeInTheDocument();
    const next = screen.getByRole('button', { name: 'Execute next' });
    next.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/AWID=3, AWLEN=1 handshake/i)).toBeInTheDocument();
    expect(screen.getByText(/AXI4 association mode/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset model' }));
    expect(screen.getByText(/WVALID && WREADY accepts D0 before AW/i)).toBeInTheDocument();
  });

  it('selects an intentional negative scenario and exposes the failed protocol result', async () => {
    const user = userEvent.setup();
    render(<CheckerModel data={checker('model-axi-write-checker')} />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Scenario' }), 'response-underflow');
    expect(screen.getByText('Checker flags issue')).toBeInTheDocument();
    expect(screen.getByText(/FAIL · Response must match eligible write/i)).toBeInTheDocument();
    expect(screen.getByText(/first accepted B response without a corresponding transaction/i)).toBeInTheDocument();
  });

  it('supports direct keyboard step selection and labels selected state', async () => {
    const user = userEvent.setup();
    render(<CheckerModel data={checker('model-ahb-core-checker')} />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Scenario' }), 'waited-incr4');
    const step = screen.getByRole('button', { name: /2\. Hold wait/i });
    step.focus();
    await user.keyboard(' ');
    expect(step).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/HREADY=0, HRESP=OKAY/i)).toBeInTheDocument();
  });

  it('exposes traceability as a keyboard-scrollable region with review ownership', () => {
    render(<CheckerModel data={checker('model-signoff-traceability')} />);
    const region = screen.getByRole('region', { name: /Scrollable traceability evidence/i });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('Requirement-to-evidence traceability')).toBeInTheDocument();
    expect(screen.getAllByText(/reviewer/i).length).toBeGreaterThan(0);
  });
});
