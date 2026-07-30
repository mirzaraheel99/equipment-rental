import type { AuthTokenProvider } from '@erms/auth';
import type { ApiEnvelope } from '@erms/types';

import { ApiClientError, ApiNetworkError, ApiTimeoutError } from './errors.js';

const SAFE_RETRYABLE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 2;

export interface ApiClientOptions {
  baseUrl: string;
  authTokenProvider?: AuthTokenProvider;
  timeoutMs?: number;
  retries?: number;
}

export interface RequestOptions {
  method?: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.replace(/^\//, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Thin, typed fetch wrapper shared by every ERMS frontend. Every response is
 * expected to be an ApiEnvelope; errors are never silently swallowed — they
 * are thrown as a typed ApiClientError subclass so callers can branch on
 * `.code`/`.status` instead of parsing strings.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly authTokenProvider: AuthTokenProvider | undefined;
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.authTokenProvider = options.authTokenProvider;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = options.retries ?? DEFAULT_RETRIES;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const method = options.method ?? 'GET';
    const correlationId = crypto.randomUUID();
    const url = buildUrl(this.baseUrl, options.path, options.query);
    const attempts = SAFE_RETRYABLE_METHODS.has(method) ? this.retries + 1 : 1;

    let lastError: unknown;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await this.attempt<T>(method, url, options, correlationId);
      } catch (error) {
        lastError = error;
        if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
          throw error; // Client errors are not retried.
        }
      }
    }
    throw lastError instanceof Error ? lastError : new ApiNetworkError(lastError, correlationId);
  }

  private async attempt<T>(
    method: string,
    url: string,
    options: RequestOptions,
    correlationId: string,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const signal = options.signal ?? controller.signal;

    try {
      const session = await this.authTokenProvider?.getSession();
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        'x-correlation-id': correlationId,
      };
      if (session?.accessToken) {
        headers.authorization = `Bearer ${session.accessToken}`;
      }

      const requestInit: RequestInit = {
        method,
        headers,
        signal,
        ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      };
      const response = await fetch(url, requestInit);

      const envelope = (await response.json().catch(() => undefined)) as ApiEnvelope<T> | undefined;

      if (!response.ok || !envelope || envelope.success === false) {
        const error = envelope && envelope.success === false ? envelope.error : undefined;
        throw new ApiClientError(
          error?.message ?? `Request failed with status ${response.status}`,
          error?.code ?? 'UNKNOWN_ERROR',
          response.status,
          correlationId,
        );
      }

      return envelope.data;
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiTimeoutError(correlationId);
      }
      throw new ApiNetworkError(error, correlationId);
    } finally {
      clearTimeout(timeout);
    }
  }
}
