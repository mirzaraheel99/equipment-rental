export interface JobContext {
  correlationId: string;
}

export interface JobDefinition<TPayload = unknown> {
  name: string;
  retryPolicy: { maxAttempts: number; backoffMs: number };
  handler: (payload: TPayload, context: JobContext) => Promise<void>;
}

/** Minimal in-memory job registry abstraction for Bootstrap. A real queue
 * backend (e.g. BullMQ over Redis) with dead-letter handling is a Phase 02
 * concern (docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md, "Events"
 * — transactional outbox, publisher worker, retry, dead-letter handling);
 * this keeps the registration API stable so jobs written against it don't
 * need to change when that backend lands. */
export class JobRegistry {
  private readonly jobs = new Map<string, JobDefinition>();

  register<TPayload>(job: JobDefinition<TPayload>): void {
    this.jobs.set(job.name, job as JobDefinition);
  }

  get(name: string): JobDefinition | undefined {
    return this.jobs.get(name);
  }

  list(): string[] {
    return [...this.jobs.keys()];
  }
}
