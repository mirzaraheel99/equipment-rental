import pino, { type Logger } from 'pino';

export interface CreateLoggerOptions {
  appName: string;
  environment: string;
  level?: string;
}

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  '*.password',
  '*.token',
  '*.secret',
  '*.accessKeyId',
  '*.secretAccessKey',
  '*.cardNumber',
];

/**
 * Structured JSON logger shared by every app. Never log secrets or raw
 * payment data — the redact list above is a safety net, not a substitute
 * for keeping sensitive values out of logged objects in the first place.
 */
export function createLogger(options: CreateLoggerOptions): Logger {
  const { appName, environment, level = 'info' } = options;

  return pino({
    name: appName,
    level,
    base: {
      app: appName,
      env: environment,
    },
    redact: {
      paths: REDACT_PATHS,
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });
}

export type { Logger };
