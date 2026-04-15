import { Avatar } from './Avatar';

export default {
  title: 'Atoms/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    online: { control: { type: 'select' }, options: [undefined, true, false] },
  },
};

export const Default = {
  args: { name: 'Atul Nayyar', size: 'md' },
};

export const WithImage = {
  args: {
    src: 'https://i.pravatar.cc/150?u=nexus',
    name: 'Jane Doe',
    size: 'lg',
  },
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
      {['xs', 'sm', 'md', 'lg', 'xl'].map(size => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-050)', color: 'var(--color-text-primary)' }}>
          <Avatar name="Atul Nayyar" size={size} />
          <span style={{ fontSize: 'var(--font-size-100)', color: 'var(--color-text-secondary)' }}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const OnlineStatus = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-200)', alignItems: 'center' }}>
      <Avatar name="Online User" size="lg" online={true} />
      <Avatar name="Offline User" size="lg" online={false} />
      <Avatar name="No Status" size="lg" />
    </div>
  ),
};

export const Fallback = {
  args: {
    src: 'https://broken-url.example/avatar.jpg',
    name: 'Broken Image',
    size: 'lg',
  },
};
