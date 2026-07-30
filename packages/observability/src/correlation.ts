import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

interface CorrelationContext {
  correlationId: string;
  requestId: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

export function runWithCorrelation<T>(context: Partial<CorrelationContext>, fn: () => T): T {
  const resolved: CorrelationContext = {
    correlationId: context.correlationId ?? randomUUID(),
    requestId: context.requestId ?? randomUUID(),
  };
  return storage.run(resolved, fn);
}

export function getCorrelationContext(): CorrelationContext | undefined {
  return storage.getStore();
}

export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}
