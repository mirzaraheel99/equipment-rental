import type { z } from 'zod';

import { ConfigValidationError } from './errors.js';

/**
 * Validate a raw environment object against a schema and fail fast with a
 * readable error on the first violation. Every app-level config module must
 * route through this — no direct `process.env` access outside it, per the
 * Bootstrap "environment principles" rule.
 */
export function loadConfig<TSchema extends z.ZodTypeAny>(
  appName: string,
  schema: TSchema,
  source: Record<string, string | undefined> = process.env,
): z.infer<TSchema> {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new ConfigValidationError(appName, result.error);
  }
  return result.data as z.infer<TSchema>;
}
