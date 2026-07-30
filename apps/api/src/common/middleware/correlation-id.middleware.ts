import { getCorrelationContext, runWithCorrelation } from '@erms/observability';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from '@erms/types';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Every request gets a correlation ID (propagated from the caller if
 * present, generated otherwise) and a fresh request ID, both echoed back on
 * the response and available to the logger/exception filter for the
 * lifetime of the request via AsyncLocalStorage. */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incomingCorrelationId = req.header(CORRELATION_ID_HEADER);

    runWithCorrelation(
      incomingCorrelationId ? { correlationId: incomingCorrelationId } : {},
      () => {
        const context = getCorrelationContext();
        if (context) {
          res.setHeader(CORRELATION_ID_HEADER, context.correlationId);
          res.setHeader(REQUEST_ID_HEADER, context.requestId);
        }
        next();
      },
    );
  }
}
