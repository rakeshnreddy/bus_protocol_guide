import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import 'vitest-axe/extend-expect';

expect.extend(matchers);

// Node 25 exposes localStorage behind an experimental file-backed getter.
// A deterministic in-memory implementation keeps browser-oriented tests quiet.
const testStorage = new Map<string, string>();
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => testStorage.get(key) ?? null,
    setItem: (key: string, value: string) => testStorage.set(key, value),
    removeItem: (key: string) => testStorage.delete(key),
    clear: () => testStorage.clear(),
  },
});

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
  testStorage.clear();
});
