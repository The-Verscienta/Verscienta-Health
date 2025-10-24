# Storybook Integration for next-intl

This guide explains how to use next-intl internationalization in Storybook stories.

## Overview

Storybook is fully integrated with next-intl, allowing you to:

- ✅ Preview components in all 4 supported locales
- ✅ Switch locales using the toolbar
- ✅ Test translations visually
- ✅ Document internationalized components

## Quick Start

### Running Storybook

```bash
# Start Storybook development server
pnpm storybook

# Build Storybook for production
pnpm build-storybook
```

Storybook will open at `http://localhost:6006`

### Switching Locales

1. Open any story
2. Click the **globe icon** (🌐) in the toolbar
3. Select a locale: English, Español, 简体中文, or 繁體中文
4. The component will re-render with the selected language

## Writing Internationalized Stories

### Basic Example

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

function MyComponent() {
  const t = useTranslations('common')
  return <button>{t('save')}</button>
}

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Override locale for specific story
export const Spanish: Story = {
  parameters: {
    locale: 'es',
  },
}
```

### Using Multiple Namespaces

```tsx
import { useTranslations } from 'next-intl'

function NavigationComponent() {
  const navT = useTranslations('nav')
  const commonT = useTranslations('common')

  return (
    <nav>
      <a href="/">{navT('home')}</a>
      <button>{commonT('search')}</button>
    </nav>
  )
}

const meta = {
  title: 'Components/Navigation',
  component: NavigationComponent,
} satisfies Meta<typeof NavigationComponent>

export default meta
```

### Parameterized Translations

```tsx
function UserGreeting({ name }: { name: string }) {
  const t = useTranslations('common')
  return <h1>{t('greeting', { name })}</h1>
}

const meta = {
  title: 'Components/UserGreeting',
  component: UserGreeting,
  argTypes: {
    name: {
      control: 'text',
      description: 'User name for greeting',
    },
  },
} satisfies Meta<typeof UserGreeting>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Alice',
  },
}

export const Spanish: Story = {
  args: {
    name: 'María',
  },
  parameters: {
    locale: 'es',
  },
}
```

### Form Components

```tsx
function LoginForm() {
  const t = useTranslations('auth')

  return (
    <form>
      <label>{t('emailLabel')}</label>
      <input type="email" placeholder={t('emailPlaceholder')} />

      <label>{t('passwordLabel')}</label>
      <input type="password" placeholder={t('passwordPlaceholder')} />

      <button type="submit">{t('loginButton')}</button>
    </form>
  )
}

