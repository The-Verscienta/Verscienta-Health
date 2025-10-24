# Testing Internationalization (i18n) with next-intl

This guide explains how to write tests for components that use next-intl for internationalization.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Test Utilities](#test-utilities)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Basic Example

```tsx
import { renderWithIntl, screen } from '@/lib/__tests__/test-utils'
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('common')
  return <button>{t('save')}</button>
}

it('renders translated button', () => {
  renderWithIntl(<MyComponent />)
  expect(screen.getByText('Save')).toBeInTheDocument()
})
```

## Configuration

### Vitest Setup

The `vitest.config.ts` has been configured to work with next-intl:

```ts
export default defineConfig({
  test: {
    // Required for next-intl: Process imports within next-intl
    deps: {
      inline: ['next-intl'],
    },
  },
})
```

**Why this is needed:** Vitest needs to transform imports from `next-intl` because the library uses ES modules. Without this configuration, you'll get import errors.

## Test Utilities

We provide several helper functions in `lib/__tests__/test-utils.tsx`:

### `renderWithIntl()`

Renders a component wrapped with `NextIntlClientProvider` using English messages by default.

```tsx
import { renderWithIntl } from '@/lib/__tests__/test-utils'

it('renders with default English locale', () => {
  renderWithIntl(<MyComponent />)
})
```

### `renderWithSpanish()`

Renders with Spanish translations:

```tsx
import { renderWithSpanish } from '@/lib/__tests__/test-utils'

it('renders in Spanish', async () => {
  await renderWithSpanish(<MyComponent />)
  expect(screen.getByText('Guardar')).toBeInTheDocument()
})
```

### `renderWithMockIntl()`

Renders with minimal mock messages for faster tests:

```tsx
import { renderWithMockIntl } from '@/lib/__tests__/test-utils'

it('renders with mock translations', () => {
  renderWithMockIntl(<MyComponent />)
})
```

### Custom Locales and Messages

```tsx
import { renderWithIntl } from '@/lib/__tests__/test-utils'

it('renders with custom messages', () => {
  const customMessages = {
    common: {
      save: 'Custom Save Text',
    },
  }

  renderWithIntl(<MyComponent />, {
    locale: 'en',
    messages: customMessages,
  })

  expect(screen.getByText('Custom Save Text')).toBeInTheDocument()
})
```

## Writing Tests

### Testing Basic Translations

```tsx
import { renderWithIntl, screen } from '@/lib/__tests__/test-utils'
import { useTranslations } from 'next-intl'

function WelcomeMessage() {
  const t = useTranslations('home')
  return <h1>{t('welcome')}</h1>
}

describe('WelcomeMessage', () => {
  it('displays welcome message', () => {
    renderWithIntl(<WelcomeMessage />)
    expect(screen.getByRole('heading')).toHaveTextContent('Welcome')
  })
})
```

### Testing Parameterized Translations

```tsx
function UserGreeting({ name }: { name: string }) {
  const t = useTranslations('common')
  return <h1>{t('greeting', { name })}</h1>
}

it('renders greeting with user name', () => {
  const messages = {
    common: {
      greeting: 'Hello {name}!',
    },
  }

  renderWithIntl(<UserGreeting name="Alice" />, { messages })
  expect(screen.getByRole('heading')).toHaveTextContent('Hello Alice!')
})
```

### Testing Multiple Locales

```tsx
describe('MultilingualComponent', () => {
  it('renders in English', () => {
    const { unmount } = renderWithIntl(<MyComponent />)
    expect(screen.getByText('Save')).toBeInTheDocument()
    unmount()
  })

  it('renders in Spanish', async () => {
    await renderWithSpanish(<MyComponent />)
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('renders in Chinese', async () => {
    const { renderWithSimplifiedChinese } = await import('@/lib/__tests__/test-utils')
    await renderWithSimplifiedChinese(<MyComponent />)
    expect(screen.getByText('保存')).toBeInTheDocument()
  })
})
```

### Testing Forms with Validation Messages

```tsx
function LoginForm() {
  const t = useTranslations('auth')
  const [error, setError] = useState('')

  return (
    <form>
      <input type="email" />
      {error && <span role="alert">{t('errors.invalidEmail')}</span>}
    </form>
  )
}

it('shows validation error in correct language', () => {
  const messages = {
    auth: {
      errors: {
        invalidEmail: 'Invalid email address',
      },
    },
  }

  renderWithIntl(<LoginForm />, { messages })
  // Trigger validation...
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address')
})
```

### Testing Navigation Components

```tsx
import { Link } from '@/i18n/routing'

function Navigation() {
  const t = useTranslations('nav')
  return (
    <nav>
      <Link href="/">{t('home')}</Link>
      <Link href="/herbs">{t('herbs')}</Link>
    </nav>
  )
}

it('renders navigation links with translations', () => {
  renderWithMockIntl(<Navigation />)

  expect(screen.getByText('Home')).toHaveAttribute('href', '/')
  expect(screen.getByText('Herbs')).toHaveAttribute('href', '/herbs')
})
```

### Testing Metadata Generation

For testing `generateMetadata` functions, you can mock the next-intl server functions:

```tsx
import { vi } from 'vitest'
import { generateMetadata } from '@/app/[lang]/herbs/[slug]/page'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn((options) => {
    return vi.fn((key) => {
      const messages = {
        'metadata.siteName': 'Verscienta Health',
        'notFound.title': 'Herb Not Found',
      }
      return messages[key] || key
    })
  }),
  setRequestLocale: vi.fn(),
}))

it('generates correct metadata for herb page', async () => {
  const metadata = await generateMetadata({
    params: Promise.resolve({ slug: 'ginseng', lang: 'en' }),
  })

  expect(metadata.title).toContain('Verscienta Health')
})
```

## Best Practices

### 1. Use Mock Messages for Unit Tests

For fast unit tests, use `renderWithMockIntl()` with minimal translations:

```tsx
// ✅ Good - Fast unit test
renderWithMockIntl(<Button />)

// ❌ Avoid - Loads full translation file
renderWithIntl(<Button />)
```

### 2. Test Actual Translations in Integration Tests

For integration tests, use real translation files:

```tsx
// ✅ Good - Tests real translations
await renderWithSpanish(<CompleteForm />)
```

### 3. Test One Locale Per Component

Unless testing locale-switching functionality, test components with a single locale:

```tsx
// ✅ Good - Tests component behavior
it('submits form with valid data', () => {
  renderWithMockIntl(<MyForm />)
  // Test form submission logic
})

// ❌ Unnecessary - Testing same logic in multiple locales
it('submits form in Spanish', async () => {
  await renderWithSpanish(<MyForm />)
  // Same logic as above
})
```

### 4. Use Data-Testid for Locale-Agnostic Tests

When text content varies by locale, use `data-testid`:

```tsx
function SubmitButton() {
  const t = useTranslations('common')
  return <button data-testid="submit-btn">{t('submit')}</button>
}

it('renders submit button', () => {
  renderWithMockIntl(<SubmitButton />)
  expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
})
```

### 5. Organize Tests by Feature, Not Locale

```tsx
// ✅ Good
describe('UserProfile', () => {
  describe('Editing', () => {
    it('saves changes')
    it('validates email')
  })

  describe('Display', () => {
    it('shows user name')
  })
})

// ❌ Avoid
describe('UserProfile in English', () => {})
describe('UserProfile in Spanish', () => {})
```

## Troubleshooting

### Error: "Cannot find module 'next-intl'"

**Solution:** Ensure `deps.inline: ['next-intl']` is in `vitest.config.ts`

### Error: "useTranslations() is not a function"

**Solution:** Make sure you're using `renderWithIntl()` or `renderWithMockIntl()` wrapper

### Error: "Translation key not found"

**Solution:** Either:
1. Add the key to your mock messages
2. Use `renderWithIntl()` with full message files
3. Provide custom messages to the render function

### Tests Run Slowly

**Solution:** Use `renderWithMockIntl()` instead of loading full translation files

### Async Component Testing Issues

For server components with async operations:

```tsx
// Define as non-async for testing
function MyComponent({ data }: { data: Promise<Data> }) {
  const resolved = use(data) // Use React.use() hook
  return <div>{resolved.title}</div>
}

// Test with pre-resolved data
it('renders component', () => {
  const mockData = { title: 'Test' }
  renderWithIntl(<MyComponent data={Promise.resolve(mockData)} />)
})
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test next-intl.test.tsx
```

## Additional Resources

- [next-intl Testing Docs](https://next-intl.dev/docs/environments/testing)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Project Testing Examples](./lib/__tests__/next-intl.test.tsx)

## Example Test Files

See these files for complete examples:

- `lib/__tests__/next-intl.test.tsx` - Comprehensive testing examples
- `lib/__tests__/test-utils.tsx` - Test utility functions
- `lib/__tests__/cloudflare-images.test.ts` - Example of non-i18n tests

---

**Last Updated:** 2025-10-18
**Documentation Version:** 1.0
