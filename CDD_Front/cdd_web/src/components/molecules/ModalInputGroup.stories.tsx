
import type { Meta, StoryObj } from '@storybook/react';
import ModalInputGroup from './ModalInputGroup';
import Input from '../atoms/Input';
import Label from '../atoms/Label';

const meta: Meta<typeof ModalInputGroup> = {
  title: 'Molecules/ModalInputGroup',
  component: ModalInputGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Label htmlFor="username">Username</Label>
        <Input id="username" type="text" placeholder="Enter your username" />
      </>
    ),
  },
};

export const WithPassword: Story = {
  args: {
    children: (
      <>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Enter your password" />
      </>
    ),
  },
};

export const MultipleInputs: Story = {
  args: {
    children: (
      <>
        <Label htmlFor="firstName">First Name</Label>
        <Input id="firstName" type="text" placeholder="Enter your first name" />
        <Label htmlFor="lastName">Last Name</Label>
        <Input id="lastName" type="text" placeholder="Enter your last name" />
      </>
    ),
  },
};
