import { Loader2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

export function Spinner({ className, label = 'Loading', ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn('inline-flex items-center gap-2 text-erms-muted', className)}
      {...props}
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
