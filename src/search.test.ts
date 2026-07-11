import { describe, it, expect, beforeEach } from 'vitest';
import { buildSearchIndex, search } from './lib/search';

describe('Search Utility', () => {
  beforeEach(() => {
    buildSearchIndex();
  });

  it('finds lessons by title', () => {
    const results = search('AHB');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.type === 'lesson')).toBe(true);
  });

  it('finds glossary terms', () => {
    const results = search('Crossbar');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.type === 'glossary')).toBe(true);
  });

  it('finds signals', () => {
    const results = search('HREADY');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.type === 'signal')).toBe(true);
  });

  it('returns empty for empty query', () => {
    const results = search('   ');
    expect(results.length).toBe(0);
  });
});
