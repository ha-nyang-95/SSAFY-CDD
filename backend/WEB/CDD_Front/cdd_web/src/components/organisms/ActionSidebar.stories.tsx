
import type { Meta, StoryObj } from '@storybook/react';
import ActionSidebar from './ActionSidebar';

const meta: Meta<typeof ActionSidebar> = {
  title: 'Organisms/ActionSidebar',
  component: ActionSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    activeView: {
      control: 'select',
      options: ['real-time', '3d-model', 'structure-management'],
    },
    onNavClick: { action: 'navigation clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RealTimeActive: Story = {
  args: {
    activeView: 'real-time',
  },
};

export const ThreeDModelActive: Story = {
  args: {
    activeView: '3d-model',
  },
};

export const StructureManagementActive: Story = {
  args: {
    activeView: 'structure-management',
  },
};
