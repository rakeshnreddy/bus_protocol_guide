import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { getVisualById } from '../../lib/visualLoaders';
import type { BurstCalculatorConfig } from '../../types/visuals';
import BurstCalculator, { calculateBurst } from './BurstCalculator';

function calculator(id: string): BurstCalculatorConfig {
  const visual = getVisualById(id);
  if (!visual || visual.type !== 'checker-model' || !visual.calculator) throw new Error(`Missing calculator ${id}`);
  return visual.calculator;
}

describe('BurstCalculator', () => {
  it('computes exact INCR final byte, end-exclusive address, and legal 4 KB split', () => {
    const config = calculator('model-axi-burst-checker');
    const result = calculateBurst(config, config.initial);
    expect(result.beats.map(beat => beat.address)).toEqual([0x0ff8, 0x0ffc, 0x1000, 0x1004]);
    expect(result.finalByte).toBe(0x1007);
    expect(result.endExclusive).toBe(0x1008);
    expect(result.boundaryLegal).toBe(false);
    expect(result.firstTransactionBeats).toBe(2);
    expect(result.secondTransactionBeats).toBe(2);
  });

  it('uses the AXI aligned-address rule for later unaligned INCR beats and active lanes', () => {
    const config = calculator('model-axi-burst-checker');
    const result = calculateBurst(config, {
      startAddress: '0x1001', burst: 'INCR', bytesPerBeat: 4, beats: 2, busBytes: 8, strobe: '0x0E',
    });
    expect(result.beats.map(beat => beat.address)).toEqual([0x1001, 0x1004]);
    expect(result.beats[0]).toMatchObject({ firstByte: 0x1001, lastByte: 0x1003, laneMask: 0x0e });
    expect(result.strobeLegal).toBe(true);
    expect(result.legal).toBe(true);
  });

  it('computes modulo WRAP order and rejects invalid AHB alignment or a 1 KB crossing', () => {
    const axi = calculator('model-axi-burst-checker');
    const wrap = calculateBurst(axi, {
      startAddress: '0x100C', burst: 'WRAP', bytesPerBeat: 4, beats: 4, busBytes: 8, strobe: '0xF0',
    });
    expect(wrap.wrapBase).toBe(0x1000);
    expect(wrap.beats.map(beat => beat.address)).toEqual([0x100c, 0x1000, 0x1004, 0x1008]);

    const ahb = calculator('model-ahb-core-checker');
    expect(calculateBurst(ahb, {
      startAddress: '0x03FD', burst: 'INCR', bytesPerBeat: 4, beats: 4, busBytes: 4,
    }).alignmentLegal).toBe(false);
    expect(calculateBurst(ahb, {
      startAddress: '0x03F8', burst: 'INCR', bytesPerBeat: 4, beats: 4, busBytes: 4,
    }).boundaryLegal).toBe(false);
  });

  it('updates calculator fields and reports WSTRB lane legality accessibly', async () => {
    const user = userEvent.setup();
    render(<BurstCalculator config={calculator('model-axi-burst-checker')} />);

    const start = screen.getByRole('textbox', { name: 'Start address' });
    await user.clear(start);
    await user.type(start, '0x1001');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Beats (AxLEN+1)' }), '2');
    const strobe = screen.getByRole('textbox', { name: 'First-beat WSTRB mask' });
    await user.clear(strobe);
    await user.type(strobe, '0x0E');

    expect(screen.getByRole('status')).toHaveTextContent('Legal request');
    expect(screen.getByText('0x0E', { selector: '.calculator-summary strong' })).toBeInTheDocument();
    const region = screen.getByRole('region', { name: 'Scrollable calculated burst beats' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('Accepted-beat address and active-byte results')).toBeInTheDocument();
  });
});
