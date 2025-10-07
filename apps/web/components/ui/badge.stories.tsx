import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'sage',
        'tcm',
        'gold',
        'success',
        'warning',
        'danger',
        'info',
        'outline',
      ],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
}

export const Sage: Story = {
  args: {
    children: 'Sage Badge',
    variant: 'sage',
  },
}

export const TCM: Story = {
  args: {
    children: 'TCM',
    variant: 'tcm',
  },
}

export const Gold: Story = {
  args: {
    children: 'Verified',
    variant: 'gold',
  },
}

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
}

export const Danger: Story = {
  args: {
    children: 'Danger',
    variant: 'danger',
  },
}

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="sage">Sage</Badge>
      <Badge variant="tcm">TCM</Badge>
      <Badge variant="gold">Verified</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const TCMProperties: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="tcm">Warming</Badge>
      <Badge variant="tcm">Cooling</Badge>
      <Badge variant="sage">Sweet</Badge>
      <Badge variant="sage">Bitter</Badge>
      <Badge variant="gold">Lung</Badge>
      <Badge variant="gold">Spleen</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example badges used for TCM properties in herb cards',
      },
    },
  },
}
