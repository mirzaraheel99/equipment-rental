import { reactConfig } from '@erms/eslint-config/react';

export default [
  ...reactConfig,
  {
    files: ['lib/env.ts'],
    rules: {
      // The one designated environment adapter (doc 25 "no direct
      // process.env usage outside configuration adapters"). Next.js also
      // requires literal `process.env.NEXT_PUBLIC_*` member expressions
      // here for its build-time client-bundle inlining to work.
      'no-restricted-syntax': 'off',
    },
  },
];
