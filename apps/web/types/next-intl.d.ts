/**
 * TypeScript augmentation for next-intl
 *
 * This file provides type safety for translation keys and enables autocomplete
 * in your IDE when using next-intl's translation functions.
 *
 * See: https://next-intl.dev/docs/workflows/typescript
 */

import type enMessages from '@/messages/en.json'

type Messages = typeof enMessages

declare global {
  // Use type safe messages keys with `next-intl`
  interface IntlMessages extends Messages {}
}

// Export the Messages type for use in other files
export type { Messages }
