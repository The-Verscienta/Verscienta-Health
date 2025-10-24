/**
 * Badge Component Tests
 *
 * Tests badge rendering, variants, and styling
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Badge } from '../badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders with children content', () => {
      render(<Badge>Badge Content</Badge>)
      expect(screen.getByText('Badge Content')).toBeInTheDocument()
    })

    it('renders without children', () => {
      const { container } = render(<Badge />)
      const badge = container.firstChild
      expect(badge).toBeInTheDocument()
    })

    it('renders as a div element', () => {
      const { container } = render(<Badge>Badge</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.tagName).toBe('DIV')
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-earth-100')
      expect(badge).toHaveClass('text-earth-700')
    })

    it('renders sage variant', () => {
      render(<Badge variant="sage">Sage</Badge>)
      const badge = screen.getByText('Sage')
      expect(badge).toHaveClass('bg-sage-100')
      expect(badge).toHaveClass('text-sage-700')
    })

    it('renders tcm variant', () => {
      render(<Badge variant="tcm">TCM</Badge>)
      const badge = screen.getByText('TCM')
      expect(badge).toHaveClass('bg-tcm-100')
      expect(badge).toHaveClass('text-tcm-600')
    })

    it('renders gold variant', () => {
      render(<Badge variant="gold">Gold</Badge>)
      const badge = screen.getByText('Gold')
      expect(badge).toHaveClass('bg-gold-100')
      expect(badge).toHaveClass('text-gold-600')
    })

    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-success-light')
      expect(badge).toHaveClass('text-success-dark')
    })

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge).toHaveClass('bg-warning-light')
      expect(badge).toHaveClass('text-warning-dark')
    })

    it('renders danger variant', () => {
      render(<Badge variant="danger">Danger</Badge>)
      const badge = screen.getByText('Danger')
      expect(badge).toHaveClass('bg-danger-light')
      expect(badge).toHaveClass('text-danger-dark')
    })

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>)
      const badge = screen.getByText('Info')
      expect(badge).toHaveClass('bg-info-light')
      expect(badge).toHaveClass('text-info-dark')
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('border-gray-300')
      expect(badge).toHaveClass('bg-transparent')
      expect(badge).toHaveClass('text-gray-700')
    })

    it('uses default variant when no variant is specified', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-earth-100')
      expect(badge).toHaveClass('text-earth-700')
    })
  })

  describe('Styling', () => {
    it('applies base styling classes', () => {
      render(<Badge>Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('items-center')
      expect(badge).toHaveClass('rounded-full')
      expect(badge).toHaveClass('px-3')
      expect(badge).toHaveClass('py-1')
      expect(badge).toHaveClass('text-xs')
      expect(badge).toHaveClass('font-semibold')
      expect(badge).toHaveClass('tracking-wide')
      expect(badge).toHaveClass('transition-colors')
    })

    it('applies custom className', () => {
      render(<Badge className="custom-badge">Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('custom-badge')
      expect(badge).toHaveClass('inline-flex') // Still has base class
    })

    it('merges custom className with variant classes', () => {
      render(
        <Badge variant="success" className="custom-class">
          Success
        </Badge>
      )
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('custom-class')
      expect(badge).toHaveClass('bg-success-light')
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode classes for default variant', () => {
      render(<Badge variant="default">Dark</Badge>)
      const badge = screen.getByText('Dark')
      expect(badge).toHaveClass('dark:bg-earth-900')
      expect(badge).toHaveClass('dark:text-earth-300')
    })

    it('applies dark mode classes for sage variant', () => {
      render(<Badge variant="sage">Dark Sage</Badge>)
      const badge = screen.getByText('Dark Sage')
      expect(badge).toHaveClass('dark:bg-sage-900')
      expect(badge).toHaveClass('dark:text-sage-300')
    })

    it('applies dark mode classes for tcm variant', () => {
      render(<Badge variant="tcm">Dark TCM</Badge>)
      const badge = screen.getByText('Dark TCM')
      expect(badge).toHaveClass('dark:bg-tcm-600')
      expect(badge).toHaveClass('dark:text-white')
    })

    it('applies dark mode classes for gold variant', () => {
      render(<Badge variant="gold">Dark Gold</Badge>)
      const badge = screen.getByText('Dark Gold')
      expect(badge).toHaveClass('dark:bg-gold-600')
      expect(badge).toHaveClass('dark:text-white')
    })
  })

  describe('HTML Attributes', () => {
    it('accepts id attribute', () => {
      render(<Badge id="test-badge">Badge</Badge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveAttribute('id', 'test-badge')
    })

    it('accepts data attributes', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      expect(screen.getByTestId('badge')).toBeInTheDocument()
    })

    it('accepts aria-label', () => {
      render(<Badge aria-label="Status badge">New</Badge>)
      const badge = screen.getByText('New')
      expect(badge).toHaveAttribute('aria-label', 'Status badge')
    })

    it('accepts role attribute', () => {
      render(<Badge role="status">Status</Badge>)
      const badge = screen.getByText('Status')
      expect(badge).toHaveAttribute('role', 'status')
    })

    it('accepts onClick handler', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Badge onClick={handleClick}>Clickable</Badge>)

      const badge = screen.getByText('Clickable')
      await user.click(badge)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('accepts custom HTML attributes', () => {
      render(
        <Badge title="Tooltip text" tabIndex={0}>
          Badge
        </Badge>
      )
      const badge = screen.getByText('Badge')
      expect(badge).toHaveAttribute('title', 'Tooltip text')
      expect(badge).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Content Types', () => {
    it('renders text content', () => {
      render(<Badge>Text Badge</Badge>)
      expect(screen.getByText('Text Badge')).toBeInTheDocument()
    })

    it('renders numeric content', () => {
      render(<Badge>42</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders with mixed content', () => {
      render(
        <Badge>
          <span>Label:</span> Value
        </Badge>
      )
      expect(screen.getByText('Label:')).toBeInTheDocument()
      expect(screen.getByText(/Value/)).toBeInTheDocument()
    })

    it('renders with icon and text', () => {
      render(
        <Badge>
          <svg data-testid="icon" />
          Text
        </Badge>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('renders empty string', () => {
      const { container } = render(<Badge>{''}</Badge>)
      const badge = container.firstChild
      expect(badge).toBeInTheDocument()
    })

    it('renders with zero as content', () => {
      render(<Badge>{0}</Badge>)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders with very long text', () => {
      const longText = 'A'.repeat(100)
      render(<Badge>{longText}</Badge>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('renders with special characters', () => {
      render(<Badge>!@#$%^&*()</Badge>)
      expect(screen.getByText('!@#$%^&*()')).toBeInTheDocument()
    })

    it('renders with unicode characters', () => {
      render(<Badge>你好 🌟</Badge>)
      expect(screen.getByText('你好 🌟')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('can be used with role="status"', () => {
      render(<Badge role="status">Live status</Badge>)
      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
    })

    it('can be used with aria-label for screen readers', () => {
      render(<Badge aria-label="3 new notifications">3</Badge>)
      const badge = screen.getByText('3')
      expect(badge).toHaveAttribute('aria-label', '3 new notifications')
    })

    it('can be made focusable with tabIndex', () => {
      render(<Badge tabIndex={0}>Focusable</Badge>)
      const badge = screen.getByText('Focusable')
      expect(badge).toHaveAttribute('tabIndex', '0')
    })

    it('supports aria-live for dynamic content', () => {
      render(
        <Badge aria-live="polite" role="status">
          Updating...
        </Badge>
      )
      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Common Use Cases', () => {
    it('works as a status indicator', () => {
      render(
        <Badge variant="success" role="status">
          Active
        </Badge>
      )
      const badge = screen.getByRole('status')
      expect(badge).toHaveTextContent('Active')
      expect(badge).toHaveClass('bg-success-light')
    })

    it('works as a count badge', () => {
      render(
        <Badge variant="danger" aria-label="5 unread messages">
          5
        </Badge>
      )
      const badge = screen.getByText('5')
      expect(badge).toHaveAttribute('aria-label', '5 unread messages')
      expect(badge).toHaveClass('bg-danger-light')
    })

    it('works as a category tag', () => {
      render(
        <Badge variant="tcm" aria-label="Traditional Chinese Medicine category">
          TCM
        </Badge>
      )
      const badge = screen.getByText('TCM')
      expect(badge).toHaveClass('bg-tcm-100')
    })

    it('works as a label with outline', () => {
      render(<Badge variant="outline">Label</Badge>)
      const badge = screen.getByText('Label')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('bg-transparent')
    })
  })

  describe('Multiple Badges', () => {
    it('renders multiple badges independently', () => {
      render(
        <div>
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      )

      expect(screen.getByText('Success')).toHaveClass('bg-success-light')
      expect(screen.getByText('Danger')).toHaveClass('bg-danger-light')
      expect(screen.getByText('Info')).toHaveClass('bg-info-light')
    })

    it('renders with different content types', () => {
      render(
        <div>
          <Badge>Text</Badge>
          <Badge>{123}</Badge>
          <Badge>
            <span>Mixed</span>
          </Badge>
        </div>
      )

      expect(screen.getByText('Text')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
      expect(screen.getByText('Mixed')).toBeInTheDocument()
    })
  })
})
