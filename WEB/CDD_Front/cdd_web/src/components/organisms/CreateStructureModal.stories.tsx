
import type { Meta, StoryObj } from '@storybook/react';
import CreateStructureModal from './CreateStructureModal';

const meta: Meta<typeof CreateStructureModal> = {
  title: 'Organisms/CreateStructureModal',
  component: CreateStructureModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
    onSubmit: { action: 'form submitted' },
    onGenerateLink: { action: 'generate link clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    onSubmit: (data) => console.log('Submitted:', data),
    onGenerateLink: async () => {
      console.log('Generating link...');
      return new Promise((resolve) => setTimeout(() => resolve('https://example.com/generated-link-123'), 1000));
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onSubmit: (data) => console.log('Submitted:', data),
    onGenerateLink: async () => 'https://example.com/generated-link-456',
  },
};
