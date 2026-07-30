import * as RadixLabel from '@radix-ui/react-label';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

export const Label = forwardRef<
  ElementRef<typeof RadixLabel.Root>,
  ComponentPropsWithoutRef<typeof RadixLabel.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <RadixLabel.Root
    ref={ref}
    className={cn('text-sm font-medium text-erms-fg peer-disabled:opacity-50', className)}
    {...props}
  >
    {children}
    {required ? (
      <span className="ms-0.5 text-danger-500" aria-hidden="true">
        *
      </span>
    ) : null}
  </RadixLabel.Root>
));
Label.displayName = 'Label';
