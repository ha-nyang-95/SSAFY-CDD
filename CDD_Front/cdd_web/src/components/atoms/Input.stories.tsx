
import type { Meta, StoryObj } from '@storybook/react';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password'],
    },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    onChange: { action: 'changed' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    hasError: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const WithValue: Story = {
  args: {
    type: 'text',
    value: 'Hello World',
    readOnly: false,
  },
};

export const ReadOnly: Story = {
  args: {
    type: 'text',
    value: 'Read-only value',
    readOnly: true,
  },
};

export const Required: Story = {
  args: {
    type: 'text',
    placeholder: 'Required field',
    required: true,
  },
};

export const ErrorState: Story = {
  args: {
    type: 'text',
    placeholder: 'Error state',
    hasError: true,
  },
};
