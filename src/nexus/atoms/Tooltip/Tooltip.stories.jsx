import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';

export default {
  title: 'Atoms/Tooltip',
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
  },
  decorators: [(Story) => <TooltipProvider delayDuration={200}><Story /></TooltipProvider>],
};

export const Default = {
  render: () => (
    <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button style={{ padding: '8px 16px', border: '1px solid var(--color-border-default)', borderRadius: '6px', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
            Hover me
          </button>
        </TooltipTrigger>
        <TooltipContent>This is a tooltip</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const Sides = {
  render: () => (
    <div style={{ padding: '80px', display: 'flex', gap: 'var(--space-200)', justifyContent: 'center' }}>
      {['top', 'right', 'bottom', 'left'].map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <button style={{ padding: '8px 16px', border: '1px solid var(--color-border-default)', borderRadius: '6px', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', textTransform: 'capitalize' }}>
              {side}
            </button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const LongContent = {
  render: () => (
    <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button style={{ padding: '8px 16px', border: '1px solid var(--color-border-default)', borderRadius: '6px', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
            Long tooltip
          </button>
        </TooltipTrigger>
        <TooltipContent>This is a longer tooltip that demonstrates the max-width constraint of 240px with text wrapping.</TooltipContent>
      </Tooltip>
    </div>
  ),
};
