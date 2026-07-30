import { loadConfig } from '@erms/config';
import { webPublicEnvSchema } from '@erms/config';

/**
 * Only NEXT_PUBLIC_-prefixed variables reach this module in the browser
 * bundle; validating them here (rather than trusting `process.env`
 * directly anywhere else in the app) is the enforced allowlist boundary.
 */
export const publicEnv = loadConfig('web', webPublicEnvSchema, {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
});
