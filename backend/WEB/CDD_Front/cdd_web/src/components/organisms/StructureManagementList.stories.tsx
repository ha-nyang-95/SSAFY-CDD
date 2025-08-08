
import type { Meta, StoryObj } from '@storybook/react';
import StructureManagementList from './StructureManagementList';

const meta: Meta<typeof StructureManagementList> = {
  title: 'Organisms/StructureManagementList',
  component: StructureManagementList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    structures: { control: 'object' },
    onCreateStructureClick: { action: 'create structure clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    structures: [
      {
        id: 'STR-001',
        name: 'Bridge Alpha',
        location: 'Seoul, South Korea',
        lastInspection: '2023-07-15',
      },
      {
        id: 'STR-002',
        name: 'Building Beta',
        location: 'Busan, South Korea',
        lastInspection: '2023-06-01',
      },
      {
        id: 'STR-003',
        name: 'Tunnel Gamma',
        location: 'Jeju, South Korea',
        lastInspection: '2023-08-20',
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    structures: [],
  },
};

export const SingleStructure: Story = {
  args: {
    structures: [
      {
        id: 'STR-004',
        name: 'Dam Delta',
        location: 'Gangwon, South Korea',
        lastInspection: '2023-09-10',
      },
    ],
  },
};
