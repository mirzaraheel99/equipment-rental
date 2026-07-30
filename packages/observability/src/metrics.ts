/** Minimal in-process counters for Bootstrap health/metrics endpoints.
 * Replaced by a real metrics backend (e.g. Prometheus/OTel) once one is
 * provisioned; the shape here is deliberately small so that swap is
 * additive, not a breaking change to callers. */
export interface AppMetrics {
  requestCount: number;
  errorCount: number;
  recordRequest(): void;
  recordError(): void;
}

export function createInMemoryMetrics(): AppMetrics {
  const state = { requestCount: 0, errorCount: 0 };
  return {
    get requestCount() {
      return state.requestCount;
    },
    get errorCount() {
      return state.errorCount;
    },
    recordRequest() {
      state.requestCount += 1;
    },
    recordError() {
      state.errorCount += 1;
    },
  };
}
