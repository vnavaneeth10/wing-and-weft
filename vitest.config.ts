// vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    // Better browser API support than happy-dom
    environment: 'jsdom',

    globals: true,

    setupFiles: ['./src/test/setup.ts'],

    css: true,

    coverage: {
      provider: 'v8',

      reporter: ['text', 'html', 'lcov'],

      include: [
        'src/components/**',
        'src/pages/**',
        'src/hooks/**',
        'src/context/**',
        'src/lib/**',
        'src/admin/**',
      ],

      exclude: [
        'src/test/**',
        '**/*.d.ts',
        '**/types/**',
        '**/vite-env.d.ts',
      ],
    },
  },
});