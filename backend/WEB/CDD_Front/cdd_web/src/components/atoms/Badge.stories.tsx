
import type { Meta, StoryObj } from '@storybook/react';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['high', 'medium', 'low'],
    },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HighSeverity: Story = {
  args: {
    variant: 'high',
    children: 'High',
  },
};

export const MediumSeverity: Story = {
  args: {
    variant: 'medium',
    children: 'Medium',
  },
};

export const LowSeverity: Story = {
  args: {
    variant: 'low',
    children: 'Low',
  },
};

export const CustomText: Story = {
  args: {
    variant: 'high',
    children: 'Critical Issue',
  },
};
