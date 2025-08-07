
import type { Meta, StoryObj } from '@storybook/react';
import Icon from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ['video', '3d-model', 'structure'],
    },
    size: { control: 'text' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const VideoIcon: Story = {
  args: {
    name: 'video',
    size: '24px',
    color: '#0A3D62', // Primary Color
  },
};

export const ThreeDModelIcon: Story = {
  args: {
    name: '3d-model',
    size: '32px',
    color: '#0984E3', // Accent Color
  },
};

export const StructureIcon: Story = {
  args: {
    name: 'structure',
    size: '40px',
    color: '#747D8C', // Dark Gray
  },
};

export const CustomSizeAndColor: Story = {
  args: {
    name: 'video',
    size: '50px',
    color: '#E74C3C', // Danger Color
  },
};
