
import type { Meta, StoryObj } from '@storybook/react';
import ListItem from './ListItem';
import Text from '../atoms/Text';

const meta: Meta<typeof ListItem> = {
  title: 'Molecules/ListItem',
  component: ListItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Text>This is a list item.</Text>,
  },
};

export const WithMultipleChildren: Story = {
  args: {
    children: (
      <>
        <Text variant="h3">Crack ID: CRK-2023-001</Text>
        <Text variant="p" fontSize="listItemInfo" color="darkGray">
          Location: Beam A, Section 3
        </Text>
        <Text variant="p" fontSize="listItemEmphasis" fontWeight="bold">
          Severity: <span style={{ color: 'red' }}>High</span>
        </Text>
      </>
    ),
  },
};

export const Clickable: Story = {
  args: {
    children: <Text>Clickable List Item</Text>,
    onClick: () => alert('List item clicked!'),
  },
};
