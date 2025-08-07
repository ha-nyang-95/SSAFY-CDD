
import type { Meta, StoryObj } from '@storybook/react';
import NavButton from './NavButton';

const meta: Meta<typeof NavButton> = {
  title: 'Molecules/NavButton',
  component: NavButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    iconName: {
      control: 'select',
      options: ['video', '3d-model', 'structure'],
    },
    label: { control: 'text' },
    isActive: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveVideo: Story = {
  args: {
    iconName: 'video',
    label: 'Real-time',
    isActive: true,
  },
};

export const InactiveVideo: Story = {
  args: {
    iconName: 'video',
    label: 'Real-time',
    isActive: false,
  },
};

export const Active3DModel: Story = {
  args: {
    iconName: '3d-model',
    label: '3D Model',
    isActive: true,
  },
};

export const Inactive3DModel: Story = {
  args: {
    iconName: '3d-model',
    label: '3D Model',
    isActive: false,
  },
};

export const ActiveStructure: Story = {
  args: {
    iconName: 'structure',
    label: 'Structure',
    isActive: true,
  },
};

export const InactiveStructure: Story = {
  args: {
    iconName: 'structure',
    label: 'Structure',
    isActive: false,
  },
};
