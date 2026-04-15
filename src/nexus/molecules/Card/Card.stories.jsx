import { Card } from './Card';
import { Button } from '../atoms/Button/Button';
import { Text } from '../atoms/Text/Text';
import { Thumbnail } from '../atoms/Thumbnail/Thumbnail';

export default {
  title: 'Molecules/Card',
  component: Card,
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    interactive: { control: 'boolean' },
  },
};

export const Default = {
  render: (args) => (
    <Card {...args}>
      <Card.Header>
        <Card.Eyebrow>Overview</Card.Eyebrow>
        <Card.Title>Learning analytics</Card.Title>
        <Card.Subtitle>Track course progress and completion at a glance.</Card.Subtitle>
      </Card.Header>
      <Card.Body>
        <Text>
          Monitor enrolments, completion rates, and average scores across all courses. Use filters to
          focus on specific cohorts or time ranges.
        </Text>
      </Card.Body>
      <Card.Footer>
        <Button variant="secondary">View insights</Button>
        <Button>Open dashboard</Button>
      </Card.Footer>
    </Card>
  ),
};

export const Variants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <Card variant="elevated">
        <Card.Header>
          <Card.Title>Elevated card</Card.Title>
          <Card.Subtitle>Default surface for most content.</Card.Subtitle>
        </Card.Header>
      </Card>
      <Card variant="outlined">
        <Card.Header>
          <Card.Title>Outlined card</Card.Title>
          <Card.Subtitle>Use for dense tables or settings.</Card.Subtitle>
        </Card.Header>
      </Card>
      <Card variant="flat">
        <Card.Header>
          <Card.Title>Flat card</Card.Title>
          <Card.Subtitle>Use for nested or low-emphasis content.</Card.Subtitle>
        </Card.Header>
      </Card>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
      <Card size="sm">
        <Card.Header>
          <Card.Title>Small</Card.Title>
          <Card.Subtitle>Compact padding for dense layouts.</Card.Subtitle>
        </Card.Header>
      </Card>
      <Card size="md">
        <Card.Header>
          <Card.Title>Medium</Card.Title>
          <Card.Subtitle>Standard card size.</Card.Subtitle>
        </Card.Header>
      </Card>
      <Card size="lg">
        <Card.Header>
          <Card.Title>Large</Card.Title>
          <Card.Subtitle>More breathing room for hero content.</Card.Subtitle>
        </Card.Header>
      </Card>
    </div>
  ),
};

export const WithMedia = {
  render: () => (
    <Card>
      <Card.Media>
        <Thumbnail
          src="https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Students studying together"
        />
      </Card.Media>
      <Card.Header>
        <Card.Eyebrow>Featured course</Card.Eyebrow>
        <Card.Title>Design Systems for LMS</Card.Title>
        <Card.Subtitle>Learn how to build consistent experiences at scale.</Card.Subtitle>
      </Card.Header>
      <Card.Footer align="start">
        <Button>View course</Button>
      </Card.Footer>
    </Card>
  ),
};

export const Interactive = {
  render: () => (
    <Card interactive>
      <Card.Header>
        <Card.Title>Clickable card</Card.Title>
        <Card.Subtitle>Ideal for dashboards and navigation tiles.</Card.Subtitle>
      </Card.Header>
      <Card.Body>
        <Text variant="caption" color="var(--color-text-secondary)">
          This card responds to hover, active, and focus-visible states when used as an interactive
          element.
        </Text>
      </Card.Body>
    </Card>
  ),
};

