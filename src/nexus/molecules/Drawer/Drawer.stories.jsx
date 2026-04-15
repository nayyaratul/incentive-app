import { useState } from 'react';
import { Drawer } from './Drawer';
import { Button } from '../atoms/Button/Button';
import { Text } from '../atoms/Text/Text';
import { Icon } from '../atoms/Icon/Icon';
import { Divider } from '../atoms/Divider/Divider';
import styles from './Drawer.module.scss';

export default {
  title: 'Molecules/Drawer',
  component: Drawer,
  argTypes: {
    placement: { control: 'select', options: ['start', 'end', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
    height: { control: 'select', options: ['auto', 'half', 'full'] },
    hasBackdrop: { control: 'boolean' },
    closeOnBackdropClick: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
  },
};

function DrawerTemplate(args) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        {...args}
        open={open}
        onOpenChange={setOpen}
        title={args.title || 'Filters'}
        subtitle={
          args.subtitle ||
          'Refine the visible courses without losing your current context.'
        }
        footer={
          args.footer || (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Clear
              </Button>
              <Button onClick={() => setOpen(false)}>Apply filters</Button>
            </>
          )
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
          <Text size="sm" color="var(--color-text-secondary)">
            Use drawers for secondary surfaces such as filters, inspectors, or composition
            flows that should not replace primary navigation.
          </Text>
          <Divider />
          {Array.from({ length: 8 }).map((_, index) => (
            <Text key={index}>Filter option {index + 1}</Text>
          ))}
        </div>
      </Drawer>
    </>
  );
}

export const Default = {
  render: (args) => <DrawerTemplate {...args} />,
  args: {
    placement: 'end',
    size: 'md',
    height: 'auto',
    hasBackdrop: true,
    closeOnBackdropClick: true,
    closeOnEsc: true,
    dismissible: true,
    showCloseButton: true,
  },
};

export const Placements = {
  render: () => {
    const [placement, setPlacement] = useState('start');
    const [open, setOpen] = useState(false);

    const placements = ['start', 'end', 'bottom'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
          {placements.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={placement === p ? 'primary' : 'secondary'}
              onClick={() => {
                setPlacement(p);
                setOpen(true);
              }}
            >
              {p}
            </Button>
          ))}
        </div>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          placement={placement}
          title={`Drawer placement: ${placement}`}
          subtitle="Drawers can slide in from the side or bottom while keeping the main page visible."
          footer={
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        >
          <Text>
            Use side drawers for filters and inspectors, and bottom drawers for mobile-first
            composition or filter experiences.
          </Text>
        </Drawer>
      </div>
    );
  },
};

export const Sizes = {
  render: () => {
    const [size, setSize] = useState('sm');
    const [open, setOpen] = useState(false);
    const sizes = ['sm', 'md', 'lg', 'full'];

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
        <Drawer
          open={open}
          onOpenChange={setOpen}
          size={size}
          title={`Drawer size: ${size}`}
          subtitle="Adjust drawer width to match the density and complexity of its content."
          footer={
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        >
          <Text>
            Smaller drawers work well for narrow filter sets; larger ones suit rich forms or
            detailed inspectors.
          </Text>
        </Drawer>
      </div>
    );
  },
};

export const BottomHeights = {
  render: () => {
    const [height, setHeight] = useState('auto');
    const [open, setOpen] = useState(false);
    const heights = ['auto', 'half', 'full'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
          {heights.map((h) => (
            <Button
              key={h}
              size="sm"
              variant={height === h ? 'primary' : 'secondary'}
              onClick={() => {
                setHeight(h);
                setOpen(true);
              }}
            >
              {h}
            </Button>
          ))}
        </div>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          placement="bottom"
          height={height}
          title={`Bottom drawer: ${height}`}
          subtitle="Bottom drawers are especially useful on smaller screens."
          footer={
            <Button onClick={() => setOpen(false)}>
              Close
            </Button>
          }
        >
          <Text>
            Use auto height for short content, half-height for balanced overlays, and full-height
            for immersive flows that still feel reversible.
          </Text>
        </Drawer>
      </div>
    );
  },
};

export const WithIconAndActions = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer with icon</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          placement="end"
          size="md"
          icon={<Icon name="Filter" />}
          title="Filter catalogue"
          subtitle="Narrow results by category, level, and duration."
          headerActions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // placeholder for clear action
              }}
            >
              Reset
            </Button>
          }
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>
                Apply
              </Button>
            </>
          }
        >
          <Text>
            Header icons and actions help signal purpose and provide quick access to supporting
            actions like resetting filters.
          </Text>
        </Drawer>
      </>
    );
  },
};

export const NonDismissible = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open non-dismissible drawer</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          dismissible={false}
          closeOnBackdropClick={false}
          closeOnEsc={false}
          title="Unsaved filters"
          subtitle="Require an explicit decision before closing this drawer."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Discard changes
              </Button>
              <Button onClick={() => setOpen(false)}>
                Save filters
              </Button>
            </>
          }
        >
          <Text>
            For critical flows, disable implicit dismissal so that people must make a deliberate
            choice to proceed or cancel.
          </Text>
        </Drawer>
      </>
    );
  },
};

export const LongContentStickyFooter = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open long drawer</Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          placement="end"
          size="md"
          title="Long drawer with sticky footer"
          subtitle="Scroll the content to see header and footer stay fixed."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-150)',
            }}
          >
            {Array.from({ length: 40 }).map((_, index) => (
              <Text key={index}>
                Line {index + 1}: This is sample content to demonstrate how the drawer body scrolls
                while the header and footer remain fixed in place.
              </Text>
            ))}
          </div>
        </Drawer>
      </>
    );
  },
};

export const StackedDrawers = {
  render: () => {
    const [outerOpen, setOuterOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOuterOpen(true)}>Open drawer</Button>

        {/* First (outer) drawer */}
        <Drawer
          open={outerOpen}
          onOpenChange={(next) => {
            setOuterOpen(next);
            if (!next) {
              setInnerOpen(false);
            }
          }}
          placement="end"
          size="md"
          hasBackdrop={!innerOpen}
          title="Vendor payment details"
          subtitle="See your payment details here."
          className={innerOpen ? styles.stackedBehind : undefined}
          footer={
            <Button variant="ghost" onClick={() => setOuterOpen(false)}>
              Close
            </Button>
          }
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-150)',
            }}
          >
            <Text>Drawer heading</Text>
            <Button onClick={() => setInnerOpen(true)}>Open 2nd drawer</Button>
          </div>
        </Drawer>

        {/* Second (inner) drawer */}
        <Drawer
          open={innerOpen}
          onOpenChange={setInnerOpen}
          placement="end"
          size="md"
          title="Confirm payout"
          subtitle="Review vendor details before confirming the payout."
          footer={
            <>
              <Button variant="ghost" onClick={() => setInnerOpen(false)}>
                Back
              </Button>
              <Button onClick={() => setInnerOpen(false)}>Confirm payout</Button>
            </>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-150)',
            }}
          >
            <Text size="md" color="var(--color-text-primary)">
              This second drawer stacks on top of the first. Clicking the dark area closes it and
              brings the first drawer back to the front.
            </Text>
          </div>
        </Drawer>
      </>
    );
  },
};

