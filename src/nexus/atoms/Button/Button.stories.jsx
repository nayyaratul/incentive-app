import { Button } from './Button';
import { Icon } from '../Icon/Icon';

export default {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'destructive', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['default', 'rounded', 'pill'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export const Default = {
  args: { children: 'Enrol Now', variant: 'primary' },
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Shapes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button shape="default">Default</Button>
        <Button shape="rounded">Rounded</Button>
        <Button shape="pill">Pill</Button>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="secondary" shape="default">Secondary default</Button>
        <Button variant="secondary" shape="rounded">Secondary rounded</Button>
        <Button variant="secondary" shape="pill">Secondary pill</Button>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="ghost" shape="default">Ghost default</Button>
        <Button variant="ghost" shape="rounded">Ghost rounded</Button>
        <Button variant="ghost" shape="pill">Ghost pill</Button>
      </div>
    </div>
  ),
};

export const WithIcons = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center' }}>
      <Button iconLeft={<Icon name="Download" size="sm" />}>Download</Button>
      <Button iconRight={<Icon name="ArrowRight" size="sm" />}>Continue</Button>
      <Button variant="destructive" iconLeft={<Icon name="Trash2" size="sm" />}>Delete</Button>
    </div>
  ),
};

export const States = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center' }}>
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
    </div>
  ),
};

export const FullWidth = {
  args: { children: 'Submit Leave Request', fullWidth: true },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
