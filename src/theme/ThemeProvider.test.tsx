import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, themeStorageKey } from './ThemeProvider';
import ThemeSwitcher from './ThemeSwitcher';

function installMatchMedia(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<() => void>();
  const media = {
    get matches() { return dark; },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_event: string, listener: () => void) => listeners.delete(listener)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => media),
  });

  return {
    setDark(next: boolean) {
      dark = next;
      listeners.forEach(listener => listener());
    },
  };
}

describe('theme selection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    installMatchMedia(false);
  });

  afterEach(() => {
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.themePreference;
    document.documentElement.style.colorScheme = '';
  });

  it('defaults to the browser color-scheme preference', async () => {
    const system = installMatchMedia(true);
    render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(screen.getByRole('button', { name: 'Use system theme' })).toHaveAttribute('aria-pressed', 'true');

    act(() => system.setDark(false));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'));
  });

  it('lets the learner choose and persist a theme explicitly', async () => {
    render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Use dark theme' }));

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(document.documentElement.dataset.themePreference).toBe('dark');
    expect(window.localStorage.getItem(themeStorageKey)).toBe('dark');
    expect(screen.getByRole('button', { name: 'Use dark theme' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('gives every theme control a 44px touch target', () => {
    render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    }
  });
});
