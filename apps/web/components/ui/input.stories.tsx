import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time'],
      description: 'The type of input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// Default input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

// Email input
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'name@example.com',
  },
}

// Password input
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

// Number input
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '123',
  },
}

// Search input
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search herbs...',
  },
}

// Date input
export const Date: Story = {
  args: {
    type: 'date',
  },
}

// With value
export const WithValue: Story = {
  args: {
    defaultValue: 'Ginseng',
    placeholder: 'Enter herb name',
  },
}

// Disabled
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

// Disabled with value
export const DisabledWithValue: Story = {
  args: {
    defaultValue: 'Cannot edit this',
    disabled: true,
  },
}

// Required
export const Required: Story = {
  args: {
    placeholder: 'Required field',
    required: true,
  },
}

// With custom width
export const CustomWidth: Story = {
  args: {
    placeholder: 'Wide input',
    className: 'w-96',
  },
}

// Small (custom)
export const Small: Story = {
  args: {
    placeholder: 'Small input',
    className: 'h-9 text-sm',
  },
}

// Large (custom)
export const Large: Story = {
  args: {
    placeholder: 'Large input',
    className: 'h-12 text-lg',
  },
}

// With error styling
export const WithError: Story = {
  args: {
    placeholder: 'Enter valid email',
    className: 'border-red-500 focus:ring-red-500',
  },
}

// With success styling
export const WithSuccess: Story = {
  args: {
    defaultValue: 'valid@example.com',
    className: 'border-green-500 focus:ring-green-500',
  },
}

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-96">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input id="name" type="text" placeholder="John Doe" required />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input id="email" type="email" placeholder="john@example.com" required />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input id="password" type="password" placeholder="••••••••" required />
      </div>
    </form>
  ),
}
