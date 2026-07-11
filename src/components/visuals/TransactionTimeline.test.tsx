import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TransactionTimeline from './TransactionTimeline';
import type { TransactionTimelineData } from '../../types/visuals';

const mockData: TransactionTimelineData = {
  id: 'test-tl',
  type: 'timeline',
  title: 'Test Timeline',
  phases: [
    {
      id: 'p1',
      name: 'Address Phase',
      durationCycles: 1,
      description: 'Send address'
    },
    {
      id: 'p2',
      name: 'Data Phase',
      durationCycles: 2,
      description: 'Send data'
    }
  ]
};

describe('TransactionTimeline', () => {
  it('renders all phases proportionally', () => {
    render(<TransactionTimeline data={mockData} />);
    expect(screen.getByText('Address Phase')).toBeInTheDocument();
    expect(screen.getByText('Data Phase')).toBeInTheDocument();
  });

  it('reveals phase description on click', () => {
    render(<TransactionTimeline data={mockData} />);
    
    // Should not be visible initially
    expect(screen.queryByText('Send address')).not.toBeInTheDocument();
    
    // Hover over the phase
    fireEvent.mouseEnter(screen.getByText('Address Phase'));
    
    // Description should now be visible
    expect(screen.getByText('Send address')).toBeInTheDocument();
  });
});
