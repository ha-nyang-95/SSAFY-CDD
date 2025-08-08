
import type { Meta, StoryObj } from '@storybook/react';
import CrackAnalysisSummary from './CrackAnalysisSummary';

const meta: Meta<typeof CrackAnalysisSummary> = {
  title: 'Organisms/CrackAnalysisSummary',
  component: CrackAnalysisSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    crackData: { control: 'object' },
    onCrackItemClick: { action: 'crack item clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    crackData: [
      {
        id: 'CRK-001',
        location: 'Beam A, Section 1',
        severity: 'high',
        length: 15.2,
        width: 0.8,
      },
      {
        id: 'CRK-002',
        location: 'Column B, Base',
        severity: 'medium',
        length: 8.5,
        width: 0.3,
      },
      {
        id: 'CRK-003',
        location: 'Slab C, Edge',
        severity: 'low',
        length: 3.1,
        width: 0.1,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    crackData: [],
  },
};

export const SingleCrack: Story = {
  args: {
    crackData: [
      {
        id: 'CRK-004',
        location: 'Wall D, Top',
        severity: 'high',
        length: 20.0,
        width: 1.2,
      },
    ],
  },
};
