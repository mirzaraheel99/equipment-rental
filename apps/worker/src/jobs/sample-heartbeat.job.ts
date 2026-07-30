import type { Logger } from '@erms/observability';

import type { JobDefinition } from '../job-registry.js';

/** Validates the worker pipeline (config, Redis connection, logger,
 * graceful shutdown) end to end without doing anything operational — per
 * Bootstrap's "a single sample development job may be used only to
 * validate the worker pipeline" allowance (doc 25 §16). */
export function createSampleHeartbeatJob(logger: Logger): JobDefinition<{ tick: number }> {
  return {
    name: 'sample.heartbeat',
    retryPolicy: { maxAttempts: 3, backoffMs: 1000 },
    handler(payload, context) {
      logger.info(
        { correlationId: context.correlationId, tick: payload.tick },
        'Heartbeat job executed',
      );
      return Promise.resolve();
    },
  };
}
