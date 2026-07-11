import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// We mock the react-markdown library because jsdom sometimes struggles with complex
// remark/rehype pipelines during tests, and we just want to test routing here.
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-markdown">{children}</div>
}));

describe('App Smoke Test', () => {
  it('renders the app shell and homepage without crashing', () => {
    render(<App />);
    expect(screen.getByText('Bus Protocol DV Academy')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders sidebar lesson links grouped by protocol', () => {
    render(<App />);
    
    // Check that protocols exist in sidebar
    expect(screen.getByText('FOUNDATIONS')).toBeInTheDocument();
    
    // Check that seeded lesson links exist
    expect(screen.getByText('Bus Mental Models')).toBeInTheDocument();
  });

  it('navigating to a lesson route renders that lesson', async () => {
    render(<App />);
    
    // Click on a lesson link
    const link = screen.getByText('Bus Mental Models');
    fireEvent.click(link);
    
    // The lesson page should render the title (might be in header)
    // We expect the lesson title to appear in an H1 tag inside the main content
    const heading = await screen.findByRole('heading', { name: 'Bus Mental Models' });
    expect(heading).toBeInTheDocument();
    
    // The mock markdown should have rendered the body
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
  });
});
