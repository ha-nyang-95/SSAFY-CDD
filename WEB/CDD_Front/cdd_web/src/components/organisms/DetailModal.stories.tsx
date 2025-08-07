
import type { Meta, StoryObj } from '@storybook/react';
import DetailModal from './DetailModal';

const meta: Meta<typeof DetailModal> = {
  title: 'Organisms/DetailModal',
  component: DetailModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
    crackDetailData: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultOpen: Story = {
  args: {
    isOpen: true,
    crackDetailData: {
      id: 'CRK-001',
      location: 'Beam A, Section 1',
      severity: 'high',
      length: 15.2,
      width: 0.8,
      description: 'A significant crack observed on the main support beam. Requires immediate attention.',
      imageURL: 'https://via.placeholder.com/300x200?text=Crack+Image',
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    crackDetailData: null,
  },
};

export const NoData: Story = {
  args: {
    isOpen: true,
    crackDetailData: null,
  },
};

export const MediumSeverityCrack: Story = {
  args: {
    isOpen: true,
    crackDetailData: {
      id: 'CRK-002',
      location: 'Column B, Base',
      severity: 'medium',
      length: 8.5,
      width: 0.3,
      description: 'A moderate crack found at the base of column B. Monitor closely.',
    },
  },
};

export const LowSeverityCrack: Story = {
  args: {
    isOpen: true,
    crackDetailData: {
      id: 'CRK-003',
      location: 'Slab C, Edge',
      severity: 'low',
      length: 3.1,
      width: 0.1,
      description: 'A minor hairline crack on the edge of slab C. No immediate action required.',
    },
  },
};
