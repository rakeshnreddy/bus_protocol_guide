import { describe, expect, it } from 'vitest';
import { getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';

function lessonBody(order: number) {
  const lesson = getLessons().find(item => item.lesson.protocol === 'ahb' && item.lesson.order === order);
  if (!lesson) throw new Error(`Missing AHB lesson ${order}`);
  return lesson.body;
}

describe('AHB Batch 3 protocol-accuracy guards', () => {
  // Arm IHI 0011A §3.9.4 and Arm IHI 0033B.b §5.1.3 permit a master
  // to cancel the remaining burst after ERROR, but do not require it.
  it('teaches ERROR cancellation as optional and attributes both response cycles correctly', () => {
    const visual = getVisualById('wf-ahb-review-error');
    expect(visual?.type).toBe('waveform');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing ERROR waveform');

    expect(lessonBody(24)).toMatch(/may[\s\S]*cancel the remaining transfers/i);
    expect(lessonBody(24)).toMatch(/also permits it to continue/i);
    expect(lessonBody(24)).not.toMatch(/strictly required to cancel/i);
    expect(visual.annotations?.find(annotation => annotation.cycle === 4)?.message)
      .toMatch(/continuing the burst is also permitted/i);
  });

  // Arm IHI 0011A §3.11 and Arm IHI 0033B.b §§3.3, 8.3 distinguish
  // original HLOCKx arbitration from HMASTLOCK and AHB5 exclusives.
  it('keeps original lock requests, bus lock indication, and AHB5 exclusives distinct', () => {
    const lock = getVisualById('tl-ahb-locked-sequence');
    const exclusive = getVisualById('tl-ahb-exclusive');
    expect(lock?.type).toBe('timeline');
    expect(exclusive?.type).toBe('timeline');
    if (!lock || lock.type !== 'timeline' || !exclusive || exclusive.type !== 'timeline') {
      throw new Error('Missing lock or exclusive timeline');
    }

    expect(lock.description).toMatch(/HLOCKx.*HMASTLOCK/i);
    expect(lessonBody(25)).toMatch(/AHB5 still defines `HMASTLOCK`/i);
    const exclusivePhaseNames = exclusive.transactions?.flatMap(transaction =>
      transaction.phases.map(phase => phase.name),
    );
    expect(exclusivePhaseNames).toEqual(expect.arrayContaining(['HEXOKAY=1', 'HEXOKAY=0']));
  });

  // Arm IHI 0033B.b §§3.9 and 8.3 define HNONSEC and HEXCL as
  // optional capability properties and keep monitor/policy placement flexible.
  it('marks AHB5 security and exclusive capabilities as optional and policy placement as implementation-defined', () => {
    const evolution = getVisualById('sig-ahb-evolution');
    const security = getVisualById('topo-ahb-security-filter');
    expect(evolution?.type).toBe('signal-explorer');
    expect(security?.type).toBe('topology');
    if (!evolution || evolution.type !== 'signal-explorer' || !security || security.type !== 'topology') {
      throw new Error('Missing evolution explorer or security topology');
    }

    expect(evolution.signals.find(signal => signal.name === 'Secure_Transfers')?.expansion)
      .toMatch(/Optional AHB5/i);
    expect(evolution.signals.find(signal => signal.name === 'Exclusive_Transfers')?.expansion)
      .toMatch(/Optional AHB5/i);
    expect(security.annotations?.find(annotation => annotation.nodeId === 'policy')?.message)
      .toMatch(/not one mandatory policy-block placement/i);
  });

  // Both Arm IHI 0011A §3.3 and Arm IHI 0033B.b §4.2 require
  // incrementing bursts not to cross the minimum 1 KB decode region.
  it('preserves the 1 KB burst boundary across original AHB and AHB5', () => {
    const evolution = getVisualById('sig-ahb-evolution');
    if (!evolution || evolution.type !== 'signal-explorer') throw new Error('Missing evolution explorer');

    expect(lessonBody(28)).not.toMatch(/Bursts can cross 1KB boundary/i);
    expect(evolution.signals.find(signal => signal.name === '1 KB boundary')?.description)
      .toMatch(/Original AMBA 2 AHB and AHB-Lite\/AHB5 all require/i);
  });

  it('keeps every Batch 3 waveform signal aligned to its declared cycle count', () => {
    for (const id of ['wf-ahb-arbitration-handover', 'wf-ahb-review-error']) {
      const visual = getVisualById(id);
      if (!visual || visual.type !== 'waveform') throw new Error(`Missing waveform ${id}`);
      visual.signals.forEach(signal => {
        expect(signal.values, `${id}:${signal.name}`).toHaveLength(visual.cycleCount);
      });
    }
  });
});
