/**
 * Computes only the fields that actually changed between two entity
 * snapshots, so audit_event.previous_values_json/new_values_json stay
 * small and readable instead of dumping the whole row on every update.
 */
export function diffEntities<T extends Record<string, unknown>>(
  before: T | undefined,
  after: T,
): { previousValues: Partial<T> | undefined; newValues: Partial<T> } {
  if (!before) {
    return { previousValues: undefined, newValues: after };
  }

  const previousValues: Partial<T> = {};
  const newValues: Partial<T> = {};

  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const beforeValue = before[key as keyof T];
    const afterValue = after[key as keyof T];
    if (!isEqual(beforeValue, afterValue)) {
      previousValues[key as keyof T] = beforeValue;
      newValues[key as keyof T] = afterValue;
    }
  }

  return { previousValues, newValues };
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}
