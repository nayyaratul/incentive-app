import { useState } from 'react';
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, ToastViewport } from './Toast';

export default {
  title: 'Atoms/Toast',
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning'] },
  },
};

const ToastDemo = ({ variant = 'default', title = 'Notification', description = 'This is a toast message.' }) => {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider swipeDirection="right">
      <button
        onClick={() => setOpen(true)}
        style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid var(--color-border-default)', borderRadius: '6px', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
      >
        Show {variant} toast
      </button>
      <Toast variant={variant} open={open} onOpenChange={setOpen} duration={5000}>
        <div style={{ flex: 1 }}>
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};

export const Default = {
  render: () => <ToastDemo />,
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
      <ToastDemo variant="default" title="Default" description="A default notification." />
      <ToastDemo variant="success" title="Success" description="Your file has been saved." />
      <ToastDemo variant="error" title="Error" description="Something went wrong." />
      <ToastDemo variant="warning" title="Warning" description="You are running low on storage." />
    </div>
  ),
};

export const WithAction = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <ToastProvider swipeDirection="right">
        <button
          onClick={() => setOpen(true)}
          style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid var(--color-border-default)', borderRadius: '6px', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
        >
          Show toast with action
        </button>
        <Toast variant="default" open={open} onOpenChange={setOpen}>
          <div style={{ flex: 1 }}>
            <ToastTitle>File deleted</ToastTitle>
            <ToastDescription>The file has been moved to trash.</ToastDescription>
          </div>
          <ToastAction altText="Undo deletion">Undo</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
  },
};
