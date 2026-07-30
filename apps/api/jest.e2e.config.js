/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  setupFiles: ['<rootDir>/test/jest-e2e.setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
