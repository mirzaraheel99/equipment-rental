import { describe, expect, it, vi } from 'vitest';

import { JobRegistry } from './job-registry.js';

describe('JobRegistry', () => {
  it('registers and retrieves a job by name', () => {
    const registry = new JobRegistry();
    const handler = vi.fn().mockResolvedValue(undefined);

    registry.register({
      name: 'sample.job',
      retryPolicy: { maxAttempts: 1, backoffMs: 0 },
      handler,
    });

    expect(registry.list()).toEqual(['sample.job']);
    expect(registry.get('sample.job')?.handler).toBe(handler);
  });

  it('returns undefined for an unregistered job', () => {
    const registry = new JobRegistry();
    expect(registry.get('missing')).toBeUndefined();
  });
});
