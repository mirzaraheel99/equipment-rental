import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ConfigValidationError } from './errors.js';
import { loadConfig } from './load-config.js';

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().int().positive().default(4000),
});

describe('loadConfig', () => {
  it('returns parsed, typed config when the source is valid', () => {
    const config = loadConfig('test-app', schema, { DATABASE_URL: 'postgresql://localhost/db' });
    expect(config).toEqual({ DATABASE_URL: 'postgresql://localhost/db', API_PORT: 4000 });
  });

  it('throws a ConfigValidationError with a readable message when required vars are missing', () => {
    expect(() => loadConfig('test-app', schema, {})).toThrow(ConfigValidationError);
  });

  it('fails fast rather than returning a partially-valid config', () => {
    try {
      loadConfig('test-app', schema, {});
      expect.fail('Expected loadConfig to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigValidationError);
      expect((error as ConfigValidationError).message).toContain('test-app');
      expect((error as ConfigValidationError).message).toContain('DATABASE_URL');
    }
  });
});
