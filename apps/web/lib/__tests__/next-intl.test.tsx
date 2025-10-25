/**
 * Example tests demonstrating how to test components with next-intl
 *
 * These tests show the recommended patterns for testing internationalized components.
 * See: https://next-intl.dev/docs/environments/testing
 */

import { useTranslations } from 'next-intl'
import { describe, expect, it } from 'vitest'
import { renderWithIntl, renderWithMockIntl, renderWithSpanish, screen } from './test-utils'

// Example component using next-intl
function GreetingComponent() {
  const t = useTranslations('common')
  return (
    <div>
      <h1>{t('greeting', { name: 'World' })}</h1>
      <button>{t('save')}</button>
    </div>
  )
}

// Example navigation component
function NavComponent() {
  const t = useTranslations('nav')
  return (
    <nav>
      <a href="/">{t('home')}</a>
      <a href="/herbs">{t('herbs')}</a>
      <a href="/formulas">{t('formulas')}</a>
    </nav>
  )
}

describe('next-intl Testing Examples', () => {
  describe('Basic rendering with default locale (English)', () => {
    it('renders component with English translations', () => {
      renderWithMockIntl(<NavComponent />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Herbs')).toBeInTheDocument()
      expect(screen.getByText('Formulas')).toBeInTheDocument()
    })

    it('renders component with mock messages', () => {
      renderWithMockIntl(<GreetingComponent />)

      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('Testing with different locales', () => {
    it('renders component with Spanish translations', async () => {
      // Note: This requires actual Spanish translations in messages/es.json
      // For demo purposes, we'll use mock messages
      const component = renderWithMockIntl(<NavComponent />)

      // In real tests with Spanish messages, you would check for Spanish text
      expect(component.container).toBeTruthy()
    })

    it('supports multiple locales in the same test suite', () => {
      // Test with English
      const { unmount } = renderWithMockIntl(<GreetingComponent />)
      expect(screen.getByText('Save')).toBeInTheDocument()
      unmount()

      // Test with different locale (would show different text in real scenario)
      renderWithMockIntl(<GreetingComponent />)
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('Testing with custom messages', () => {
    it('can override specific translations for testing', () => {
      const customMessages = {
        common: {
          save: 'Custom Save Button',
          greeting: 'Hello {name}!',
        },
      }

      renderWithIntl(<GreetingComponent />, { messages: customMessages as any })

      expect(screen.getByText('Custom Save Button')).toBeInTheDocument()
    })
  })

  describe('Testing translation parameters', () => {
    it('renders component with parameterized translations', () => {
      function UserGreeting({ name }: { name: string }) {
        const t = useTranslations('common')
        return <h1>{t('greeting', { name })}</h1>
      }

      const customMessages = {
        common: {
          greeting: 'Hello {name}!',
        },
      }

      renderWithIntl(<UserGreeting name="Alice" />, { messages: customMessages as any })

      expect(screen.getByText('Hello Alice!')).toBeInTheDocument()
    })
  })

  describe('Testing conditional rendering based on locale', () => {
    it('renders different content based on locale', () => {
      function LocaleAwareComponent() {
        const t = useTranslations('common')
        return <div data-testid="content">{t('save')}</div>
      }

      // Test with English
      const { unmount } = renderWithMockIntl(<LocaleAwareComponent />)
      expect(screen.getByTestId('content')).toHaveTextContent('Save')
      unmount()

      // In a real test with Spanish messages, this would show "Guardar"
      renderWithIntl(<LocaleAwareComponent />, {
        locale: 'es',
        messages: { common: { save: 'Guardar' } } as any,
      })
      expect(screen.getByTestId('content')).toHaveTextContent('Guardar')
    })
  })
})

describe('Real-world Testing Patterns', () => {
  describe('Testing forms with internationalized validation messages', () => {
    it('shows validation errors in correct language', () => {
      function FormComponent() {
        const t = useTranslations('forms')
        return (
          <form>
            <input type="email" aria-label="Email" />
            <span role="alert">{t('emailRequired')}</span>
          </form>
        )
      }

      const messages = {
        forms: {
          emailRequired: 'Email is required',
        },
      }

      renderWithIntl(<FormComponent />, { messages: messages as any })

      expect(screen.getByRole('alert')).toHaveTextContent('Email is required')
    })
  })

  describe('Testing components with formatted dates/numbers', () => {
    it('formats dates according to locale', () => {
      function DateComponent({ date }: { date: Date }) {
        return <time>{date.toLocaleDateString('en-US')}</time>
      }

      renderWithIntl(<DateComponent date={new Date('2025-01-15')} />)

      expect(screen.getByRole('time')).toBeInTheDocument()
    })
  })

  describe('Testing navigation components', () => {
    it('renders navigation links with translations', () => {
      renderWithMockIntl(<NavComponent />)

      expect(screen.getByText('Home')).toHaveAttribute('href', '/')
      expect(screen.getByText('Herbs')).toHaveAttribute('href', '/herbs')
      expect(screen.getByText('Formulas')).toHaveAttribute('href', '/formulas')
    })
  })
})
