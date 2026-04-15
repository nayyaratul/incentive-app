import { Tag } from './Tag';
import { Star, Zap, Heart } from 'lucide-react';

export default {
  title: 'Atoms/Tag',
  component: Tag,
  argTypes: {
    variant: { control: 'select', options: ['default', 'info', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['sm', 'md'] },
    dismissible: { control: 'boolean' },
  },
};

export const Default = {
  args: { children: 'Label', variant: 'default' },
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
      <Tag variant="default">Default</Tag>
      <Tag variant="info">Info</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="error">Error</Tag>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-100)', alignItems: 'center' }}>
      <Tag size="sm" variant="info">Small</Tag>
      <Tag size="md" variant="info">Medium</Tag>
    </div>
  ),
};

export const WithIcon = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
      <Tag icon={<Star size={12} />} variant="warning">Featured</Tag>
      <Tag icon={<Zap size={12} />} variant="info">Fast</Tag>
      <Tag icon={<Heart size={12} />} variant="error">Favourite</Tag>
    </div>
  ),
};

export const Dismissible = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
      <Tag dismissible variant="default">Removable</Tag>
      <Tag dismissible variant="info">Filter</Tag>
      <Tag dismissible variant="success" icon={<Star size={12} />}>With icon</Tag>
    </div>
  ),
};
