import { Badge } from './Badge';

export default {
  title: 'Atoms/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning', 'info'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    dot: { control: 'boolean' },
    count: { control: 'number' },
  },
};

export const Default = {
  args: { children: 'New', variant: 'info' },
};

export const StatusPills = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
      <Badge variant="success">Approved</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Rejected</Badge>
      <Badge variant="info">In Review</Badge>
      <Badge variant="default">Draft</Badge>
    </div>
  ),
};

export const CountBadges = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-150)', alignItems: 'center' }}>
      <Badge count={3} variant="error" />
      <Badge count={12} variant="info" />
      <Badge count={150} variant="default" />
    </div>
  ),
};

export const DotIndicators = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-200)', alignItems: 'center' }}>
      {['default', 'success', 'error', 'warning', 'info'].map(v => (
        <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-300)' }}>
          <Badge dot variant={v} />
          <span style={{ textTransform: 'capitalize' }}>{v}</span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-100)', alignItems: 'center' }}>
      <Badge size="sm" variant="info">Small</Badge>
      <Badge size="md" variant="info">Medium</Badge>
      <Badge size="lg" variant="info">Large</Badge>
    </div>
  ),
};
