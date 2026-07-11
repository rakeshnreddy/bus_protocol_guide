import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteLoadingFallback } from './RouteLoadingFallback';

describe('RouteLoadingFallback', () => {
  it('renders loading text with correct aria attributes', () => {
    render(<RouteLoadingFallback />);
    const el = screen.getByRole('status');
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent('Loading page…');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });
});
