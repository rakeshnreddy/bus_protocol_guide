import { describe, expect, it } from 'vitest';
import { getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';

function lessonBody(order: number) {
  const lesson = getLessons().find(item => item.lesson.protocol === 'axi' && item.lesson.order === order);
  if (!lesson) throw new Error(`Missing AXI lesson ${order}`);
  return lesson.body;
}

function acceptedCycles(valid: string[], ready: string[]) {
  return valid.flatMap((value, index) => value === '1' && ready[index] === '1' ? [index + 1] : []);
}

describe('AXI Batch 1 protocol-accuracy guards', () => {
  // Arm IHI 0022H A1.2 and A3.2 define five unidirectional information
  // channels. Each channel has a source-driven VALID and destination-driven READY.
  it('keeps all five channel directions and READY ownership explicit', () => {
    const visual = getVisualById('topo-axi-five-channels');
    if (!visual || visual.type !== 'topology') throw new Error('Missing AXI five-channel topology');

    const endpoints = Object.fromEntries(visual.edges.map(edge => [edge.id, [edge.source, edge.target]]));
    expect(endpoints).toMatchObject({
      'channel-aw': ['master-aw', 'slave-aw'],
      'channel-w': ['master-w', 'slave-w'],
      'channel-b': ['slave-b', 'master-b'],
      'channel-ar': ['master-ar', 'slave-ar'],
      'channel-r': ['slave-r', 'master-r'],
    });
    expect(visual.edges.every(edge => edge.label?.includes('READY'))).toBe(true);
    expect(visual.edges.every(edge => edge.bidirectional === true)).toBe(true);
  });

  // Arm IHI 0022H A3.2 requires VALID to remain asserted until a rising-edge
  // handshake and forbids a source from waiting for READY before asserting VALID.
  it('shows all legal VALID/READY timings and detects an early VALID withdrawal', () => {
    const visual = getVisualById('wf-axi-ready-valid-scenarios');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing VALID/READY waveform');

    const signal = (name: string) => visual.signals.find(item => item.name === name)?.values ?? [];
    expect(acceptedCycles(signal('VALID'), signal('READY'))).toEqual([3, 5, 7]);
    expect(signal('PAYLOAD').slice(0, 3)).toEqual(['A', 'A', 'A']);
    expect(signal('VALID').slice(7, 9)).toEqual(['1', '0']);
    expect(visual.violations).toEqual([
      expect.objectContaining({ cycle: 9, message: expect.stringMatching(/dropped before handshake/i) }),
    ]);
  });

  // Arm IHI 0022H A3.3 permits W data to appear before AW at an interface.
  // AXI4 adds both accepted-AW and accepted-final-W dependencies before BVALID.
  it('keeps write-channel independence and AXI4 B-response dependencies exact', () => {
    const visual = getVisualById('wf-axi-write-channels');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing AXI write waveform');

    const signal = (name: string) => visual.signals.find(item => item.name === name)?.values ?? [];
    const awAccept = acceptedCycles(signal('AWVALID'), signal('AWREADY'));
    const wAccept = acceptedCycles(signal('WVALID'), signal('WREADY'));
    const bAccept = acceptedCycles(signal('BVALID'), signal('BREADY'));
    expect(awAccept).toEqual([3]);
    expect(wAccept).toEqual([2, 5, 6]);
    expect(bAccept).toEqual([8]);
    expect(wAccept[0]).toBeLessThan(awAccept[0]);
    expect(Math.min(...signal('BVALID').flatMap((value, index) => value === '1' ? [index + 1] : [])))
      .toBeGreaterThan(Math.max(awAccept[0], wAccept.at(-1)!));
    expect(signal('WDATA').slice(2, 5)).toEqual(['D1', 'D1', 'D1']);
    expect(signal('WSTRB').slice(2, 5)).toEqual(['0xF', '0xF', '0xF']);
  });

  // Arm IHI 0022H A3.4 requires the configured number of transfers even after
  // an error. RRESP is returned with every R beat and qualifies that beat.
  it('holds the complete R payload under backpressure and treats RRESP per beat', () => {
    const visual = getVisualById('wf-axi-read-channels');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing AXI read waveform');

    const signal = (name: string) => visual.signals.find(item => item.name === name)?.values ?? [];
    expect(acceptedCycles(signal('ARVALID'), signal('ARREADY'))).toEqual([3]);
    expect(acceptedCycles(signal('RVALID'), signal('RREADY'))).toEqual([4, 7, 8]);
    for (const name of ['RID', 'RDATA', 'RRESP', 'RLAST']) {
      expect(signal(name).slice(4, 7), `${name} must remain stable through the stall`)
        .toEqual([signal(name)[4], signal(name)[4], signal(name)[4]]);
    }
    expect(signal('RRESP')[7]).toBe('SLVERR');
    expect(signal('RLAST')[7]).toBe('1');
    expect(lessonBody(9)).toMatch(/protocol does not require every later beat to repeat the same error/i);
  });

  // Arm IHI 0022H A5 and A6 permit different-ID responses to be reordered,
  // while same-ID responses remain ordered. AXI4 write data follows AW order.
  it('separates AXI4 write-data order from different-ID response order', () => {
    const visual = getVisualById('wf-axi-ids-correlation');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing AXI ID waveform');

    const signal = (name: string) => visual.signals.find(item => item.name === name)?.values ?? [];
    expect(signal('AWID').slice(0, 2)).toEqual(['0xA', '0xB']);
    expect(signal('W_OWNER').filter(value => value !== '-')).toEqual(['ID 0xA', 'ID 0xB']);
    expect(signal('BID').filter(value => value !== '-')).toEqual(['0xB', '0xA']);
    expect(visual.annotations?.some(annotation => /same ID.*issue order/i.test(annotation.message))).toBe(true);
  });

  it('encodes revision and policy boundaries in the comparison explorers', () => {
    const variants = getVisualById('sig-axi-variants');
    const sidebands = getVisualById('sig-axi-sideband-attributes');
    if (!variants || variants.type !== 'signal-explorer') throw new Error('Missing AXI variants explorer');
    if (!sidebands || sidebands.type !== 'signal-explorer') throw new Error('Missing AXI sideband explorer');

    const axi4 = variants.signals.find(signal => signal.name === 'AXI4');
    const lite = variants.signals.find(signal => signal.name === 'AXI4-Lite');
    expect(axi4?.description).toMatch(/INCR bursts to 256.*FIXED and WRAP.*16/i);
    expect(axi4?.description).toMatch(/removes WID/i);
    expect(lite?.description).toMatch(/one full-bus-width beat/i);
    expect(lite?.verificationNote).toMatch(/Multiple transactions may still be outstanding/i);

    expect(sidebands.signals.find(signal => signal.name === 'AxCACHE')?.description)
      .toMatch(/bit 1.*Modifiable/i);
    expect(sidebands.signals.find(signal => signal.name === 'AxQOS')?.description)
      .toMatch(/exact scheduling policy is not specified/i);
    expect(sidebands.signals.find(signal => signal.name === 'AxPROT')?.values)
      .toContain('[1] 0 secure / 1 non-secure');
  });

  it('gives every address signal the ownership, sampling, and DV context needed for debugging', () => {
    const visual = getVisualById('sig-axi-address-channels');
    if (!visual || visual.type !== 'signal-explorer') throw new Error('Missing AXI address explorer');

    expect(visual.signals).toHaveLength(14);
    for (const signal of visual.signals) {
      expect(signal.direction?.trim(), `${signal.name} direction`).toBeTruthy();
      expect(signal.sampled?.trim(), `${signal.name} sampling edge`).toBeTruthy();
      expect(signal.values?.length, `${signal.name} values`).toBeGreaterThan(0);
      expect(signal.verificationNote?.trim(), `${signal.name} DV watchpoint`).toBeTruthy();
    }
  });

  it('retains the corrected lesson claims at the teaching boundary', () => {
    expect(lessonBody(1)).toMatch(/different IDs.*ID- and destination-scoped ordering rules/i);
    expect(lessonBody(2)).toMatch(/WRAP.*exactly 2, 4, 8, or 16 beats/i);
    expect(lessonBody(5)).toMatch(/`INCR` permits 1–256 beats.*`FIXED` permits 1–16.*`WRAP` permits exactly 2, 4, 8, or 16/is);
    expect(lessonBody(8)).toMatch(/`INCR` permits 1–256 beats.*`FIXED` permits 1–16.*`WRAP` permits exactly 2, 4, 8, or 16/is);
    expect(lessonBody(7)).toMatch(/protocol does not define the letter as an abbreviation for .Buffer/i);
    expect(lessonBody(7)).toMatch(/accepted both the AW request and the final W beat/i);
    expect(lessonBody(10)).toMatch(/exact arbitration and starvation policy is implementation-defined/i);
    expect(lessonBody(11)).toMatch(/source is NOT permitted to wait until READY/i);
  });

  it('keeps every changed waveform signal aligned to its declared cycle count', () => {
    for (const id of [
      'wf-axi-write-channels',
      'wf-axi-read-channels',
      'wf-axi-ids-correlation',
      'wf-axi-ready-valid-scenarios',
    ]) {
      const visual = getVisualById(id);
      if (!visual || visual.type !== 'waveform') throw new Error(`Missing waveform ${id}`);
      visual.signals.forEach(signal => {
        expect(signal.values, `${id}:${signal.name}`).toHaveLength(visual.cycleCount);
      });
    }
  });
});
