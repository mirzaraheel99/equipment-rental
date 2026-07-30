import { diffEntities } from './entity-diff.js';

describe('diffEntities', () => {
  it('treats every field as new when there is no before snapshot', () => {
    const result = diffEntities(undefined, { name: 'Bobcat', status: 'active' });
    expect(result.previousValues).toBeUndefined();
    expect(result.newValues).toEqual({ name: 'Bobcat', status: 'active' });
  });

  it('only reports fields that actually changed', () => {
    const result = diffEntities(
      { name: 'Bobcat', status: 'active', code: 'A-1' },
      { name: 'Bobcat', status: 'suspended', code: 'A-1' },
    );
    expect(result.previousValues).toEqual({ status: 'active' });
    expect(result.newValues).toEqual({ status: 'suspended' });
  });

  it('reports no diff when nothing changed', () => {
    const snapshot = { name: 'Bobcat', status: 'active' };
    const result = diffEntities({ ...snapshot }, { ...snapshot });
    expect(result.previousValues).toEqual({});
    expect(result.newValues).toEqual({});
  });

  it('treats deep-equal dates and objects as unchanged', () => {
    const before = { updatedAt: new Date('2026-01-01T00:00:00Z'), meta: { a: 1 } };
    const after = { updatedAt: new Date('2026-01-01T00:00:00Z'), meta: { a: 1 } };
    const result = diffEntities(before, after);
    expect(result.previousValues).toEqual({});
    expect(result.newValues).toEqual({});
  });
});
