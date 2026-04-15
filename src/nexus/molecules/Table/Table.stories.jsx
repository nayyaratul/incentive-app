import { Table } from './Table';

export default {
  title: 'Molecules/Table',
  component: Table,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['simple', 'striped'] },
    layout: { control: 'select', options: ['auto', 'fixed'] },
    hoverable: { control: 'boolean' },
    bordered: { control: 'boolean' },
  },
};

const sampleData = [
  { name: 'Alice Johnson', subject: 'Mathematics', score: 95, grade: 'A+' },
  { name: 'Bob Smith', subject: 'Physics', score: 87, grade: 'A' },
  { name: 'Carol Davis', subject: 'Chemistry', score: 72, grade: 'B' },
  { name: 'Dan Wilson', subject: 'Biology', score: 91, grade: 'A' },
  { name: 'Eva Brown', subject: 'English', score: 68, grade: 'C+' },
];

export const Default = {
  render: (args) => (
    <Table {...args}>
      <Table.Caption>Student grades for Q1 2026</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Subject</Table.Head>
          <Table.Head align="right">Score</Table.Head>
          <Table.Head align="center">Grade</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sampleData.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.subject}</Table.Cell>
            <Table.Cell align="right">{row.score}</Table.Cell>
            <Table.Cell align="center">{row.grade}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const Striped = {
  render: () => (
    <Table variant="striped">
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Subject</Table.Head>
          <Table.Head align="right">Score</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sampleData.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.subject}</Table.Cell>
            <Table.Cell align="right">{row.score}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const Hoverable = {
  render: () => (
    <Table hoverable>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Subject</Table.Head>
          <Table.Head align="right">Score</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sampleData.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.subject}</Table.Cell>
            <Table.Cell align="right">{row.score}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const Bordered = {
  render: () => (
    <Table bordered>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Subject</Table.Head>
          <Table.Head align="right">Score</Table.Head>
          <Table.Head align="center">Grade</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sampleData.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.subject}</Table.Cell>
            <Table.Cell align="right">{row.score}</Table.Cell>
            <Table.Cell align="center">{row.grade}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const StickyHeader = {
  render: () => (
    <div style={{ height: 'calc(12.5 * var(--space-200))', overflow: 'auto' }}>
      <Table>
        <Table.Header sticky>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Subject</Table.Head>
            <Table.Head align="right">Score</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[...sampleData, ...sampleData, ...sampleData].map((row, i) => (
            <Table.Row key={i}>
              <Table.Cell>{row.name}</Table.Cell>
              <Table.Cell>{row.subject}</Table.Cell>
              <Table.Cell align="right">{row.score}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  ),
};

export const WithSorting = {
  render: () => (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head sortable sortDirection="asc">Name</Table.Head>
          <Table.Head sortable sortDirection="none">Subject</Table.Head>
          <Table.Head sortable sortDirection="desc" align="right">Score</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sampleData.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.subject}</Table.Cell>
            <Table.Cell align="right">{row.score}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  ),
};

export const Sizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
      {['sm', 'md', 'lg'].map((size) => (
        <div key={size}>
          <div style={{ fontSize: 'var(--font-size-200)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 'var(--space-100)' }}>{size}</div>
          <Table size={size}>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head align="right">Score</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row><Table.Cell>Alice</Table.Cell><Table.Cell align="right">95</Table.Cell></Table.Row>
              <Table.Row><Table.Cell>Bob</Table.Cell><Table.Cell align="right">87</Table.Cell></Table.Row>
            </Table.Body>
          </Table>
        </div>
      ))}
    </div>
  ),
};

export const Combined = {
  render: () => (
    <Table variant="striped" hoverable bordered size="md">
      <Table.Caption>Student grades for Q1 2026</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head sortable sortDirection="asc">Name</Table.Head>
          <Table.Head>Subject</Table.Head>
          <Table.Head sortable sortDirection="none" align="right">Score</Table.Head>
          <Table.Head align="center">Grade</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sampleData.map((row, i) => (
          <Table.Row key={row.name} selected={i === 1}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.subject}</Table.Cell>
            <Table.Cell align="right">{row.score}</Table.Cell>
            <Table.Cell align="center">{row.grade}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell>Average</Table.Cell>
          <Table.Cell />
          <Table.Cell align="right">82.6</Table.Cell>
          <Table.Cell align="center">B+</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>
  ),
};
