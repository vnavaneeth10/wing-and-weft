// src/test/setup.ts
//
// Global test bootstrap for Wing & Weft Vitest suite.
// Referenced by vitest.config.ts → test.setupFiles.

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── IntersectionObserver ──────────────────────────────────────────────────────
// happy-dom does not implement IntersectionObserver, so ContactPage's
// useVisible() hook would throw without this stub.
// We make every element immediately "visible" so animated sections render.

const IntersectionObserverMock = vi.fn().mockImplementation((callback: IntersectionObserverCallback) => ({
  observe: vi.fn((el: Element) => {
    // Fire the callback immediately so useVisible() sets vis=true synchronously
    callback(
      [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  }),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// ── window.open ───────────────────────────────────────────────────────────────
// Prevent JSDOM warnings about missing opener implementation.
vi.stubGlobal('open', vi.fn());