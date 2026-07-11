import { describe, it, expect } from 'vitest';
import { getLessons, getGlossaryEntries } from './lib/loaders';

describe('Cross-linking Audit', () => {
  const lessons = getLessons().map(l => l.lesson);
  const glossary = getGlossaryEntries();

  const lessonIds = new Set(lessons.map(l => l.id));
  const glossaryTerms = new Set(glossary.map(g => g.term));

  it('all relatedLessons in lessons point to valid lessons', () => {
    lessons.forEach(lesson => {
      (lesson.relatedLessons || []).forEach(rel => {
        expect(lessonIds.has(rel), `Lesson ${lesson.id} references missing related lesson: ${rel}`).toBe(true);
      });
    });
  });

  it('all prerequisites in lessons point to valid lessons', () => {
    const errors: string[] = [];
    lessons.forEach(lesson => {
      (lesson.prerequisites || []).forEach(pre => {
        if (!lessonIds.has(pre)) errors.push(`Lesson ${lesson.id} references missing prerequisite: ${pre}`);
      });
    });
    expect(errors.length, errors.join('\\n')).toBe(0);
  });

  it('all glossaryTerms in lessons point to valid glossary entries', () => {
    const termsUsed = new Set<string>();
    const errors: string[] = [];
    
    lessons.forEach(lesson => {
      (lesson.glossaryTerms || []).forEach(term => {
        if (!glossaryTerms.has(term)) errors.push(`Lesson ${lesson.id} references missing glossary term: ${term}`);
        termsUsed.add(term);
      });
    });

    // Check for orphaned glossary terms
    glossaryTerms.forEach(term => {
      if (!termsUsed.has(term)) errors.push(`Glossary term "${term}" is orphaned`);
    });
    
    expect(errors.length, errors.join('\\n')).toBe(0);
  });
});
