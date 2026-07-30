import { loadConfig, webPublicEnvSchema } from '@erms/config';

export const publicEnv = loadConfig('customer-portal', webPublicEnvSchema, {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
});
