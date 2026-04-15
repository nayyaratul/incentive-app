import { Text } from './Text';

export default {
  title: 'Atoms/Text',
  component: Text,
  argTypes: {
    variant: { control: 'select', options: ['body', 'bodyLg', 'caption', 'micro', 'overline'] },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold'] },
    align: { control: 'select', options: ['left', 'center', 'right'] },
    truncate: { control: 'boolean' },
  },
};

export const Default = {
  args: { children: 'Your next module is ready for review.' },
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <Text variant="body">Body — Your next module is ready for review.</Text>
      <Text variant="bodyLg">Body Large — Course enrollment confirmed.</Text>
      <Text variant="caption">Caption — Updated 3 hours ago</Text>
      <Text variant="micro">Micro — 12 of 24 modules complete</Text>
      <Text variant="overline">Overline — Learning path</Text>
    </div>
  ),
};

export const Weights = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
      <Text weight="regular">Regular (400) — Default body text</Text>
      <Text weight="medium">Medium (500) — Emphasis text</Text>
      <Text weight="semibold">Semibold (600) — Strong text</Text>
    </div>
  ),
};
