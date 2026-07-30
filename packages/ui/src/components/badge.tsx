import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

/**
 * Status is never conveyed by color alone (per the UI design system's
 * status-badge rule) — every variant pairs a color with a distinct icon
 * slot and/or label text supplied by the caller.
 */
export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'border-erms-border bg-erms-border/30 text-erms-fg',
        success: 'border-success-500/30 bg-success-500/10 text-success-500',
        warning: 'border-warning-500/30 bg-warning-500/10 text-warning-500',
        danger: 'border-danger-500/30 bg-danger-500/10 text-danger-500',
        info: 'border-info-500/30 bg-info-500/10 text-info-500',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
