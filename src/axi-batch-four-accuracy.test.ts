import { describe, expect, it } from 'vitest';
import specRulesData from '../content/reference/spec-rules.json';
import { getChecklistById, getLessons } from './lib/loaders';
import { getAllVisuals, getVisualById } from './lib/visualLoaders';

function lesson(order: number) {
  const item = getLessons().find(entry => entry.lesson.protocol === 'axi' && entry.lesson.order === order);
  if (!item) throw new Error(`Missing AXI lesson ${order}`);
  return item;
}

describe('AXI Batch 4 protocol-accuracy guards', () => {
  it('registers the Batch 4 assets and gives every lesson an inline learning visual', () => {
    const expectedIds = [
      'topo-axi-dv-environment',
      'sig-axi-assertion-library',
      'cm-axi-burst-resp',
      'fp-axi-wlast-exact',
      'wf-axi-out-of-order',
      'wf-axi-debug-wlast',
      'wf-axi-deadlock',
      'spec-rule-explorer-axi',
      'sig-axi-signoff-evidence',
      'axi-signal-ref',
      'tl-axi-ordering-review',
      'wf-axi-throughput',
      'sig-axi-senior-recap',
    ];

    expect(getAllVisuals()).toHaveLength(79);
    expectedIds.forEach(id => expect(getVisualById(id), id).toBeDefined());

    for (let order = 34; order <= 44; order += 1) {
      const { lesson: metadata, body } = lesson(order);
      expect(metadata.visualIds.length, metadata.id).toBeGreaterThan(0);
      metadata.visualIds.forEach(id => {
        expect(body, `${metadata.id} must render ${id} inline`).toContain(`(visual:${id})`);
      });
    }
  });

  it('models accepted-channel reconstruction and per-ID scoreboarding as independent evidence paths', () => {
    const visual = getVisualById('topo-axi-dv-environment');
    if (!visual || visual.type !== 'topology') throw new Error('Missing AXI DV topology');

    expect(visual.nodes.find(node => node.id === 'axi-monitor')?.label)
      .toMatch(/Accepted-handshake reconstruction/i);
    expect(visual.nodes.find(node => node.id === 'axi-scoreboard')?.label)
      .toMatch(/Per-ID issue-order queues/i);
    expect(visual.annotations?.find(annotation => annotation.nodeId === 'axi-monitor')?.message)
      .toMatch(/Allocate only on accepted AW or AR.*retire only on accepted B or RLAST/i);
    expect(visual.annotations?.find(annotation => annotation.nodeId === 'axi-scoreboard')?.message)
      .toMatch(/Match BID and RID.*preserve issue order within each ID/i);
    expect(lesson(34).body).toMatch(/ID selects the ordering stream.*not the entire expected result/i);
  });

  // Arm IHI 0022H A3.2/A3.3: a source does not wait for READY, payload is
  // stable until acceptance, and AXI4 BVALID follows accepted AW and final W.
  it('keeps channel safety, transaction dependencies, and bounded liveness separate', () => {
    const visual = getVisualById('sig-axi-assertion-library');
    if (!visual || visual.type !== 'signal-explorer') throw new Error('Missing AXI assertion explorer');

    expect(visual.signals.find(signal => signal.name === 'Source VALID independence')?.verificationNote)
      .toMatch(/READY is allowed to wait for VALID/i);
    expect(visual.signals.find(signal => signal.name === 'AXI4 write response')?.description)
      .toMatch(/write address has been accepted.*final write-data transfer has been accepted/i);
    expect(visual.signals.find(signal => signal.name === 'Bounded progress contract')?.description)
      .toMatch(/configured bound.*assumptions/i);
    expect(lesson(35).body).toMatch(/AXI does not provide one universal finite service limit/i);
  });

  // Arm IHI 0022H A7.2.4 restricts exclusive span, alignment, attributes,
  // and paired request fields. It does not make EXOKAY legality a burst-only test.
  it('treats EXOKAY coverage as conditional on the full exclusive context', () => {
    const visual = getVisualById('cm-axi-burst-resp');
    if (!visual || visual.type !== 'coverage-map') throw new Error('Missing AXI coverage map');

    const fixedExokay = visual.bins.find(bin => bin.x === 'FIXED' && bin.y === 'EXOKAY');
    expect(fixedExokay?.illegal).toBe(false);
    expect(fixedExokay?.tooltip).toMatch(/AxLOCK.*exclusive span.*alignment.*attribute/i);
    expect(lesson(36).body).toMatch(/Burst type alone is not enough/i);
    expect(lesson(36).body).not.toMatch(/EXOKAY.*illegal for a `FIXED` burst/i);
  });

  it('checks both directions of exact WLAST placement on accepted transfers', () => {
    const visual = getVisualById('fp-axi-wlast-exact');
    if (!visual || visual.type !== 'formal-property') throw new Error('Missing AXI formal visual');

    expect(visual.property.svaString).toMatch(/WVALID && WREADY.*WLAST == \(beat_index == AWLEN\)/i);
    expect(visual.property.description).toMatch(/both directions/i);
    expect(visual.waveform.signals.find(signal => signal.name === 'ACCEPTED_BEAT')?.values)
      .toEqual(['-', '1 of 4', '2 of 4', '3 of 4', '4 of 4', '-', '-']);
    visual.waveform.signals.forEach(signal => {
      expect(signal.values, signal.name).toHaveLength(visual.waveform.cycleCount);
    });
    expect(lesson(37).body).toMatch(/Formal results are only as strong as the property.*assumptions/i);
    expect(lesson(37).body).toMatch(/base protocol.*do not supply one universal response-time bound/i);
  });

  it('corrects common-bug rules without inventing QoS, ID-width, or liveness mandates', () => {
    const axiRules = specRulesData.rules.filter(rule => rule.protocol === 'axi');
    const qos = axiRules.find(rule => rule.id === 'axi-qos-starvation');
    const idWidth = axiRules.find(rule => rule.id === 'axi-id-truncation');
    const circular = axiRules.find(rule => rule.id === 'axi-circular-backpressure');

    expect(qos?.statement).toMatch(/does not specify the exact use.*recommends.*higher value/i);
    expect(qos?.statement).toMatch(/fairness.*system policy/i);
    expect(idWidth?.statement).toMatch(/manipulation of AXI IDs.*preserve.*original ID/i);
    expect(idWidth?.bugPattern.rootCause).toMatch(/Narrowing is not inherently illegal/i);
    expect(circular?.statement).toMatch(/source.*not wait for READY.*READY can wait for VALID/i);
    expect(circular?.bugPattern.rootCause).toMatch(/withholds BREADY.*withholds WREADY/i);
    expect(lesson(38).body).toMatch(/integration liveness failure/i);
  });

  it('retains diagnostic ownership while distinguishing safety from liveness', () => {
    const outOfOrder = getVisualById('wf-axi-out-of-order');
    const deadlock = getVisualById('wf-axi-deadlock');
    const wlast = getVisualById('wf-axi-debug-wlast');
    if (!outOfOrder || outOfOrder.type !== 'waveform') throw new Error('Missing reorder waveform');
    if (!deadlock || deadlock.type !== 'waveform') throw new Error('Missing deadlock waveform');
    if (!wlast || wlast.type !== 'waveform') throw new Error('Missing WLAST waveform');

    expect(outOfOrder.signals.find(signal => signal.name === 'RID')?.values.filter(value => value !== '-'))
      .toEqual(['1', '1', '0', '0']);
    expect(deadlock.violations).toBeUndefined();
    expect(deadlock.annotations?.some(annotation => /system-level liveness design failure/i.test(annotation.message)))
      .toBe(true);
    expect(wlast.violations?.map(violation => violation.cycle)).toEqual([4, 5]);
    expect(lesson(39).body).toMatch(/rather than automatically a single-interface safety violation/i);
  });

  it('loads a complete evidence-oriented expert checklist', () => {
    const checklist = getChecklistById('axi-expert');
    expect(checklist).toBeDefined();
    expect(checklist?.items).toHaveLength(12);
    expect(checklist?.items.map(item => item.description).join(' ')).toMatch(/full 4 KB span/i);
    expect(checklist?.items.map(item => item.description).join(' ')).toMatch(/fairness, QoS, timeout, latency/i);
    expect(lesson(40).lesson.checklistIds).toEqual(['axi-expert']);

    const evidence = getVisualById('sig-axi-signoff-evidence');
    if (!evidence || evidence.type !== 'signal-explorer') throw new Error('Missing AXI signoff explorer');
    expect(evidence.signals.find(signal => signal.name === 'Coverage closure')?.verificationNote)
      .toMatch(/AxLOCK.*additional dimensions/i);
  });

  it('provides a complete AXI4 channel reference with ownership and DV context', () => {
    const visual = getVisualById('axi-signal-ref');
    if (!visual || visual.type !== 'signal-explorer') throw new Error('Missing AXI signal reference');

    expect(visual.signals).toHaveLength(46);
    expect(visual.signals.map(signal => signal.name)).toEqual(expect.arrayContaining([
      'ACLK', 'ARESETn', 'AWID', 'AWREGION', 'AWUSER', 'WSTRB', 'BID', 'BRESP',
      'ARID', 'ARREGION', 'ARUSER', 'RID', 'RRESP', 'RUSER',
    ]));
    expect(visual.signals.some(signal => signal.name === 'WID')).toBe(false);
    for (const signal of visual.signals) {
      expect(signal.direction?.trim(), `${signal.name} direction`).toBeTruthy();
      expect(signal.sampled?.trim(), `${signal.name} sampling`).toBeTruthy();
      expect(signal.verificationNote?.trim(), `${signal.name} DV context`).toBeTruthy();
    }
    expect(visual.signals.find(signal => signal.name === 'BVALID')?.verificationNote)
      .toMatch(/AW handshake.*accepted WLAST/i);
  });

  // Arm IHI 0022H A6: read responses within one ID and write responses
  // within one ID preserve request order; different IDs can reorder.
  it('makes the per-ID response queue decision explicit in the ordering review', () => {
    const visual = getVisualById('tl-axi-ordering-review');
    if (!visual || visual.type !== 'timeline') throw new Error('Missing AXI ordering review timeline');

    expect(visual.transactions?.find(transaction => transaction.id === 'legal-cab')?.phases.map(phase => phase.name))
      .toEqual(['C · ID 2', 'A · ID 5', 'B · ID 5']);
    expect(visual.transactions?.find(transaction => transaction.id === 'illegal-bca')?.phases[0].description)
      .toMatch(/younger ID-5 write.*before A/i);
    expect(visual.annotations?.find(annotation => annotation.phase === 'bca-b')?.message)
      .toMatch(/head of that ID's outstanding queue is still A/i);
    expect(lesson(42).body).toMatch(/memory, barrier, or system constraint/i);
    expect(lesson(42).body).toMatch(/Matching read\/write ID values do not create cross-channel order/i);
  });

  it('qualifies the waveform review and senior recap with accepted-edge and product-policy context', () => {
    expect(lesson(43).body).toMatch(/channel independence, not a universal latency advantage/i);
    expect(lesson(43).body).toMatch(/long stall can be legal/i);

    const recap = getVisualById('sig-axi-senior-recap');
    if (!recap || recap.type !== 'signal-explorer') throw new Error('Missing AXI recap explorer');
    expect(recap.signals.find(signal => signal.name === 'Is every long stall a violation?')?.description)
      .toMatch(/does not provide one universal finite READY or response-latency bound/i);
    expect(recap.signals.find(signal => signal.name === 'What does ID ordering guarantee?')?.verificationNote)
      .toMatch(/ID selects an ordering queue.*address.*expected data/i);
    expect(lesson(44).body).toMatch(/per-ID issue-order queue.*full stored request context/i);
    expect(lesson(44).body).toMatch(/one decode target.*address increments/i);
    expect(lesson(44).body).toMatch(/different IDs to permit and observe reordering/i);
    expect(lesson(44).body).not.toMatch(/unique IDs to force out-of-order/i);
  });
});
