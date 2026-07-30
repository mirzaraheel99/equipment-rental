import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

export const Checkbox = forwardRef<
  ElementRef<typeof RadixCheckbox.Root>,
  ComponentPropsWithoutRef<typeof RadixCheckbox.Root>
>(({ className, ...props }, ref) => (
  <RadixCheckbox.Root
    ref={ref}
    className={cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-erms-border',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 data-[state=checked]:text-white',
      className,
    )}
    {...props}
  >
    <RadixCheckbox.Indicator>
      <Check className="h-3 w-3" aria-hidden="true" />
    </RadixCheckbox.Indicator>
  </RadixCheckbox.Root>
));
Checkbox.displayName = 'Checkbox';
