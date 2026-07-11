import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChecklistViewer from './ChecklistViewer';
import type { Checklist } from '../../types/content';

const mockChecklist: Checklist = {
  id: 'cl-1',
  title: 'Test Checklist',
  protocol: 'foundations',
  items: [
    { id: 'item1', description: 'Task 1', done: false },
    { id: 'item2', description: 'Task 2', done: false }
  ]
};

describe('ChecklistViewer', () => {
  it('renders checklist items', () => {
    render(<ChecklistViewer checklist={mockChecklist} />);
    expect(screen.getByText('Checklist: Test Checklist')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('toggles item state on click and updates progress', () => {
    render(<ChecklistViewer checklist={mockChecklist} />);
    
    // Progress should be 0/2
    expect(screen.getByText('0 / 2')).toBeInTheDocument();
    
    // Click Task 1 checkbox (the input element is previous sibling or inside label)
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    
    // Progress should update to 1/2
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
});
