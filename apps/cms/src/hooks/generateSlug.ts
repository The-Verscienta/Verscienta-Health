import type { FieldHook } from 'payload'

/**
 * Generate a URL-friendly slug from a field value
 * @param fieldName - The field to use for slug generation
 */
export const generateSlug =
  (fieldName: string): FieldHook =>
  ({ data, operation, value }) => {
    if (operation === 'create' || !value) {
      const sourceValue = data?.[fieldName]

      if (sourceValue && typeof sourceValue === 'string') {
        return sourceValue
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
          .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      }
    }

    return value
  }
