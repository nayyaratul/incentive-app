import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';
import { HelpCircle, Settings } from 'lucide-react';

export default {
  title: 'Atoms/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  argTypes: {
    variant: { control: 'select', options: ['default', 'bordered'] },
    type: { control: 'select', options: ['single', 'multiple'] },
    collapsible: { control: 'boolean' },
  },
};

const sampleItems = [
  {
    value: 'item-1',
    icon: HelpCircle,
    title: 'What is the Nexus Design System?',
    content:
      'Nexus is a comprehensive design system built on Radix primitives, providing accessible, theme-aware components for building consistent user interfaces.',
  },
  {
    value: 'item-2',
    icon: Settings,
    title: 'How do I customise the theme?',
    content:
      'Themes are driven by CSS custom properties defined in tokens.scss. Switch between light and dark by toggling the data-theme attribute on a parent element.',
  },
];

function AccordionTemplate(args) {
  return (
    <div style={{ maxWidth: 720 }}>
      <Accordion {...args}>
        {sampleItems.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger icon={item.icon}>{item.title}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export const Default = {
  render: (args) => <AccordionTemplate {...args} />,
  args: {
    type: 'single',
    collapsible: true,
    variant: 'default',
  },
};

export const Bordered = {
  render: (args) => <AccordionTemplate {...args} />,
  args: {
    type: 'single',
    collapsible: true,
    variant: 'bordered',
  },
};

