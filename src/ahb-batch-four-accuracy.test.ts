import { describe, expect, it } from 'vitest';
import specRulesData from '../content/reference/spec-rules.json';
import { getChecklistById, getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';

function lessonBody(order: number) {
  const lesson = getLessons().find(item => item.lesson.protocol === 'ahb' && item.lesson.order === order);
  if (!lesson) throw new Error(`Missing AHB lesson ${order}`);
  return lesson.body;
}

describe('AHB Batch 4 protocol-accuracy guards', () => {
  // Arm IHI 0033B.b section 4.3 permits BUSY within a burst. Fixed-length
  // bursts finish with SEQ, while undefined-length INCR may end after BUSY.
  it('teaches legal HTRANS burst progression without rejecting INCR termination', () => {
    expect(lessonBody(30)).toMatch(/undefined-length `INCR` burst may terminate after `BUSY`/i);
    expect(lessonBody(30)).not.toMatch(/BUSY.*(?:followed by|to).*IDLE.*strictly illegal/i);

    const explorer = getVisualById('sig-ahb-assertion-library');
    if (!explorer || explorer.type !== 'signal-explorer') throw new Error('Missing assertion explorer');
    expect(explorer.signals.find(signal => signal.name === 'Transfer-type legality')?.verificationNote)
      .toMatch(/undefined-length INCR may terminate/i);
  });

  it('uses production coverage Markdown and avoids invented turnaround requirements', () => {
    expect(lessonBody(31)).toContain('](visual:cm-ahb-burst-resp)');
    expect(lessonBody(31)).not.toMatch(/```(?:visual|exercise)/i);
    expect(lessonBody(31)).not.toMatch(/mandatory idle|turnaround cycle/i);
    expect(lessonBody(31)).toMatch(/raw percentage alone is not a signoff decision/i);
  });

  // AHB defines completion behavior, but not one universal response-time bound.
  it('labels bounded liveness and fairness as configured product contracts', () => {
    const formal = getVisualById('fp-ahb-hready-liveness');
    if (!formal || formal.type !== 'formal-property') throw new Error('Missing liveness visual');

    expect(lessonBody(32)).toMatch(/four-cycle window.*teaching contract, not a universal AHB maximum/i);
    expect(lessonBody(32)).toMatch(/AHB does not mandate one fairness policy/i);
    expect(formal.property.description).toMatch(/teaching\/configuration bound, not an AHB protocol maximum/i);
  });

  // Arm IHI 0033B.b section 5.1.3 permits canceling or continuing after ERROR.
  it('keeps both legal post-ERROR choices in debug guidance and rule data', () => {
    expect(lessonBody(33)).toMatch(/Both canceling and continuing are permitted/i);

    expect(getVisualById('spec-rule-explorer-ahb')?.type).toBe('spec-rule-explorer');
    const errorRule = specRulesData.rules.find(rule => rule.id === 'ahb-two-cycle-error');
    expect(`${errorRule?.statement} ${errorRule?.bugPattern.rootCause}`).toMatch(/cancel|continu/i);
  });

  it('marks the first bad stalled-data edge while retaining the owning transfer', () => {
    const visual = getVisualById('wf-ahb-bug-wait-state');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing wait-state bug waveform');

    expect(visual.signals.find(signal => signal.name === 'HREADY')?.values[2]).toBe('0');
    expect(visual.signals.find(signal => signal.name === 'DATA_OWNER')?.values[3]).toBe('0x14');
    expect(visual.violations?.find(violation => violation.cycle === 4)?.message).toMatch(/EARLY ADVANCE/i);
    expect(lessonBody(34)).toMatch(/Cycle 4.*incorrectly advances `HWDATA`/i);
  });

  it('separates raw decoder transients from the select sampled at the accepting edge', () => {
    const visual = getVisualById('wf-ahb-bug-decoder-glitch');
    if (!visual || visual.type !== 'waveform') throw new Error('Missing decoder waveform');

    expect(visual.signals.find(signal => signal.name === 'HSEL_S2_RAW')?.values)
      .toContain('0→pulse→0');
    expect(visual.signals.find(signal => signal.name === 'HSEL_S2_SAMPLED')?.values)
      .not.toContain(1);
    expect(lessonBody(34)).toMatch(/raw transient is not an accepted Slave 2 transfer/i);
  });

  it('provides a complete expert checklist at the production loader boundary', () => {
    const checklist = getChecklistById('chk-ahb-expert');
    expect(checklist).toBeDefined();
    expect(checklist?.items).toHaveLength(10);
  });

  it('keeps core return-path direction and version-specific signals explicit', () => {
    const visual = getVisualById('sig-ahb-full');
    if (!visual || visual.type !== 'signal-explorer') throw new Error('Missing full signal explorer');

    expect(visual.signals.find(signal => signal.name === 'HREADY')?.direction)
      .toMatch(/Return mux.*master and slaves/i);
    expect(visual.signals.some(signal => signal.name === 'HREADYOUT')).toBe(true);
    expect(visual.signals.some(signal => signal.name === 'HSPLITx')).toBe(true);
    expect(visual.signals.some(signal => signal.name === 'HNONSEC')).toBe(true);
    expect(visual.signals.some(signal => signal.name === 'HEXCL')).toBe(true);
  });

  it('qualifies recap guidance with pending-transfer and integration context', () => {
    expect(lessonBody(38)).toMatch(/valid `NONSEQ` or `SEQ` address phase is pending/i);
    expect(lessonBody(38)).toMatch(/IDLE, BUSY, and first-ERROR-cycle exceptions/i);
    expect(lessonBody(38)).toMatch(/Combinational behavior can be legal/i);
    expect(lessonBody(38)).not.toMatch(/Never trust combinatorial `HREADYOUT`/i);
  });

  it('keeps every Batch 4 waveform signal aligned to its declared cycle count', () => {
    for (const id of [
      'wf-ahb-bug-wait-state',
      'wf-ahb-bug-decoder-glitch',
      'wf-ahb-review-error',
      'wf-ahb-illegal-htrans',
      'wf-ahb-wait-state-heavy',
    ]) {
      const visual = getVisualById(id);
      if (!visual || visual.type !== 'waveform') throw new Error(`Missing waveform ${id}`);
      visual.signals.forEach(signal => {
        expect(signal.values, `${id}:${signal.name}`).toHaveLength(visual.cycleCount);
      });
    }
  });
});
