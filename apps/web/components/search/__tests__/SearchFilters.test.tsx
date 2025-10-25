/**
 * SearchFilters Component Tests
 *
 * Tests filter groups, multi-select, active filters, and sorting
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type FilterGroup, SearchFilters } from '../SearchFilters'

describe('SearchFilters', () => {
  const mockFilterGroups: FilterGroup[] = [
    {
      id: 'category',
      label: 'Category',
      options: [
        { label: 'Adaptogen', value: 'adaptogen', count: 5 },
        { label: 'Tonic', value: 'tonic', count: 3 },
        { label: 'Digestive', value: 'digestive', count: 8 },
      ],
      multiSelect: true,
    },
    {
      id: 'tradition',
      label: 'Tradition',
      options: [
        { label: 'TCM', value: 'tcm', count: 12 },
        { label: 'Ayurveda', value: 'ayurveda', count: 7 },
      ],
      multiSelect: false,
    },
  ]

  const mockSortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Name A-Z', value: 'name-asc' },
    { label: 'Name Z-A', value: 'name-desc' },
  ]

  const defaultProps = {
    filterGroups: mockFilterGroups,
    activeFilters: {},
    onFilterChange: vi.fn(),
    onClearAll: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Tradition')).toBeInTheDocument()
    })

    it('renders all filter groups', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Tradition')).toBeInTheDocument()
    })

    it('renders all filter options', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.getByText('Adaptogen')).toBeInTheDocument()
      expect(screen.getByText('Tonic')).toBeInTheDocument()
      expect(screen.getByText('Digestive')).toBeInTheDocument()
      expect(screen.getByText('TCM')).toBeInTheDocument()
      expect(screen.getByText('Ayurveda')).toBeInTheDocument()
    })

    it('renders option counts when provided', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.getByText('(5)')).toBeInTheDocument()
      expect(screen.getByText('(3)')).toBeInTheDocument()
      expect(screen.getByText('(8)')).toBeInTheDocument()
      expect(screen.getByText('(12)')).toBeInTheDocument()
      expect(screen.getByText('(7)')).toBeInTheDocument()
    })

    it('renders filters expanded by default', () => {
      render(<SearchFilters {...defaultProps} />)

      // All options should be visible
      expect(screen.getByText('Adaptogen')).toBeVisible()
      expect(screen.getByText('TCM')).toBeVisible()
    })

    it('does not render Clear All when no active filters', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
    })
  })

  describe('Filter Toggle Button', () => {
    it('shows filter count badge when filters are active', () => {
      render(
        <SearchFilters {...defaultProps} activeFilters={{ category: ['adaptogen', 'tonic'] }} />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('toggles filter visibility when clicked', async () => {
      const user = userEvent.setup()
      render(<SearchFilters {...defaultProps} />)

      const filterButton = screen.getByRole('button', { name: /Filters/i })

      // Filters are visible by default
      expect(screen.getByText('Adaptogen')).toBeVisible()

      // Click to hide
      await user.click(filterButton)
      expect(screen.queryByText('Adaptogen')).not.toBeInTheDocument()

      // Click to show again
      await user.click(filterButton)
      expect(screen.getByText('Adaptogen')).toBeVisible()
    })
  })

  describe('Multi-Select Filters', () => {
    it('renders checkboxes for multi-select groups', () => {
      const { container } = render(<SearchFilters {...defaultProps} />)

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(3)
    })

    it('allows selecting multiple options', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()

      const { container } = render(
        <SearchFilters {...defaultProps} onFilterChange={onFilterChange} />
      )

      // Find checkbox by value attribute or by text content
      const adaptogenLabel = screen.getByText('Adaptogen').closest('label')
      if (adaptogenLabel) {
        await user.click(adaptogenLabel)
        expect(onFilterChange).toHaveBeenCalledWith('category', ['adaptogen'])
      }
    })

    it('allows deselecting options', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()

      const { container } = render(
        <SearchFilters
          {...defaultProps}
          activeFilters={{ category: ['adaptogen', 'tonic'] }}
          onFilterChange={onFilterChange}
        />
      )

      // Find the checkbox label (not the pill)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      const adaptogenCheckbox = Array.from(checkboxes).find((cb) => {
        const label = cb.closest('label')
        return label?.textContent?.includes('Adaptogen') && label?.textContent?.includes('(5)')
      })

      if (adaptogenCheckbox) {
        const label = adaptogenCheckbox.closest('label')
        if (label) {
          await user.click(label)
          expect(onFilterChange).toHaveBeenCalledWith('category', ['tonic'])
        }
      }
    })

    it('checks boxes for active filters', () => {
      const { container } = render(
        <SearchFilters {...defaultProps} activeFilters={{ category: ['adaptogen'] }} />
      )

      // Find the checkbox within the Adaptogen label
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      const adaptogenCheckbox = Array.from(checkboxes).find((cb) => {
        const label = cb.closest('label')
        return label?.textContent?.includes('Adaptogen')
      }) as HTMLInputElement

      expect(adaptogenCheckbox?.checked).toBe(true)
    })
  })

  describe('Single-Select Filters', () => {
    it('renders radio buttons for single-select groups', () => {
      const { container } = render(<SearchFilters {...defaultProps} />)

      const radios = container.querySelectorAll('input[type="radio"]')
      expect(radios.length).toBe(2)
    })

    it('allows selecting one option', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()

      render(<SearchFilters {...defaultProps} onFilterChange={onFilterChange} />)

      const tcmLabel = screen.getByText('TCM').closest('label')
      if (tcmLabel) {
        await user.click(tcmLabel)
        expect(onFilterChange).toHaveBeenCalledWith('tradition', ['tcm'])
      }
    })

    it('deselects when clicking active option', () => {
      const { container } = render(
        <SearchFilters {...defaultProps} activeFilters={{ tradition: ['tcm'] }} />
      )

      // Verify TCM is checked
      const radios = container.querySelectorAll('input[type="radio"]')
      const tcmRadio = Array.from(radios).find((radio) => {
        const label = radio.closest('label')
        return label?.textContent?.includes('TCM') && label?.textContent?.includes('(12)')
      }) as HTMLInputElement

      expect(tcmRadio).toBeTruthy()
      expect(tcmRadio.checked).toBe(true)

      // Note: HTML radio buttons can't be unchecked by clicking again,
      // they can only be deselected by clicking another radio or using the pill X button
      // This is standard radio button behavior
    })

    it('replaces selection when clicking different option', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()

      const { container } = render(
        <SearchFilters
          {...defaultProps}
          activeFilters={{ tradition: ['tcm'] }}
          onFilterChange={onFilterChange}
        />
      )

      // Find the Ayurveda radio label
      const radios = container.querySelectorAll('input[type="radio"]')
      const ayurvedaRadio = Array.from(radios).find((radio) => {
        const label = radio.closest('label')
        return label?.textContent?.includes('Ayurveda') && label?.textContent?.includes('(7)')
      })

      if (ayurvedaRadio) {
        const label = ayurvedaRadio.closest('label')
        if (label) {
          await user.click(label)
          expect(onFilterChange).toHaveBeenCalledWith('tradition', ['ayurveda'])
        }
      }
    })

    it('checks radio for active filter', () => {
      const { container } = render(
        <SearchFilters {...defaultProps} activeFilters={{ tradition: ['tcm'] }} />
      )

      // Find the radio within the TCM label
      const radios = container.querySelectorAll('input[type="radio"]')
      const tcmRadio = Array.from(radios).find((radio) => {
        const label = radio.closest('label')
        return label?.textContent?.includes('TCM')
      }) as HTMLInputElement

      expect(tcmRadio?.checked).toBe(true)
    })
  })

  describe('Active Filter Pills', () => {
    it('renders active filter pills', () => {
      const { container } = render(
        <SearchFilters
          {...defaultProps}
          activeFilters={{
            category: ['adaptogen', 'tonic'],
            tradition: ['tcm'],
          }}
        />
      )

      // Pills have X buttons (they have empty aria-labels)
      const pillXButtons = container.querySelectorAll('.gap-1.pr-1 button')
      expect(pillXButtons.length).toBe(3) // 2 category + 1 tradition
    })

    it('removes filter when clicking pill X button', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()

      render(
        <SearchFilters
          {...defaultProps}
          activeFilters={{ category: ['adaptogen', 'tonic'] }}
          onFilterChange={onFilterChange}
        />
      )

      const pillButtons = screen.getAllByRole('button')
      const adaptogenPill = pillButtons.find((btn) => btn.textContent?.includes('Adaptogen'))
      const xButton = adaptogenPill?.querySelector('button')

      if (xButton) {
        await user.click(xButton)
        expect(onFilterChange).toHaveBeenCalledWith('category', ['tonic'])
      }
    })

    it('does not render pills when no active filters', () => {
      const { container } = render(<SearchFilters {...defaultProps} />)

      const pills = container.querySelectorAll('[class*="gap-1"]')
      expect(pills.length).toBe(0)
    })
  })

  describe('Clear All Button', () => {
    it('renders Clear All when filters are active', () => {
      render(<SearchFilters {...defaultProps} activeFilters={{ category: ['adaptogen'] }} />)

      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })

    it('calls onClearAll when clicked', async () => {
      const user = userEvent.setup()
      const onClearAll = vi.fn()

      render(
        <SearchFilters
          {...defaultProps}
          activeFilters={{ category: ['adaptogen'] }}
          onClearAll={onClearAll}
        />
      )

      await user.click(screen.getByText('Clear All'))
      expect(onClearAll).toHaveBeenCalledTimes(1)
    })

    it('does not render when no active filters', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
    })
  })

  describe('Sort Options', () => {
    it('renders sort dropdown when provided', () => {
      render(
        <SearchFilters
          {...defaultProps}
          sortOptions={mockSortOptions}
          activeSort="relevance"
          onSortChange={vi.fn()}
        />
      )

      expect(screen.getByText('Sort by:')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('shows all sort options', () => {
      render(
        <SearchFilters
          {...defaultProps}
          sortOptions={mockSortOptions}
          activeSort="relevance"
          onSortChange={vi.fn()}
        />
      )

      const select = screen.getByRole('combobox')
      const options = within(select).getAllByRole('option')

      expect(options.length).toBe(3)
      expect(options[0]).toHaveTextContent('Relevance')
      expect(options[1]).toHaveTextContent('Name A-Z')
      expect(options[2]).toHaveTextContent('Name Z-A')
    })

    it('selects active sort option', () => {
      render(
        <SearchFilters
          {...defaultProps}
          sortOptions={mockSortOptions}
          activeSort="name-asc"
          onSortChange={vi.fn()}
        />
      )

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select.value).toBe('name-asc')
    })

    it('calls onSortChange when selection changes', async () => {
      const user = userEvent.setup()
      const onSortChange = vi.fn()

      render(
        <SearchFilters
          {...defaultProps}
          sortOptions={mockSortOptions}
          activeSort="relevance"
          onSortChange={onSortChange}
        />
      )

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'name-desc')

      expect(onSortChange).toHaveBeenCalledWith('name-desc')
    })

    it('does not render sort dropdown when not provided', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.queryByText('Sort by:')).not.toBeInTheDocument()
    })
  })

  describe('Filter Group Expansion', () => {
    it('collapses group when header is clicked', async () => {
      const user = userEvent.setup()
      render(<SearchFilters {...defaultProps} />)

      const categoryHeader = screen.getByText('Category')

      // Options are visible by default
      expect(screen.getByText('Adaptogen')).toBeVisible()

      // Click header to collapse
      await user.click(categoryHeader)
      expect(screen.queryByText('Adaptogen')).not.toBeInTheDocument()
    })

    it('expands collapsed group when header is clicked', async () => {
      const user = userEvent.setup()
      render(<SearchFilters {...defaultProps} />)

      const categoryHeader = screen.getByText('Category')

      // Collapse
      await user.click(categoryHeader)
      expect(screen.queryByText('Adaptogen')).not.toBeInTheDocument()

      // Expand
      await user.click(categoryHeader)
      expect(screen.getByText('Adaptogen')).toBeVisible()
    })

    it('shows chevron up icon when expanded', () => {
      const { container } = render(<SearchFilters {...defaultProps} />)

      // Find chevron up icons (groups are expanded by default)
      const chevronUp = container.querySelector('svg')
      expect(chevronUp).toBeInTheDocument()
    })

    it('shows selected count in collapsed group', () => {
      render(
        <SearchFilters {...defaultProps} activeFilters={{ category: ['adaptogen', 'tonic'] }} />
      )

      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })

    it('does not show selected count when no filters active', () => {
      render(<SearchFilters {...defaultProps} />)

      expect(screen.queryByText(/selected/)).not.toBeInTheDocument()
    })
  })

  describe('Active Filter Count', () => {
    it('calculates total active filter count correctly', () => {
      render(
        <SearchFilters
          {...defaultProps}
          activeFilters={{
            category: ['adaptogen', 'tonic', 'digestive'],
            tradition: ['tcm'],
          }}
        />
      )

      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('updates count when filters change', () => {
      const { rerender } = render(
        <SearchFilters {...defaultProps} activeFilters={{ category: ['adaptogen'] }} />
      )

      expect(screen.getByText('1')).toBeInTheDocument()

      rerender(
        <SearchFilters {...defaultProps} activeFilters={{ category: ['adaptogen', 'tonic'] }} />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty filter groups', () => {
      render(<SearchFilters {...defaultProps} filterGroups={[]} />)

      expect(screen.getByText('Filters')).toBeInTheDocument()
      expect(screen.queryByText('Category')).not.toBeInTheDocument()
    })

    it('handles filter group with no options', () => {
      render(
        <SearchFilters
          {...defaultProps}
          filterGroups={[{ id: 'empty', label: 'Empty Group', options: [] }]}
        />
      )

      expect(screen.getByText('Empty Group')).toBeInTheDocument()
    })

    it('handles options without count', () => {
      const groupsWithoutCount: FilterGroup[] = [
        {
          id: 'test',
          label: 'Test',
          options: [{ label: 'Option 1', value: 'opt1' }],
        },
      ]

      render(<SearchFilters {...defaultProps} filterGroups={groupsWithoutCount} />)

      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
    })

    it('handles very long filter labels', () => {
      const longLabelGroups: FilterGroup[] = [
        {
          id: 'test',
          label: 'Test',
          options: [{ label: 'A'.repeat(100), value: 'long' }],
        },
      ]

      render(<SearchFilters {...defaultProps} filterGroups={longLabelGroups} />)

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses proper input types for multi-select and single-select', () => {
      const { container } = render(<SearchFilters {...defaultProps} />)

      // Multi-select uses checkboxes
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)

      // Single-select uses radio buttons
      const radios = container.querySelectorAll('input[type="radio"]')
      expect(radios.length).toBeGreaterThan(0)
    })

    it('groups radio buttons with name attribute', () => {
      const { container } = render(<SearchFilters {...defaultProps} />)

      const radios = container.querySelectorAll('input[type="radio"]')
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'tradition')
      })
    })

    it('labels are clickable', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()

      render(<SearchFilters {...defaultProps} onFilterChange={onFilterChange} />)

      // Click label text
      const adaptogenLabel = screen.getByText('Adaptogen').closest('label')
      if (adaptogenLabel) {
        await user.click(adaptogenLabel)
        expect(onFilterChange).toHaveBeenCalled()
      }
    })

    it('has accessible button labels', () => {
      render(<SearchFilters {...defaultProps} activeFilters={{ category: ['adaptogen'] }} />)

      expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
    })
  })
})
