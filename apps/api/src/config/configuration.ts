import { apiEnvSchema, loadConfig, type ApiEnv } from '@erms/config';

let cachedEnv: ApiEnv | undefined;

/** Validates process.env once at module load and caches the result — the
 * only place in this app allowed to read `process.env` directly. */
export function getEnv(): ApiEnv {
  cachedEnv ??= loadConfig('api', apiEnvSchema);
  return cachedEnv;
}
