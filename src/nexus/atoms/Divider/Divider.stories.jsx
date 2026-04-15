import { Divider } from './Divider';

export default {
  title: 'Atoms/Divider',
  component: Divider,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: ['solid', 'dashed', 'dotted'] },
    spacing: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
};

export const Default = {
  args: {},
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <Divider variant="solid" />
      <Divider variant="dashed" />
      <Divider variant="dotted" />
    </div>
  ),
};

export const WithLabel = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <Divider label="Section" />
      <Divider label="Or continue with" variant="dashed" />
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const Spacing = {
  render: () => (
    <div>
      <p>Above (sm spacing)</p>
      <Divider spacing="sm" />
      <p>Between (md spacing)</p>
      <Divider spacing="md" />
      <p>Between (lg spacing)</p>
      <Divider spacing="lg" />
      <p>Below</p>
    </div>
  ),
};
