
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'nav', 'auth', 'switch-auth'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    onClick: { action: 'clicked' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Primary Button',
  },
};

export const PrimarySmall: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Primary Small',
  },
};

export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Primary Large',
  },
};

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Primary Disabled',
    disabled: true,
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Button',
  },
};

export const SecondaryDisabled: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Disabled',
    disabled: true,
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'md',
    children: 'Danger Button',
  },
};

export const DangerDisabled: Story = {
  args: {
    variant: 'danger',
    size: 'md',
    children: 'Danger Disabled',
    disabled: true,
  },
};

export const Nav: Story = {
  args: {
    variant: 'nav',
    size: 'sm',
    children: 'Nav Button',
  },
};

export const NavDisabled: Story = {
  args: {
    variant: 'nav',
    size: 'sm',
    children: 'Nav Disabled',
    disabled: true,
  },
};

export const Auth: Story = {
  args: {
    variant: 'auth',
    size: 'lg',
    children: 'Auth Button',
  },
};

export const AuthDisabled: Story = {
  args: {
    variant: 'auth',
    size: 'lg',
    children: 'Auth Disabled',
    disabled: true,
  },
};

export const SwitchAuth: Story = {
  args: {
    variant: 'switch-auth',
    size: 'md',
    children: 'Switch Auth',
  },
};

export const SwitchAuthDisabled: Story = {
  args: {
    variant: 'switch-auth',
    size: 'md',
    children: 'Switch Auth Disabled',
    disabled: true,
  },
};
