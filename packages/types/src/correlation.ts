export type CorrelationId = string & { readonly __brand: 'CorrelationId' };

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';
