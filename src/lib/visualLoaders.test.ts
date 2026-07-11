import { describe, it, expect } from 'vitest';
import { getVisualById } from './visualLoaders';

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

  it('should return undefined for unknown visual IDs', () => {
    const data = getVisualById('unknown-id-123');
    expect(data).toBeUndefined();
  });
});
