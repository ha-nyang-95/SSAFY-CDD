
import type { Meta, StoryObj } from '@storybook/react';
import LiveFeedContainer from './LiveFeedContainer';

const meta: Meta<typeof LiveFeedContainer> = {
  title: 'Organisms/LiveFeedContainer',
  component: LiveFeedContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['live', 'offline'],
    },
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveStatus: Story = {
  args: {
    status: 'live',
    message: 'Drone feed is active.',
  },
};

export const OfflineStatus: Story = {
  args: {
    status: 'offline',
    message: 'Drone feed is currently unavailable.',
  },
};
