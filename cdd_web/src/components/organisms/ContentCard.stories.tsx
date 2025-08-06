
import type { Meta, StoryObj } from '@storybook/react';
import ContentCard from './ContentCard';
import Text from '../atoms/Text';

const meta: Meta<typeof ContentCard> = {
  title: 'Organisms/ContentCard',
  component: ContentCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    children: <Text>This is the content of the card.</Text>,
  },
};

export const WithMultipleChildren: Story = {
  args: {
    title: 'Detailed Information',
    children: (
      <>
        <Text variant="p">Line 1 of content.</Text>
        <Text variant="p">Line 2 of content.</Text>
        <Text variant="p">Line 3 of content.</Text>
      </>
    ),
  },
};

export const EmptyContent: Story = {
  args: {
    title: 'Empty Card',
    children: <Text color="gray">No content available.</Text>,
  },
};
