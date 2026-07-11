import { describe, it, expect } from 'vitest';
import ahbSignalsData from '../content/visuals/sig-ahb-full.json';
import axiSignalsData from '../content/visuals/axi-signal-ref.json';
import { getGlossaryEntries } from './lib/loaders';

describe('Signal Reference Links Verification', () => {
  it('ensures every AHB signal with a relatedTermId maps to a lesson', () => {
    const entries = getGlossaryEntries();
    
    let linkedSignalsCount = 0;
    ahbSignalsData.signals.forEach(sig => {
      if (sig.relatedTermId) {
        const term = entries.find(g => g.term === sig.relatedTermId);
        expect(term, `Glossary term ${sig.relatedTermId} missing`).toBeDefined();
        expect(term?.relatedLessons?.length ?? 0, `Term ${sig.relatedTermId} has no related lessons`).toBeGreaterThan(0);
        linkedSignalsCount++;
      }
    });
    // Ensure we actually checked some signals
    expect(linkedSignalsCount).toBeGreaterThan(0);
  });

  it('ensures every AXI signal with a relatedTermId maps to a lesson', () => {
    const entries = getGlossaryEntries();
    
    let linkedSignalsCount = 0;
    axiSignalsData.signals.forEach(sig => {
      if (sig.relatedTermId) {
        const term = entries.find(g => g.term === sig.relatedTermId);
        expect(term, `Glossary term ${sig.relatedTermId} missing`).toBeDefined();
        expect(term?.relatedLessons?.length ?? 0, `Term ${sig.relatedTermId} has no related lessons`).toBeGreaterThan(0);
        linkedSignalsCount++;
      }
    });
    // Ensure we actually checked some signals
    expect(linkedSignalsCount).toBeGreaterThan(0);
  });
});
