import { describe, expect, it } from 'vitest';
import { getLessons } from './lib/loaders';
import { getAllVisuals, getVisualById } from './lib/visualLoaders';

function lesson(order: number) {
  const item = getLessons().find(entry => entry.lesson.protocol === 'axi' && entry.lesson.order === order);
  if (!item) throw new Error(`Missing AXI lesson ${order}`);
  return item;
}

function waveform(id: string) {
  const visual = getVisualById(id);
  if (!visual || visual.type !== 'waveform') throw new Error(`Missing waveform ${id}`);
  return visual;
}

function signalValues(id: string, name: string) {
  return waveform(id).signals.find(signal => signal.name === name)?.values ?? [];
}

describe('AXI Batch 3 protocol-accuracy guards', () => {
  it('registers all Batch 3 assets and gives every lesson an inline learning visual', () => {
    const expectedIds = [
      'tl-axi-burst-address-progression',
      'wf-axi-alignment-byte-lanes',
      'wf-axi-4kb-boundary',
      'sig-axi-legality-patterns',
      'tl-axi3-axi4-write-order',
      'sig-axi4-lite-interface',
      'wf-axi-stream',
      'tp-axi-crossbar',
      'tl-axi-qos-arbitration',
      'tp-axi-apb-bridge',
    ];

    expect(getAllVisuals()).toHaveLength(79);
    expectedIds.forEach(id => expect(getVisualById(id), id).toBeDefined());

    for (let order = 23; order <= 33; order += 1) {
      const { lesson: metadata, body } = lesson(order);
      expect(metadata.visualIds.length, metadata.id).toBeGreaterThan(0);
      metadata.visualIds.forEach(id => {
        expect(body, `${metadata.id} must render ${id} inline`).toContain(`(visual:${id})`);
      });
    }
  });

  // Arm IHI 0022H A3.4: AxSIZE encodes 2^n bytes, WRAP lengths are
  // 2/4/8/16, and the WRAP start is transfer-size aligned.
  it('keeps burst-type address progression tied to AxSIZE and legal WRAP structure', () => {
    const visual = getVisualById('tl-axi-burst-address-progression');
    if (!visual || visual.type !== 'timeline') throw new Error('Missing burst progression timeline');

    expect(visual.transactions?.find(transaction => transaction.id === 'fixed4')?.phases.map(phase => phase.name))
      .toEqual(['B0 · 0x2000', 'B1 · 0x2000', 'B2 · 0x2000', 'B3 · 0x2000']);
    expect(visual.transactions?.find(transaction => transaction.id === 'wrap4')?.phases.map(phase => phase.name))
      .toEqual(['B0 · 0x100C', 'B1 · 0x1000', 'B2 · 0x1004', 'B3 · 0x1008']);
    expect(lesson(23).body).toMatch(/progression advances by `2\^AxSIZE` bytes/i);
    expect(lesson(23).body).toMatch(/FIXED and WRAP bursts remain limited to 1–16 beats/i);
  });

  // Arm IHI 0022H A3.4 permits an unaligned start and requires low address
  // bits and byte strobes to describe a consistent selection.
  it('shows the first unaligned transfer and aligned subsequent INCR address on the correct byte lanes', () => {
    expect(signalValues('wf-axi-alignment-byte-lanes', 'AWADDR')).toEqual([
      '0x1000', 'INV', '0x1001', 'INV', 'INV',
    ]);
    expect(signalValues('wf-axi-alignment-byte-lanes', 'Beat addr')).toEqual([
      'INV', '0x1000', 'INV', '0x1001', '0x1004',
    ]);
    expect(signalValues('wf-axi-alignment-byte-lanes', 'WSTRB[7:0]')).toEqual([
      'INV', '00001111', 'INV', '00001110', '11110000',
    ]);
    expect(lesson(24).body).toMatch(/WRAP.*start address must be aligned/i);
    expect(lesson(24).body).not.toMatch(/slave will automatically adjust/i);
  });

  // Arm IHI 0022H A3.4 prohibits a burst crossing a 4 KB boundary.
  it('marks the first derived address in the next 4 KB region and presents legal split transactions', () => {
    const visual = waveform('wf-axi-4kb-boundary');
    expect(signalValues(visual.id, 'Beat address')).toEqual([
      'B0 0x0FF8', 'B1 0x0FFC', 'B2 0x1000', 'B3 0x1004',
      '0x0FF8→0x0FFC', '0x1000→0x1004',
    ]);
    expect(visual.violations).toEqual([
      expect.objectContaining({ cycle: 3, message: expect.stringMatching(/crosses a 4 KB boundary/i) }),
    ]);
    expect(lesson(25).body).toMatch(/requester must issue separate legal transactions/i);
  });

  // Arm IHI 0022H A3/A5: response dependencies use accepted transfers,
  // LAST follows accepted beat count, and ordering state is scoped by ID.
  it('teaches legal and illegal patterns with endpoint ownership and accepted-transfer state', () => {
    const visual = getVisualById('sig-axi-legality-patterns');
    if (!visual || visual.type !== 'signal-explorer') throw new Error('Missing legality explorer');

    expect(visual.signals.map(signal => signal.name)).toEqual([
      'VALID independence', 'B response', 'Burst bounds', 'LAST count', 'ID ordering', 'Read after write',
    ]);
    expect(visual.signals.find(signal => signal.name === 'B response')?.description)
      .toMatch(/accepted the write address.*accepted the final write-data transfer/i);
    expect(visual.signals.find(signal => signal.name === 'LAST count')?.verificationNote)
      .toMatch(/Count accepted beats rather than clock cycles/i);
    expect(lesson(26).body).toMatch(/before it has accepted both the write address and the final write-data transfer/i);
  });

  // Arm IHI 0022H A5.2: WID exists only in AXI3; AXI4 write data follows
  // write-address order and a combining interconnect preserves that order.
  it('contrasts AXI3 WID interleaving with AXI4 write-address order', () => {
    const visual = getVisualById('tl-axi3-axi4-write-order');
    if (!visual || visual.type !== 'timeline') throw new Error('Missing AXI3/AXI4 ordering timeline');

    expect(visual.transactions?.find(transaction => transaction.id === 'axi3-w')?.phases.map(phase => phase.name))
      .toEqual(['A0 · WID 0', 'B0 · WID 1', 'A1 · WLAST', 'B1 · WLAST']);
    expect(visual.transactions?.find(transaction => transaction.id === 'axi4-w')?.phases.map(phase => phase.name))
      .toEqual(['A0', 'A1 · WLAST', 'B0', 'B1 · WLAST']);
    expect(lesson(27).body).toMatch(/interconnect combining writes.*forward the write data in address order/i);
  });

  // Arm IHI 0022H B1: Lite retains AxPROT and WSTRB, omits burst/size,
  // LAST/LOCK/CACHE controls, and does not use IDs for reordering.
  it('models the actual AXI4-Lite signal subset without dropping protection attributes', () => {
    const visual = getVisualById('sig-axi4-lite-interface');
    if (!visual || visual.type !== 'signal-explorer') throw new Error('Missing AXI4-Lite explorer');

    expect(visual.signals.find(signal => signal.name === 'AW channel')?.expansion).toContain('AWPROT');
    expect(visual.signals.find(signal => signal.name === 'AR channel')?.expansion).toContain('ARPROT');
    expect(visual.signals.find(signal => signal.name === 'W channel')?.expansion).toContain('WSTRB');
    expect(visual.signals.find(signal => signal.name === 'Fixed subset')?.description)
      .toMatch(/omits AxLEN, AxSIZE, and AxBURST/i);
    expect(lesson(28).body).toMatch(/`AWPROT` and `ARPROT` remain/i);
    expect(lesson(28).body).not.toMatch(/No Cache\/Protection/i);
  });

  // Arm IHI 0051B section 2.2: a stream payload and sidebands remain stable
  // while TVALID is asserted and TREADY is LOW.
  it('holds the complete AXI4-Stream final beat stable through backpressure', () => {
    expect(signalValues('wf-axi-stream', 'TVALID').slice(3, 5)).toEqual(['1', '1']);
    expect(signalValues('wf-axi-stream', 'TREADY').slice(3, 5)).toEqual(['0', '1']);
    for (const signal of ['TDATA', 'TKEEP', 'TLAST', 'TID', 'TDEST']) {
      const values = signalValues('wf-axi-stream', signal);
      expect(values[3], signal).toBe(values[4]);
    }
    expect(signalValues('wf-axi-stream', 'TLAST').slice(3, 5)).toEqual(['1', '1']);
    expect(lesson(29).body).toMatch(/source holds `TVALID` and the payload stable/i);
  });

  // Arm IHI 0022H A5.2 describes source-port ID extension. The topology
  // also makes clear that a configured fabric can retain equivalent metadata.
  it('keeps crossbar concurrency separate from response ownership and one fixed internal encoding', () => {
    const visual = getVisualById('tp-axi-crossbar');
    if (!visual || visual.type !== 'topology') throw new Error('Missing AXI crossbar');

    expect(visual.nodes.find(node => node.id === 'xbar')?.label).toMatch(/Decode \+ Arbitrate[\s\S]*Track Source IDs/i);
    expect(visual.annotations?.find(annotation => annotation.edgeId === 'e-xbar-s0')?.message)
      .toMatch(/prepend source bits, remap IDs, or keep source metadata internally/i);
    expect(lesson(30).body).toMatch(/crossbar capability, not a requirement/i);
    expect(lesson(31).body).toMatch(/exact internal representation is an implementation choice/i);
  });

  // Arm IHI 0022H A8.1 recommends higher values as higher priority, does
  // not define exact use, and gives AXI ordering constraints precedence.
  it('treats QoS as a system-policy input that cannot override AXI ordering', () => {
    const visual = getVisualById('tl-axi-qos-arbitration');
    if (!visual || visual.type !== 'timeline') throw new Error('Missing QoS timeline');

    expect(visual.transactions?.find(transaction => transaction.id === 'ordered-read')?.phases
      .find(phase => phase.id === 'ordered-block')?.description).toMatch(/cannot overtake an older same-ID transaction/i);
    expect(visual.annotations?.find(annotation => annotation.phase === 'display-choice')?.message)
      .toMatch(/does not mandate an instantaneous grant/i);
    expect(lesson(32).body).toMatch(/protocol does not specify their exact use/i);
    expect(lesson(32).body).not.toMatch(/instantly grant|forcing the interconnect to drop everything/i);
  });

  // Arm IHI 0024D: SETUP is followed by one or more ACCESS cycles; APB3+
  // can report PSLVERR, which maps to AXI RRESP or BRESP in a bridge.
  it('models AXI-to-APB conversion with configurable buffering, wait states, and APB3 error return', () => {
    const visual = getVisualById('tp-axi-apb-bridge');
    if (!visual || visual.type !== 'topology') throw new Error('Missing AXI/APB bridge');

    expect(visual.annotations?.find(annotation => annotation.edgeId === 'e-bridge-uart')?.message)
      .toMatch(/APB3 and later.*PSLVERR.*RRESP or BRESP/i);
    expect(visual.annotations?.find(annotation => annotation.edgeId === 'e-bridge-timer')?.message)
      .toMatch(/two-cycle path is the minimum, not a fixed latency/i);
    expect(lesson(33).body).toMatch(/How much AXI address and write data it accepts.*documented buffering/i);
    expect(lesson(33).body).toMatch(/APB3 and later define optional `PSLVERR`/i);
    expect(lesson(33).body).not.toMatch(/prior to APB4|strict 2-cycle transfers/i);
  });
});
