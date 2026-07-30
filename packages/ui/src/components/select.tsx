import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

export const Select = RadixSelect.Root;
export const SelectValue = RadixSelect.Value;
export const SelectGroup = RadixSelect.Group;

export const SelectTrigger = forwardRef<
  ElementRef<typeof RadixSelect.Trigger>,
  ComponentPropsWithoutRef<typeof RadixSelect.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-erms-border bg-transparent',
      'px-3 py-2 text-sm text-erms-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
    <RadixSelect.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
    </RadixSelect.Icon>
  </RadixSelect.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = forwardRef<
  ElementRef<typeof RadixSelect.Content>,
  ComponentPropsWithoutRef<typeof RadixSelect.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <RadixSelect.Portal>
    <RadixSelect.Content
      ref={ref}
      position={position}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border border-erms-border bg-[rgb(var(--erms-bg))] shadow-md',
        className,
      )}
      {...props}
    >
      <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1">
        <ChevronUp className="h-4 w-4" aria-hidden="true" />
      </RadixSelect.ScrollUpButton>
      <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
      <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1">
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </RadixSelect.ScrollDownButton>
    </RadixSelect.Content>
  </RadixSelect.Portal>
));
SelectContent.displayName = 'SelectContent';

export const SelectItem = forwardRef<
  ElementRef<typeof RadixSelect.Item>,
  ComponentPropsWithoutRef<typeof RadixSelect.Item>
>(({ className, children, ...props }, ref) => (
  <RadixSelect.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 ps-8 pe-2 text-sm',
      'outline-none focus:bg-erms-border/40 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute start-2 flex h-3.5 w-3.5 items-center justify-center">
      <RadixSelect.ItemIndicator>
        <Check className="h-4 w-4" aria-hidden="true" />
      </RadixSelect.ItemIndicator>
    </span>
    <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
  </RadixSelect.Item>
));
SelectItem.displayName = 'SelectItem';
