import { useState, useEffect } from 'react';
import { ProgressBar } from './ProgressBar';

export default {
  title: 'Atoms/ProgressBar',
  component: ProgressBar,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'success', 'warning', 'error', 'subtle'] },
  },
};

export const Default = {
  args: { value: 60, size: 'md', variant: 'default' },
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', maxWidth: 400 }}>
      <div>
        <div style={{ fontSize: 'var(--font-size-200)', marginBottom: 'var(--space-075)', color: 'var(--color-text-secondary)' }}>xs (2px)</div>
        <ProgressBar value={70} size="xs" />
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-200)', marginBottom: 'var(--space-075)', color: 'var(--color-text-secondary)' }}>sm (4px)</div>
        <ProgressBar value={70} size="sm" />
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-200)', marginBottom: 'var(--space-075)', color: 'var(--color-text-secondary)' }}>md (8px)</div>
        <ProgressBar value={70} size="md" />
      </div>
      <div>
        <div style={{ fontSize: 'var(--font-size-200)', marginBottom: 'var(--space-075)', color: 'var(--color-text-secondary)' }}>lg (12px)</div>
        <ProgressBar value={70} size="lg" />
      </div>
    </div>
  ),
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', maxWidth: 400 }}>
      <ProgressBar value={80} variant="default" />
      <ProgressBar value={100} variant="success" />
      <ProgressBar value={50} variant="warning" />
      <ProgressBar value={30} variant="error" />
      <ProgressBar value={60} variant="subtle" size="md" />
    </div>
  ),
};

export const SubtleOnDark = {
  render: () => (
    <div style={{ background: 'var(--grey-90)', padding: 'var(--space-200)', borderRadius: 'var(--radius-150)', maxWidth: 400 }}>
      <ProgressBar value={60} variant="subtle" size="xs" />
    </div>
  ),
};

export const Animated = {
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const timer = setInterval(() => {
        setValue((v) => (v >= 100 ? 0 : v + 5));
      }, 300);
      return () => clearInterval(timer);
    }, []);
    return <ProgressBar value={value} size="lg" style={{ maxWidth: 400 }} />;
  },
};
