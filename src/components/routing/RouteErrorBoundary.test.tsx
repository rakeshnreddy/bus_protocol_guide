import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RouteErrorBoundary } from './RouteErrorBoundary';

const ThrowingChild = () => {
  throw new Error('Test error');
};

describe('RouteErrorBoundary', () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = vi.fn(); // Suppress React error logging for intentional throws
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders normal children when no error occurs', () => {
    render(
      <RouteErrorBoundary>
        <div data-testid="normal-child">Normal Child</div>
      </RouteErrorBoundary>
    );
    expect(screen.getByTestId('normal-child')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <RouteErrorBoundary>
        <ThrowingChild />
      </RouteErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load page content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls injected retry callback when button is clicked', () => {
    const onRetry = vi.fn();
    render(
      <RouteErrorBoundary onRetry={onRetry}>
        <ThrowingChild />
      </RouteErrorBoundary>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('resets error state when resetKey changes', () => {
    const { rerender } = render(
      <RouteErrorBoundary resetKey="key1">
        <ThrowingChild />
      </RouteErrorBoundary>
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    rerender(
      <RouteErrorBoundary resetKey="key2">
        <div data-testid="normal-child">Normal Child</div>
      </RouteErrorBoundary>
    );
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('normal-child')).toBeInTheDocument();
  });
});
