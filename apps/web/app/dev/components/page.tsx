'use client';

import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  PageContainer,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  useTheme,
} from '@erms/ui';

/**
 * Non-production component gallery — a manual smoke test surface for the
 * shared UI package. Not a Storybook replacement (see apps/storybook); this
 * page exists so the component set can be eyeballed inside a real Next.js
 * app (theming, RTL, forms) without launching a second dev server.
 */
export default function ComponentGalleryPage() {
  const { theme, setTheme } = useTheme();

  return (
    <PageContainer>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Component Gallery</h1>
          <Select value={theme} onValueChange={(value) => setTheme(value as typeof theme)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <section className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </section>

        <section className="flex flex-wrap gap-2">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="success">Available</Badge>
          <Badge variant="warning">PPM Due</Badge>
          <Badge variant="danger">Overdue</Badge>
          <Badge variant="info">In Transit</Badge>
        </section>

        <section className="flex max-w-md flex-col gap-4">
          <div>
            <Label htmlFor="name" required>
              Name
            </Label>
            <Input id="name" placeholder="Asset name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Condition notes" className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ack" />
            <Label htmlFor="ack">I confirm the checklist is complete</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="telematics" />
            <Label htmlFor="telematics">Telematics-equipped</Label>
          </div>
          <RadioGroup defaultValue="daily" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly</Label>
            </div>
          </RadioGroup>
        </section>

        <section className="flex flex-col gap-3">
          <Alert variant="info" title="Info">
            This is an informational alert.
          </Alert>
          <Alert variant="success" title="Success">
            This is a success alert.
          </Alert>
          <Alert variant="warning" title="Warning">
            This is a warning alert.
          </Alert>
          <Alert variant="danger" title="Danger">
            This is a danger alert.
          </Alert>
        </section>

        <section className="flex items-center gap-4">
          <Spinner />
          <Skeleton className="h-8 w-40" />
        </section>

        <section>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab One</TabsTrigger>
              <TabsTrigger value="tab2">Tab Two</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content for tab one.</TabsContent>
            <TabsContent value="tab2">Content for tab two.</TabsContent>
          </Tabs>
        </section>

        <section>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Example dialog</DialogTitle>
                <DialogDescription>
                  Confirms the Dialog primitive renders and is dismissible.
                </DialogDescription>
              </DialogHeader>
              <Button>Close me with Escape or the X button</Button>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </PageContainer>
  );
}
