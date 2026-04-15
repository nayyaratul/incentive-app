import { EmptyState } from './EmptyState';
import { Tag } from '../atoms/Tag/Tag';

export default {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  argTypes: {
    variant: { control: 'select', options: ['default', 'no-results', 'error', 'upgrade'] },
    size: { control: 'select', options: ['page', 'section', 'inline'] },
    align: { control: 'select', options: ['center', 'start'] },
    iconName: { control: 'text' },
  },
};

export const Default = {
  render: (args) => (
    <EmptyState
      {...args}
      iconName={args.iconName || 'Inbox'}
      title={args.title || 'No courses yet'}
      description={
        args.description ||
        'When you create or enrol in a course, it will appear here. Use the Catalogue to discover new content.'
      }
      primaryAction={
        args.primaryAction || {
          label: 'Browse catalogue',
        }
      }
      secondaryAction={
        args.secondaryAction || {
          label: 'Create course',
          variant: 'secondary',
        }
      }
    />
  ),
};

export const NoResults = {
  render: () => (
    <EmptyState
      variant="no-results"
      size="section"
      iconName="Search"
      title="No results"
      description={
        <>
          We couldn&rsquo;t find anything matching{' '}
          <Tag size="sm" variant="default">leadership fundamentals</Tag>. Try adjusting your filters
          or using a different keyword.
        </>
      }
      primaryAction={{ label: 'Clear filters' }}
    />
  ),
};

export const Error = {
  render: () => (
    <EmptyState
      variant="error"
      size="section"
      iconName="AlertTriangle"
      title="We couldn&rsquo;t load your courses"
      description="Something went wrong while fetching your data. This might be a temporary issue."
      primaryAction={{ label: 'Retry' }}
      secondaryAction={{ label: 'Contact support', variant: 'secondary' }}
    />
  ),
};

export const Upgrade = {
  render: () => (
    <EmptyState
      variant="upgrade"
      size="section"
      iconName="Lock"
      title="Unlock advanced analytics"
      description="Upgrade your plan to access cohort comparison, trend analysis, and exportable reports."
      primaryAction={{ label: 'View plans' }}
      secondaryAction={{ label: 'Remind me later', variant: 'secondary' }}
    />
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <EmptyState
        size="page"
        iconName="Inbox"
        title="Page-level empty state"
        description="Use this layout when an entire page has no content yet."
      />
      <EmptyState
        size="section"
        iconName="FolderOpen"
        title="Section-level empty state"
        description="Use this inside a card or panel."
      />
      <EmptyState
        size="inline"
        iconName="Info"
        title="Inline empty state"
        description="Use this for small areas such as a sidebar list."
        align="start"
      />
    </div>
  ),
};

