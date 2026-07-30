export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly correlationId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiTimeoutError extends ApiClientError {
  constructor(correlationId?: string) {
    super('Request timed out', 'REQUEST_TIMEOUT', 0, correlationId);
    this.name = 'ApiTimeoutError';
  }
}

export class ApiNetworkError extends ApiClientError {
  constructor(cause: unknown, correlationId?: string) {
    super('Network request failed', 'NETWORK_ERROR', 0, correlationId);
    this.name = 'ApiNetworkError';
    this.cause = cause;
  }
}
