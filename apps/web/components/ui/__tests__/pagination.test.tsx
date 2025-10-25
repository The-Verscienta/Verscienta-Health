/**
 * Pagination Component Tests
 *
 * Tests pagination rendering, navigation, and accessibility
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '../pagination'

// Mock next-intl routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    baseUrl: '/herbs',
  }

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Pagination {...defaultProps} />)
      const nav = screen.getByRole('navigation', { name: 'Pagination' })
      expect(nav).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = render(<Pagination {...defaultProps} className="custom-class" />)
      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('custom-class')
    })

    it('renders previous and next buttons', () => {
      render(<Pagination {...defaultProps} />)

      const prevButton = screen.getByLabelText('Go to previous page')
      const nextButton = screen.getByLabelText('Go to next page')

      expect(prevButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })
  })

  describe('Page Numbers', () => {
    it('shows first page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const links = screen.getAllByRole('link')
      const firstPageLink = links.find((link) => link.textContent === '1')
      expect(firstPageLink).toBeInTheDocument()
    })

    it('shows last page when total pages > 1', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />)
      const lastPage = screen.getByRole('link', { name: /Go to page 10/i })
      expect(lastPage).toBeInTheDocument()
    })

    it('shows current page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const currentPage = screen.getByRole('link', { name: /Current page, page 5/i })
      expect(currentPage).toBeInTheDocument()
    })

    it('shows pages around current page', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />)

      expect(screen.getByRole('link', { name: /Go to page 4/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Current page, page 5/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Go to page 6/i })).toBeInTheDocument()
    })

    it('does not show last page when totalPages is 1', () => {
      render(<Pagination currentPage={1} totalPages={1} baseUrl="/herbs" />)
      // Should only show page 1
      const links = screen.getAllByRole('link')
      // Filter out prev/next buttons
      const pageLinks = links.filter(
        (link) =>
          !link.getAttribute('aria-label')?.includes('previous') &&
          !link.getAttribute('aria-label')?.includes('next')
      )
      expect(pageLinks).toHaveLength(1)
    })
  })

  describe('Ellipsis', () => {
    it('shows ellipsis when there is a gap before current page', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={8} totalPages={10} />)
      const ellipsis = container.querySelectorAll('[aria-hidden="true"]')
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('shows ellipsis when there is a gap after current page', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={3} totalPages={10} />)
      const ellipsis = container.querySelectorAll('[aria-hidden="true"]')
      expect(ellipsis.length).toBeGreaterThan(0)
    })

    it('shows two ellipses when current page is in the middle', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />)
      const ellipsis = container.querySelectorAll('[aria-hidden="true"]')
      expect(ellipsis.length).toBe(2)
    })

    it('does not show ellipsis when current page is near start', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={2} totalPages={5} />)
      const ellipsis = container.querySelectorAll('[aria-hidden="true"]')
      expect(ellipsis.length).toBeLessThanOrEqual(1)
    })

    it('does not show ellipsis when current page is near end', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={9} totalPages={10} />)
      const ellipsis = container.querySelectorAll('[aria-hidden="true"]')
      expect(ellipsis.length).toBeLessThanOrEqual(1)
    })
  })

  describe('Navigation Links', () => {
    it('generates correct URLs for page links', () => {
      render(<Pagination {...defaultProps} currentPage={2} baseUrl="/herbs" />)

      const links = screen.getAllByRole('link')
      const page1Link = links.find((link) => link.textContent === '1')
      expect(page1Link).toHaveAttribute('href', '/herbs?page=1')

      const page3Link = links.find((link) => link.textContent === '3')
      expect(page3Link).toHaveAttribute('href', '/herbs?page=3')
    })

    it('generates correct previous page URL', () => {
      render(<Pagination {...defaultProps} currentPage={3} />)
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).toHaveAttribute('href', '/herbs?page=2')
    })

    it('generates correct next page URL', () => {
      render(<Pagination {...defaultProps} currentPage={3} />)
      const nextButton = screen.getByLabelText('Go to next page')
      expect(nextButton).toHaveAttribute('href', '/herbs?page=4')
    })

    it('previous button points to # when on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).toHaveAttribute('href', '#')
    })

    it('next button points to # when on last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={10} />)
      const nextButton = screen.getByLabelText('Go to next page')
      expect(nextButton).toHaveAttribute('href', '#')
    })
  })

  describe('Button States', () => {
    it('disables previous button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).toHaveClass('pointer-events-none')
      expect(prevButton).toHaveClass('opacity-50')
      expect(prevButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('enables previous button when not on first page', () => {
      render(<Pagination {...defaultProps} currentPage={2} />)
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).not.toHaveClass('pointer-events-none')
      expect(prevButton).not.toHaveClass('opacity-50')
      expect(prevButton).toHaveAttribute('aria-disabled', 'false')
    })

    it('disables next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={10} />)
      const nextButton = screen.getByLabelText('Go to next page')
      expect(nextButton).toHaveClass('pointer-events-none')
      expect(nextButton).toHaveClass('opacity-50')
      expect(nextButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('enables next button when not on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const nextButton = screen.getByLabelText('Go to next page')
      expect(nextButton).not.toHaveClass('pointer-events-none')
      expect(nextButton).not.toHaveClass('opacity-50')
      expect(nextButton).toHaveAttribute('aria-disabled', 'false')
    })

    it('highlights current page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const currentPage = screen.getByRole('link', { name: /Current page, page 5/i })
      expect(currentPage).toHaveClass('bg-earth-600')
      expect(currentPage).toHaveClass('text-white')
      expect(currentPage).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight non-current pages', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const page4 = screen.getByRole('link', { name: /Go to page 4/i })
      expect(page4).not.toHaveClass('bg-earth-600')
      expect(page4).not.toHaveAttribute('aria-current')
    })
  })

  describe('Edge Cases', () => {
    it('handles single page', () => {
      render(<Pagination currentPage={1} totalPages={1} baseUrl="/herbs" />)

      // Previous and next buttons should be disabled
      const prevButton = screen.getByLabelText('Go to previous page')
      const nextButton = screen.getByLabelText('Go to next page')

      expect(prevButton).toHaveClass('pointer-events-none')
      expect(nextButton).toHaveClass('pointer-events-none')
    })

    it('handles two pages', () => {
      render(<Pagination currentPage={1} totalPages={2} baseUrl="/herbs" />)

      expect(screen.getByRole('link', { name: /page 1/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /page 2/i })).toBeInTheDocument()
    })

    it('handles three pages', () => {
      render(<Pagination currentPage={2} totalPages={3} baseUrl="/herbs" />)

      expect(screen.getByRole('link', { name: /page 1/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /page 2/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /page 3/i })).toBeInTheDocument()
    })

    it('handles large number of pages', () => {
      render(<Pagination currentPage={50} totalPages={100} baseUrl="/herbs" />)

      // Should show first, last, current, and surrounding pages
      const links = screen.getAllByRole('link')
      const page1 = links.find((link) => link.textContent === '1')
      const page50 = links.find((link) => link.textContent === '50')
      const page100 = links.find((link) => link.textContent === '100')

      expect(page1).toBeInTheDocument()
      expect(page50).toBeInTheDocument()
      expect(page100).toBeInTheDocument()
    })

    it('handles last page correctly', () => {
      render(<Pagination currentPage={10} totalPages={10} baseUrl="/herbs" />)

      const nextButton = screen.getByLabelText('Go to next page')
      expect(nextButton).toHaveClass('pointer-events-none')
    })

    it('handles first page correctly', () => {
      render(<Pagination currentPage={1} totalPages={10} baseUrl="/herbs" />)

      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).toHaveClass('pointer-events-none')
    })
  })

  describe('Accessibility', () => {
    it('has proper navigation landmark', () => {
      render(<Pagination {...defaultProps} />)
      const nav = screen.getByRole('navigation', { name: 'Pagination' })
      expect(nav).toBeInTheDocument()
    })

    it('provides aria-labels for navigation buttons', () => {
      render(<Pagination {...defaultProps} />)

      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument()
    })

    it('provides aria-labels for page links', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)

      expect(screen.getByRole('link', { name: /Current page, page 5/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Go to page 4/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Go to page 6/i })).toBeInTheDocument()
    })

    it('marks current page with aria-current', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const currentPage = screen.getByRole('link', { name: /Current page, page 5/i })
      expect(currentPage).toHaveAttribute('aria-current', 'page')
    })

    it('marks disabled buttons with aria-disabled', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('hides ellipsis from screen readers', () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={5} totalPages={10} />)
      const ellipsis = container.querySelectorAll('[aria-hidden="true"]')
      expect(ellipsis.length).toBe(2) // Should have 2 ellipses
      ellipsis.forEach((el) => {
        expect(el).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Visual Styling', () => {
    it('applies hover styles to page links', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const page4 = screen.getByRole('link', { name: /Go to page 4/i })
      expect(page4).toHaveClass('hover:bg-earth-50')
    })

    it('applies different styles to current page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />)
      const currentPage = screen.getByRole('link', { name: /Current page, page 5/i })
      expect(currentPage).toHaveClass('bg-earth-600')
      expect(currentPage).toHaveClass('text-white')
    })

    it('applies transition classes', () => {
      render(<Pagination {...defaultProps} />)
      const prevButton = screen.getByLabelText('Go to previous page')
      expect(prevButton).toHaveClass('transition-colors')
    })
  })

  describe('URL Generation', () => {
    it('uses correct base URL', () => {
      render(<Pagination {...defaultProps} baseUrl="/formulas" currentPage={2} />)
      const page3Link = screen.getByRole('link', { name: /Go to page 3/i })
      expect(page3Link).toHaveAttribute('href', '/formulas?page=3')
    })

    it('handles base URL without leading slash', () => {
      render(<Pagination {...defaultProps} baseUrl="herbs" currentPage={2} />)
      const page3Link = screen.getByRole('link', { name: /Go to page 3/i })
      expect(page3Link.getAttribute('href')).toContain('page=3')
    })

    it('handles base URL with trailing slash', () => {
      render(<Pagination {...defaultProps} baseUrl="/herbs/" currentPage={2} />)
      const page3Link = screen.getByRole('link', { name: /Go to page 3/i })
      expect(page3Link.getAttribute('href')).toContain('page=3')
    })
  })
})
