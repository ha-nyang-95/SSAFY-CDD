
import type { Meta, StoryObj } from '@storybook/react';
import AuthForm from './AuthForm';

const meta: Meta<typeof AuthForm> = {
  title: 'Organisms/AuthForm',
  component: AuthForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['login', 'signup'],
    },
    onSubmit: { action: 'form submitted' },
    onSwitchAuth: { action: 'switch auth clicked' },
    errorMessage: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginForm: Story = {
  args: {
    type: 'login',
    onSubmit: (data) => console.log('Login Data:', data),
    onSwitchAuth: () => console.log('Switch to Sign Up'),
  },
};

export const SignUpForm: Story = {
  args: {
    type: 'signup',
    onSubmit: (data) => console.log('Sign Up Data:', data),
    onSwitchAuth: () => console.log('Switch to Login'),
  },
};

export const LoginFormWithError: Story = {
  args: {
    type: 'login',
    onSubmit: (data) => console.log('Login Data:', data),
    onSwitchAuth: () => console.log('Switch to Sign Up'),
    errorMessage: 'Invalid username or password.',
  },
};

export const SignUpFormWithError: Story = {
  args: {
    type: 'signup',
    onSubmit: (data) => console.log('Sign Up Data:', data),
    onSwitchAuth: () => console.log('Switch to Login'),
    errorMessage: 'Employee ID already exists.',
  },
};
