import type { ZodError } from 'zod';

/** Thrown at process startup when required environment variables are
 * missing or invalid. Callers should let this crash the process — failing
 * fast with a clear message is safer than starting in a half-configured
 * state (see Bootstrap AT-009). */
export class ConfigValidationError extends Error {
  constructor(
    public readonly appName: string,
    public readonly zodError: ZodError,
  ) {
    const issues = zodError.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    super(`Invalid configuration for "${appName}":\n${issues}`);
    this.name = 'ConfigValidationError';
  }
}
