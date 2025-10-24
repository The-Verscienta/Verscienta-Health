# TypeScript Integration for next-intl

This guide explains how to use TypeScript with next-intl for type-safe internationalization.

## Overview

next-intl provides excellent TypeScript support out of the box. We've enhanced this with type declarations that provide:

- ✅ **Autocomplete** for translation keys
- ✅ **Compile-time validation** for missing translations
- ✅ **Type-safe parameters** for dynamic values
- ✅ **IDE integration** with IntelliSense

## Configuration

### Type Declaration File

We've created `types/next-intl.d.ts` that augments next-intl types with our message structure:

```typescript
// types/next-intl.d.ts
import type enMessages from '@/messages/en.json'

type Messages = typeof enMessages

declare global {
  interface IntlMessages extends Messages {}
}
```

This file is automatically included by TypeScript (specified in `tsconfig.json`).

## Usage Examples

### Basic Translation with Autocomplete

```tsx
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('common')

  // ✅ TypeScript will autocomplete 'save', 'cancel', 'delete', etc.
  return <button>{t('save')}</button>

  // ❌ TypeScript will show an error for non-existent keys
  // return <button>{t('nonExistentKey')}</button>
}
```

### Nested Translation Keys

```tsx
import { useTranslations } from 'next-intl'

function Navigation() {
  const t = useTranslations('nav')

  // ✅ Autocomplete shows: 'home', 'herbs', 'formulas', etc.
  return (
    <nav>
      <a href="/">{t('home')}</a>
      <a href="/herbs">{t('herbs')}</a>
    </nav>
  )
}
```

### Multiple Namespaces

```tsx
import { useTranslations } from 'next-intl'

function ComplexComponent() {
  // Get translations from different namespaces
  const commonT = useTranslations('common')
  const navT = useTranslations('nav')
  const homeT = useTranslations('home')

  return (
    <div>
      <button>{commonT('save')}</button>
      <nav>{navT('home')}</nav>
      <h1>{homeT('welcome')}</h1>
    </div>
  )
}
```

### Parameterized Translations (Type-Safe)

For parameterized translations, TypeScript will infer the required parameters:

```tsx
// In messages/en.json:
// {
//   "common": {
//     "greeting": "Hello {name}!"
//   }
// }

function Greeting({ userName }: { userName: string }) {
  const t = useTranslations('common')

  // ✅ TypeScript knows 'greeting' requires a 'name' parameter
  return <h1>{t('greeting', { name: userName })}</h1>

  // ❌ This would be a TypeScript error (missing 'name' parameter)
  // return <h1>{t('greeting')}</h1>
}
```

### Server Components

```tsx
import { getTranslations } from 'next-intl/server'

export default async function ServerComponent() {
  const t = await getTranslations('common')

  // ✅ Full autocomplete and type safety
  return <h1>{t('loading')}</h1>
}
```

### generateMetadata with Type Safety

```tsx
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const t = await getTranslations({ locale: lang, namespace: 'metadata' })

  // ✅ Autocomplete for metadata keys
  return {
    title: t('title'),
    description: t('description'),
  }
}
```

## Advanced Patterns

### Creating Typed Translation Hooks

You can create custom hooks with specific namespace types:

```tsx
import { useTranslations as useNextIntlTranslations } from 'next-intl'

// Type-safe hook for common translations
export function useCommonTranslations() {
  return useNextIntlTranslations('common')
}

// Type-safe hook for navigation translations
export function useNavTranslations() {
  return useNextIntlTranslations('nav')
}

// Usage
function MyComponent() {
  const t = useCommonTranslations()
  return <button>{t('save')}</button> // ✅ Autocomplete!
}
```

### Type-Safe Translation Keys as Constants

```tsx
// lib/translation-keys.ts
export const TRANSLATION_KEYS = {
  COMMON: {
    SAVE: 'common.save',
    CANCEL: 'common.cancel',
  },
  NAV: {
    HOME: 'nav.home',
    HERBS: 'nav.herbs',
  },
} as const

// Usage with type safety
function Component() {
  const t = useTranslations('common')
  const key: keyof IntlMessages['common'] = 'save'
  return <button>{t(key)}</button>
}
```

### Conditional Translations

