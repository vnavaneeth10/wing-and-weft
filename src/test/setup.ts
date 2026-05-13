// src/test/setup.ts

import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// ─────────────────────────────────────────────────────────────
// Auto cleanup + restore mocks
// Prevents DOM leakage and mock pollution across tests
// ─────────────────────────────────────────────────────────────
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────
// IntersectionObserver mock
// Required for lazy loading / animations / visibility hooks
// ─────────────────────────────────────────────────────────────
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// ─────────────────────────────────────────────────────────────
// ResizeObserver mock
// Used by Radix UI / responsive libraries
// ─────────────────────────────────────────────────────────────
class MockResizeObserver implements ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

// ─────────────────────────────────────────────────────────────
// matchMedia mock
// Required for responsive hooks and theme handling
// ─────────────────────────────────────────────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─────────────────────────────────────────────────────────────
// window.open mock
// Prevents jsdom navigation warnings
// ─────────────────────────────────────────────────────────────
vi.stubGlobal('open', vi.fn());

// ─────────────────────────────────────────────────────────────
// scrollTo mock
// Needed for navigation / scroll restoration tests
// ─────────────────────────────────────────────────────────────
window.scrollTo = vi.fn();

// ─────────────────────────────────────────────────────────────
// localStorage mock
// Stable storage behavior across tests
// ─────────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),

    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),

    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),

    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

// ─────────────────────────────────────────────────────────────
// URL mocks
// Prevent blob/file API crashes in tests
// ─────────────────────────────────────────────────────────────
global.URL.createObjectURL = vi
  .fn()
  .mockReturnValue('blob:mock-url');

global.URL.revokeObjectURL = vi.fn();