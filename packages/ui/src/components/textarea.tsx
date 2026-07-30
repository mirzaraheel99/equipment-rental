import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-20 w-full rounded-md border border-erms-border bg-transparent px-3 py-2 text-sm text-erms-fg',
          'placeholder:text-erms-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid && 'border-danger-500 focus-visible:ring-danger-500',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