const meta = {
  title: 'Forms/Login',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LoginForm>

export default meta
```

## Advanced Patterns

### Testing All Locales

Create stories for each locale to visually test translations:

```tsx
const meta = {
  title: 'Components/MultilocaleExample',
  component: MyComponent,
} satisfies Meta<typeof MyComponent>

export default meta
type Story = StoryObj<typeof meta>

export const English: Story = {
  parameters: { locale: 'en' },
}

export const Spanish: Story = {
  parameters: { locale: 'es' },
}

export const SimplifiedChinese: Story = {
  parameters: { locale: 'zh-CN' },
}

export const TraditionalChinese: Story = {
  parameters: { locale: 'zh-TW' },
}
```

### Using Custom Messages in Stories

For testing edge cases or specific scenarios:

```tsx
import { NextIntlClientProvider } from 'next-intl'

function ComponentWithCustomMessages() {
  const t = useTranslations('custom')
  return <div>{t('message')}</div>
}

const meta = {
  title: 'Components/CustomMessages',
  component: ComponentWithCustomMessages,
  decorators: [
    (Story) => (
      <NextIntlClientProvider
        locale="en"
        messages={{
          custom: {
            message: 'Custom test message',
          },
        }}
      >
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof ComponentWithCustomMessages>

export default meta
```

### Documenting Translation Keys

Add documentation about required translations:

```tsx
const meta = {
  title: 'Components/DocumentedComponent',
  component: MyComponent,
  parameters: {
    docs: {
      description: {
        component: `
          This component uses the following translation keys:
          - \`common.save\` - Save button text
          - \`common.cancel\` - Cancel button text
          - \`common.delete\` - Delete button text

          Switch locales using the toolbar to see translations.
        `,
      },
    },
  },
} satisfies Meta<typeof MyComponent>

export default meta
```

### Interactive Locale Switching

Create stories that demonstrate locale switching behavior:

```tsx
import { useState } from 'react'

export const InteractiveLocale: Story = {
  render: () => {
    const [locale, setLocale] = useState('en')

    return (
      <div>
        <select value={locale} onChange={(e) => setLocale(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="zh-CN">简体中文</option>
          <option value="zh-TW">繁體中文</option>
        </select>

        <NextIntlClientProvider locale={locale} messages={messages[locale]}>
          <MyComponent />
        </NextIntlClientProvider>
      </div>
    )
  },
}
```

## Configuration

The Storybook configuration is in `.storybook/preview.tsx`:

```tsx
// Automatically wraps all stories with NextIntlClientProvider
decorators: [
  (Story, context) => {
    const locale = context.globals.locale || 'en'
    return (
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        <Story />
      </NextIntlClientProvider>
    )
  },
]

// Adds locale switcher to toolbar
globalTypes: {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    toolbar: {
      icon: 'globe',
      items: ['en', 'es', 'zh-CN', 'zh-TW'].map((locale) => ({
        value: locale,
        title: localeNames[locale],
      })),
    },
  },
}
```

## Best Practices

### 1. Use Descriptive Story Names

```tsx
// ✅ Good - Clear what's being tested
export const SaveButtonInEnglish: Story = {}
export const SaveButtonInSpanish: Story = { parameters: { locale: 'es' } }

// ❌ Avoid - Unclear naming
export const Story1: Story = {}
export const Story2: Story = {}
```

### 2. Document Required Translation Keys

```tsx
/**
 * This component requires these translation keys:
 * - common.save
 * - common.cancel
 * - errors.invalidInput
 */
function MyComponent() {
  // ...
}
```

### 3. Test Edge Cases

```tsx
export const LongText: Story = {
  parameters: {
    locale: 'de', // German often has longer words
  },
}

export const RTLLanguage: Story = {
  parameters: {
    locale: 'ar', // Test right-to-left languages
    direction: 'rtl',
  },
}
```

### 4. Group Related Stories

```tsx
const meta = {
  title: 'Forms/Login/Translations',
  component: LoginForm,
} satisfies Meta<typeof LoginForm>

// All translation variants in one place
export const English: Story = { parameters: { locale: 'en' } }
export const Spanish: Story = { parameters: { locale: 'es' } }
export const Chinese: Story = { parameters: { locale: 'zh-CN' } }
```

### 5. Use Args for Dynamic Content

```tsx
export const WithCustomName: Story = {
  args: {
    userName: 'Test User',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates parameterized translations with custom user name',
      },
    },
  },
}
```

## Troubleshooting

### Translations Not Appearing

**Problem:** Component shows translation keys instead of translated text

**Solutions:**
1. Check that the key exists in `messages/[locale].json`
2. Verify you're using the correct namespace: `useTranslations('namespace')`
3. Ensure Storybook is running (restart if needed)

### Locale Switcher Not Working

**Problem:** Changing locale doesn't update the component

**Solution:** Clear Storybook cache and restart:

```bash
# Clear Storybook cache
rm -rf .storybook/cache
rm -rf storybook-static

# Restart Storybook
pnpm storybook
```

### TypeScript Errors

**Problem:** TypeScript complains about missing translation keys

**Solution:**
1. Ensure `types/next-intl.d.ts` is in your project
2. Run `pnpm type-check` to see all errors
3. Restart your TypeScript server in VSCode

### Missing Locale in Toolbar

**Problem:** Only English shows in toolbar

**Solution:** Check `.storybook/preview.tsx` includes all locales:

```tsx
globalTypes: {
  locale: {
    toolbar: {
      items: ['en', 'es', 'zh-CN', 'zh-TW'], // All 4 locales
    },
  },
}
```

## Examples

See these files for complete examples:

- `components/examples/TranslatedButton.stories.tsx` - Basic internationalized component
- `.storybook/preview.tsx` - Storybook configuration
- `lib/__tests__/test-utils.tsx` - Testing utilities (similar patterns)

## Testing Workflow

1. **Create Component** - Build component with next-intl
2. **Write Story** - Create Storybook story
3. **Test in English** - Verify component works
4. **Switch Locales** - Use toolbar to test all languages
5. **Document** - Add documentation about translation keys
6. **Review** - Have translators review in Storybook

## Integration with Testing

Storybook stories can be used in tests:

```tsx
import { composeStories } from '@storybook/react'
import { render } from '@testing-library/react'
import * as stories from './MyComponent.stories'

const { Default, Spanish } = composeStories(stories)

it('renders in English', () => {
  render(<Default />)
  // Test assertions
})

it('renders in Spanish', () => {
  render(<Spanish />)
  // Test assertions
})
```

## Resources

- [Storybook Documentation](https://storybook.js.org/)
- [next-intl Storybook Docs](https://next-intl.dev/docs/workflows/storybook)
- [Example Story](../components/examples/TranslatedButton.stories.tsx)

---

**Last Updated:** 2025-10-18
**Storybook Version:** 8.x
**next-intl Version:** 3.x
