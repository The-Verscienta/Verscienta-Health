/**
 * Footer Component Tests
 *
 * Tests footer links, sections, translations, and responsive layout
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Footer } from '../Footer'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const translations: Record<string, Record<string, string>> = {
      nav: {
        herbs: 'Herbs',
        formulas: 'Formulas',
        conditions: 'Conditions',
        practitioners: 'Practitioners',
        symptomChecker: 'Symptom Checker',
        modalities: 'Modalities',
        about: 'About',
        contact: 'Contact',
      },
      footer: {
        tagline: 'Evidence-based natural health solutions',
        quickLinks: 'Quick Links',
        legal: 'Legal',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        disclaimer: 'Disclaimer',
        copyright: '© 2025 Verscienta Health. All rights reserved.',
      },
    }

    return (key: string) => {
      if (!namespace) {
        // Root translations - handle nested keys like 'nav.herbs'
        const [section, subkey] = key.split('.')
        return translations[section]?.[subkey] || key
      }
      return translations[namespace]?.[key] || key
    }
  },
}))

// Mock next-intl routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Footer', () => {
  describe('Rendering', () => {
    it('renders the footer element', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('renders with correct styling classes', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('bg-earth-50')
      expect(footer).toHaveClass('border-t')
      expect(footer).toHaveClass('border-gray-200')
    })
  })

  describe('Brand Section', () => {
    it('renders Verscienta Health brand name', () => {
      render(<Footer />)

      expect(screen.getByText('Verscienta Health')).toBeInTheDocument()
    })

    it('renders tagline', () => {
      render(<Footer />)

      expect(screen.getByText('Evidence-based natural health solutions')).toBeInTheDocument()
    })

    it('brand name has correct styling', () => {
      render(<Footer />)

      const brandName = screen.getByText('Verscienta Health')
      expect(brandName).toHaveClass('text-earth-900')
      expect(brandName).toHaveClass('font-serif')
      expect(brandName).toHaveClass('font-bold')
    })
  })

  describe('Quick Links Section', () => {
    it('renders Quick Links heading', () => {
      render(<Footer />)

      expect(screen.getByText('Quick Links')).toBeInTheDocument()
    })

    it('renders herbs link', () => {
      const { container } = render(<Footer />)

      const herbsLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/herbs' && link.textContent === 'Herbs'
      )
      expect(herbsLink).toBeInTheDocument()
    })

    it('renders formulas link', () => {
      const { container } = render(<Footer />)

      const formulasLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/formulas' && link.textContent === 'Formulas'
      )
      expect(formulasLink).toBeInTheDocument()
    })

    it('renders conditions link', () => {
      const { container } = render(<Footer />)

      const conditionsLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/conditions' && link.textContent === 'Conditions'
      )
      expect(conditionsLink).toBeInTheDocument()
    })

    it('renders practitioners link', () => {
      const { container } = render(<Footer />)

      const practitionersLink = Array.from(container.querySelectorAll('a')).find(
        (link) =>
          link.getAttribute('href') === '/practitioners' && link.textContent === 'Practitioners'
      )
      expect(practitionersLink).toBeInTheDocument()
    })
  })

  describe('Resources/About Section', () => {
    it('renders About heading', () => {
      render(<Footer />)

      // "About" appears as section heading
      const headings = screen.getAllByText('About')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('renders symptom checker link', () => {
      const { container } = render(<Footer />)

      const symptomCheckerLink = Array.from(container.querySelectorAll('a')).find(
        (link) =>
          link.getAttribute('href') === '/symptom-checker' &&
          link.textContent === 'Symptom Checker'
      )
      expect(symptomCheckerLink).toBeInTheDocument()
    })

    it('renders modalities link', () => {
      const { container } = render(<Footer />)

      const modalitiesLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/modalities' && link.textContent === 'Modalities'
      )
      expect(modalitiesLink).toBeInTheDocument()
    })

    it('renders about link', () => {
      const { container } = render(<Footer />)

      const aboutLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/about' && link.textContent === 'About'
      )
      expect(aboutLink).toBeInTheDocument()
    })

    it('renders contact link', () => {
      const { container } = render(<Footer />)

      const contactLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/contact' && link.textContent === 'Contact'
      )
      expect(contactLink).toBeInTheDocument()
    })
  })

  describe('Legal Section', () => {
    it('renders Legal heading', () => {
      render(<Footer />)

      expect(screen.getByText('Legal')).toBeInTheDocument()
    })

    it('renders privacy policy link', () => {
      const { container } = render(<Footer />)

      const privacyLink = Array.from(container.querySelectorAll('a')).find(
        (link) =>
          link.getAttribute('href') === '/privacy' && link.textContent === 'Privacy Policy'
      )
      expect(privacyLink).toBeInTheDocument()
    })

    it('renders terms of service link', () => {
      const { container } = render(<Footer />)

      const termsLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/terms' && link.textContent === 'Terms of Service'
      )
      expect(termsLink).toBeInTheDocument()
    })

    it('renders disclaimer link', () => {
      const { container } = render(<Footer />)

      const disclaimerLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/disclaimer' && link.textContent === 'Disclaimer'
      )
      expect(disclaimerLink).toBeInTheDocument()
    })
  })

  describe('Copyright', () => {
    it('renders copyright notice', () => {
      render(<Footer />)

      expect(screen.getByText('© 2025 Verscienta Health. All rights reserved.')).toBeInTheDocument()
    })

    it('copyright notice has correct styling', () => {
      render(<Footer />)

      const copyright = screen.getByText('© 2025 Verscienta Health. All rights reserved.')
      expect(copyright).toHaveClass('text-sm')
      expect(copyright).toHaveClass('text-gray-600')
    })

    it('copyright section has border top', () => {
      const { container } = render(<Footer />)

      const copyrightSection = container.querySelector('.border-t.pt-8')
      expect(copyrightSection).toBeInTheDocument()
    })
  })

  describe('Responsive Layout', () => {
    it('uses grid layout', () => {
      const { container } = render(<Footer />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('has responsive grid columns', () => {
      const { container } = render(<Footer />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-4')
    })

    it('has correct spacing', () => {
      const { container } = render(<Footer />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('gap-8')
    })
  })

  describe('Link Styling', () => {
    it('links have hover styles', () => {
      const { container } = render(<Footer />)

      const herbsLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/herbs' && link.textContent === 'Herbs'
      )
      expect(herbsLink).toHaveClass('hover:text-earth-600')
      expect(herbsLink).toHaveClass('transition-colors')
    })

    it('links have text color', () => {
      const { container } = render(<Footer />)

      const herbsLink = Array.from(container.querySelectorAll('a')).find(
        (link) => link.getAttribute('href') === '/herbs' && link.textContent === 'Herbs'
      )
      expect(herbsLink).toHaveClass('text-gray-600')
    })
  })

  describe('Dark Mode Support', () => {
    it('footer has dark mode classes', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toHaveClass('dark:bg-gray-900')
    })

    it('brand name has dark mode class', () => {
      render(<Footer />)

      const brandName = screen.getByText('Verscienta Health')
      expect(brandName).toHaveClass('dark:text-earth-100')
    })

    it('tagline has dark mode class', () => {
      render(<Footer />)

      const tagline = screen.getByText('Evidence-based natural health solutions')
      expect(tagline).toHaveClass('dark:text-gray-400')
    })

    it('section headings have dark mode class', () => {
      render(<Footer />)

      const legalHeading = screen.getByText('Legal')
      expect(legalHeading).toHaveClass('dark:text-white')
    })
  })

  describe('Accessibility', () => {
    it('renders as semantic footer element', () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })

    it('all links are keyboard accessible', () => {
      const { container } = render(<Footer />)

      const links = container.querySelectorAll('a')
      // Should have: 4 quick links + 4 resources + 3 legal = 11 links
      expect(links.length).toBe(11)
    })

    it('section headings use appropriate heading tags', () => {
      const { container } = render(<Footer />)

      const h3 = container.querySelector('h3')
      expect(h3).toHaveTextContent('Verscienta Health')

      const h4Elements = container.querySelectorAll('h4')
      expect(h4Elements.length).toBe(3) // Quick Links, About, Legal
    })
  })

  describe('Container', () => {
    it('uses container-custom class', () => {
      const { container } = render(<Footer />)

      const contentDiv = container.querySelector('.container-custom')
      expect(contentDiv).toBeInTheDocument()
    })

    it('has correct padding', () => {
      const { container } = render(<Footer />)

      const contentDiv = container.querySelector('.container-custom')
      expect(contentDiv).toHaveClass('py-12')
    })
  })

  describe('Translations', () => {
    it('uses translated section headings', () => {
      render(<Footer />)

      expect(screen.getByText('Quick Links')).toBeInTheDocument()
      expect(screen.getByText('Legal')).toBeInTheDocument()
    })

    it('uses translated link labels', () => {
      render(<Footer />)

      expect(screen.getByText('Herbs')).toBeInTheDocument()
      expect(screen.getByText('Formulas')).toBeInTheDocument()
      expect(screen.getByText('Conditions')).toBeInTheDocument()
      expect(screen.getByText('Practitioners')).toBeInTheDocument()
      expect(screen.getByText('Symptom Checker')).toBeInTheDocument()
      expect(screen.getByText('Modalities')).toBeInTheDocument()
    })

    it('uses translated legal labels', () => {
      render(<Footer />)

      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
      expect(screen.getByText('Disclaimer')).toBeInTheDocument()
    })
  })

  describe('Complete Structure', () => {
    it('renders all four columns', () => {
      const { container } = render(<Footer />)

      const columns = container.querySelectorAll('.grid > div')
      expect(columns.length).toBe(4)
    })

    it('has brand, quick links, resources, and legal sections', () => {
      render(<Footer />)

      expect(screen.getByText('Verscienta Health')).toBeInTheDocument()
      expect(screen.getByText('Quick Links')).toBeInTheDocument()
      expect(screen.getByText('Legal')).toBeInTheDocument()
    })

    it('has copyright section at bottom', () => {
      render(<Footer />)

      expect(screen.getByText('© 2025 Verscienta Health. All rights reserved.')).toBeInTheDocument()
    })
  })
})
