import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

import { cn } from '../lib/cn';

/**
 * A side-anchored panel built on the Dialog primitive (Radix has no
 * dedicated drawer primitive — this is the standard pattern). `side`
 * respects logical start/end so it flips automatically under RTL.
 */
export const Drawer = RadixDialog.Root;
export const DrawerTrigger = RadixDialog.Trigger;
export const DrawerClose = RadixDialog.Close;

export interface DrawerContentProps extends ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  side?: 'start' | 'end';
}

export const DrawerContent = forwardRef<ElementRef<typeof RadixDialog.Content>, DrawerContentProps>(
  ({ className, side = 'end', children, ...props }, ref) => (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          'fixed inset-y-0 z-50 flex h-full w-full max-w-sm flex-col border-erms-border bg-[rgb(var(--erms-bg))] p-6 shadow-lg focus:outline-none',
          side === 'end' ? 'end-0 border-s' : 'start-0 border-e',
          className,
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close
          className="absolute end-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),
);
DrawerContent.displayName = 'DrawerContent';

export const DrawerTitle = RadixDialog.Title;
export const DrawerDescription = RadixDialog.Description;
