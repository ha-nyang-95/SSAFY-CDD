
import type { Meta, StoryObj } from '@storybook/react';
import Label from './Label';

const meta: Meta<typeof Label> = {
  title: 'Atoms/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: 'someInputId',
    children: 'Label Text',
  },
};

export const LongLabel: Story = {
  args: {
    htmlFor: 'anotherInputId',
    children: 'This is a very long label text to demonstrate how it behaves.',
  },
};
