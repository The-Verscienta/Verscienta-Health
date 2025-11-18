import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './SearchBar'

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    defaultValue: { control: 'text' },
    autoFocus: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

// Default search bar
export const Default: Story = {
  args: {
    placeholder: 'Search herbs, formulas, and conditions...',
  },
}

// With default value
export const WithDefaultValue: Story = {
  args: {
    placeholder: 'Search herbs, formulas, and conditions...',
    defaultValue: 'ginseng',
  },
}

// With auto focus
export const WithAutoFocus: Story = {
  args: {
    placeholder: 'Search herbs, formulas, and conditions...',
    autoFocus: true,
  },
}

// Custom placeholder
export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Find herbal remedies...',
  },
}

// Empty placeholder
export const EmptyPlaceholder: Story = {
  args: {
    placeholder: '',
  },
}

// Herbs specific
export const HerbsSearch: Story = {
  args: {
    placeholder: 'Search herbs by name, properties, or benefits...',
  },
}

// Formulas specific
export const FormulasSearch: Story = {
  args: {
    placeholder: 'Search traditional herbal formulas...',
  },
}

// Conditions specific
export const ConditionsSearch: Story = {
  args: {
    placeholder: 'Search health conditions or symptoms...',
  },
}

// In header/navbar context
export const InHeader: Story = {
  render: () => (
    <div className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-serif font-bold text-earth-900">Verscienta Health</div>
        <div className="flex-1 max-w-md ml-8">
          <SearchBar placeholder="Search herbs, formulas, conditions..." />
        </div>
        <nav className="ml-8">
          <a href="#" className="text-gray-600 hover:text-earth-700">
            Menu
          </a>
        </nav>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [],
}

// In hero section
export const InHeroSection: Story = {
  render: () => (
    <div className="w-full bg-gradient-to-b from-earth-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-serif font-bold text-earth-900 mb-4">
          Discover Traditional Herbal Wisdom
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Search our comprehensive database of herbs, formulas, and conditions
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar placeholder="Search herbs, formulas, and conditions..." autoFocus />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [],
}

// Compact width
export const CompactWidth: Story = {
  render: () => (
    <div className="w-[300px]">
      <SearchBar placeholder="Search..." />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
  decorators: [],
}

// Full width
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <SearchBar placeholder="Search herbs, formulas, and conditions..." />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
  decorators: [],
}

// Mobile responsive
export const MobileView: Story = {
  render: () => (
    <div className="w-[375px] p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <SearchBar placeholder="Search..." />
      </div>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
  decorators: [],
}

// With recent searches pattern
export const WithRecentSearches: Story = {
  render: () => {
    const recentSearches = ['Ginseng', 'Si Junzi Tang', 'Chronic Fatigue', 'Astragalus']

    return (
      <div className="w-[600px]">
        <SearchBar placeholder="Search herbs, formulas, and conditions..." />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-2">Recent Searches</div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button
                key={search}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  },
  decorators: [],
}

// With popular searches pattern
export const WithPopularSearches: Story = {
  render: () => {
    const popularSearches = [
      { term: 'Ginseng', count: 1234 },
      { term: 'Astragalus', count: 982 },
      { term: 'Reishi', count: 876 },
      { term: 'Turmeric', count: 754 },
    ]

    return (
      <div className="w-[600px]">
        <SearchBar placeholder="Search herbs, formulas, and conditions..." />
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-2">Popular Searches</div>
          <div className="space-y-2">
            {popularSearches.map((item) => (
              <button
                key={item.term}
                className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors"
              >
                <span>{item.term}</span>
                <span className="text-xs text-gray-500">{item.count} searches</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  },
  decorators: [],
}
