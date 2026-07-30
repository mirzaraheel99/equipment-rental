import { describe, expect, it } from 'vitest';

import { isUuid, isoDateSchema, safeDisplayStringSchema } from './primitives.js';

describe('isUuid', () => {
  it('accepts a valid UUID', () => {
    expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('rejects a non-UUID string', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isUuid(123)).toBe(false);
  });
});

describe('isoDateSchema', () => {
  it('accepts a valid ISO date string', () => {
    expect(isoDateSchema.safeParse('2026-07-30T00:00:00.000Z').success).toBe(true);
  });

  it('rejects an unparseable date string', () => {
    expect(isoDateSchema.safeParse('not-a-date').success).toBe(false);
  });
});

describe('safeDisplayStringSchema', () => {
  it('rejects values containing angle brackets', () => {
    expect(safeDisplayStringSchema.safeParse('<script>alert(1)</script>').success).toBe(false);
  });

  it('accepts a plain string', () => {
    expect(safeDisplayStringSchema.safeParse('Bobcat S650').success).toBe(true);
  });
});
