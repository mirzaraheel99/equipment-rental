import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

export const RadioGroup = RadixRadioGroup.Root;

export const RadioGroupItem = forwardRef<
  ElementRef<typeof RadixRadioGroup.Item>,
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>
>(({ className, ...props }, ref) => (
  <RadixRadioGroup.Item
    ref={ref}
    className={cn(
      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-erms-border',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:border-brand-600',
      className,
    )}
    {...props}
  >
    <RadixRadioGroup.Indicator>
      <Circle className="h-2 w-2 fill-brand-600 text-brand-600" aria-hidden="true" />
    </RadixRadioGroup.Indicator>
  </RadixRadioGroup.Item>
));
RadioGroupItem.displayName = 'RadioGroupItem';
