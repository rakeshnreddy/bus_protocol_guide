import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LessonRenderer from './LessonRenderer';
import type { Lesson } from '../types/content';

// Mock the loaders so we can test the interactive integrations
vi.mock('../lib/loaders', () => ({
  getExerciseById: vi.fn((id: string) => {
    if (id === 'ex-1') return { id: 'ex-1', type: 'reflection', prompt: 'Mock Exercise', expectedTakeaway: 'Mock Takeaway' };
    return undefined;
  }),
  getChecklistById: vi.fn((id: string) => {
    if (id === 'cl-1') return { id: 'cl-1', title: 'Mock Checklist', items: [{ id: 'i1', description: 'Item 1', done: false }] };
    return undefined;
  }),
  getGlossaryEntries: vi.fn(() => [
    { term: 'master', expandedForm: 'Master', definition: 'Initiates transactions.' }
  ])
}));

// Mock VisualRenderer to isolate its test
vi.mock('./visuals/VisualRenderer', () => ({
  default: ({ visualRef }: any) => <div data-testid={`mock-visual-${visualRef.id}`} />
}));

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
  exerciseIds: ['ex-1'],
  glossaryTerms: ['master'],
  checklistIds: ['cl-1'],
  order: 1
};

describe('LessonRenderer', () => {
  it('renders lesson title, summary, and markdown body', () => {
    const body = 'This is a **markdown** body.';
    render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body={body} />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Lesson Title')).toBeInTheDocument();
    expect(screen.getByText('Test summary.')).toBeInTheDocument();
    // markdown should render bold text
    const strongEl = screen.getByText('markdown');
    expect(strongEl.tagName).toBe('STRONG');
  });

  it('renders inline visuals using the special syntax', () => {
    const body = 'Here is a visual: ![Caption](visual:wf-1)';
    render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body={body} />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('mock-visual-wf-1')).toBeInTheDocument();
    expect(screen.getByText('Figure: Caption')).toBeInTheDocument();
  });

  it('renders interactive exercises from exerciseIds', () => {
    render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body="" />
      </MemoryRouter>
    );
    expect(screen.getByText('Check your understanding')).toBeInTheDocument();
    expect(screen.getByText('Mock Exercise')).toBeInTheDocument();
  });

  it('renders interactive checklists from checklistIds', () => {
    render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body="" />
      </MemoryRouter>
    );
    expect(screen.getByText('Checklist: Mock Checklist')).toBeInTheDocument();
  });

  it('renders inline glossary terms and tooltips from markdown links', () => {
    const body = 'A [master](glossary:master) device.';
    render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body={body} />
      </MemoryRouter>
    );
    
    const inlineTerm = screen.getAllByText('master')[0];
    expect(inlineTerm).toBeInTheDocument();
    
    // The tooltip content should be present
    expect(screen.getByText(/Initiates transactions/)).toBeInTheDocument();
  });
});
