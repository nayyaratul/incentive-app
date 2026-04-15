import { Toggle } from './Toggle';
import { Bold, Italic, Underline } from 'lucide-react';

export default { title: 'Atoms/Toggle' };

export const Default = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', padding: '40px' }}>
      <Toggle>Bold</Toggle>
      <Toggle pressed>Italic</Toggle>
    </div>
  ),
};

export const Outline = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', padding: '40px' }}>
      <Toggle variant="outline">Bold</Toggle>
      <Toggle variant="outline" pressed>Italic</Toggle>
    </div>
  ),
};

export const Pill = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', padding: '40px' }}>
      <Toggle variant="pill">All</Toggle>
      <Toggle variant="pill" pressed>Courses</Toggle>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '40px' }}>
      <Toggle size="sm" pressed>Small</Toggle>
      <Toggle size="md" pressed>Medium</Toggle>
      <Toggle size="lg" pressed>Large</Toggle>
    </div>
  ),
};

export const WithIcon = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', padding: '40px' }}>
      <Toggle variant="outline" aria-label="Bold"><Bold size={16} /></Toggle>
      <Toggle variant="outline" pressed aria-label="Italic"><Italic size={16} /></Toggle>
      <Toggle variant="outline" aria-label="Underline"><Underline size={16} /></Toggle>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', padding: '40px' }}>
      <Toggle disabled>Disabled</Toggle>
      <Toggle disabled pressed>Disabled On</Toggle>
      <Toggle variant="outline" disabled>Outline Disabled</Toggle>
    </div>
  ),
};