```tsx
import { useTranslations } from 'next-intl'

function StatusMessage({ status }: { status: 'loading' | 'success' | 'error' }) {
  const t = useTranslations('common')

  // Map status to translation keys (type-safe)
  const message: Record<typeof status, keyof IntlMessages['common']> = {
    loading: 'loading',
    success: 'success',
    error: 'error',
  }

  return <div>{t(message[status])}</div>
}
```

## Type Checking Translation Files

### Ensuring Consistency Across Locales

TypeScript will catch if a translation key exists in one locale but not another:

```json
// messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}

// messages/es.json
{
  "common": {
    "save": "Guardar"
    // ❌ Missing 'cancel' - TypeScript will catch this!
  }
}
```

### Using JSON Schema for Validation

For additional validation, you can create a JSON schema:

```json
// schema/messages.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "common": {
      "type": "object",
      "required": ["save", "cancel", "delete"]
    }
  }
}
```

## IDE Configuration

### VSCode

VSCode will automatically provide IntelliSense for translation keys. For better experience:

1. Install "TypeScript Importer" extension
2. Install "Path Autocomplete" extension
3. Reload VSCode after adding new translation keys

### WebStorm / IntelliJ

WebStorm has built-in TypeScript support. It will automatically pick up the type declarations.

## Troubleshooting

### Autocomplete Not Working

**Solution 1:** Reload TypeScript Server
- VSCode: `Cmd/Ctrl + Shift + P` → "TypeScript: Reload Project"
- WebStorm: "File" → "Invalidate Caches / Restart"

**Solution 2:** Check tsconfig.json includes types
```json
{
  "include": ["types/**/*.ts", "**/*.ts", "**/*.tsx"]
}
```

**Solution 3:** Restart your IDE

### Type Errors in Translation Files

If you see errors like "Type 'X' is not assignable to type 'Y'":

1. Ensure all locale files have the same structure
2. Run `pnpm type-check` to see all TypeScript errors
3. Fix missing or extra keys in translation files

### Parameter Type Inference Not Working

Make sure you're using the correct syntax:

```tsx
// ✅ Correct
t('greeting', { name: 'Alice' })

// ❌ Incorrect (won't infer types)
t('greeting', 'Alice')
```

## Best Practices

### 1. Keep Translation Keys Consistent

```json
// ✅ Good - Consistent structure
{
  "auth": {
    "login": {
      "title": "Login",
      "submit": "Sign In"
    },
    "register": {
      "title": "Register",
      "submit": "Sign Up"
    }
  }
}

// ❌ Avoid - Inconsistent structure
{
  "auth": {
    "loginTitle": "Login",
    "login_submit": "Sign In",
    "registerHeading": "Register"
  }
}
```

### 2. Use Namespaces to Organize

```tsx
// ✅ Good - Clear namespace separation
useTranslations('auth.login')
useTranslations('auth.register')

// ❌ Avoid - Flat structure
useTranslations('authLoginTitle')
```

### 3. Type-Safe Default Values

```tsx
function Component() {
  const t = useTranslations('common')

  // ✅ Type-safe with fallback
  const text = t('save') || 'Save'

  // ✅ Better - use rich() for complex fallbacks
  return <button>{t.rich('save', { defaultValue: 'Save' })}</button>
}
```

### 4. Extract Reusable Translation Logic

```tsx
// lib/translations/helpers.ts
import type { IntlMessages } from '@/types/next-intl'

export function getErrorMessage(
  error: string,
  t: (key: keyof IntlMessages['errors']) => string
): string {
  return t(error as keyof IntlMessages['errors']) || 'Unknown error'
}
```

## Testing with TypeScript

```tsx
import { renderWithIntl } from '@/lib/__tests__/test-utils'
import type { Messages } from '@/types/next-intl'

it('renders with type-safe messages', () => {
  const messages: Partial<Messages> = {
    common: {
      save: 'Save',
      cancel: 'Cancel',
    },
  }

  renderWithIntl(<MyComponent />, { messages: messages as Messages })
})
```

## Generating Types from JSON

For advanced use cases, you can auto-generate types from JSON files:

```bash
# Install json-to-ts
pnpm add -D json-to-ts

# Generate types (add to package.json scripts)
json-to-ts messages/en.json > types/generated-messages.ts
```

## Resources

- [next-intl TypeScript Documentation](https://next-intl.dev/docs/workflows/typescript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)

---

**Last Updated:** 2025-10-18
**TypeScript Version:** 5.7+
**next-intl Version:** 3.x+
