/**
 * ConditionCard Component Tests
 *
 * Tests condition card rendering, severity indicators, and navigation
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConditionCard } from '../ConditionCard'

// Mock next-intl routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('ConditionCard', () => {
  const defaultProps = {
    conditionId: 'C001',
    title: 'Common Cold',
    slug: 'common-cold',
  }

  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      render(<ConditionCard {...defaultProps} />)

      expect(screen.getByText('Common Cold')).toBeInTheDocument()
      expect(screen.getByText('C001')).toBeInTheDocument()
    })

    it('renders as a link to condition detail page', () => {
      const { container } = render(<ConditionCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '/conditions/common-cold')
    })

    it('renders description when provided', () => {
      const description = 'A viral infection of the upper respiratory tract'
      render(<ConditionCard {...defaultProps} description={description} />)

      expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('does not render description when not provided', () => {
      const { container } = render(<ConditionCard {...defaultProps} />)

      const description = container.querySelector('.line-clamp-2')
      expect(description).not.toBeInTheDocument()
    })
  })

  describe('Category Badge', () => {
    it('renders category badge when provided', () => {
      render(<ConditionCard {...defaultProps} category="Respiratory" />)

      expect(screen.getByText('Respiratory')).toBeInTheDocument()
    })

    it('applies default variant to category badge', () => {
      render(<ConditionCard {...defaultProps} category="Respiratory" />)

      const badge = screen.getByText('Respiratory')
      expect(badge).toHaveClass('bg-earth-100')
    })

    it('does not render category badge when not provided', () => {
      const { container } = render(<ConditionCard {...defaultProps} />)

      const badges = container.querySelectorAll('.inline-flex')
      expect(badges.length).toBe(0)
    })
  })

  describe('Severity Badge', () => {
    it('renders severity badge when provided', () => {
      render(<ConditionCard {...defaultProps} severity="Mild" />)

      expect(screen.getByText('Mild')).toBeInTheDocument()
    })

    it('applies sage variant for mild severity', () => {
      render(<ConditionCard {...defaultProps} severity="mild" />)

      const badge = screen.getByText('mild')
      expect(badge).toHaveClass('bg-sage-100')
    })

    it('applies gold variant for moderate severity', () => {
      render(<ConditionCard {...defaultProps} severity="moderate" />)

      const badge = screen.getByText('moderate')
      expect(badge).toHaveClass('bg-gold-100')
    })

    it('applies tcm variant for severe severity', () => {
      render(<ConditionCard {...defaultProps} severity="severe" />)

      const badge = screen.getByText('severe')
      expect(badge).toHaveClass('bg-tcm-100')
    })

    it('applies default variant for unknown severity', () => {
      render(<ConditionCard {...defaultProps} severity="critical" />)

      const badge = screen.getByText('critical')
      expect(badge).toHaveClass('bg-earth-100')
    })

    it('handles case-insensitive severity matching', () => {
      render(<ConditionCard {...defaultProps} severity="MILD" />)

      const badge = screen.getByText('MILD')
      expect(badge).toHaveClass('bg-sage-100')
    })

    it('does not render severity badge when not provided', () => {
      render(<ConditionCard {...defaultProps} />)

      expect(screen.queryByText(/mild|moderate|severe/i)).not.toBeInTheDocument()
    })
  })

  describe('Related Herbs Badge', () => {
    it('renders related herbs count when provided', () => {
      render(<ConditionCard {...defaultProps} relatedHerbsCount={5} />)

      expect(screen.getByText('5 herbs')).toBeInTheDocument()
    })

    it('renders singular form when count is 1', () => {
      render(<ConditionCard {...defaultProps} relatedHerbsCount={1} />)

      expect(screen.getByText('1 herb')).toBeInTheDocument()
    })

    it('does not render when count is 0', () => {
      render(<ConditionCard {...defaultProps} relatedHerbsCount={0} />)

      expect(screen.queryByText(/herb/i)).not.toBeInTheDocument()
    })

    it('does not render when count is undefined', () => {
      render(<ConditionCard {...defaultProps} />)

      expect(screen.queryByText(/herb/i)).not.toBeInTheDocument()
    })

    it('applies outline variant to herbs count badge', () => {
      render(<ConditionCard {...defaultProps} relatedHerbsCount={5} />)

      const badge = screen.getByText('5 herbs')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('bg-transparent')
    })
  })

  describe('Related Formulas Badge', () => {
    it('renders related formulas count when provided', () => {
      render(<ConditionCard {...defaultProps} relatedFormulasCount={3} />)

      expect(screen.getByText('3 formulas')).toBeInTheDocument()
    })

    it('renders singular form when count is 1', () => {
      render(<ConditionCard {...defaultProps} relatedFormulasCount={1} />)

      expect(screen.getByText('1 formula')).toBeInTheDocument()
    })

    it('does not render when count is 0', () => {
      render(<ConditionCard {...defaultProps} relatedFormulasCount={0} />)

      expect(screen.queryByText(/formula/i)).not.toBeInTheDocument()
    })

    it('does not render when count is undefined', () => {
      render(<ConditionCard {...defaultProps} />)

      expect(screen.queryByText(/formula/i)).not.toBeInTheDocument()
    })

    it('applies outline variant to formulas count badge', () => {
      render(<ConditionCard {...defaultProps} relatedFormulasCount={3} />)

      const badge = screen.getByText('3 formulas')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('bg-transparent')
    })
  })

  describe('Multiple Badges', () => {
    it('renders all badges when all metadata is provided', () => {
      render(
        <ConditionCard
          {...defaultProps}
          category="Respiratory"
          severity="moderate"
          relatedHerbsCount={5}
          relatedFormulasCount={3}
        />
      )

      expect(screen.getByText('Respiratory')).toBeInTheDocument()
      expect(screen.getByText('moderate')).toBeInTheDocument()
      expect(screen.getByText('5 herbs')).toBeInTheDocument()
      expect(screen.getByText('3 formulas')).toBeInTheDocument()
    })

    it('renders only provided badges', () => {
      render(<ConditionCard {...defaultProps} category="Digestive" relatedHerbsCount={2} />)

      expect(screen.getByText('Digestive')).toBeInTheDocument()
      expect(screen.getByText('2 herbs')).toBeInTheDocument()
      expect(screen.queryByText(/formula/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/mild|moderate|severe/i)).not.toBeInTheDocument()
    })
  })

  describe('Complete Card', () => {
    it('renders all information when fully populated', () => {
      render(
        <ConditionCard
          conditionId="C123"
          title="Insomnia"
          slug="insomnia"
          description="Difficulty falling or staying asleep"
          category="Sleep Disorders"
          severity="moderate"
          relatedHerbsCount={8}
          relatedFormulasCount={4}
        />
      )

      expect(screen.getByText('Insomnia')).toBeInTheDocument()
      expect(screen.getByText('Difficulty falling or staying asleep')).toBeInTheDocument()
      expect(screen.getByText('Sleep Disorders')).toBeInTheDocument()
      expect(screen.getByText('moderate')).toBeInTheDocument()
      expect(screen.getByText('8 herbs')).toBeInTheDocument()
      expect(screen.getByText('4 formulas')).toBeInTheDocument()
      expect(screen.getByText('C123')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies hover shadow class', () => {
      const { container } = render(<ConditionCard {...defaultProps} />)

      const card = container.querySelector('.hover\\:shadow-lg')
      expect(card).toBeInTheDocument()
    })

    it('applies group class for hover effects', () => {
      const { container } = render(<ConditionCard {...defaultProps} />)

      const card = container.querySelector('.group')
      expect(card).toBeInTheDocument()
    })

    it('applies line-clamp to description', () => {
      const { container } = render(
        <ConditionCard {...defaultProps} description="Long description" />
      )

      const description = container.querySelector('.line-clamp-2')
      expect(description).toBeInTheDocument()
    })

    it('applies small text size to badges', () => {
      render(<ConditionCard {...defaultProps} category="Respiratory" />)

      const badge = screen.getByText('Respiratory')
      expect(badge).toHaveClass('text-xs')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'A'.repeat(100)
      render(<ConditionCard {...defaultProps} title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles very long descriptions', () => {
      const longDescription = 'Very long description. '.repeat(50)
      const { container } = render(
        <ConditionCard {...defaultProps} description={longDescription} />
      )

      // Description is clamped, so check for partial content
      expect(screen.getByText(/Very long description/)).toBeInTheDocument()

      // Verify line-clamp is applied
      const descriptionElement = container.querySelector('.line-clamp-2')
      expect(descriptionElement).toBeInTheDocument()
    })

    it('handles large related counts', () => {
      render(<ConditionCard {...defaultProps} relatedHerbsCount={999} relatedFormulasCount={888} />)

      expect(screen.getByText('999 herbs')).toBeInTheDocument()
      expect(screen.getByText('888 formulas')).toBeInTheDocument()
    })

    it('handles special characters in title', () => {
      render(<ConditionCard {...defaultProps} title="Condition & Symptoms (TCM)" />)

      expect(screen.getByText('Condition & Symptoms (TCM)')).toBeInTheDocument()
    })

    it('handles special characters in description', () => {
      render(<ConditionCard {...defaultProps} description="Causes <pain> & [inflammation]" />)

      expect(screen.getByText('Causes <pain> & [inflammation]')).toBeInTheDocument()
    })

    it('handles mixed case in severity', () => {
      render(<ConditionCard {...defaultProps} severity="MoDErAtE" />)

      const badge = screen.getByText('MoDErAtE')
      expect(badge).toHaveClass('bg-gold-100')
    })
  })

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const { container } = render(<ConditionCard {...defaultProps} />)

      expect(container.querySelector('a')).toBeInTheDocument()
    })

    it('provides accessible navigation link', () => {
      const { container } = render(<ConditionCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href')
    })

    it('renders description with proper ARIA semantics', () => {
      render(<ConditionCard {...defaultProps} description="Test description" />)

      // Description should be visible and readable
      const description = screen.getByText('Test description')
      expect(description).toBeInTheDocument()
    })
  })
})
