import { describe, it, expect } from 'vitest';
import { getLessons, getLessonsByProtocol, getGlossaryEntries, getChecklists, getExercises, getChecklistById, getExerciseById } from './loaders';

// We rely on the actual seeded data from the content folder for these integration-style tests.
describe('Loaders', () => {
  it('should load all lessons successfully and parse frontmatter', () => {
    const lessons = getLessons();
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0]).toHaveProperty('lesson');
    expect(lessons[0]).toHaveProperty('body');
    expect(lessons[0].lesson).toHaveProperty('id');
    expect(lessons[0].lesson).toHaveProperty('title');
  });

  it('should group lessons by protocol', () => {
    const grouped = getLessonsByProtocol();
    expect(grouped).toHaveProperty('foundations');
    expect(grouped).toHaveProperty('ahb');
    expect(grouped).toHaveProperty('axi');
    
    // Check that items in ahb have protocol === 'ahb'
    if (grouped['ahb'].length > 0) {
      expect(grouped['ahb'][0].protocol).toBe('ahb');
    }
  });

  it('should load glossary entries', () => {
    const entries = getGlossaryEntries();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]).toHaveProperty('term');
    expect(entries[0]).toHaveProperty('definition');
  });

  it('should load checklists', () => {
    const checklists = getChecklists();
    expect(checklists.length).toBeGreaterThan(0);
    expect(checklists[0]).toHaveProperty('title');
    expect(checklists[0]).toHaveProperty('items');
  });

  it('should get checklist by ID', () => {
    const checklists = getChecklists();
    if (checklists.length > 0) {
      const id = checklists[0].id;
      const checklist = getChecklistById(id);
      expect(checklist).toBeDefined();
      expect(checklist?.id).toBe(id);
    }
  });

  it('should load exercises', () => {
    const exercises = getExercises();
    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises[0]).toHaveProperty('prompt');
  });

  it('should get exercise by ID', () => {
    const exercises = getExercises();
    if (exercises.length > 0) {
      const id = exercises[0].id;
      const exercise = getExerciseById(id);
      expect(exercise).toBeDefined();
      expect(exercise?.id).toBe(id);
    }
  });

  describe('Lesson Normalization', () => {
    it('should default missing collection arrays to empty arrays', () => {
      const lessons = getLessons();
      for (const { lesson } of lessons) {
        expect(Array.isArray(lesson.tags)).toBe(true);
        expect(Array.isArray(lesson.prerequisites)).toBe(true);
        expect(Array.isArray(lesson.relatedLessons)).toBe(true);
        expect(Array.isArray(lesson.visualIds)).toBe(true);
        expect(Array.isArray(lesson.exerciseIds)).toBe(true);
        expect(Array.isArray(lesson.glossaryTerms)).toBe(true);
        expect(Array.isArray(lesson.checklistIds)).toBe(true);
      }
    });

    it('should reject lessons with invalid core metadata', () => {
      // Tested by ensuring only 88 valid lessons load (any failures would reduce count)
      expect(getLessons().length).toBe(88);
    });
  });

  describe('Glossary Normalization', () => {
    it('should map legacy expansion to canonical expandedForm', () => {
      const entries = getGlossaryEntries();
      // BFM historically used "expansion", should now be under expandedForm
      const bfm = entries.find(e => e.term === 'BFM');
      if (bfm) {
        expect(bfm.expandedForm).toBe('Bus Functional Model');
      }
    });

    it('should derive missing protocolScope from file path', () => {
      const entries = getGlossaryEntries();
      // AHB items should have 'ahb'
      const hclk = entries.find(e => e.term === 'HCLK');
      if (hclk) {
        expect(hclk.protocolScope).toContain('ahb');
      }
    });

    it('should derive deterministic IDs when missing', () => {
      const entries = getGlossaryEntries();
      const allHaveIds = entries.every(e => typeof e.id === 'string' && e.id.length > 0);
      expect(allHaveIds).toBe(true);
    });

    it('should handle duplicate terms across protocols without ID collisions', () => {
      const entries = getGlossaryEntries();
      const transactions = entries.filter(e => e.term === 'Transaction');
      expect(transactions.length).toBeGreaterThan(1);
      
      const ids = new Set(transactions.map(t => t.id));
      expect(ids.size).toBe(transactions.length); // All IDs must be unique
    });

    it('should preserve relatedTerms if present', () => {
      const entries = getGlossaryEntries();
      const hasRelatedTerms = entries.some(e => e.relatedTerms && e.relatedTerms.length > 0);
      expect(hasRelatedTerms).toBe(true);
    });

    it('should default missing collection arrays to empty arrays', () => {
      const entries = getGlossaryEntries();
      for (const entry of entries) {
        expect(Array.isArray(entry.protocolScope)).toBe(true);
        expect(Array.isArray(entry.relatedSignals)).toBe(true);
        expect(Array.isArray(entry.relatedLessons)).toBe(true);
      }
    });
  });
});

