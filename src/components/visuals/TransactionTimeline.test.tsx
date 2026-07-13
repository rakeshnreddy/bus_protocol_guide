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

  it('renders and explains overlapping transaction lanes', () => {
    const laneData: TransactionTimelineData = {
      id: 'multi-lane',
      type: 'timeline',
      title: 'Out-of-order completion',
      transactions: [
        {
          id: 'T1',
          label: 'Burst A',
          phases: [
            { id: 'T1-response', name: 'Response', startCycle: 4, endCycle: 5, description: 'Burst A responds last.' },
          ],
        },
        {
          id: 'T2',
          label: 'Burst B',
          phases: [
            { id: 'T2-response', name: 'Response', startCycle: 3, endCycle: 4, description: 'Burst B responds first.' },
          ],
        },
      ],
    };

    render(<TransactionTimeline data={laneData} />);
    const burstBResponse = screen.getByRole('button', { name: /Burst B: Response/ });
    expect(burstBResponse).toBeInTheDocument();
    expect(burstBResponse).not.toHaveTextContent(/1 cycle/);

    fireEvent.focus(burstBResponse);
    expect(screen.getByText('Burst B responds first.')).toBeInTheDocument();
  });

  it('shows a useful empty state for malformed timeline data', () => {
    render(<TransactionTimeline data={{ id: 'empty', type: 'timeline', title: 'Empty' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('No timeline phases are available');
  });
});
