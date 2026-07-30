import { reactConfig } from '@erms/eslint-config/react';

export default [
  ...reactConfig,
  {
    files: ['lib/env.ts'],
    rules: {
      // The one designated environment adapter — see apps/web's identical
      // override for the rationale.
      'no-restricted-syntax': 'off',
    },
  },
];
