import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';

export default { title: 'Atoms/ToggleGroup' };

export const SingleSelect = {
  render: () => (
    <div style={{ padding: '40px' }}>
      <ToggleGroup type="single" defaultValue="center">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const MultiSelect = {
  render: () => (
    <div style={{ padding: '40px' }}>
      <ToggleGroup type="multiple" defaultValue={['bold']}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Outline = {
  render: () => (
    <div style={{ padding: '40px' }}>
      <ToggleGroup type="single" variant="outline" defaultValue="center">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Pill = {
  render: () => (
    <div style={{ padding: '40px' }}>
      <ToggleGroup type="single" variant="pill" defaultValue="all">
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="courses">Courses</ToggleGroupItem>
        <ToggleGroupItem value="assessments">Assessments</ToggleGroupItem>
        <ToggleGroupItem value="playlist">Playlist</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div style={{ padding: '40px' }}>
      <ToggleGroup type="single" orientation="vertical" defaultValue="center">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const WithIcons = {
  render: () => (
    <div style={{ padding: '40px' }}>
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft size={16} /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter size={16} /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right"><AlignRight size={16} /></ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Justify"><AlignJustify size={16} /></ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};
