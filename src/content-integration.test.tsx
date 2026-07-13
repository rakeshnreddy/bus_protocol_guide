import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { getLessons, getGlossaryEntries, getExercises, getChecklists } from './lib/loaders';
import { MemoryRouter } from 'react-router-dom';
import LessonRenderer from './components/LessonRenderer';

describe('Content Integration Tests', () => {
  it('loads and parses all lessons without error', () => {
    const lessons = getLessons();
    expect(lessons.length).toBeGreaterThan(0);
    
    // Ensure all required fields exist on every lesson
    lessons.forEach(({ lesson, body }) => {
      expect(lesson.id).toBeDefined();
      expect(lesson.title).toBeDefined();
      expect(lesson.protocol).toBeDefined();
      expect(body).toBeDefined();
      expect(typeof body).toBe('string');
    });
  });

  it('does not contain old ::: visual syntax in any lesson (markdown visual syntax regression guard)', () => {
    const lessons = getLessons();
    lessons.forEach(({ body }) => {
      expect(body).not.toMatch(/:::\s*visual/);
    });
  });

  it('renders all lessons through LessonRenderer without throwing', () => {
    const lessons = getLessons();
    
    lessons.forEach(({ lesson, body }) => {
      try {
        const { unmount } = render(
          <MemoryRouter>
            <LessonRenderer lesson={lesson} body={body} />
          </MemoryRouter>
        );
        unmount(); // Clean up to prevent DOM bloat
      } catch (error) {
        throw new Error(`Failed to render lesson ${lesson.id}: ${error}`);
      }
    });
  }, 30000);

  it('loads all glossaries without error', () => {
    const terms = getGlossaryEntries();
    expect(terms.length).toBeGreaterThan(0);
    terms.forEach(term => {
      expect(term.term).toBeDefined();
      expect(term.definition).toBeDefined();
    });
  });

  it('loads all exercises without error', () => {
    const exercises = getExercises();
    expect(exercises.length).toBeGreaterThan(0);
    exercises.forEach(ex => {
      expect(ex.id).toBeDefined();
      expect(ex.prompt).toBeDefined();
      expect(ex.type).toBeDefined();
    });
  });

  it('loads all checklists without error', () => {
    const checklists = getChecklists();
    expect(checklists.length).toBeGreaterThan(0);
    checklists.forEach(cl => {
      expect(cl.id).toBeDefined();
      expect(cl.title).toBeDefined();
      expect(cl.items).toBeDefined();
      expect(Array.isArray(cl.items)).toBe(true);
    });
  });
});
