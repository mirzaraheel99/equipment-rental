import * as RadixTooltip from '@radix-ui/react-tooltip';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';

import { cn } from '../lib/cn';

export const TooltipProvider = RadixTooltip.Provider;

export const TooltipContent = forwardRef<
  ElementRef<typeof RadixTooltip.Content>,
  ComponentPropsWithoutRef<typeof RadixTooltip.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <RadixTooltip.Portal>
    <RadixTooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[var(--z-erms-popover)] rounded-erms-sm border border-erms-border bg-[rgb(var(--erms-fg))] px-2.5 py-1.5',
        'text-xs text-[rgb(var(--erms-bg))] shadow-erms-md',
        className,
      )}
      {...props}
    />
  </RadixTooltip.Portal>
));
TooltipContent.displayName = 'TooltipContent';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

/** Convenience wrapper for the common case of one trigger + one tooltip
 * body — use the Radix primitives directly for anything more elaborate.
 * Includes its own Provider so it works standalone (Radix Tooltip requires
 * one); nesting inside an app-level TooltipProvider is harmless. */
export function Tooltip({ content, children, disabled }: TooltipProps) {
  if (disabled) return <>{children}</>;
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <TooltipContent>{content}</TooltipContent>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
