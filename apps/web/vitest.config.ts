import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': dirname,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['@erms/testing/vitest-setup'],
    globals: true,
    include: ['tests/unit/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    // lib/env.ts validates NEXT_PUBLIC_* eagerly at import time — these
    // defaults let unit tests import anything that touches it without
    // needing a real API to point at.
    env: {
      NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4000/api/v1',
      NEXT_PUBLIC_DEFAULT_LOCALE: 'en',
    },
  },
});
