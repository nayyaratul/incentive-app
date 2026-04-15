import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../atoms/Button/Button';
import { Text } from '../atoms/Text/Text';
import { Icon } from '../atoms/Icon/Icon';

export default {
  title: 'Molecules/Modal',
  component: Modal,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'fullscreen'] },
    variant: { control: 'select', options: ['default', 'info', 'success', 'warning', 'danger'] },
    placement: { control: 'select', options: ['center', 'top'] },
    scrollBehavior: { control: 'select', options: ['inside', 'outside'] },
    alignFooter: { control: 'select', options: ['start', 'center', 'end'] },
    dismissible: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
  },
};

function ModalTemplate(args) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        title={args.title || 'Invite learners'}
        description={args.description || 'Share this course with your learners.'}
        footer={
          args.footer || (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button>Send invites</Button>
            </>
          )
        }
      >
        <Text>
          Learners will receive an email with a link to this course. You can also manage enrolments
          from the course settings page.
        </Text>
      </Modal>
    </>
  );
}

export const Default = {
  render: (args) => <ModalTemplate {...args} />,
  args: {
    size: 'md',
    variant: 'default',
    dismissible: true,
    placement: 'center',
    scrollBehavior: 'inside',
    alignFooter: 'end',
    showCloseButton: true,
  },
};

export const LongContentInsideScroll = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open long modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Course settings"
          description="Adjust grading, availability, and assessment rules for this course."
          scrollBehavior="inside"
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button>Save changes</Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
            {Array.from({ length: 20 }).map((_, index) => (
              <Text key={index}>
                Setting {index + 1}: Explain how this configuration affects learners and course
                behaviour. Keep descriptions concise and actionable.
              </Text>
            ))}
          </div>
        </Modal>
      </>
    );
  },
};

export const Sizes = {
  render: () => {
    const [size, setSize] = useState('sm');
    const [open, setOpen] = useState(false);
    const sizes = ['sm', 'md', 'lg', 'xl', 'fullscreen'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
          {sizes.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={size === s ? 'primary' : 'secondary'}
              onClick={() => {
                setSize(s);
                setOpen(true);
              }}
            >
              {s}
            </Button>
          ))}
        </div>
        <Modal
          open={open}
          onOpenChange={setOpen}
          size={size}
          title={`Modal size: ${size}`}
          description="Use smaller dialogs for simple confirmations and larger ones for dense forms or data."
          footer={
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        >
          <Text>
            This dialog demonstrates how width and max-height adjust with each size preset while
            still relying on design tokens.
          </Text>
        </Modal>
      </div>
    );
  },
};

export const Variants = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [variant, setVariant] = useState('info');
    const variants = ['default', 'info', 'success', 'warning', 'danger'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
          {variants.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={variant === v ? 'primary' : 'secondary'}
              onClick={() => {
                setVariant(v);
                setOpen(true);
              }}
            >
              {v}
            </Button>
          ))}
        </div>
        <Modal
          open={open}
          onOpenChange={setOpen}
          variant={variant}
          icon={variant !== 'default' ? <Icon name="Info" /> : undefined}
          title="Dialog variant"
          description="Use intent variants sparingly to communicate status or severity."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Dismiss
              </Button>
              <Button>Primary action</Button>
            </>
          }
        >
          <Text>
            This dialog uses the variant to subtly adjust the visual tone via border and optional
            icon, while keeping layout and behaviour consistent.
          </Text>
        </Modal>
      </div>
    );
  },
};

export const NonDismissible = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open non-dismissible modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          dismissible={false}
          title="Session about to expire"
          description="To keep your work, choose an option below. This dialog cannot be dismissed without an explicit choice."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Stay signed in
              </Button>
              <Button onClick={() => setOpen(false)}>Sign out</Button>
            </>
          }
        >
          <Text>
            For critical flows, avoid closing on overlay click or Escape. This pattern ensures users
            make a deliberate choice.
          </Text>
        </Modal>
      </>
    );
  },
};

export const TopAligned = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open top-aligned modal</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          placement="top"
          title="Filter courses"
          description="Adjust filters at the top of the viewport while keeping results visible underneath."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Clear
              </Button>
              <Button onClick={() => setOpen(false)}>Apply filters</Button>
            </>
          }
        >
          <Text>
            Top-aligned dialogs work well for search and filter interfaces where the underlying
            content remains context.
          </Text>
        </Modal>
      </>
    );
  },
};

