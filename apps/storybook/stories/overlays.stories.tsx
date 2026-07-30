import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = { title: 'Foundation/Overlays' };
export default meta;

export const DialogDefault: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
          <DialogDescription>
            Dismiss with Escape, the close button, or an overlay click.
          </DialogDescription>
        </DialogHeader>
        <Button>Confirm</Button>
      </DialogContent>
    </Dialog>
  ),
};

export const DrawerEnd: StoryObj = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary">Open end drawer</Button>
      </DrawerTrigger>
      <DrawerContent side="end">
        <DrawerTitle>Asset detail</DrawerTitle>
        <DrawerDescription>
          Side panels flip automatically under RTL (side=&quot;end&quot;).
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  ),
};

export const TabsDefault: StoryObj = {
  render: () => (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="details">Asset details content.</TabsContent>
      <TabsContent value="history">Status history content.</TabsContent>
    </Tabs>
  ),
};
