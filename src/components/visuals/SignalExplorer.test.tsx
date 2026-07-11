import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SignalExplorer from './SignalExplorer';
import type { SignalExplorerData } from '../../types/visuals';

const mockData: SignalExplorerData = {
  id: 'test-se',
  type: 'signal-explorer',
  title: 'Test Signals',
  signals: [
    {
      name: 'VALID',
      expansion: 'Valid',
      role: 'control',
      description: 'Asserted when data is valid.'
    }
  ]
};

describe('SignalExplorer', () => {
  it('renders signals grouped by role', () => {
    render(<SignalExplorer data={mockData} />);
    expect(screen.getByText('CONTROL SIGNALS')).toBeInTheDocument();
    expect(screen.getByText('VALID')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('clicking a signal expands its details', () => {
    render(<SignalExplorer data={mockData} />);
    
    // Description shouldn't be visible initially
    expect(screen.queryByText('Asserted when data is valid.')).not.toBeInTheDocument();
    
    // Click the signal item header
    fireEvent.click(screen.getByText('VALID'));
    
    // Description should now be visible
    expect(screen.getByText('Asserted when data is valid.')).toBeInTheDocument();
  });
});
