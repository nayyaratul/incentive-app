import { useState } from 'react';
import { Overlay } from './Overlay';

export default {
  title: 'Atoms/Overlay',
  component: Overlay,
  argTypes: {
    visible: { control: 'boolean' },
  },
};

export const Default = {
  args: { visible: true },
  render: (args) => (
    <div style={{ position: 'relative', height: '200px', padding: 'var(--space-200)' }}>
      <p style={{ position: 'relative', zIndex: 1 }}>Content behind the overlay</p>
      <Overlay {...args} />
    </div>
  ),
};

export const WithOnClick = {
  render: function WithOnClickStory() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ position: 'relative', minHeight: '180px' }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ position: 'relative', zIndex: 1 }}
        >
          Open overlay
        </button>
        {open && (
          <Overlay
            visible
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <p style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1001, background: 'var(--color-bg-elevated)', padding: 'var(--space-200)', borderRadius: 'var(--radius-200)' }}>
            Click the dimmed area to close
          </p>
        )}
      </div>
    );
  },
};

export const Hidden = {
  args: { visible: false },
  render: (args) => (
    <div style={{ position: 'relative', height: '200px', padding: 'var(--space-200)' }}>
      <p style={{ position: 'relative', zIndex: 1 }}>Overlay is hidden (visible=false); content is fully interactive</p>
      <Overlay {...args} />
    </div>
  ),
};
