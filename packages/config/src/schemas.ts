import { APP_ENVIRONMENTS, NODE_ENVIRONMENTS } from '@erms/types';
import { z } from 'zod';

/** Base variables every ERMS process needs, regardless of app. */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(NODE_ENVIRONMENTS).default('development'),
  APP_ENV: z.enum(APP_ENVIRONMENTS).default('local'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

export const redisEnvSchema = z.object({
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
});

export const objectStorageEnvSchema = z.object({
  S3_ENDPOINT: z.string().min(1, 'S3_ENDPOINT is required'),
  S3_REGION: z.string().min(1, 'S3_REGION is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_ACCESS_KEY_ID: z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
  S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
});

export const mailEnvSchema = z.object({
  MAIL_HOST: z.string().min(1, 'MAIL_HOST is required'),
  MAIL_PORT: z.coerce.number().int().positive(),
});

export const observabilityEnvSchema = z.object({
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default(''),
});

export const authEnvSchema = z.object({
  /** local-dev: stub OIDC issuer for seeded dev users. entra-id: Microsoft
   * Entra ID federation (docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-
   * GOVERNANCE-DOMAIN-SPECIFICATION.md §5.1). */
  AUTH_OIDC_PROVIDER: z.enum(['local-dev', 'entra-id']).default('local-dev'),
  /** Signs/verifies ERMS's own access tokens (never the OIDC ID token). */
  AUTH_JWT_ACCESS_SECRET: z.string().min(32, 'AUTH_JWT_ACCESS_SECRET must be at least 32 characters'),
  AUTH_JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  AUTH_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(1209600),
  AUTH_STEP_UP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  /** Signs the local dev provider's own stub ID tokens — dev/CI only, never
   * used when AUTH_OIDC_PROVIDER=entra-id. */
  AUTH_LOCAL_DEV_SIGNING_SECRET: z.string().optional(),
  /** Required only when AUTH_OIDC_PROVIDER=entra-id; validated at provider
   * construction time, not here, so local dev never needs real values. */
  AUTH_ENTRA_TENANT_ID: z.string().optional(),
  AUTH_ENTRA_CLIENT_ID: z.string().optional(),
});

export const apiEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(redisEnvSchema)
  .merge(objectStorageEnvSchema)
  .merge(mailEnvSchema)
  .merge(observabilityEnvSchema)
  .merge(authEnvSchema)
  .extend({
    API_PORT: z.coerce.number().int().positive().default(4000),
  });

export const workerEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(redisEnvSchema)
  .merge(observabilityEnvSchema)
  .extend({
    WORKER_PORT: z.coerce.number().int().positive().default(4100),
  });

/** Public web-app variables. Only NEXT_PUBLIC_-prefixed values may reach the
 * browser — this schema is the enforced allowlist. */
export const webPublicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().min(1, 'NEXT_PUBLIC_API_BASE_URL is required'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'ar']).default('en'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WorkerEnv = z.infer<typeof workerEnvSchema>;
export type WebPublicEnv = z.infer<typeof webPublicEnvSchema>;
