import * as RadixToast from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

export const ToastProvider = RadixToast.Provider;

export const ToastViewport = forwardRef<
  ElementRef<typeof RadixToast.Viewport>,
  ComponentPropsWithoutRef<typeof RadixToast.Viewport>
>(({ className, ...props }, ref) => (
  <RadixToast.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 end-0 z-[var(--z-erms-toast)] flex w-full max-w-sm flex-col gap-2 p-4 outline-none',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

const toastVariants = cva(
  'pointer-events-auto flex items-start gap-3 rounded-erms-md border p-4 shadow-erms-md ' +
    'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out',
  {
    variants: {
      variant: {
        info: 'border-info-500/30 bg-[rgb(var(--erms-bg))] text-erms-fg',
        success: 'border-success-500/30 bg-[rgb(var(--erms-bg))] text-erms-fg',
        danger: 'border-danger-500/30 bg-[rgb(var(--erms-bg))] text-erms-fg',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const VARIANT_ICON = { info: Info, success: CheckCircle2, danger: AlertCircle };

export interface ToastRootProps
  extends ComponentPropsWithoutRef<typeof RadixToast.Root>,
    VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
}

export const Toast = forwardRef<ElementRef<typeof RadixToast.Root>, ToastRootProps>(
  ({ className, variant = 'info', title, description, ...props }, ref) => {
    const Icon = VARIANT_ICON[variant ?? 'info'];
    return (
      <RadixToast.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-0.5">
          <RadixToast.Title className="text-sm font-medium">{title}</RadixToast.Title>
          {description ? (
            <RadixToast.Description className="text-sm text-erms-muted">{description}</RadixToast.Description>
          ) : null}
        </div>
        <RadixToast.Close
          className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </RadixToast.Close>
      </RadixToast.Root>
    );
  },
);
Toast.displayName = 'Toast';
