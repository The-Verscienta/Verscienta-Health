/**
 * PractitionerCard Component Tests
 *
 * Tests practitioner card rendering, verification status, ratings, and navigation
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PractitionerCard } from '../PractitionerCard'

// Mock next-intl routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock OptimizedAvatar component
vi.mock('@/components/ui/optimized-image', () => ({
  OptimizedAvatar: ({ src, alt, fallback }: any) => (
    <img src={src} alt={alt} data-fallback={fallback} />
  ),
}))

describe('PractitionerCard', () => {
  const defaultProps = {
    practitionerId: 'P001',
    name: 'Dr. Jane Smith',
    slug: 'dr-jane-smith',
  }

  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      render(<PractitionerCard {...defaultProps} />)

      expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('P001')).toBeInTheDocument()
    })

    it('renders as a link to practitioner detail page', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href', '/practitioners/dr-jane-smith')
    })

    it('renders title when provided', () => {
      render(<PractitionerCard {...defaultProps} title="Licensed Acupuncturist" />)

      expect(screen.getByText('Licensed Acupuncturist')).toBeInTheDocument()
    })

    it('does not render title when not provided', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      // Only name should be present, no subtitle
      expect(container.querySelectorAll('p').length).toBe(0)
    })
  })

  describe('Photo Display', () => {
    it('renders OptimizedAvatar when photo is provided', () => {
      render(
        <PractitionerCard
          {...defaultProps}
          photo={{ url: 'https://example.com/photo.jpg', alt: 'Profile photo' }}
        />
      )

      const img = screen.getByAltText('Profile photo')
      expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
    })

    it('uses name as alt text when alt is not provided', () => {
      render(
        <PractitionerCard {...defaultProps} photo={{ url: 'https://example.com/photo.jpg' }} />
      )

      const img = screen.getByAltText('Dr. Jane Smith')
      expect(img).toBeInTheDocument()
    })

    it('renders initials when photo is not provided', () => {
      render(<PractitionerCard {...defaultProps} />)

      expect(screen.getByText('DJ')).toBeInTheDocument()
    })

    it('generates correct initials from name', () => {
      render(<PractitionerCard {...defaultProps} name="Mary Anne Johnson" />)

      // Takes first char of each word, then slices to 2: "M", "A", "J" -> "MAJ" -> "MA"
      expect(screen.getByText('MA')).toBeInTheDocument()
    })

    it('handles single name', () => {
      render(<PractitionerCard {...defaultProps} name="Madonna" />)

      // Single name returns just first letter
      expect(screen.getByText('M')).toBeInTheDocument()
    })

    it('limits initials to 2 characters', () => {
      render(<PractitionerCard {...defaultProps} name="A B C D E F" />)

      // Takes first char of each word, then slices to 2 chars
      const initials = screen.getByText('AB')
      expect(initials).toBeInTheDocument()
    })
  })

  describe('Verification Status', () => {
    it('renders verified icon when status is verified', () => {
      render(<PractitionerCard {...defaultProps} verificationStatus="verified" />)

      const icon = screen.getByLabelText('Verified')
      expect(icon).toBeInTheDocument()
    })

    it('does not render verified icon when status is pending', () => {
      render(<PractitionerCard {...defaultProps} verificationStatus="pending" />)

      expect(screen.queryByLabelText('Verified')).not.toBeInTheDocument()
    })

    it('does not render verified icon when status is unverified', () => {
      render(<PractitionerCard {...defaultProps} verificationStatus="unverified" />)

      expect(screen.queryByLabelText('Verified')).not.toBeInTheDocument()
    })

    it('does not render verified icon when status is not provided', () => {
      render(<PractitionerCard {...defaultProps} />)

      expect(screen.queryByLabelText('Verified')).not.toBeInTheDocument()
    })
  })

  describe('Rating Display', () => {
    it('renders rating when provided with reviews', () => {
      render(<PractitionerCard {...defaultProps} averageRating={4.8} reviewCount={15} />)

      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('(15)')).toBeInTheDocument()
    })

    it('does not render rating when reviewCount is 0', () => {
      render(<PractitionerCard {...defaultProps} averageRating={4.8} reviewCount={0} />)

      expect(screen.queryByText('4.8')).not.toBeInTheDocument()
    })

    it('does not render rating when averageRating is undefined', () => {
      render(<PractitionerCard {...defaultProps} reviewCount={15} />)

      expect(screen.queryByText('(15)')).not.toBeInTheDocument()
    })

    it('does not render rating when reviewCount is undefined', () => {
      render(<PractitionerCard {...defaultProps} averageRating={4.8} />)

      expect(screen.queryByText('4.8')).not.toBeInTheDocument()
    })

    it('formats rating to one decimal place', () => {
      render(<PractitionerCard {...defaultProps} averageRating={4.567} reviewCount={5} />)

      expect(screen.getByText('4.6')).toBeInTheDocument()
    })
  })

  describe('Modalities Display', () => {
    it('renders modalities when provided', () => {
      render(<PractitionerCard {...defaultProps} modalities={['Acupuncture', 'Herbal Medicine']} />)

      expect(screen.getByText('Acupuncture')).toBeInTheDocument()
      expect(screen.getByText('Herbal Medicine')).toBeInTheDocument()
    })

    it('limits modalities display to first 3', () => {
      render(
        <PractitionerCard
          {...defaultProps}
          modalities={['Acupuncture', 'Herbal Medicine', 'Cupping', 'Moxibustion']}
        />
      )

      expect(screen.getByText('Acupuncture')).toBeInTheDocument()
      expect(screen.getByText('Herbal Medicine')).toBeInTheDocument()
      expect(screen.getByText('Cupping')).toBeInTheDocument()
      expect(screen.queryByText('Moxibustion')).not.toBeInTheDocument()
    })

    it('shows +N badge when there are more than 3 modalities', () => {
      render(
        <PractitionerCard
          {...defaultProps}
          modalities={['Acupuncture', 'Herbal Medicine', 'Cupping', 'Moxibustion', 'Tuina']}
        />
      )

      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('does not show +N badge when there are exactly 3 modalities', () => {
      render(
        <PractitionerCard
          {...defaultProps}
          modalities={['Acupuncture', 'Herbal Medicine', 'Cupping']}
        />
      )

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
    })

    it('does not render modalities when not provided', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      const modalityBadges = container.querySelectorAll('.bg-sage-100')
      expect(modalityBadges.length).toBe(0)
    })

    it('does not render modalities when empty array', () => {
      render(<PractitionerCard {...defaultProps} modalities={[]} />)

      const { container } = render(<PractitionerCard {...defaultProps} modalities={[]} />)
      const modalityBadges = container.querySelectorAll('.bg-sage-100')
      expect(modalityBadges.length).toBe(0)
    })
  })

  describe('Location Display', () => {
    it('renders city and state when both provided', () => {
      render(
        <PractitionerCard {...defaultProps} address={{ city: 'San Francisco', state: 'CA' }} />
      )

      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    })

    it('renders only city when state is not provided', () => {
      render(<PractitionerCard {...defaultProps} address={{ city: 'San Francisco' }} />)

      expect(screen.getByText('San Francisco')).toBeInTheDocument()
    })

    it('renders only state when city is not provided', () => {
      render(<PractitionerCard {...defaultProps} address={{ state: 'CA' }} />)

      expect(screen.getByText('CA')).toBeInTheDocument()
    })

    it('does not render location when address is not provided', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      // MapPin icon should not be present
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('does not render location when address is empty', () => {
      render(<PractitionerCard {...defaultProps} address={{}} />)

      const { container } = render(<PractitionerCard {...defaultProps} address={{}} />)
      expect(screen.queryByText(/,/)).not.toBeInTheDocument()
    })
  })

  describe('Complete Card', () => {
    it('renders all information when fully populated', () => {
      render(
        <PractitionerCard
          practitionerId="P123"
          name="Dr. Sarah Chen"
          slug="dr-sarah-chen"
          photo={{ url: 'https://example.com/photo.jpg', alt: 'Dr. Chen' }}
          title="Licensed Acupuncturist, MSTCM"
          modalities={['Acupuncture', 'Herbal Medicine', 'Cupping', 'Moxibustion']}
          address={{ city: 'Los Angeles', state: 'CA' }}
          averageRating={4.9}
          reviewCount={42}
          verificationStatus="verified"
        />
      )

      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Licensed Acupuncturist, MSTCM')).toBeInTheDocument()
      expect(screen.getByText('Acupuncture')).toBeInTheDocument()
      expect(screen.getByText('Herbal Medicine')).toBeInTheDocument()
      expect(screen.getByText('Cupping')).toBeInTheDocument()
      expect(screen.getByText('+1')).toBeInTheDocument()
      expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument()
      expect(screen.getByText('4.9')).toBeInTheDocument()
      expect(screen.getByText('(42)')).toBeInTheDocument()
      expect(screen.getByLabelText('Verified')).toBeInTheDocument()
      expect(screen.getByText('P123')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies hover shadow class', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      const card = container.querySelector('.hover\\:shadow-lg')
      expect(card).toBeInTheDocument()
    })

    it('applies group class for hover effects', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      const card = container.querySelector('.group')
      expect(card).toBeInTheDocument()
    })

    it('applies sage variant to modality badges', () => {
      render(<PractitionerCard {...defaultProps} modalities={['Acupuncture']} />)

      const badge = screen.getByText('Acupuncture')
      expect(badge).toHaveClass('bg-sage-100')
    })

    it('applies outline variant to +N badge', () => {
      render(
        <PractitionerCard
          {...defaultProps}
          modalities={['Acupuncture', 'Herbs', 'Cupping', 'Moxibustion']}
        />
      )

      const badge = screen.getByText('+1')
      expect(badge).toHaveClass('border')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long names', () => {
      const longName = 'Dr. ' + 'A'.repeat(100)
      render(<PractitionerCard {...defaultProps} name={longName} />)

      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles very long titles', () => {
      const longTitle = 'Licensed Acupuncturist, ' + 'X'.repeat(100)
      render(<PractitionerCard {...defaultProps} title={longTitle} />)

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles many modalities', () => {
      const modalities = Array.from({ length: 10 }, (_, i) => `Modality ${i + 1}`)
      render(<PractitionerCard {...defaultProps} modalities={modalities} />)

      expect(screen.getByText('Modality 1')).toBeInTheDocument()
      expect(screen.getByText('Modality 2')).toBeInTheDocument()
      expect(screen.getByText('Modality 3')).toBeInTheDocument()
      expect(screen.getByText('+7')).toBeInTheDocument()
    })

    it('handles zero rating', () => {
      render(<PractitionerCard {...defaultProps} averageRating={0} reviewCount={5} />)

      expect(screen.getByText('0.0')).toBeInTheDocument()
    })

    it('handles large review count', () => {
      render(<PractitionerCard {...defaultProps} averageRating={4.5} reviewCount={9999} />)

      expect(screen.getByText('(9999)')).toBeInTheDocument()
    })

    it('handles special characters in name', () => {
      render(<PractitionerCard {...defaultProps} name="Dr. O'Brien-Smith" />)

      expect(screen.getByText("Dr. O'Brien-Smith")).toBeInTheDocument()
    })

    it('handles names with accents', () => {
      render(<PractitionerCard {...defaultProps} name="Dr. José García" />)

      expect(screen.getByText('Dr. José García')).toBeInTheDocument()
    })

    it('handles Asian characters in name', () => {
      render(<PractitionerCard {...defaultProps} name="Dr. 李明" />)

      expect(screen.getByText('Dr. 李明')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      expect(container.querySelector('a')).toBeInTheDocument()
    })

    it('provides accessible navigation link', () => {
      const { container } = render(<PractitionerCard {...defaultProps} />)

      const link = container.querySelector('a')
      expect(link).toHaveAttribute('href')
    })

    it('provides aria-label for verified icon', () => {
      render(<PractitionerCard {...defaultProps} verificationStatus="verified" />)

      const icon = screen.getByLabelText('Verified')
      expect(icon).toBeInTheDocument()
    })

    it('provides alt text for photo', () => {
      render(
        <PractitionerCard
          {...defaultProps}
          photo={{ url: 'https://example.com/photo.jpg', alt: 'Profile photo' }}
        />
      )

      const img = screen.getByAltText('Profile photo')
      expect(img).toBeInTheDocument()
    })
  })
})
