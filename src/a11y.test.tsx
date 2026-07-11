import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';


declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): Promise<void>;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): Promise<void>;
  }
}
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import App from './app/App';
import SearchBar from './components/SearchBar';
import LessonRenderer from './components/LessonRenderer';
import type { Lesson } from './types/content';

const mockLesson: Lesson = {
  id: 'test-lesson',
  title: 'Test Lesson Title',
  protocol: 'foundations',
  tier: 'core',
  level: 'beginner',
  summary: 'Test summary.',
  tags: ['test'],
  prerequisites: [],
  relatedLessons: [],
  visualIds: [],
  exerciseIds: [],
  glossaryTerms: [],
  checklistIds: [],
  order: 1
};

describe('Accessibility Audit (axe-core)', () => {
  it('AppShell and Navigation should have no a11y violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SearchBar should have no a11y violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LessonRenderer should have no a11y violations', async () => {
    const body = 'This is a test lesson body with a [link](glossary:axi).';
    const { container } = render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body={body} />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
