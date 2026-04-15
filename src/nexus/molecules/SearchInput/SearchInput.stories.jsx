import { useState } from 'react';
import { SearchInput } from './SearchInput';
import { FormField } from '../atoms/FormField/FormField';

export default {
  title: 'Molecules/SearchInput',
  component: SearchInput,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    loading: { control: 'boolean' },
    showClear: { control: 'boolean' },
  },
};

export const Default = {
  render: (args) => {
    const [value, setValue] = useState('');

    return (
      <SearchInput
        {...args}
        placeholder={args.placeholder || 'Search courses'}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  },
};

export const WithFormField = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <FormField
        label="Search catalogue"
        htmlFor="search-catalogue"
        hint="Search by course name, instructor, or tag."
      >
        <SearchInput
          id="search-catalogue"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </FormField>
    );
  },
};

export const Sizes = {
  render: () => {
    const [small, setSmall] = useState('');
    const [medium, setMedium] = useState('');
    const [large, setLarge] = useState('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
        <SearchInput
          size="sm"
          placeholder="Small search"
          value={small}
          onChange={(event) => setSmall(event.target.value)}
        />
        <SearchInput
          size="md"
          placeholder="Medium search"
          value={medium}
          onChange={(event) => setMedium(event.target.value)}
        />
        <SearchInput
          size="lg"
          placeholder="Large search"
          value={large}
          onChange={(event) => setLarge(event.target.value)}
        />
      </div>
    );
  },
};

export const LoadingState = {
  render: () => {
    const [value, setValue] = useState('Leadership fundamentals');

    return (
      <SearchInput
        placeholder="Search while loading"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        loading
      />
    );
  },
};

