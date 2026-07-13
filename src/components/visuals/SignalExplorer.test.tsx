import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    
    fireEvent.click(screen.getByRole('button', { name: /VALID/ }));
    
    // Description should now be visible
    expect(screen.getByText('Asserted when data is valid.')).toBeInTheDocument();
  });

  it('uses a keyboard-accessible native control with a comfortable touch target', async () => {
    const user = userEvent.setup();
    render(<SignalExplorer data={mockData} />);
    const button = screen.getByRole('button', { name: /VALID/ });

    button.focus();
    await user.keyboard('{Enter}');

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(getComputedStyle(button).minHeight).toBe('52px');
  });
});
