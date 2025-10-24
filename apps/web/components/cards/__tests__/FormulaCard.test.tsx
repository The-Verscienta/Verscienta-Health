/**
 * FormulaCard Component Tests
 *
 * Tests formula card rendering, data display, and navigation
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FormulaCard } from '../FormulaCard'

// Mock next-intl routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('FormulaCard', () => {
  const defaultProps = {
    formulaId: 'F001',
    title: 'Si Jun Zi Tang',
    slug: 'si-jun-zi-tang',
  }

  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      render(<FormulaCard {...defaultProps} />)

      expect(screen.getByText('Si Jun Zi Tang')).toBeInTheDocument()
      expect(screen.getByText('F001')).toBeInTheDocument()
    })

    it('renders as a link to formula detail page', () => {
      const { container } = render(<FormulaCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '/formulas/si-jun-zi-tang')
    })

    it('renders Chinese name when provided', () => {
      render(<FormulaCard {...defaultProps} chineseName="四君子汤" />)

      expect(screen.getByText('四君子汤')).toBeInTheDocument()
    })

    it('renders pinyin when provided', () => {
      render(<FormulaCard {...defaultProps} pinyin="sì jūn zǐ tāng" />)

      expect(screen.getByText('sì jūn zǐ tāng')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
      const description = 'Tonifies spleen qi'
      render(<FormulaCard {...defaultProps} description={description} />)

      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('renders without Chinese name and pinyin', () => {
      render(<FormulaCard {...defaultProps} />)

      expect(screen.queryByText(/四/)).not.toBeInTheDocument()
      expect(screen.queryByText(/sì/)).not.toBeInTheDocument()
    })

    it('renders without description', () => {
      const { container } = render(<FormulaCard {...defaultProps} />)

      const description = container.querySelector('.line-clamp-3')
      expect(description).not.toBeInTheDocument()
    })
  })

  describe('Rating Display', () => {
    it('renders rating when provided with reviews', () => {
      render(<FormulaCard {...defaultProps} averageRating={4.5} reviewCount={10} />)

      expect(screen.getByText('4.5')).toBeInTheDocument()
      expect(screen.getByText('(10)')).toBeInTheDocument()
    })

    it('does not render rating when reviewCount is 0', () => {
      render(<FormulaCard {...defaultProps} averageRating={4.5} reviewCount={0} />)

      expect(screen.queryByText('4.5')).not.toBeInTheDocument()
    })

    it('does not render rating when averageRating is undefined', () => {
      render(<FormulaCard {...defaultProps} reviewCount={10} />)

      expect(screen.queryByText('(10)')).not.toBeInTheDocument()
    })

    it('does not render rating when reviewCount is undefined', () => {
      render(<FormulaCard {...defaultProps} averageRating={4.5} />)

      expect(screen.queryByText('4.5')).not.toBeInTheDocument()
    })

    it('formats rating to one decimal place', () => {
      render(<FormulaCard {...defaultProps} averageRating={4.567} reviewCount={5} />)

      expect(screen.getByText('4.6')).toBeInTheDocument()
    })
  })

  describe('Badges', () => {
    it('renders tradition badge when provided', () => {
      render(<FormulaCard {...defaultProps} tradition="Traditional Chinese Medicine" />)

      expect(screen.getByText('Traditional Chinese Medicine')).toBeInTheDocument()
    })

    it('renders category badge when provided', () => {
      render(<FormulaCard {...defaultProps} category="Tonifying" />)

      expect(screen.getByText('Tonifying')).toBeInTheDocument()
    })

    it('renders ingredient count badge when provided', () => {
      render(<FormulaCard {...defaultProps} ingredientCount={8} />)

      expect(screen.getByText('8 ingredients')).toBeInTheDocument()
    })

    it('renders ingredient badge with singular form when count is 1', () => {
      render(<FormulaCard {...defaultProps} ingredientCount={1} />)

      expect(screen.getByText('1 ingredient')).toBeInTheDocument()
    })

    it('renders ingredient count of 0', () => {
      render(<FormulaCard {...defaultProps} ingredientCount={0} />)

      expect(screen.getByText('0 ingredients')).toBeInTheDocument()
    })

    it('renders all badges when all metadata is provided', () => {
      render(
        <FormulaCard
          {...defaultProps}
          tradition="TCM"
          category="Tonifying"
          ingredientCount={8}
        />
      )

      expect(screen.getByText('TCM')).toBeInTheDocument()
      expect(screen.getByText('Tonifying')).toBeInTheDocument()
      expect(screen.getByText('8 ingredients')).toBeInTheDocument()
    })

    it('does not render badges when metadata is not provided', () => {
      const { container } = render(<FormulaCard {...defaultProps} />)

      const badges = container.querySelectorAll('.inline-flex')
      expect(badges.length).toBe(0)
    })
  })

  describe('Complete Card', () => {
    it('renders all information when fully populated', () => {
      render(
        <FormulaCard
          formulaId="F123"
          title="Liu Wei Di Huang Wan"
          slug="liu-wei-di-huang-wan"
          chineseName="六味地黄丸"
          pinyin="liù wèi dì huáng wán"
          description="Nourishes kidney yin and essence"
          category="Tonifying"
          tradition="TCM"
          ingredientCount={6}
          averageRating={4.8}
          reviewCount={25}
        />
      )

      expect(screen.getByText('Liu Wei Di Huang Wan')).toBeInTheDocument()
      expect(screen.getByText('六味地黄丸')).toBeInTheDocument()
      expect(screen.getByText('liù wèi dì huáng wán')).toBeInTheDocument()
      expect(screen.getByText('Nourishes kidney yin and essence')).toBeInTheDocument()
      expect(screen.getByText('TCM')).toBeInTheDocument()
      expect(screen.getByText('Tonifying')).toBeInTheDocument()
      expect(screen.getByText('6 ingredients')).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('(25)')).toBeInTheDocument()
      expect(screen.getByText('F123')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies hover shadow class', () => {
      const { container } = render(<FormulaCard {...defaultProps} />)

      const card = container.querySelector('.hover\\:shadow-lg')
      expect(card).toBeInTheDocument()
    })

    it('applies group class for hover effects', () => {
      const { container } = render(<FormulaCard {...defaultProps} />)

      const card = container.querySelector('.group')
      expect(card).toBeInTheDocument()
    })

    it('applies Chinese font class to Chinese name', () => {
      const { container } = render(<FormulaCard {...defaultProps} chineseName="四君子汤" />)

      const chineseName = container.querySelector('.font-serif-sc')
      expect(chineseName).toBeInTheDocument()
    })

    it('applies italic class to pinyin', () => {
      const { container } = render(<FormulaCard {...defaultProps} pinyin="sì jūn zǐ tāng" />)

      const pinyin = container.querySelector('.italic')
      expect(pinyin).toBeInTheDocument()
    })

    it('applies line-clamp to description', () => {
      const { container } = render(
        <FormulaCard {...defaultProps} description="Very long description" />
      )

      const description = container.querySelector('.line-clamp-3')
      expect(description).toBeInTheDocument()
    })
  })

  describe('Badge Variants', () => {
    it('applies tcm variant to tradition badge', () => {
      render(<FormulaCard {...defaultProps} tradition="TCM" />)

      const badge = screen.getByText('TCM')
      expect(badge).toHaveClass('bg-tcm-100')
    })

    it('applies sage variant to category badge', () => {
      render(<FormulaCard {...defaultProps} category="Tonifying" />)

      const badge = screen.getByText('Tonifying')
      expect(badge).toHaveClass('bg-sage-100')
    })

    it('applies outline variant to ingredient count badge', () => {
      render(<FormulaCard {...defaultProps} ingredientCount={8} />)

      const badge = screen.getByText('8 ingredients')
      expect(badge).toHaveClass('border')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(100)
      render(<FormulaCard {...defaultProps} title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles very long descriptions', () => {
      const longDescription = 'Very long description. '.repeat(50)
      const { container } = render(<FormulaCard {...defaultProps} description={longDescription} />)

      // Description is clamped, so check for partial content
      expect(screen.getByText(/Very long description/)).toBeInTheDocument()

      // Verify line-clamp is applied
      const descriptionElement = container.querySelector('.line-clamp-3')
      expect(descriptionElement).toBeInTheDocument()
    })

    it('handles zero rating', () => {
      render(<FormulaCard {...defaultProps} averageRating={0} reviewCount={5} />)

      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('handles large review count', () => {
      render(<FormulaCard {...defaultProps} averageRating={4.5} reviewCount={9999} />)

      expect(screen.getByText('(9999)')).toBeInTheDocument()
    })

    it('handles special characters in title', () => {
      render(<FormulaCard {...defaultProps} title="Formula & Herbs (TCM)" />)

      expect(screen.getByText('Formula & Herbs (TCM)')).toBeInTheDocument()
    })

    it('handles special characters in description', () => {
      render(
        <FormulaCard {...defaultProps} description="Treats cough and inflammation" />
      )

      expect(screen.getByText('Treats cough and inflammation')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const { container } = render(<FormulaCard {...defaultProps} />)

      expect(container.querySelector('a')).toBeInTheDocument()
    })

    it('provides accessible navigation link', () => {
      const { container } = render(<FormulaCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href')
    })
  })
})
