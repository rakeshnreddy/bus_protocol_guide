import { describe, expect, it } from 'vitest';
import { getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';

function lesson(order: number) {
  const item = getLessons().find(entry => entry.lesson.protocol === 'axi' && entry.lesson.order === order);
  if (!item) throw new Error(`Missing AXI lesson ${order}`);
  return item;
}

function values(id: string, signalName: string) {
  const visual = getVisualById(id);
  if (!visual || visual.type !== 'waveform') throw new Error(`Missing waveform ${id}`);
  return visual.signals.find(signal => signal.name === signalName)?.values ?? [];
}

function acceptedCycles(valid: string[], ready: string[]) {
  return valid.flatMap((value, index) => value === '1' && ready[index] === '1' ? [index + 1] : []);
}

describe('AXI Batch 2 protocol-accuracy guards', () => {
  // Arm IHI 0022H A3.3 permits write data before write address at an
  // interface. AXI4 BVALID depends on accepted AW and accepted final W.
  it('keeps the independent-channel walkthrough aligned with the production waveform', () => {
    expect(acceptedCycles(values('wf-axi-write-channels', 'AWVALID'), values('wf-axi-write-channels', 'AWREADY')))
      .toEqual([3]);
    expect(acceptedCycles(values('wf-axi-write-channels', 'WVALID'), values('wf-axi-write-channels', 'WREADY')))
      .toEqual([2, 5, 6]);
    expect(acceptedCycles(values('wf-axi-write-channels', 'BVALID'), values('wf-axi-write-channels', 'BREADY')))
      .toEqual([8]);
    expect(lesson(13).body).toMatch(/Cycle 2:[\s\S]*first beat.*transfers before the address/i);
    expect(lesson(13).body).toMatch(/Cycle 8:[\s\S]*write transaction completes/i);
  });

  // Arm IHI 0022H A3.2 requires the R payload to remain stable while
  // RVALID is asserted and RREADY is LOW. A3.4 keeps the declared beat count.
  it('keeps the read walkthrough aligned through R backpressure and final error', () => {
    expect(acceptedCycles(values('wf-axi-read-channels', 'ARVALID'), values('wf-axi-read-channels', 'ARREADY')))
      .toEqual([3]);
    expect(acceptedCycles(values('wf-axi-read-channels', 'RVALID'), values('wf-axi-read-channels', 'RREADY')))
      .toEqual([4, 7, 8]);
    expect(values('wf-axi-read-channels', 'RDATA').slice(4, 7)).toEqual(['D1', 'D1', 'D1']);
    expect(values('wf-axi-read-channels', 'RRESP')[7]).toBe('SLVERR');
    expect(lesson(14).body).toMatch(/receiving implementation's recovery behavior is not defined/i);
  });

  // Arm IHI 0022H A3.4 defines AxLEN+1, 2^AxSIZE bytes, FIXED/INCR/WRAP,
  // legal wrap lengths, and the 4KB boundary rule.
  it('derives FIXED, INCR, and WRAP addresses from the same burst controls', () => {
    const visual = getVisualById('tl-axi-burst-address-progression');
    if (!visual || visual.type !== 'timeline') throw new Error('Missing AXI burst progression timeline');

    const names = (id: string) => visual.transactions
      ?.find(transaction => transaction.id === id)?.phases.map(phase => phase.name) ?? [];
    expect(names('fixed4')).toEqual([
      'B0 · 0x2000', 'B1 · 0x2000', 'B2 · 0x2000', 'B3 · 0x2000',
    ]);
    expect(names('incr4')).toEqual([
      'B0 · 0x1000', 'B1 · 0x1004', 'B2 · 0x1008', 'B3 · 0x100C',
    ]);
    expect(names('wrap4')).toEqual([
      'B0 · 0x100C', 'B1 · 0x1000', 'B2 · 0x1004', 'B3 · 0x1008',
    ]);
    expect(lesson(15).body).toMatch(/FIXED and WRAP bursts remain limited to 16/i);
    expect(lesson(15).body).toMatch(/increment is `2\^AxSIZE` bytes/i);
  });

  // Arm IHI 0022H A3.2/A3.4 require LAST on the final transfer and state
  // that early burst termination is unsupported.
  it('marks both sides of a WLAST count mismatch without inventing recovery behavior', () => {
    const visual = getVisualById('wf-axi-debug-wlast');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing WLAST debug waveform');

    expect(acceptedCycles(values(visual.id, 'WVALID'), values(visual.id, 'WREADY'))).toEqual([2, 3, 4, 5]);
    expect(values(visual.id, 'WLAST')).toEqual(['0', '0', '0', '1', '0', '0']);
    expect(visual.violations?.map(violation => violation.cycle)).toEqual([4, 5]);
    expect(visual.annotations?.at(-1)?.message).toMatch(/implementation-dependent/i);
    expect(lesson(16).body).toMatch(/AXI3 and AXI4 do not support terminating a burst early/i);
    expect(lesson(16).body).not.toMatch(/Early Termination \(AXI3 only\)/i);
  });

  // Arm IHI 0022H A5/A6 require ID reflection and original ordering to be
  // preserved, while the fabric's internal ID mapping is implementation-specific.
  it('keeps master-local IDs distinct without mandating one interconnect encoding', () => {
    const visual = getVisualById('tp-axi-crossbar');
    if (!visual || visual.type !== 'topology') throw new Error('Missing AXI crossbar topology');

    expect(visual.nodes.filter(node => node.type === 'master').map(node => node.label))
      .toEqual(expect.arrayContaining([expect.stringMatching(/Master 0[\s\S]*ID 0x1/), expect.stringMatching(/Master 1[\s\S]*ID 0x1/)]));
    expect(visual.annotations?.find(annotation => annotation.edgeId === 'e-xbar-s0')?.message)
      .toMatch(/prepend source bits, remap IDs, or keep source metadata internally/i);
    expect(lesson(17).body).toMatch(/implementation choice, not an AXI-mandated bit layout/i);
  });

  it('models outstanding depth independently from the number of ID values', () => {
    const visual = getVisualById('tl-axi-outstanding-window');
    if (!visual || visual.type !== 'timeline') throw new Error('Missing outstanding-window timeline');

    expect(visual.transactions).toHaveLength(3);
    expect(visual.transactions?.filter(transaction => transaction.label.includes('ID 0'))).toHaveLength(2);
    expect(visual.transactions?.find(transaction => transaction.id === 'read-c')?.phases[0].description)
      .toMatch(/Reusing an ID is legal/i);
    expect(lesson(18).body).toMatch(/cannot withdraw that `VALID`/i);
    expect(lesson(22).body).toMatch(/same ID can legally be reused for multiple queued transactions/i);
  });

  // Arm IHI 0022H A6 returns same-ID read responses in request order and
  // permits different-ID responses in either order.
  it('contrasts same-ID order with different-ID completion using attributable beats', () => {
    expect(values('wf-axi-in-order', 'ARID').filter(value => value !== '-')).toEqual(['0', '0']);
    expect(values('wf-axi-in-order', 'R_TXN').filter(value => value !== '-')).toEqual(['A', 'A', 'B', 'B']);
    expect(values('wf-axi-out-of-order', 'ARID').filter(value => value !== '-')).toEqual(['0', '1']);
    expect(values('wf-axi-out-of-order', 'R_TXN').filter(value => value !== '-')).toEqual(['B', 'B', 'A', 'A']);
    expect(lesson(19).body).toMatch(/Matching numeric read and write IDs alone does not create a cross-channel ordering guarantee/i);
    expect(lesson(20).body).toMatch(/slave.*permitted to complete the responses in a different order/i);
  });

  // AXI source VALID independence is a safety requirement. READY can wait for
  // VALID; incompatible cross-channel READY policies can therefore be a
  // liveness failure without the shown sources violating VALID stability.
  it('distinguishes legal backpressure safety from circular-policy liveness failure', () => {
    const deadlock = getVisualById('wf-axi-deadlock');
    if (!deadlock || deadlock.type !== 'waveform') throw new Error('Missing AXI deadlock waveform');

    expect(deadlock.violations).toBeUndefined();
    expect(values(deadlock.id, 'WVALID')).toEqual(Array(8).fill('1'));
    expect(values(deadlock.id, 'BVALID')).toEqual(Array(8).fill('1'));
    expect(deadlock.annotations?.some(annotation => /not automatically.*safety violation/i.test(annotation.message)))
      .toBe(false);
    expect(lesson(21).body).toMatch(/not automatically a single-interface safety violation/i);
    expect(lesson(21).body).toMatch(/direct combinational input-to-output paths.*no-combinational-path rule/i);
    expect(lesson(21).body).toMatch(/integration-level progress contract or bounded timeout/i);
  });

  // AHB HREADY extends both the active data phase and overlapping address
  // phase. AXI channel handshakes remain independent; neither implies a fixed
  // implementation throughput.
  it('shows an AHB pipeline hold without claiming a mandated AXI speedup', () => {
    expect(values('wf-axi-throughput', 'AHB_HREADY').slice(2, 4)).toEqual(['0', '0']);
    expect(values('wf-axi-throughput', 'AHB_ADDR_PHASE').slice(2, 5)).toEqual(['A3', 'A3', 'A3']);
    expect(acceptedCycles(values('wf-axi-throughput', 'AXI_AWVALID'), values('wf-axi-throughput', 'AXI_AWREADY')))
      .toEqual([1, 2, 3]);
    expect(values('wf-axi-throughput', 'AXI_WDATA').slice(2, 5)).toEqual(['W2', 'W2', 'W2']);
    expect(getVisualById('wf-axi-throughput')?.description).toMatch(/not a mandated latency comparison/i);
    expect(lesson(22).body).toMatch(/not a protocol-mandated latency or universal AXI speedup/i);
  });

  it('keeps all Batch 2 waveform rows aligned to their declared cycle counts', () => {
    for (const id of [
      'wf-axi-debug-wlast',
      'wf-axi-in-order',
      'wf-axi-out-of-order',
      'wf-axi-deadlock',
      'wf-axi-throughput',
    ]) {
      const visual = getVisualById(id);
      if (!visual || visual.type !== 'waveform') throw new Error(`Missing waveform ${id}`);
      for (const signal of visual.signals) {
        expect(signal.values, `${id}:${signal.name}`).toHaveLength(visual.cycleCount);
      }
    }
  });

  it('gives every AXI lesson 12 through 22 a declared inline visual answer', () => {
    for (let order = 12; order <= 22; order += 1) {
      const item = lesson(order);
      expect(item.lesson.visualIds.length, `lesson ${order}`).toBeGreaterThan(0);
      for (const id of item.lesson.visualIds) {
        expect(getVisualById(id), `lesson ${order} visual ${id}`).toBeDefined();
        expect(item.body, `lesson ${order} inline ${id}`).toContain(`](visual:${id})`);
      }
    }
  });
});
