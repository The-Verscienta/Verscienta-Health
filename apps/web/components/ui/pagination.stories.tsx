import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'The currently active page number',
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      description: 'Total number of pages',
    },
    baseUrl: {
      control: 'text',
      description: 'Base URL for pagination links',
    },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

// Few pages (no ellipsis)
export const FewPages: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    baseUrl: '/herbs',
  },
}

// First page
export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    baseUrl: '/herbs',
  },
}

// Middle page
export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    baseUrl: '/herbs',
  },
}

// Last page
export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    baseUrl: '/herbs',
  },
}

// Many pages (with ellipsis)
export const ManyPages: Story = {
  args: {
    currentPage: 1,
    totalPages: 50,
    baseUrl: '/herbs',
  },
}

// Many pages - middle
export const ManyPagesMiddle: Story = {
  args: {
    currentPage: 25,
    totalPages: 50,
    baseUrl: '/herbs',
  },
}

// Many pages - near end
export const ManyPagesNearEnd: Story = {
  args: {
    currentPage: 48,
    totalPages: 50,
    baseUrl: '/herbs',
  },
}

// Single page (no pagination needed)
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    baseUrl: '/herbs',
  },
}

// Two pages
export const TwoPages: Story = {
  args: {
    currentPage: 1,
    totalPages: 2,
    baseUrl: '/herbs',
  },
}

// Page 2 of 3
export const Page2Of3: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    baseUrl: '/formulas',
  },
}

// Large dataset
export const LargeDataset: Story = {
  args: {
    currentPage: 42,
    totalPages: 100,
    baseUrl: '/conditions',
  },
}

// Herbs example
export const HerbsExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600">
        Showing 1-12 of 348 herbs
      </div>
      <Pagination currentPage={1} totalPages={29} baseUrl="/herbs" />
    </div>
  ),
}

// Formulas example
export const FormulasExample: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600">
        Showing 13-24 of 156 formulas
      </div>
      <Pagination currentPage={2} totalPages={13} baseUrl="/formulas" />
    </div>
  ),
}

// Search results example
export const SearchResults: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Found 842 results for <strong>"ginseng"</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Showing results 61-72
        </p>
      </div>
      <Pagination currentPage={6} totalPages={71} baseUrl="/search" />
    </div>
  ),
}

// With results per page selector
export const WithResultsPerPage: Story = {
  render: () => {
    const [perPage, setPerPage] = React.useState(12)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1-{perPage} of 348 herbs
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="perPage" className="text-sm text-gray-600">
              Results per page:
            </label>
            <select
              id="perPage"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>
        </div>
        <Pagination
          currentPage={1}
          totalPages={Math.ceil(348 / perPage)}
          baseUrl="/herbs"
        />
      </div>
    )
  },
}

// Compact version
export const Compact: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    baseUrl: '/herbs',
    className: 'space-x-1',
  },
}

// With custom styling
export const CustomStyling: Story = {
  args: {
    currentPage: 3,
    totalPages: 8,
    baseUrl: '/herbs',
    className: 'space-x-3 scale-110',
  },
}
