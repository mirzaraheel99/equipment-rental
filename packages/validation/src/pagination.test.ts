import { describe, expect, it } from 'vitest';

import { paginationQuerySchema } from './pagination.js';

describe('paginationQuerySchema', () => {
  it('applies default page and pageSize when omitted', () => {
    const result = paginationQuerySchema.parse({});
    expect(result).toEqual({ page: 1, pageSize: 25 });
  });

  it('coerces string query values to numbers', () => {
    const result = paginationQuerySchema.parse({ page: '3', pageSize: '50' });
    expect(result).toEqual({ page: 3, pageSize: 50 });
  });

  it('rejects a pageSize above the maximum', () => {
    const result = paginationQuerySchema.safeParse({ pageSize: 500 });
    expect(result.success).toBe(false);
  });
});
