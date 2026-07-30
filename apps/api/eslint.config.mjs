import { nodeConfig } from '@erms/eslint-config/node';

export default [
  ...nodeConfig,
  {
    rules: {
      // NestJS relies on decorator metadata reflection which the checked
      // rule set below cannot statically verify; scoped off for this app only.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['test/**/*.ts', 'src/**/*.test.ts'],
    rules: {
      // supertest's request() and Nest's getHttpServer() are untyped at
      // this boundary; and jest-e2e.setup.ts is the intentional exception
      // to the process.env rule (test-harness bootstrap, not app runtime).
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-restricted-syntax': 'off',
    },
  },
];
