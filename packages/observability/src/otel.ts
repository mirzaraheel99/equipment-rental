export interface OtelInitOptions {
  serviceName: string;
  endpoint?: string;
}

/**
 * Placeholder OpenTelemetry initialization interface for Bootstrap. Real
 * exporter wiring (traces/metrics to an OTLP collector) is intentionally
 * deferred until an observability backend is chosen — this keeps the call
 * site stable so apps don't need to change when that happens.
 */
export function initOtel(options: OtelInitOptions): { shutdown: () => Promise<void> } {
  if (!options.endpoint) {
    return { shutdown: async () => {} };
  }

  // Real SDK wiring belongs here once an OTLP collector endpoint exists.
  return { shutdown: async () => {} };
}
