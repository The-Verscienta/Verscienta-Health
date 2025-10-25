/**
 * Test utilities for next-intl components
 *
 * This file provides helper functions for testing components that use next-intl.
 * See: https://next-intl.dev/docs/environments/testing
 */

import { RenderOptions, render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { ReactElement, ReactNode } from 'react'

// Import English messages as default for tests
import enMessages from '@/messages/en.json'

type Messages = typeof enMessages

/**
 * Custom render function that wraps components with NextIntlClientProvider
 *
 * @example
 * ```tsx
 * import { renderWithIntl } from '@/lib/__tests__/test-utils'
 *
 * it('renders component with translations', () => {
 *   const { getByText } = renderWithIntl(<MyComponent />)
 *   expect(getByText('translated.text')).toBeInTheDocument()
 * })
 * ```
 */
export function renderWithIntl(
  ui: ReactElement,
  options?: {
    locale?: string
    messages?: any
    renderOptions?: Omit<RenderOptions, 'wrapper'>
  }
) {
  const { locale = 'en', messages = enMessages, renderOptions = {} } = options || {}

  // @ts-ignore - Type compatibility issue between React 19 and React 18 types
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages as any}>
        {children}
      </NextIntlClientProvider>
    )
  }

  // @ts-ignore - Type compatibility issue between React 19 and React 18 types
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Renders a component with Spanish translations
 *
 * @example
 * ```tsx
 * import { renderWithSpanish } from '@/lib/__tests__/test-utils'
 *
 * it('renders component in Spanish', async () => {
 *   const { getByText } = await renderWithSpanish(<MyComponent />)
 *   expect(getByText('texto traducido')).toBeInTheDocument()
 * })
 * ```
 */
export async function renderWithSpanish(
  ui: ReactElement,
  renderOptions?: Omit<RenderOptions, 'wrapper'>
) {
  const esMessages = await import('@/messages/es.json')
  return renderWithIntl(ui, { locale: 'es', messages: esMessages.default, renderOptions })
}

/**
 * Renders a component with Simplified Chinese translations
 */
export async function renderWithSimplifiedChinese(
  ui: ReactElement,
  renderOptions?: Omit<RenderOptions, 'wrapper'>
) {
  const zhCNMessages = await import('@/messages/zh-CN.json')
  return renderWithIntl(ui, { locale: 'zh-CN', messages: zhCNMessages.default, renderOptions })
}

/**
 * Renders a component with Traditional Chinese translations
 */
export async function renderWithTraditionalChinese(
  ui: ReactElement,
  renderOptions?: Omit<RenderOptions, 'wrapper'>
) {
  const zhTWMessages = await import('@/messages/zh-TW.json')
  return renderWithIntl(ui, { locale: 'zh-TW', messages: zhTWMessages.default, renderOptions })
}

/**
 * Mock messages for testing
 * Use this when you want to test with minimal translations
 */
export const mockMessages = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    filter: 'Filter',
    sort: 'Sort',
    clear: 'Clear',
    viewAll: 'View All',
    learnMore: 'Learn More',
    submit: 'Submit',
    tryAgain: 'Try Again',
  },
  modalities: {
    title: 'Modalities',
  },
  api: {
    title: 'API',
  },
  about: {
    title: 'About',
  },
  privacy: {
    title: 'Privacy',
  },
  terms: {
    title: 'Terms',
  },
  nav: {
    home: 'Home',
    herbs: 'Herbs',
    formulas: 'Formulas',
    conditions: 'Conditions',
    practitioners: 'Practitioners',
  },
  metadata: {
    siteName: 'Verscienta Health',
    title: 'Verscienta Health - Test',
  },
  faq: {},
} as const

/**
 * Renders a component with mock messages (minimal translations for faster tests)
 */
export function renderWithMockIntl(
  ui: ReactElement,
  renderOptions?: Omit<RenderOptions, 'wrapper'>
) {
  return renderWithIntl(ui, { messages: mockMessages as any, renderOptions })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
