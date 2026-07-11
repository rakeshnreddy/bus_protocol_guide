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
});
