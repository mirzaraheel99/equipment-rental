/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'src/.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  // Source uses explicit `.js` extensions on relative imports (valid,
  // required under NodeNext ESM and resolves correctly against compiled
  // CJS output) — but ts-jest/swc-jest run directly against .ts source
  // with no compiled sibling .js file, so map the extension away here.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};
