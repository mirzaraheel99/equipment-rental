import type { ApiEnv } from '@erms/config';

import { StepUpService } from './step-up.service.js';

function buildEnv(): ApiEnv {
  return { AUTH_STEP_UP_TTL_SECONDS: 300 } as ApiEnv;
}

function buildRedisMock() {
  const store = new Set<string>();
  return {
    set: jest.fn((key: string) => {
      store.add(key);
      return Promise.resolve('OK');
    }),
    exists: jest.fn((key: string) => Promise.resolve(store.has(key) ? 1 : 0)),
  };
}

describe('StepUpService', () => {
  it('has no active grant before one is issued', async () => {
    const service = new StepUpService(buildRedisMock() as never, buildEnv());
    await expect(service.hasActiveGrant('user-1')).resolves.toBe(false);
  });

  it('reports an active grant after granting', async () => {
    const service = new StepUpService(buildRedisMock() as never, buildEnv());
    await service.grant('user-1');
    await expect(service.hasActiveGrant('user-1')).resolves.toBe(true);
  });

  it('does not leak a grant to a different user', async () => {
    const service = new StepUpService(buildRedisMock() as never, buildEnv());
    await service.grant('user-1');
    await expect(service.hasActiveGrant('user-2')).resolves.toBe(false);
  });
});
