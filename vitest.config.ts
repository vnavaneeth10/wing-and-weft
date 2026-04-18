// vitest.config.ts  (project root)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom for a fast, lightweight DOM environment.
    // Switch to 'jsdom' if you need fuller browser API coverage.
    environment: 'happy-dom',

    // Injects expect matchers from @testing-library/jest-dom globally
    // so every test file can use .toBeInTheDocument(), .toBeDisabled(), etc.
    globals: true,

    // Runs before every test file
    setupFiles: ['./src/test/setup.ts'],

    // Optional: collect coverage with `vitest run --coverage`
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/pages/**', 'src/components/**'],
    },
  },
});