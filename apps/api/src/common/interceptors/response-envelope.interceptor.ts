import { getCorrelationId } from '@erms/observability';
import type { ApiSuccessEnvelope } from '@erms/types';
import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Wraps every successful controller response in the shared
 * ApiSuccessEnvelope shape, so frontends never special-case "this endpoint
 * happens to return a bare array/object." Health endpoints are excluded —
 * they intentionally use a specialized health-check response format. */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        const envelope: ApiSuccessEnvelope<unknown> = {
          success: true,
          data,
          correlationId: getCorrelationId() ?? 'unknown',
        };
        return envelope;
      }),
    );
  }
}
