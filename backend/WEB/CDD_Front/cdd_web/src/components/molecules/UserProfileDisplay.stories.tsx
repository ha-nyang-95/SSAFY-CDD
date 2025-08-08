
import type { Meta, StoryObj } from '@storybook/react';
import UserProfileDisplay from './UserProfileDisplay';

const meta: Meta<typeof UserProfileDisplay> = {
  title: 'Molecules/UserProfileDisplay',
  component: UserProfileDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    username: { control: 'text' },
    isLoggedIn: { control: 'boolean' },
    onLogout: { action: 'logout clicked' },
    onLoginClick: { action: 'login clicked' },
    onJoinClick: { action: 'join clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    username: 'JohnDoe',
    isLoggedIn: true,
  },
};

export const LoggedOut: Story = {
  args: {
    isLoggedIn: false,
  },
};
