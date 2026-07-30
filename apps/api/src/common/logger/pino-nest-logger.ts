import { createLogger, getCorrelationId, type Logger } from '@erms/observability';
import { type LoggerService, type LogLevel } from '@nestjs/common';

const LEVEL_MAP: Record<LogLevel, keyof Logger> = {
  verbose: 'trace',
  debug: 'debug',
  log: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal',
};

/** Adapts the shared @erms/observability pino logger to Nest's LoggerService
 * interface, so Nest's internal logging and application logging both flow
 * through the same structured, redacted, correlation-aware sink. */
export class PinoNestLogger implements LoggerService {
  constructor(private readonly logger: Logger) {}

  static create(appName: string, environment: string, level: string): PinoNestLogger {
    return new PinoNestLogger(createLogger({ appName, environment, level }));
  }

  private write(level: LogLevel, message: unknown, context?: string, trace?: string) {
    const pinoLevel = LEVEL_MAP[level];
    const correlationId = getCorrelationId();
    (this.logger[pinoLevel] as (obj: object, msg?: string) => void)(
      { context, trace, correlationId },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  }

  log(message: unknown, context?: string) {
    this.write('log', message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string) {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write('verbose', message, context);
  }

  fatal(message: unknown, context?: string) {
    this.write('fatal', message, context);
  }
}
