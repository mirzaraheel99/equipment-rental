import { AlertCircle } from 'lucide-react';

import { cn } from '../lib/cn';

import { Button } from './button';

export interface ErrorStateProps {
  message: string;
  /** Surfaced for support/debugging — never a raw stack trace (doc 21 §28). */
  correlationId?: string | undefined;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
}

export function ErrorState({ message, correlationId, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-erms-md border border-danger-500/30 bg-danger-500/5 px-6 py-12 text-center',
        className,
      )}
    >
      <AlertCircle className="h-8 w-8 text-danger-500" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-erms-fg">{message}</p>
        {correlationId ? (
          <p className="text-xs text-erms-muted">
            Reference: <span className="font-mono">{correlationId}</span>
          </p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
