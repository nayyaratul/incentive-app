import { Heading } from './Heading';

export default {
  title: 'Atoms/Heading',
  component: Heading,
  argTypes: {
    level: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    align: { control: 'select', options: ['left', 'center', 'right'] },
    truncate: { control: 'boolean' },
  },
};

export const Default = {
  args: { level: 1, children: 'Introduction to Data Science' },
};

export const AllLevels = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <Heading level={1}>Heading 1 — Display</Heading>
      <Heading level={2}>Heading 2 — Page Title</Heading>
      <Heading level={3}>Heading 3 — Section</Heading>
      <Heading level={4}>Heading 4 — Subsection</Heading>
      <Heading level={5}>Heading 5 — Card Title</Heading>
      <Heading level={6}>Heading 6 — Label</Heading>
    </div>
  ),
};

export const Truncated = {
  args: {
    level: 3,
    truncate: true,
    children: 'This is a very long heading that should be truncated when it overflows the container width',
  },
  decorators: [(Story) => <div style={{ maxWidth: 300 }}><Story /></div>],
};
