import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SearchFilters, type FilterGroup } from './SearchFilters'

const meta = {
  title: 'Components/SearchFilters',
  component: SearchFilters,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchFilters>

export default meta
type Story = StoryObj<typeof meta>

// Sample filter groups for herbs
const herbFilterGroups: FilterGroup[] = [
  {
    id: 'category',
    label: 'TCM Category',
    options: [
      { label: 'Qi Tonics', value: 'qi-tonics', count: 45 },
      { label: 'Blood Tonics', value: 'blood-tonics', count: 32 },
      { label: 'Yin Tonics', value: 'yin-tonics', count: 28 },
      { label: 'Yang Tonics', value: 'yang-tonics', count: 21 },
      { label: 'Clearing Heat', value: 'clearing-heat', count: 38 },
    ],
    multiSelect: false,
  },
  {
    id: 'temperature',
    label: 'Temperature',
    options: [
      { label: 'Warm', value: 'warm', count: 67 },
      { label: 'Cool', value: 'cool', count: 54 },
      { label: 'Neutral', value: 'neutral', count: 43 },
      { label: 'Hot', value: 'hot', count: 12 },
      { label: 'Cold', value: 'cold', count: 18 },
    ],
    multiSelect: true,
  },
  {
    id: 'taste',
    label: 'Taste',
    options: [
      { label: 'Sweet', value: 'sweet', count: 89 },
      { label: 'Bitter', value: 'bitter', count: 76 },
      { label: 'Pungent', value: 'pungent', count: 54 },
      { label: 'Salty', value: 'salty', count: 23 },
      { label: 'Sour', value: 'sour', count: 34 },
    ],
    multiSelect: true,
  },
]

const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Rating (High to Low)', value: 'rating-desc' },
  { label: 'Most Popular', value: 'popular' },
]

// Default filters with interactivity
export const Default: Story = {
  args: undefined as any,
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
    const [activeSort, setActiveSort] = useState('relevance')

    return (
      <SearchFilters
        filterGroups={herbFilterGroups}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
      />
    )
  },
}

// With active filters
export const WithActiveFilters: Story = {
  args: undefined as any,
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
      category: ['qi-tonics'],
      temperature: ['warm', 'neutral'],
      taste: ['sweet'],
    })
    const [activeSort, setActiveSort] = useState('name-asc')

    return (
      <SearchFilters
        filterGroups={herbFilterGroups}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
      />
    )
  },
}

// Without sort options
export const WithoutSort: Story = {
  args: undefined as any,
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    return (
      <SearchFilters
        filterGroups={herbFilterGroups}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
      />
    )
  },
}

// Single filter group
export const SingleGroup: Story = {
  args: undefined as any,
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    return (
      <SearchFilters
        filterGroups={[herbFilterGroups[0]]}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
      />
    )
  },
}

// Condition filters
export const ConditionFilters: Story = {
  args: undefined as any,
  render: () => {
    const conditionFilterGroups: FilterGroup[] = [
      {
        id: 'severity',
        label: 'Severity',
        options: [
          { label: 'Mild', value: 'mild', count: 34 },
          { label: 'Moderate', value: 'moderate', count: 28 },
          { label: 'Severe', value: 'severe', count: 12 },
        ],
        multiSelect: false,
      },
      {
        id: 'category',
        label: 'Category',
        options: [
          { label: 'Digestive Health', value: 'digestive', count: 23 },
          { label: 'Mental Health', value: 'mental', count: 18 },
          { label: 'Respiratory Health', value: 'respiratory', count: 15 },
          { label: "Women's Health", value: 'womens', count: 21 },
          { label: 'Pain Management', value: 'pain', count: 14 },
        ],
        multiSelect: true,
      },
    ]

    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    return (
      <SearchFilters
        filterGroups={conditionFilterGroups}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
      />
    )
  },
}

