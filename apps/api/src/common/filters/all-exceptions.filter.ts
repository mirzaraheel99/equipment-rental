import { getCorrelationId } from '@erms/observability';
import type { ApiErrorEnvelope } from '@erms/types';
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Every error response — expected or not — is normalized into the shared
 * ApiErrorEnvelope shape. Stack traces and internal messages never reach
 * the client outside development; this is the one place that decides what
 * a caller is allowed to see, so no controller needs to reimplement it.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const correlationId = getCorrelationId() ?? 'unknown';

    const { status, code, message, details } = this.normalize(exception);

    if (status >= 500) {
      this.logger.error({ correlationId, exception }, 'Unhandled exception');
    }

    const envelope: ApiErrorEnvelope = {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
      correlationId,
    };

    response.status(status).json(envelope);
  }

  private normalize(exception: unknown): {
    status: number;
    code: string;
    message: string;
    details?: { code: string; message: string; field?: string }[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const bodyRecord = body as Record<string, unknown>;
        const rawMessage = bodyRecord.message;
        const details = Array.isArray(rawMessage)
          ? rawMessage.map((m) => ({ code: 'VALIDATION_ERROR', message: String(m) }))
          : undefined;
        return {
          status,
          code: this.codeForStatus(status),
          message: typeof rawMessage === 'string' ? rawMessage : exception.message,
          ...(details ? { details } : {}),
        };
      }
      return { status, code: this.codeForStatus(status), message: exception.message };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    };
  }

  private static readonly STATUS_CODES: Partial<Record<number, string>> = {
    [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.CONFLICT]: 'CONFLICT',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
    [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  };

  private codeForStatus(status: number): string {
    return (
      AllExceptionsFilter.STATUS_CODES[status] ??
      (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR')
    );
  }
}
