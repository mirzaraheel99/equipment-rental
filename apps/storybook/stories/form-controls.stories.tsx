import {
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@erms/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = { title: 'Foundation/Form Controls' };
export default meta;

export const TextInput: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 320 }}>
      <Label htmlFor="story-input" required>
        Asset name
      </Label>
      <Input id="story-input" placeholder="Bobcat S650" />
    </div>
  ),
};

export const InputInvalid: StoryObj = {
  render: () => <Input invalid defaultValue="invalid value" aria-describedby="story-error" />,
};

export const InputDisabled: StoryObj = {
  render: () => <Input disabled defaultValue="Disabled" />,
};

export const TextareaDefault: StoryObj = {
  render: () => <Textarea placeholder="Condition notes" />,
};

export const CheckboxDefault: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Checkbox id="story-checkbox" />
      <Label htmlFor="story-checkbox">Checklist complete</Label>
    </div>
  ),
};

export const SwitchDefault: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Switch id="story-switch" />
      <Label htmlFor="story-switch">Telematics-equipped</Label>
    </div>
  ),
};

export const RadioGroupDefault: StoryObj = {
  render: () => (
    <RadioGroup defaultValue="daily" style={{ display: 'flex', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <RadioGroupItem value="daily" id="story-daily" />
        <Label htmlFor="story-daily">Daily</Label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <RadioGroupItem value="weekly" id="story-weekly" />
        <Label htmlFor="story-weekly">Weekly</Label>
      </div>
    </RadioGroup>
  ),
};

export const SelectDefault: StoryObj = {
  render: () => (
    <Select defaultValue="daily">
      <SelectTrigger style={{ width: 200 }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  ),
};
