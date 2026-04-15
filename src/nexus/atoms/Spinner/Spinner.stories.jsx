import { Spinner } from './Spinner';

export default {
  title: 'Atoms/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['spin', 'dots'] },
  },
};

export const Default = {
  args: { size: 'md' },
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
      {['xs', 'sm', 'md', 'lg', 'xl'].map(size => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-100)', color: 'var(--color-text-primary)' }}>
          <Spinner size={size} />
          <span style={{ fontSize: 'var(--font-size-100)', color: 'var(--color-text-secondary)' }}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Dots = {
  args: { variant: 'dots' },
};
