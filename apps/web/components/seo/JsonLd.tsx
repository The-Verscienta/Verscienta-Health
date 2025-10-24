/**
 * JSON-LD Component for Structured Data
 *
 * Renders schema.org structured data as JSON-LD in <head>
 *
 * @see https://nextjs.org/docs/app/guides/json-ld
 */

import type { Thing, WithContext } from 'schema-dts'

interface JsonLdProps {
  data: WithContext<Thing> | WithContext<Thing>[]
}

/**
 * JSON-LD Component
 *
 * Usage:
 * ```tsx
 * import { JsonLd } from '@/components/seo/JsonLd'
 * import { generateHerbSchema } from '@/lib/json-ld'
 *
 * <JsonLd data={generateHerbSchema(herb)} />
 * ```
 */
export function JsonLd({ data }: JsonLdProps) {
  // If multiple schemas provided, render each separately
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
          />
        ))}
      </>
    )
  }

  // Single schema
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
    />
  )
}
