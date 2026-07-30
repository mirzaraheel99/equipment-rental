import * as RadixSwitch from '@radix-ui/react-switch';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

export const Switch = forwardRef<
  ElementRef<typeof RadixSwitch.Root>,
  ComponentPropsWithoutRef<typeof RadixSwitch.Root>
>(({ className, ...props }, ref) => (
  <RadixSwitch.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent',
      'bg-erms-border transition-colors focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-brand-600',
      className,
    )}
    {...props}
  >
    <RadixSwitch.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform',
        'translate-x-0.5 rtl:-translate-x-0.5 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4',
      )}
    />
  </RadixSwitch.Root>
));
Switch.displayName = 'Switch';
