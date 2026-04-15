import { useState } from 'react';
import { Switch } from './Switch';

export default {
  title: 'Atoms/Switch',
  component: Switch,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
};

export const Default = {
  args: {},
};

export const Checked = {
  args: { checked: true },
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center' }}>
      <Switch size="sm" checked />
      <Switch size="md" checked />
      <Switch size="lg" checked />
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center' }}>
      <Switch />
      <Switch checked />
      <Switch disabled />
      <Switch checked disabled />
    </div>
  ),
};

export const Interactive = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: 'flex', gap: 'var(--space-100)', alignItems: 'center' }}>
        <Switch checked={checked} onCheckedChange={setChecked} id="dark-mode" />
        <label htmlFor="dark-mode" style={{ fontSize: '14px', cursor: 'pointer' }}>Dark mode</label>
      </div>
    );
  },
};
