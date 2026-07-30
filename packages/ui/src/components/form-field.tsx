import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

import { Label } from './label';

export interface FormFieldProps {
  /** Associates the label with the control via htmlFor/id — pass the same
   * id to the control itself. */
  htmlFor: string;
  label: string;
  required?: boolean;
  /** Explains why a field is required or how to fill it (doc 21 §14.1). */
  hint?: string;
  /** Specific, actionable, near the field (doc 21 §14.3). Presence alone
   * also marks the field invalid for styling/aria purposes. */
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Binds a Label, control, hint, and validation message with the id/aria
 * wiring doc 21 §14 requires, so no module hand-rolls this layout. The
 * control itself (`children`) is opaque — pass `aria-describedby="{id}-error"`
 * or `"{id}-hint"` and `aria-invalid` on it directly using the same
 * `htmlFor` id, since FormField cannot safely clone arbitrary children. */
export function FormField({ htmlFor, label, required, hint, error, children, className }: FormFieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-erms-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
