/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'src/.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['@swc/jest'],
  },
  // uuid@14 ships ESM-only with no CJS build — Jest's default
  // node_modules-is-ignored transform rule would otherwise choke on its
  // `export` syntax the first time a test's import chain reaches it
  // (e.g. via AuditService -> common/id.ts -> uuid). Jest resolves pnpm's
  // symlinks to the real `.pnpm/<pkg>@<version>/node_modules/...` path, so
  // the exclusion has to key off the `.pnpm/uuid@` store-directory segment
  // (a plain `(?!.*/uuid/)` lookahead still matches at the *inner*
  // `node_modules/uuid/` occurrence and leaves the file ignored).
  transformIgnorePatterns: ['node_modules/\\.pnpm/(?!uuid@)'],
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