// Practitioner filters
export const PractitionerFilters: Story = {
  args: undefined as any,
  render: () => {
    const practitionerFilterGroups: FilterGroup[] = [
      {
        id: 'modality',
        label: 'Modality',
        options: [
          { label: 'Acupuncture', value: 'acupuncture', count: 45 },
          { label: 'Herbal Medicine', value: 'herbal', count: 38 },
          { label: 'Naturopathy', value: 'naturopathy', count: 23 },
          { label: 'Western Herbalism', value: 'western-herbalism', count: 19 },
          { label: 'Ayurveda', value: 'ayurveda', count: 12 },
        ],
        multiSelect: true,
      },
      {
        id: 'verification',
        label: 'Verification Status',
        options: [
          { label: 'Verified Only', value: 'verified', count: 67 },
        ],
        multiSelect: false,
      },
      {
        id: 'location',
        label: 'State',
        options: [
          { label: 'California', value: 'CA', count: 23 },
          { label: 'New York', value: 'NY', count: 18 },
          { label: 'Texas', value: 'TX', count: 15 },
          { label: 'Florida', value: 'FL', count: 12 },
          { label: 'Washington', value: 'WA', count: 10 },
        ],
        multiSelect: false,
      },
    ]

    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    return (
      <SearchFilters
        filterGroups={practitionerFilterGroups}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
        sortOptions={[
          { label: 'Highest Rated', value: 'rating-desc' },
          { label: 'Most Reviews', value: 'reviews-desc' },
          { label: 'Name (A-Z)', value: 'name-asc' },
          { label: 'Nearest', value: 'distance-asc' },
        ]}
        activeSort="rating-desc"
        onSortChange={() => {}}
      />
    )
  },
}

// Formula filters
export const FormulaFilters: Story = {
  args: undefined as any,
  render: () => {
    const formulaFilterGroups: FilterGroup[] = [
      {
        id: 'tradition',
        label: 'Tradition',
        options: [
          { label: 'Classical TCM', value: 'classical', count: 56 },
          { label: 'Modern TCM', value: 'modern', count: 32 },
          { label: 'Japanese Kampo', value: 'kampo', count: 18 },
        ],
        multiSelect: false,
      },
      {
        id: 'category',
        label: 'Formula Category',
        options: [
          { label: 'Qi Tonifying', value: 'qi-tonifying', count: 28 },
          { label: 'Blood Tonifying', value: 'blood-tonifying', count: 23 },
          { label: 'Yin Tonifying', value: 'yin-tonifying', count: 19 },
          { label: 'Harmonizing', value: 'harmonizing', count: 21 },
          { label: 'Clearing Heat', value: 'clearing-heat', count: 17 },
        ],
        multiSelect: true,
      },
      {
        id: 'ingredients',
        label: 'Ingredient Count',
        options: [
          { label: '1-4 herbs', value: '1-4', count: 15 },
          { label: '5-8 herbs', value: '5-8', count: 34 },
          { label: '9+ herbs', value: '9-plus', count: 21 },
        ],
        multiSelect: false,
      },
    ]

    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    return (
      <SearchFilters
        filterGroups={formulaFilterGroups}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
      />
    )
  },
}

// Without counts
export const WithoutCounts: Story = {
  args: undefined as any,
  render: () => {
    const filterGroupsNoCounts: FilterGroup[] = [
      {
        id: 'category',
        label: 'Category',
        options: [
          { label: 'Qi Tonics', value: 'qi-tonics' },
          { label: 'Blood Tonics', value: 'blood-tonics' },
          { label: 'Yin Tonics', value: 'yin-tonics' },
        ],
        multiSelect: false,
      },
      {
        id: 'temperature',
        label: 'Temperature',
        options: [
          { label: 'Warm', value: 'warm' },
          { label: 'Cool', value: 'cool' },
          { label: 'Neutral', value: 'neutral' },
        ],
        multiSelect: true,
      },
    ]

    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    return (
      <SearchFilters
        filterGroups={filterGroupsNoCounts}
        activeFilters={activeFilters}
        onFilterChange={(filterId, values) => {
          setActiveFilters({ ...activeFilters, [filterId]: values })
        }}
        onClearAll={() => setActiveFilters({})}
      />
    )
  },
}

// Mobile view
export const MobileView: Story = {
  args: undefined as any,
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
      category: ['qi-tonics'],
      temperature: ['warm'],
    })

    return (
      <div className="w-full max-w-[375px] p-4 bg-gray-50">
        <SearchFilters
          filterGroups={herbFilterGroups}
          activeFilters={activeFilters}
          onFilterChange={(filterId, values) => {
            setActiveFilters({ ...activeFilters, [filterId]: values })
          }}
          onClearAll={() => setActiveFilters({})}
          sortOptions={sortOptions}
          activeSort="relevance"
          onSortChange={() => {}}
        />
      </div>
    )
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [],
}

// In sidebar layout
export const InSidebar: Story = {
  args: undefined as any,
  render: () => {
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})

    return (
      <div className="flex gap-6 max-w-6xl">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-4">
            <SearchFilters
              filterGroups={herbFilterGroups}
              activeFilters={activeFilters}
              onFilterChange={(filterId, values) => {
                setActiveFilters({ ...activeFilters, [filterId]: values })
              }}
              onClearAll={() => setActiveFilters({})}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Showing 45 results {Object.keys(activeFilters).length > 0 && 'with filters'}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    layout: 'padded',
  },
  decorators: [],
}
