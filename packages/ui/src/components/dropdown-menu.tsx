import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof RadixDropdownMenu.Content>,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RadixDropdownMenu.Portal>
    <RadixDropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[var(--z-erms-dropdown)] min-w-48 overflow-hidden rounded-erms-md border border-erms-border',
        'bg-[rgb(var(--erms-bg))] p-1 shadow-erms-md',
        className,
      )}
      {...props}
    />
  </RadixDropdownMenu.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof RadixDropdownMenu.Item>,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Item
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center gap-2 rounded-erms-sm px-2 py-2 text-sm text-erms-fg outline-none',
      'data-[highlighted]:bg-erms-border/30',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuCheckboxItem = forwardRef<
  ElementRef<typeof RadixDropdownMenu.CheckboxItem>,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem>
>(({ className, children, checked = false, ...props }, ref) => (
  <RadixDropdownMenu.CheckboxItem
    ref={ref}
    checked={checked}
    className={cn(
      'flex cursor-pointer items-center gap-2 rounded-erms-sm px-2 py-2 text-sm text-erms-fg outline-none',
      'data-[highlighted]:bg-erms-border/30',
      className,
    )}
    {...props}
  >
    <span className="flex h-3.5 w-3.5 items-center justify-center">
      <RadixDropdownMenu.ItemIndicator>
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      </RadixDropdownMenu.ItemIndicator>
    </span>
    {children}
  </RadixDropdownMenu.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

export function DropdownMenuLabel({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('px-2 py-1.5 text-xs font-medium text-erms-muted', className)} {...props} />;
}

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof RadixDropdownMenu.Separator>,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Separator ref={ref} className={cn('my-1 h-px bg-erms-border', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
