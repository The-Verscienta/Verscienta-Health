/**
 * HerbCard Component Tests
 *
 * Tests rendering, props, and interactions
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HerbCard } from '../HerbCard'

// Mock next-intl routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock OptimizedCardImage
vi.mock('@/components/ui/optimized-image', () => ({
  OptimizedCardImage: ({ src, alt, fallback, className }: any) => (
    <img src={src} alt={alt} className={className} data-fallback={fallback} />
  ),
}))

describe('HerbCard', () => {
  const defaultProps = {
    herbId: 'H001',
    title: 'Ginseng',
    slug: 'ginseng',
  }

  describe('Basic Rendering', () => {
    it('renders with minimum required props', () => {
      render(<HerbCard {...defaultProps} />)

      expect(screen.getByText('Ginseng')).toBeInTheDocument()
      expect(screen.getByText('H001')).toBeInTheDocument()
    })

    it('renders as a link to herb detail page', () => {
      render(<HerbCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/herbs/ginseng')
    })

    it('displays scientific name when provided', () => {
      render(<HerbCard {...defaultProps} scientificName="Panax ginseng" />)

      expect(screen.getByText('Panax ginseng')).toBeInTheDocument()
    })

    it('displays description when provided', () => {
      render(<HerbCard {...defaultProps} description="A powerful adaptogenic herb" />)

      expect(screen.getByText('A powerful adaptogenic herb')).toBeInTheDocument()
    })
  })

  describe('Featured Image', () => {
    it('renders featured image when provided', () => {
      render(
        <HerbCard
          {...defaultProps}
          featuredImage={{
            url: '/images/ginseng.jpg',
            alt: 'Ginseng root',
          }}
        />
      )

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', '/images/ginseng.jpg')
      expect(image).toHaveAttribute('alt', 'Ginseng root')
    })

    it('uses herb title as alt text when alt not provided', () => {
      render(
        <HerbCard
          {...defaultProps}
          featuredImage={{
            url: '/images/ginseng.jpg',
          }}
        />
      )

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', 'Ginseng')
    })

    it('shows placeholder icon when no image provided', () => {
      render(<HerbCard {...defaultProps} />)

      // Leaf icon should be present
      const container = screen.getByRole('link')
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('includes fallback image path', () => {
      render(
        <HerbCard
          {...defaultProps}
          featuredImage={{
            url: '/images/ginseng.jpg',
          }}
        />
      )

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('data-fallback', '/images/herb-placeholder.jpg')
    })
  })

  describe('Rating Display', () => {
    it('displays rating and review count when provided', () => {
      render(<HerbCard {...defaultProps} averageRating={4.5} reviewCount={120} />)

      expect(screen.getByText('4.5')).toBeInTheDocument()
      expect(screen.getByText('(120)')).toBeInTheDocument()
    })

    it('formats rating to 1 decimal place', () => {
      render(<HerbCard {...defaultProps} averageRating={4.567} reviewCount={10} />)

      expect(screen.getByText('4.6')).toBeInTheDocument()
    })

    it('does not display rating when reviewCount is 0', () => {
      render(<HerbCard {...defaultProps} averageRating={5.0} reviewCount={0} />)

      expect(screen.queryByText('5.0')).not.toBeInTheDocument()
    })

    it('does not display rating when not provided', () => {
      render(<HerbCard {...defaultProps} />)

      expect(screen.queryByText(/\d\.\d/)).not.toBeInTheDocument()
    })
  })

  describe('TCM Properties', () => {
    it('displays taste properties', () => {
      render(
        <HerbCard
          {...defaultProps}
          tcmProperties={{
            taste: ['Sweet', 'Bitter'],
          }}
        />
      )

      expect(screen.getByText('Sweet')).toBeInTheDocument()
      expect(screen.getByText('Bitter')).toBeInTheDocument()
    })

    it('displays temperature property', () => {
      render(
        <HerbCard
          {...defaultProps}
          tcmProperties={{
            temperature: 'Warm',
          }}
        />
      )

      expect(screen.getByText('Warm')).toBeInTheDocument()
    })

    it('displays multiple TCM properties', () => {
      render(
        <HerbCard
          {...defaultProps}
          tcmProperties={{
            taste: ['Sweet', 'Slightly Bitter'],
            temperature: 'Neutral',
            category: 'Qi Tonic',
          }}
        />
      )

      expect(screen.getByText('Sweet')).toBeInTheDocument()
      expect(screen.getByText('Slightly Bitter')).toBeInTheDocument()
      expect(screen.getByText('Neutral')).toBeInTheDocument()
    })

    it('handles empty taste array', () => {
      render(
        <HerbCard
          {...defaultProps}
          tcmProperties={{
            taste: [],
            temperature: 'Cool',
          }}
        />
      )

      expect(screen.getByText('Cool')).toBeInTheDocument()
    })
  })

  describe('Western Properties', () => {
    it('displays western properties', () => {
      render(
        <HerbCard
          {...defaultProps}
          westernProperties={['Adaptogen', 'Immune Support', 'Energy Boost']}
        />
      )

      expect(screen.getByText('Adaptogen')).toBeInTheDocument()
      expect(screen.getByText('Immune Support')).toBeInTheDocument()
      expect(screen.getByText('Energy Boost')).toBeInTheDocument()
    })

    it('limits display to first 3 properties', () => {
      render(
        <HerbCard
          {...defaultProps}
          westernProperties={['Prop1', 'Prop2', 'Prop3', 'Prop4', 'Prop5']}
        />
      )

      expect(screen.getByText('Prop1')).toBeInTheDocument()
      expect(screen.getByText('Prop2')).toBeInTheDocument()
      expect(screen.getByText('Prop3')).toBeInTheDocument()
      expect(screen.queryByText('Prop4')).not.toBeInTheDocument()
    })

    it('shows count of additional properties', () => {
      render(
        <HerbCard
          {...defaultProps}
          westernProperties={['Prop1', 'Prop2', 'Prop3', 'Prop4', 'Prop5']}
        />
      )

      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('does not show count when 3 or fewer properties', () => {
      render(<HerbCard {...defaultProps} westernProperties={['Prop1', 'Prop2']} />)

      expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument()
    })

    it('handles empty western properties array', () => {
      render(<HerbCard {...defaultProps} westernProperties={[]} />)

      // Should not error, just not display any properties
      expect(screen.getByText('Ginseng')).toBeInTheDocument()
    })
  })

  describe('Complete Card Rendering', () => {
    it('renders all props together correctly', () => {
      render(
        <HerbCard
          herbId="H001"
          title="Ginseng"
          slug="ginseng"
          scientificName="Panax ginseng"
          description="A powerful adaptogenic herb used for energy and vitality"
          featuredImage={{
            url: '/images/ginseng.jpg',
            alt: 'Fresh ginseng root',
          }}
          tcmProperties={{
            taste: ['Sweet', 'Slightly Bitter'],
            temperature: 'Warm',
            category: 'Qi Tonic',
          }}
          westernProperties={['Adaptogen', 'Immune Support', 'Energy Boost', 'Cognitive Function']}
          averageRating={4.7}
          reviewCount={234}
        />
      )

      // Title and ID
      expect(screen.getByText('Ginseng')).toBeInTheDocument()
      expect(screen.getByText('H001')).toBeInTheDocument()

      // Scientific name
      expect(screen.getByText('Panax ginseng')).toBeInTheDocument()

      // Description
      expect(
        screen.getByText('A powerful adaptogenic herb used for energy and vitality')
      ).toBeInTheDocument()

      // Image
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', '/images/ginseng.jpg')

      // Rating
      expect(screen.getByText('4.7')).toBeInTheDocument()
      expect(screen.getByText('(234)')).toBeInTheDocument()

      // TCM Properties
      expect(screen.getByText('Sweet')).toBeInTheDocument()
      expect(screen.getByText('Warm')).toBeInTheDocument()

      // Western Properties
      expect(screen.getByText('Adaptogen')).toBeInTheDocument()
      expect(screen.getByText('+1')).toBeInTheDocument() // 4 total, showing 3
    })
  })

  describe('Accessibility', () => {
    it('has proper link structure for screen readers', () => {
      render(
        <HerbCard
          {...defaultProps}
          scientificName="Panax ginseng"
          description="A powerful herb"
        />
      )

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      // Link contains the card content
      expect(link).toHaveTextContent('Ginseng')
      expect(link).toHaveTextContent('Panax ginseng')
    })

    it('provides alt text for images', () => {
      render(
        <HerbCard
          {...defaultProps}
          featuredImage={{
            url: '/images/ginseng.jpg',
            alt: 'Fresh ginseng root',
          }}
        />
      )

      const image = screen.getByRole('img', { name: 'Fresh ginseng root' })
      expect(image).toBeInTheDocument()
    })

    it('uses semantic HTML structure', () => {
      const { container } = render(<HerbCard {...defaultProps} />)

      // Should have proper card structure
      expect(container.querySelector('a')).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('applies hover effects', () => {
      const { container } = render(<HerbCard {...defaultProps} />)

      const card = container.querySelector('[class*="group"]')
      expect(card).toBeInTheDocument()
      expect(card?.className).toContain('hover:shadow-lg')
    })

    it('applies proper spacing classes', () => {
      const { container } = render(<HerbCard {...defaultProps} />)

      expect(container.querySelector('[class*="h-full"]')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long titles gracefully', () => {
      const longTitle =
        'This is an extremely long herb name that might break the layout if not handled properly'

      render(<HerbCard {...defaultProps} title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles very long descriptions', () => {
      const longDescription =
        'This is a very long description that should be truncated using line-clamp to prevent it from taking up too much space on the card and breaking the layout of the grid system'

      render(<HerbCard {...defaultProps} description={longDescription} />)

      const description = screen.getByText(longDescription)
      expect(description.className).toContain('line-clamp-2')
    })

    it('handles zero rating correctly', () => {
      render(<HerbCard {...defaultProps} averageRating={0} reviewCount={1} />)

      expect(screen.getByText('0.0')).toBeInTheDocument()
      expect(screen.getByText('(1)')).toBeInTheDocument()
    })

    it('handles single review', () => {
      render(<HerbCard {...defaultProps} averageRating={5.0} reviewCount={1} />)

      expect(screen.getByText('5.0')).toBeInTheDocument()
      expect(screen.getByText('(1)')).toBeInTheDocument()
    })

    it('handles undefined optional props', () => {
      render(
        <HerbCard
          herbId="H001"
          title="Test Herb"
          slug="test"
          scientificName={undefined}
          description={undefined}
          featuredImage={undefined}
          tcmProperties={undefined}
          westernProperties={undefined}
          averageRating={undefined}
          reviewCount={undefined}
        />
      )

      expect(screen.getByText('Test Herb')).toBeInTheDocument()
    })
  })
})
