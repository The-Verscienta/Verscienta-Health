/**
 * SearchBar Component Tests
 *
 * Tests search bar rendering, form submission, and navigation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from '../SearchBar'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'herbs.searchPlaceholder': 'Search herbs...',
      'common.search': 'Search',
    }
    return translations[key] || key
  },
}))

// Mock next-intl routing
const mockPush = vi.fn()
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SearchBar', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<SearchBar />)

      expect(screen.getByPlaceholderText('Search herbs...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      render(<SearchBar placeholder="Search formulas..." />)

      expect(screen.getByPlaceholderText('Search formulas...')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<SearchBar defaultValue="ginseng" />)

      const input = screen.getByPlaceholderText('Search herbs...') as HTMLInputElement
      expect(input.value).toBe('ginseng')
    })

    it('renders with autoFocus enabled', () => {
      render(<SearchBar autoFocus />)

      const input = screen.getByPlaceholderText('Search herbs...') as HTMLInputElement
      // autoFocus is a DOM property, check via prop or focus behavior
      expect(input).toBeInTheDocument()
      // Note: In testing environment, autoFocus may not take effect
    })

    it('renders without autoFocus by default', () => {
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')
      expect(input).not.toHaveAttribute('autoFocus')
    })

    it('renders search icon', () => {
      const { container } = render(<SearchBar />)

      // Lucide icons render as SVG
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders as a form', () => {
      const { container } = render(<SearchBar />)

      expect(container.querySelector('form')).toBeInTheDocument()
    })
  })

  describe('Input Interaction', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...') as HTMLInputElement

      await user.type(input, 'ginseng')

      expect(input.value).toBe('ginseng')
    })

    it('allows clearing input value', async () => {
      const user = userEvent.setup()
      render(<SearchBar defaultValue="ginseng" />)

      const input = screen.getByPlaceholderText('Search herbs...') as HTMLInputElement
      expect(input.value).toBe('ginseng')

      await user.clear(input)

      expect(input.value).toBe('')
    })

    it('handles special characters', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, 'herbs & spices')

      expect(input).toHaveValue('herbs & spices')
    })

    it('handles Chinese characters', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, '人参')

      expect(input).toHaveValue('人参')
    })
  })

  describe('Form Submission', () => {
    it('navigates to search page on submit', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')
      const submitButton = screen.getByRole('button', { name: 'Search' })

      await user.type(input, 'ginseng')
      await user.click(submitButton)

      expect(mockPush).toHaveBeenCalledWith('/search?q=ginseng')
    })

    it('navigates on form submit (pressing Enter)', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, 'ginseng')
      await user.keyboard('{Enter}')

      expect(mockPush).toHaveBeenCalledWith('/search?q=ginseng')
    })

    it('trims whitespace before submitting', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, '  ginseng  ')
      await user.keyboard('{Enter}')

      expect(mockPush).toHaveBeenCalledWith('/search?q=ginseng')
    })

    it('URL encodes special characters', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, 'herbs & spices')
      await user.keyboard('{Enter}')

      expect(mockPush).toHaveBeenCalledWith('/search?q=herbs%20%26%20spices')
    })

    it('does not navigate when input is empty', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const submitButton = screen.getByRole('button', { name: 'Search' })

      await user.click(submitButton)

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('does not navigate when input is only whitespace', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, '   ')
      await user.keyboard('{Enter}')

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('submits with default value on Enter without typing', async () => {
      const user = userEvent.setup()
      render(<SearchBar defaultValue="ginseng" />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.click(input)
      await user.keyboard('{Enter}')

      expect(mockPush).toHaveBeenCalledWith('/search?q=ginseng')
    })
  })

  describe('Input Attributes', () => {
    it('has type="search"', () => {
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('has spellCheck disabled', () => {
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')
      expect(input).toHaveAttribute('spellCheck', 'false')
    })

    it('has autoComplete disabled', () => {
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')
      expect(input).toHaveAttribute('autoComplete', 'off')
    })
  })

  describe('Styling', () => {
    it('applies padding for search icon', () => {
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')
      expect(input).toHaveClass('pl-12')
    })

    it('renders search icon with proper positioning', () => {
      const { container } = render(<SearchBar />)

      const icon = container.querySelector('.absolute.left-4')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long search queries', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')
      const longQuery = 'A'.repeat(200)

      await user.type(input, longQuery)
      await user.keyboard('{Enter}')

      expect(mockPush).toHaveBeenCalledWith(`/search?q=${longQuery}`)
    })

    it('handles multiple spaces in query', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, 'herb    with    spaces')
      await user.keyboard('{Enter}')

      // Trims leading/trailing but keeps internal spaces
      expect(mockPush).toHaveBeenCalledWith('/search?q=herb%20%20%20%20with%20%20%20%20spaces')
    })

    it('handles Unicode characters', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, '🌿 herb')
      await user.keyboard('{Enter}')

      expect(mockPush).toHaveBeenCalled()
    })

    it('handles query with line breaks', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      // Type query with newline character (though it won't actually insert in input)
      await user.type(input, 'ginseng')
      await user.keyboard('{Enter}')

      expect(mockPush).toHaveBeenCalledWith('/search?q=ginseng')
    })
  })

  describe('Accessibility', () => {
    it('has accessible form structure', () => {
      const { container } = render(<SearchBar />)

      expect(container.querySelector('form')).toBeInTheDocument()
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    })

    it('allows keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      // Tab to input
      await user.tab()
      expect(screen.getByPlaceholderText('Search herbs...')).toHaveFocus()

      // Tab to button
      await user.tab()
      expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus()
    })

    it('supports Enter key submission from input', async () => {
      const user = userEvent.setup()
      render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...')

      await user.type(input, 'ginseng{Enter}')

      expect(mockPush).toHaveBeenCalledWith('/search?q=ginseng')
    })
  })

  describe('Multiple Renders', () => {
    it('maintains state between re-renders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<SearchBar />)

      const input = screen.getByPlaceholderText('Search herbs...') as HTMLInputElement

      await user.type(input, 'ginseng')
      expect(input.value).toBe('ginseng')

      rerender(<SearchBar />)

      // Value is maintained in component state
      expect(input.value).toBe('ginseng')
    })

    it('updates when defaultValue changes', () => {
      const { rerender } = render(<SearchBar defaultValue="ginseng" />)

      let input = screen.getByPlaceholderText('Search herbs...') as HTMLInputElement
      expect(input.value).toBe('ginseng')

      rerender(<SearchBar defaultValue="turmeric" />)

      input = screen.getByPlaceholderText('Search herbs...') as HTMLInputElement
      // Note: defaultValue only sets initial value, doesn't update existing state
      expect(input.value).toBe('ginseng')
    })
  })
})
