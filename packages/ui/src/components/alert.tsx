import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

const alertVariants = cva('flex gap-3 rounded-md border p-4 text-sm', {
  variants: {
    variant: {
      info: 'border-info-500/30 bg-info-500/10 text-erms-fg',
      success: 'border-success-500/30 bg-success-500/10 text-erms-fg',
      warning: 'border-warning-500/30 bg-warning-500/10 text-erms-fg',
      danger: 'border-danger-500/30 bg-danger-500/10 text-erms-fg',
    },
  },
  defaultVariants: { variant: 'info' },
});

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
} as const;

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title?: string;
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const Icon = ICONS[variant ?? 'info'];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <div className="text-erms-muted">{children}</div>
      </div>
    </div>
  );
}
