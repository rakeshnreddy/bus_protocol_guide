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
import TopologyViewer from './components/visuals/TopologyViewer';
import { getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';
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
  }, 15000);

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

  it('AHB Batch 1 interactive signal lesson should have no a11y violations', async () => {
    const lessonContent = getLessons().find(({ lesson }) => lesson.id === '05_address_and_control');
    if (!lessonContent) throw new Error('Missing AHB address and control lesson');

    const { container } = render(
      <MemoryRouter>
        <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AHB Batch 2 alignment waveform lesson should have no a11y violations', async () => {
    const lessonContent = getLessons().find(({ lesson }) => lesson.id === '14_hsize_and_alignment');
    if (!lessonContent) throw new Error('Missing AHB HSIZE and alignment lesson');

    const { container } = render(
      <MemoryRouter>
        <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AHB Batch 2 performance timeline lesson should have no a11y violations', async () => {
    const lessonContent = getLessons().find(({ lesson }) => lesson.id === '18_throughput_vs_latency');
    if (!lessonContent) throw new Error('Missing AHB throughput and latency lesson');

    const { container } = render(
      <MemoryRouter>
        <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('interactive topology diagrams should have no a11y violations', async () => {
    const topology = getVisualById('topo-ahb-multi-master');
    if (!topology || topology.type !== 'topology') throw new Error('Missing AHB multi-master topology');

    const { container } = render(<TopologyViewer data={topology} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AHB Batch 3 security lesson should have no a11y violations', async () => {
    const lessonContent = getLessons().find(({ lesson }) => lesson.id === '27_secure_vs_non_secure');
    if (!lessonContent) throw new Error('Missing AHB secure versus non-secure lesson');

    const { container } = render(
      <MemoryRouter>
        <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AHB Batch 4 coverage lesson should have no a11y violations', async () => {
    const lessonContent = getLessons().find(({ lesson }) => lesson.id === '31_ahb_functional_coverage');
    if (!lessonContent) throw new Error('Missing AHB functional coverage lesson');

    const { container } = render(
      <MemoryRouter>
        <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
      </MemoryRouter>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
