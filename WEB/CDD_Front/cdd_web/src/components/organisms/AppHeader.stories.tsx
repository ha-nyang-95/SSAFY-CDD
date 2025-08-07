
import type { Meta, StoryObj } from '@storybook/react';
import AppHeader from './AppHeader';

const meta: Meta<typeof AppHeader> = {
  title: 'Organisms/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
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
    title: 'CDD Dashboard',
    username: 'JohnDoe',
    isLoggedIn: true,
  },
};

export const LoggedOut: Story = {
  args: {
    title: 'CDD Dashboard',
    isLoggedIn: false,
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'My Custom Dashboard',
    username: 'JaneSmith',
    isLoggedIn: true,
  },
};
