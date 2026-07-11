import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from './SearchBar';
import { vi, describe, it, expect } from 'vitest';

// Mock search module
vi.mock('../lib/search', () => ({
  buildSearchIndex: vi.fn(),
  search: vi.fn((query) => {
    if (query === 'HREADY') {
      return [{
        id: 'signal-ahb-HREADY',
        type: 'signal',
        title: 'HREADY',
        description: 'AHB Ready signal',
        path: '/reference/ahb-signals'
      }];
    }
    return [];
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('SearchBar', () => {
  it('renders input field', () => {
    render(<MemoryRouter><SearchBar /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Search lessons/i)).toBeInTheDocument();
  });

  it('shows results when typing', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><SearchBar /></MemoryRouter>);
    const input = screen.getByPlaceholderText(/Search lessons/i);
    await user.type(input, 'HREADY');
    expect(await screen.findByText(/HREADY/)).toBeInTheDocument();
    expect(screen.getByText(/AHB Ready signal/)).toBeInTheDocument();
  });

  it('navigates when a result is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><SearchBar /></MemoryRouter>);
    const input = screen.getByPlaceholderText(/Search lessons/i);
    await user.type(input, 'HREADY');
    const result = await screen.findByText(/HREADY/);
    await user.click(result);
    expect(mockNavigate).toHaveBeenCalledWith('/reference/ahb-signals');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><SearchBar /></MemoryRouter>);
    const input = screen.getByPlaceholderText(/Search lessons/i);
    await user.type(input, 'HREADY');
    await screen.findByText(/HREADY/);
    
    // Arrow down
    await user.keyboard('{ArrowDown}');
    // Enter
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/reference/ahb-signals');
  });
});
