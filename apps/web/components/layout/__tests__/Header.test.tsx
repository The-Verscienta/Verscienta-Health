/**
 * Header Component Tests
 *
 * Tests navigation, links, translations, and responsive behavior
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Header } from '../Header'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const translations: Record<string, string> = {
      herbs: 'Herbs',
      formulas: 'Formulas',
      conditions: 'Conditions',
      modalities: 'Modalities',
      practitioners: 'Practitioners',
      symptomChecker: 'Symptom Checker',
    }
    return (key: string) => translations[key] || key
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

// Mock UserNav component
vi.mock('@/components/auth/UserNav', () => ({
  UserNav: () => <div data-testid="user-nav">User Nav</div>,
}))

// Mock LanguageSwitcher component
vi.mock('../LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}))

describe('Header', () => {
  describe('Rendering', () => {
    it('renders the header element', () => {
      const { container } = render(<Header />)

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders with correct styling classes', () => {
      const { container } = render(<Header />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('sticky')
      expect(header).toHaveClass('top-0')
      expect(header).toHaveClass('z-50')
      expect(header).toHaveClass('bg-white/95')
      expect(header).toHaveClass('backdrop-blur')
    })
  })

  describe('Logo', () => {
    it('renders the Verscienta logo', () => {
      render(<Header />)

      expect(screen.getByText('Verscienta')).toBeInTheDocument()
    })

    it('logo links to home page', () => {
      const { container } = render(<Header />)

      const logoLink = container.querySelector('a[href="/"]')
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toContainElement(screen.getByText('Verscienta'))
    })

    it('applies correct styling to logo', () => {
      render(<Header />)

      const logo = screen.getByText('Verscienta')
      expect(logo).toHaveClass('text-earth-900')
      expect(logo).toHaveClass('font-serif')
      expect(logo).toHaveClass('text-2xl')
      expect(logo).toHaveClass('font-bold')
    })
  })

  describe('Navigation Links', () => {
    it('renders all main navigation links', () => {
      render(<Header />)

      expect(screen.getByText('Herbs')).toBeInTheDocument()
      expect(screen.getByText('Formulas')).toBeInTheDocument()
      expect(screen.getByText('Conditions')).toBeInTheDocument()
      expect(screen.getByText('Modalities')).toBeInTheDocument()
      expect(screen.getByText('Practitioners')).toBeInTheDocument()
      expect(screen.getByText('Symptom Checker')).toBeInTheDocument()
    })

    it('herbs link has correct href', () => {
      const { container } = render(<Header />)

      const herbsLink = container.querySelector('a[href="/herbs"]')
      expect(herbsLink).toBeInTheDocument()
      expect(herbsLink).toHaveTextContent('Herbs')
    })

    it('formulas link has correct href', () => {
      const { container } = render(<Header />)

      const formulasLink = container.querySelector('a[href="/formulas"]')
      expect(formulasLink).toBeInTheDocument()
      expect(formulasLink).toHaveTextContent('Formulas')
    })

    it('conditions link has correct href', () => {
      const { container } = render(<Header />)

      const conditionsLink = container.querySelector('a[href="/conditions"]')
      expect(conditionsLink).toBeInTheDocument()
      expect(conditionsLink).toHaveTextContent('Conditions')
    })

    it('modalities link has correct href', () => {
      const { container } = render(<Header />)

      const modalitiesLink = container.querySelector('a[href="/modalities"]')
      expect(modalitiesLink).toBeInTheDocument()
      expect(modalitiesLink).toHaveTextContent('Modalities')
    })

    it('practitioners link has correct href', () => {
      const { container } = render(<Header />)

      const practitionersLink = container.querySelector('a[href="/practitioners"]')
      expect(practitionersLink).toBeInTheDocument()
      expect(practitionersLink).toHaveTextContent('Practitioners')
    })

    it('symptom checker link has correct href', () => {
      const { container } = render(<Header />)

      const symptomCheckerLink = container.querySelector('a[href="/symptom-checker"]')
      expect(symptomCheckerLink).toBeInTheDocument()
      expect(symptomCheckerLink).toHaveTextContent('Symptom Checker')
    })

    it('navigation links have hover styles', () => {
      const { container } = render(<Header />)

      const herbsLink = container.querySelector('a[href="/herbs"]')
      expect(herbsLink).toHaveClass('hover:text-earth-600')
      expect(herbsLink).toHaveClass('transition-colors')
    })
  })

  describe('Search Icon', () => {
    it('renders search link', () => {
      const { container } = render(<Header />)

      const searchLink = container.querySelector('a[href="/search"]')
      expect(searchLink).toBeInTheDocument()
    })

    it('search link has aria-label', () => {
      const { container } = render(<Header />)

      const searchLink = container.querySelector('a[href="/search"]')
      expect(searchLink).toHaveAttribute('aria-label', 'Search')
    })

    it('search link has correct styling', () => {
      const { container } = render(<Header />)

      const searchLink = container.querySelector('a[href="/search"]')
      expect(searchLink).toHaveClass('hover:bg-earth-50')
      expect(searchLink).toHaveClass('rounded-lg')
      expect(searchLink).toHaveClass('transition-colors')
    })
  })

  describe('Child Components', () => {
    it('renders LanguageSwitcher component', () => {
      render(<Header />)

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    })

    it('renders UserNav component', () => {
      render(<Header />)

      expect(screen.getByTestId('user-nav')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('navigation has md:flex class for responsive visibility', () => {
      const { container } = render(<Header />)

      const nav = container.querySelector('nav')
      expect(nav).toHaveClass('hidden')
      expect(nav).toHaveClass('md:flex')
    })

    it('header has correct height', () => {
      const { container } = render(<Header />)

      const headerContent = container.querySelector('.h-16')
      expect(headerContent).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('uses container-custom class', () => {
      const { container } = render(<Header />)

      const contentDiv = container.querySelector('.container-custom')
      expect(contentDiv).toBeInTheDocument()
    })

    it('has correct flexbox layout', () => {
      const { container } = render(<Header />)

      const contentDiv = container.querySelector('.container-custom')
      expect(contentDiv).toHaveClass('flex')
      expect(contentDiv).toHaveClass('items-center')
      expect(contentDiv).toHaveClass('justify-between')
    })

    it('actions section has correct spacing', () => {
      const { container } = render(<Header />)

      const actionsDiv = container.querySelectorAll('.space-x-2')[1] // Second space-x-2 div (actions)
      expect(actionsDiv).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('renders as semantic header element', () => {
      const { container } = render(<Header />)

      const header = container.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renders as semantic nav element', () => {
      const { container } = render(<Header />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('search link has accessible label', () => {
      const { container } = render(<Header />)

      const searchLink = container.querySelector('a[aria-label="Search"]')
      expect(searchLink).toBeInTheDocument()
    })

    it('all links are keyboard accessible', () => {
      const { container } = render(<Header />)

      const links = container.querySelectorAll('a')
      // Should have: logo, herbs, formulas, conditions, modalities, practitioners, symptom-checker, search
      expect(links.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('Translations', () => {
    it('uses translated navigation labels', () => {
      render(<Header />)

      // These would be translations keys in real app, but our mock returns the labels
      expect(screen.getByText('Herbs')).toBeInTheDocument()
      expect(screen.getByText('Formulas')).toBeInTheDocument()
      expect(screen.getByText('Conditions')).toBeInTheDocument()
      expect(screen.getByText('Modalities')).toBeInTheDocument()
      expect(screen.getByText('Practitioners')).toBeInTheDocument()
      expect(screen.getByText('Symptom Checker')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has border bottom', () => {
      const { container } = render(<Header />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('border-b')
      expect(header).toHaveClass('border-gray-200')
    })

    it('has backdrop blur', () => {
      const { container } = render(<Header />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('backdrop-blur')
    })

    it('uses proper z-index for sticky positioning', () => {
      const { container } = render(<Header />)

      const header = container.querySelector('header')
      expect(header).toHaveClass('z-50')
    })
  })
})
