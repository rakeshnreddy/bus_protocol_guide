import { describe, it, expect } from 'vitest';
import { buildVisualRegistry, getVisualById, getVisualRegistryReport } from './visualLoaders';

describe('Visual Loaders', () => {
  it('should correctly resolve waveform visual data by ID', () => {
    const data = getVisualById('wf-foundations-handshake');
    expect(data).toBeDefined();
    expect(data?.type).toBe('waveform');
    expect(data?.title).toBeDefined();
  });

  it('should correctly resolve timeline visual data by ID', () => {
    const data = getVisualById('tl-abstract-transaction');
    expect(data).toBeDefined();
    expect(data?.type).toBe('timeline');
    expect(data?.title).toBeDefined();
  });

  it('should correctly resolve topology visual data by ID', () => {
    const data = getVisualById('tp-basic-ahb');
    expect(data).toBeDefined();
    expect(data?.type).toBe('topology');
    expect(data?.title).toBeDefined();
  });
  
  it('should correctly resolve signal explorer data by ID', () => {
    const data = getVisualById('se-foundations-signals');
    expect(data).toBeDefined();
    expect(data?.type).toBe('signal-explorer');
  });

  it('should correctly resolve coverage map data by ID', () => {
    const data = getVisualById('cm-axi-burst-resp');
    expect(data).toBeDefined();
    expect(data?.type).toBe('coverage-map');
    expect(data?.title).toBeDefined();
  });

  it('should discover legacy root-level visual files', () => {
    expect(getVisualById('wf-ahb-reset')?.type).toBe('waveform');
    expect(getVisualById('tl-ahb-exclusive')?.type).toBe('timeline');
    expect(getVisualById('topo-ahb-multi-master')?.type).toBe('topology');
    expect(getVisualById('spec-rule-explorer-axi')?.type).toBe('spec-rule-explorer');
  });

  it('should normalize the legacy AXI signals type', () => {
    expect(getVisualById('axi-signal-ref')?.type).toBe('signal-explorer');
  });

  it('should normalize nested legacy waveform data and half-cycle samples', () => {
    const nestedWaveform = getVisualById('wf-handshake-backpressure');
    expect(nestedWaveform?.type).toBe('waveform');
    if (nestedWaveform?.type !== 'waveform') throw new Error('Expected waveform');
    expect(nestedWaveform.cycleCount).toBe(6);
    expect(nestedWaveform.signals.find(signal => signal.name === 'VALID')?.values).toEqual(['0', '1', '1', '1', '0', '0']);

    const halfCycleWaveform = getVisualById('wf-ahb-wait-state');
    expect(halfCycleWaveform?.type).toBe('waveform');
    if (halfCycleWaveform?.type !== 'waveform') throw new Error('Expected waveform');
    expect(halfCycleWaveform.signals.find(signal => signal.name === 'HADDR')?.values).toHaveLength(6);
    expect(halfCycleWaveform.signals.find(signal => signal.name === 'HTRANS')?.type).toBe('sideband');
    expect(halfCycleWaveform.signals.find(signal => signal.name === 'HADDR')?.color).toBe('#7c3aed');
  });

  it('should preserve native per-cycle Batch 2 waveform data', () => {
    const data = getVisualById('wf-ahb-simple-transfer');
    expect(data?.type).toBe('waveform');
    if (data?.type !== 'waveform') throw new Error('Expected waveform');
    expect(data.cycleCount).toBe(5);
    expect(data.signals.find(signal => signal.name === 'HTRANS')?.values)
      .toEqual(['NONSEQ', 'NONSEQ', 'IDLE', 'IDLE', 'IDLE']);
    expect(data.annotations?.[1]?.message).toMatch(/remain independent/i);
  });

  it('should normalize WaveDrom-style debug waveform data', () => {
    const { registry } = buildVisualRegistry({
      '../../content/visuals/wf-legacy-wavedrom.json': {
        id: 'wf-legacy-wavedrom',
        type: 'waveform',
        title: 'Legacy WaveDrom waveform',
        signals: [
          { name: 'clk', wave: 'p........' },
          { name: 'WDATA', wave: 'x..====x.', data: ['D0', 'D1', 'D2', 'D3'] },
          { name: 'WLAST', wave: '0....10..' },
        ],
        annotations: [{ time: 5, text: 'WLAST asserted early.' }],
      },
    });
    const data = registry.get('wf-legacy-wavedrom');
    expect(data?.type).toBe('waveform');
    if (data?.type !== 'waveform') throw new Error('Expected waveform');
    expect(data.cycleCount).toBe(9);
    expect(data.signals.find(signal => signal.name === 'WDATA')?.values).toContain('D3');
    expect(data.annotations?.[0]?.message).toMatch(/WLAST asserted/);
  });

  it('should normalize legacy topology fields and stable edge IDs', () => {
    const data = getVisualById('tp-axi-crossbar');
    expect(data?.type).toBe('topology');
    if (data?.type !== 'topology') throw new Error('Expected topology');
    expect(data.nodes.find(node => node.id === 'xbar')?.type).toBe('arbiter');
    expect(data.edges[0]).toMatchObject({ source: 'm1', target: 'xbar' });
    expect(data.edges.every(edge => Boolean(edge.id))).toBe(true);
    expect(data.highlightedPath).toEqual([
      'm1',
      'e-m0-xbar',
      'xbar',
      'e-xbar-s0',
      's1',
      'm2',
      'e-m1-xbar',
      'e-xbar-s1',
      's2',
    ]);

    const ahbData = getVisualById('topo-ahb-multi-master');
    expect(ahbData?.type).toBe('topology');
    if (ahbData?.type !== 'topology') throw new Error('Expected topology');
    expect(ahbData.highlightedPath).toContain('e-dec-s2');
  });

  it('should preserve legacy multi-transaction timeline lanes', () => {
    const data = getVisualById('tl-burst-transfer');
    expect(data?.type).toBe('timeline');
    if (data?.type !== 'timeline') throw new Error('Expected timeline');
    expect(data.transactions).toHaveLength(2);
    expect(data.transactions?.[1].phases.find(phase => phase.name === 'Response')).toMatchObject({
      startCycle: 7,
      endCycle: 8,
    });
  });

  it('should return undefined for unknown visual IDs', () => {
    const data = getVisualById('unknown-id-123');
    expect(data).toBeUndefined();
  });

  it('should infer only established root prefixes and typed folders when type is absent', () => {
    const result = buildVisualRegistry({
      '../../content/visuals/wf-prefix.json': {
        id: 'wf-prefix', title: 'Prefix waveform', cycleCount: 1, signals: [],
      },
      '../../content/visuals/signals/typed.json': {
        id: 'typed-signal', title: 'Typed signal', signals: [],
      },
      '../../content/visuals/mystery.json': {
        id: 'mystery', title: 'Unknown visual',
      },
      '../../content/visuals/wf-explicit-unknown.json': {
        id: 'wf-explicit-unknown', title: 'Explicit unknown', type: 'not-supported',
      },
    });

    expect(result.registry.get('wf-prefix')?.type).toBe('waveform');
    expect(result.registry.get('typed-signal')?.type).toBe('signal-explorer');
    expect(result.registry.has('mystery')).toBe(false);
    expect(result.registry.has('wf-explicit-unknown')).toBe(false);
    expect(result.issues.filter(issue => issue.kind === 'unsupported-type')).toHaveLength(2);
  });

  it('should isolate malformed assets and preserve the first duplicate with source diagnostics', () => {
    const result = buildVisualRegistry({
      '../../content/visuals/waveforms/valid.json': {
        id: 'same-id', type: 'waveform', title: 'First', cycleCount: 1, signals: [],
      },
      '../../content/visuals/timelines/duplicate.json': {
        id: 'same-id', type: 'timeline', title: 'Second', phases: [],
      },
      '../../content/visuals/not-an-object.json': [],
      '../../content/visuals/missing-id.json': { type: 'waveform', title: 'Missing ID' },
      '../../content/visuals/topologies/still-valid.json': {
        id: 'still-valid', type: 'topology', title: 'Still valid', nodes: [], edges: [],
      },
    });

    expect(result.registry.get('same-id')?.title).toBe('First');
    expect(result.registry.has('still-valid')).toBe(true);
    expect(result.sourcePaths.get('same-id')).toContain('valid.json');
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'duplicate-id', id: 'same-id', originalPath: expect.stringContaining('valid.json') }),
      expect.objectContaining({ kind: 'malformed-file' }),
      expect.objectContaining({ kind: 'missing-id' }),
    ]));
  });

  it('should report a clean production registry with recovered root-level files', () => {
    const report = getVisualRegistryReport();
    expect(report.totalVisuals).toBeGreaterThanOrEqual(50);
    expect(report.rootLevelVisualsRecovered).toBe(35);
    expect(report.duplicateIds).toEqual([]);
    expect(report.malformedFiles).toEqual([]);
    expect(report.unsupportedFiles).toEqual([]);
  });
});
