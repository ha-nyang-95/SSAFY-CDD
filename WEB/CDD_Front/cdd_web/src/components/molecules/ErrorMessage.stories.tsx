
import type { Meta, StoryObj } from '@storybook/react';
import ErrorMessage from './ErrorMessage';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Molecules/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'This is a default error message.',
  },
};

export const LongMessage: Story = {
  args: {
    message: 'This is a very long error message that might wrap to multiple lines to demonstrate how it handles longer content.',
  },
};

export const EmptyMessage: Story = {
  args: {
    message: '',
  },
};
