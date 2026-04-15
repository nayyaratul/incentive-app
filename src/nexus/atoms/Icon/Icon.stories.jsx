import { Icon } from './Icon';

export default {
  title: 'Atoms/Icon',
  component: Icon,
  argTypes: {
    name: { control: 'text' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    color: { control: 'color' },
  },
};

export const Default = {
  args: { name: 'Heart', size: 'md' },
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
      {['xs', 'sm', 'md', 'lg', 'xl'].map(size => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-050)', color: 'var(--color-text-primary)' }}>
          <Icon name="Star" size={size} />
          <span style={{ fontSize: 'var(--font-size-100)', color: 'var(--color-text-secondary)' }}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const CommonIcons = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap', color: 'var(--color-text-primary)' }}>
      {['Heart', 'Star', 'Search', 'Bell', 'Settings', 'User', 'Mail', 'BookOpen', 'Calendar', 'Check', 'X', 'ChevronDown', 'ArrowRight', 'Download'].map(name => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-050)', width: 56 }}>
          <Icon name={name} size="lg" />
          <span style={{ fontSize: 'var(--font-size-100)', color: 'var(--color-text-secondary)' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
