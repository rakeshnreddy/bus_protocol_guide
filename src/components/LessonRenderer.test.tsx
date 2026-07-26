import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import LessonRenderer from './LessonRenderer';
import type { Lesson } from '../types/content';

// Mock the loaders so we can test the interactive integrations
vi.mock('../lib/loaders', () => ({
  getExerciseById: vi.fn((id: string) => {
    if (id === 'ex-1') return { id: 'ex-1', type: 'reflection', prompt: 'Mock Exercise', expectedTakeaway: 'Mock Takeaway' };
    if (id === 'lab-1') return {
      id: 'lab-1',
      title: 'Mock Applied Lab',
      type: 'diagnostic-lab',
      difficulty: 'advanced',
      protocolScope: 'AHB5',
      learnerQuestion: 'Which edge proves the failure?',
      prompt: 'Inspect the evidence.',
      scenario: 'A pending transfer changes.',
      expectedTakeaway: 'Retain accepted state.',
      relatedLessons: ['test-lesson'],
      evidence: {
        caption: 'Mock evidence.',
        columns: [{ key: 'ready', label: 'HREADY' }, { key: 'address', label: 'HADDR' }],
        rows: [
          { id: 'c1', label: 'C1', values: { ready: '0', address: '0x0' } },
          { id: 'c2', label: 'C2', values: { ready: '0', address: '0x4' } },
        ],
      },
      diagnosisSteps: [
        {
          id: 'locate',
          label: 'Locate',
          prompt: 'Where?',
          options: [{ id: 'c1', label: 'C1' }, { id: 'c2', label: 'C2' }],
          correctOptionId: 'c2',
          explanation: 'C2 changes.',
        },
        {
          id: 'verify',
          label: 'Verify',
          prompt: 'What evidence?',
          options: [{ id: 'none', label: 'None' }, { id: 'history', label: 'Accepted history' }],
          correctOptionId: 'history',
          explanation: 'History proves it.',
        },
      ],
    };
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

vi.mock('../lib/visualLoaders', () => ({
  getVisualById: vi.fn((id: string) => id === 'wf-1'
    ? { id: 'wf-1', type: 'waveform', title: 'Mock Waveform' }
    : undefined),
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
  visualIds: ['wf-1'],
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
    expect(document.querySelector('.inline-visual-caption')).toHaveTextContent('Figure Caption');
    expect(screen.getByText('Visual 1 of 1')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Visual 1 of 1' })).toBeInTheDocument();
    expect(screen.getByText('Waveform')).toBeInTheDocument();
    expect(screen.getByText(/Identify the accepting edge, phase owner/i)).toBeInTheDocument();
  });

  it('exposes named lesson progress as accessible grouped metadata', () => {
    render(
      <MemoryRouter>
        <LessonRenderer
          lesson={mockLesson}
          body="Lesson content."
          navigation={{ current: 1, total: 6 }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('group', { name: 'Lesson 1 of 6' })).toHaveTextContent(
      'FOUNDATIONS path',
    );
  });

  it('provides a visual-first lesson workflow and retrieval prompts', () => {
    render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body="Lesson content." />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Lesson workflow' })).toBeInTheDocument();
    expect(screen.getByText('Inspect 1 visual')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Retain the model' })).toBeInTheDocument();
    expect(screen.getByText('Which component or protocol boundary owns each part of the transaction?'))
      .toBeInTheDocument();
  });

  it('supports pointer, Enter, and Space activation for the retention disclosure', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LessonRenderer lesson={mockLesson} body="Lesson content." />
      </MemoryRouter>
    );

    const summary = screen.getByText('Run the retrieval check').closest('summary');
    if (!summary) throw new Error('Expected retention summary');
    expect(summary.tagName).toBe('SUMMARY');
    await user.click(summary);

    expect(summary.closest('details')).toHaveAttribute('open');

    summary.focus();
    expect(summary).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(summary.closest('details')).not.toHaveAttribute('open');

    await user.keyboard(' ');
    expect(summary.closest('details')).toHaveAttribute('open');
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

  it('separates diagnostic labs into the Applied DV practice workflow', () => {
    render(
      <MemoryRouter>
        <LessonRenderer lesson={{ ...mockLesson, exerciseIds: ['lab-1', 'ex-1'] }} body="" />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Applied DV practice' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mock Applied Lab' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Check your understanding' })).toBeInTheDocument();
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
