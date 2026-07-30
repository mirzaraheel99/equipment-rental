import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-erms-border bg-transparent px-3 py-2 text-sm text-erms-fg',
          'placeholder:text-erms-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid && 'border-danger-500 focus-visible:ring-danger-500',
          className,
        )}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
