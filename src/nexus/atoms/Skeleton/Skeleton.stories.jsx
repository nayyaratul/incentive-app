import { Skeleton } from './Skeleton';

export default {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  argTypes: {
    width: { control: 'text' },
    height: { control: 'text' },
    circle: { control: 'boolean' },
    count: { control: { type: 'number', min: 1, max: 10 } },
  },
};

export const Default = {
  args: { width: '100%', height: 16 },
};

export const TextBlock = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Skeleton width="100%" height={16} count={4} />
    </div>
  ),
};

export const Circle = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
      <Skeleton circle width={32} />
      <Skeleton circle width={48} />
      <Skeleton circle width={64} />
    </div>
  ),
};

export const Card = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'flex-start', maxWidth: 320 }}>
      <Skeleton circle width={40} />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height={14} />
        <div style={{ marginTop: 'var(--space-075)' }}>
          <Skeleton width="100%" height={12} count={2} />
        </div>
      </div>
    </div>
  ),
};

export const Shapes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <Skeleton width={200} height={120} borderRadius="var(--radius-150)" />
      <Skeleton width="100%" height={16} />
      <Skeleton width="75%" height={12} />
    </div>
  ),
};
