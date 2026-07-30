import {
  Button,
  CommandPalette,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Toast,
  ToastProvider,
  ToastViewport,
  Tooltip,
} from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Search, Truck } from 'lucide-react';
import { useState } from 'react';

const meta: Meta = { title: 'Foundation/Command and Menus' };
export default meta;

export const CommandPaletteDefault: StoryObj = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button onClick={() => setOpen(true)}>
            <Search className="h-4 w-4" aria-hidden="true" /> Open command palette
          </Button>
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            items={[
              { id: 'create-reservation', label: 'Create reservation', group: 'Create', icon: Plus, onSelect: () => undefined },
              { id: 'open-dispatch', label: 'Go to dispatch board', group: 'Navigate', icon: Truck, onSelect: () => undefined },
            ]}
          />
        </div>
      );
    }
    return <Demo />;
  },
};

export const DropdownMenuDefault: StoryObj = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const TooltipDefault: StoryObj = {
  render: () => (
    <Tooltip content="Last checked 3 days ago">
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  ),
};

export const ToastDefault: StoryObj = {
  render: () => (
    <ToastProvider>
      <Toast open title="Reservation saved" description="A-1024 reserved for Jul 30–Aug 2." />
      <ToastViewport />
    </ToastProvider>
  ),
};
