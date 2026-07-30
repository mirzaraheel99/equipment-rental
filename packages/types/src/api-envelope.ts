import type { PaginationMeta } from './pagination.js';

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  correlationId: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  field?: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  correlationId: string;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;
