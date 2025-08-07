
import type { Meta, StoryObj } from '@storybook/react';
import Text from './Text';

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'p', 'span', 'strong'],
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'accent',
        'white',
        'lightGray',
        'gray',
        'darkGray',
        'nearBlack',
        'success',
        'warning',
        'danger',
        '#FF00FF', // Example of custom color
      ],
    },
    fontSize: {
      control: 'select',
      options: [
        'base',
        'headerTitle',
        'navButton',
        'contentCardTitle',
        'listItemInfo',
        'listItemEmphasis',
        'severityBadge',
        'modalTitlePageHeader',
        'liveFeedContainer',
        '20px', // Example of custom font size
      ],
    },
    fontWeight: { control: 'text' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultParagraph: Story = {
  args: {
    children: 'This is a default paragraph text.',
  },
};

export const Heading1: Story = {
  args: {
    variant: 'h1',
    children: 'Heading 1 Title',
  },
};

export const Heading2: Story = {
  args: {
    variant: 'h2',
    children: 'Heading 2 Subtitle',
  },
};

export const Heading3: Story = {
  args: {
    variant: 'h3',
    children: 'Heading 3 Card Title',
  },
};

export const SpanText: Story = {
  args: {
    variant: 'span',
    children: 'This is a span text.',
  },
};

export const StrongText: Story = {
  args: {
    variant: 'strong',
    children: 'This is a strong text.',
  },
};

export const PrimaryColorText: Story = {
  args: {
    color: 'primary',
    children: 'Text with Primary Color',
  },
};

export const AccentColorText: Story = {
  args: {
    color: 'accent',
    children: 'Text with Accent Color',
  },
};

export const DangerColorText: Story = {
  args: {
    color: 'danger',
    children: 'Text with Danger Color',
  },
};

export const CustomColorText: Story = {
  args: {
    color: '#8A2BE2', // BlueViolet
    children: 'Text with Custom Color',
  },
};

export const LargeFontSize: Story = {
  args: {
    fontSize: 'modalTitlePageHeader',
    children: 'Large Font Size Text',
  },
};

export const SmallFontSize: Story = {
  args: {
    fontSize: 'severityBadge',
    children: 'Small Font Size Text',
  },
};

export const CustomFontSize: Story = {
  args: {
    fontSize: '28px',
    children: 'Custom Font Size Text',
  },
};

export const BoldText: Story = {
  args: {
    fontWeight: 'bold',
    children: 'Bold Text Example',
  },
};

export const LightWeightText: Story = {
  args: {
    fontWeight: '300',
    children: 'Light Weight Text Example',
  },
};

export const CombinedProps: Story = {
  args: {
    variant: 'h2',
    color: 'success',
    fontSize: 'headerTitle',
    fontWeight: '900',
    children: 'Combined Props Example',
  },
};
