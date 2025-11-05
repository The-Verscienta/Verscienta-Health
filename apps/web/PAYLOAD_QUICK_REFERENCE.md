# Payload CMS Quick Reference

## 🚀 Common Patterns: Strapi → Payload

### Basic Setup
```typescript
// Import Payload
import { getPayload } from 'payload'
import config from '@payload-config'

// Get Payload instance
const payload = await getPayload({ config })
```

---

## 📖 Reading Data

### Get All Items (Paginated)

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs?pagination[page]=1&pagination[pageSize]=10`)
const data = await response.json()
const herbs = data.data
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  limit: 10,
  page: 1
})
const herbs = result.docs
```

### Get Single Item by Slug

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs?filters[slug][$eq]=ginseng`)
const data = await response.json()
const herb = data.data[0]
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  where: {
    slug: { equals: 'ginseng' }
  },
  limit: 1
})
const herb = result.docs[0]
```

### Get Published Items Only

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs?filters[publishedAt][$notNull]=true`)
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  where: {
    _status: { equals: 'published' }
  }
})
```

---

## 🔍 Filtering & Searching

### Text Search

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs?filters[title][$contains]=ginseng`)
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  where: {
    title: { contains: 'ginseng' }
  }
})
```

### Multiple Conditions (AND)

**Before (Strapi):**
```typescript
const response = await fetch(
  `${STRAPI_URL}/api/herbs?filters[tcmCategory]=tonifying&filters[averageRating][$gte]=4`
)
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  where: {
    and: [
      { 'tcmProperties.tcmCategory': { equals: 'tonifying' } },
      { averageRating: { greater_than_equal: 4 } }
    ]
  }
})
```

### Multiple Conditions (OR)

**Before (Strapi):**
```typescript
const response = await fetch(
  `${STRAPI_URL}/api/herbs?filters[$or][0][title][$contains]=ginseng&filters[$or][1][scientificName][$contains]=ginseng`
)
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  where: {
    or: [
      { title: { contains: 'ginseng' } },
      { 'botanicalInfo.scientificName': { contains: 'ginseng' } }
    ]
  }
})
```

---

## 📝 Creating Data

### Create New Item

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      title: 'Ginseng',
      slug: 'ginseng'
    }
  })
})
```

**After (Payload):**
```typescript
const herb = await payload.create({
  collection: 'herbs',
  data: {
    title: 'Ginseng',
    slug: 'ginseng',
    _status: 'draft' // or 'published'
  }
})
```

---

## ✏️ Updating Data

### Update Existing Item

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      averageRating: 4.5
    }
  })
})
```

**After (Payload):**
```typescript
const herb = await payload.update({
  collection: 'herbs',
  id,
  data: {
    averageRating: 4.5
  }
})
```

---

## 🗑️ Deleting Data

### Delete Item

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs/${id}`, {
  method: 'DELETE'
})
```

**After (Payload):**
```typescript
await payload.delete({
  collection: 'herbs',
  id
})
```

---

## 🔗 Relationships & Population

### Populate Relationships

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/formulas?populate=*`)
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'formulas',
  depth: 2 // Populate relationships 2 levels deep
})

// Access populated data
result.docs[0].ingredients.forEach(ing => {
  console.log(ing.herb.title) // Herb is populated
})
```

### Specific Field Population

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'formulas',
  depth: 1,
  // Payload auto-populates based on relationship fields
})
```

---

## 📄 Pagination

### Get Specific Page

**Before (Strapi):**
```typescript
const response = await fetch(
  `${STRAPI_URL}/api/herbs?pagination[page]=2&pagination[pageSize]=20`
)
const data = await response.json()
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  page: 2,
  limit: 20
})

console.log(result.docs) // Current page items
console.log(result.totalDocs) // Total count
console.log(result.totalPages) // Total pages
console.log(result.hasNextPage) // Boolean
console.log(result.hasPrevPage) // Boolean
```

---

## 🎯 Sorting

### Sort Results

**Before (Strapi):**
```typescript
const response = await fetch(`${STRAPI_URL}/api/herbs?sort=createdAt:desc`)
```

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  sort: '-createdAt' // Descending (newest first)
  // or
  sort: 'title' // Ascending (A-Z)
})
```

### Multiple Sort Fields

**After (Payload):**
```typescript
const result = await payload.find({
  collection: 'herbs',
  sort: '-averageRating,title' // Rating desc, then title asc
})
```

---

## 🔐 Server Components (Next.js)

### Basic Page Component

```typescript
// app/[lang]/herbs/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { HerbCard } from '@/components/cards/HerbCard'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function HerbsPage({ params, searchParams }: PageProps) {
  const { lang } = await params
  const { page = '1', q } = await searchParams

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'herbs',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(q
          ? [
              {
                or: [
                  { title: { contains: q } },
                  { 'botanicalInfo.scientificName': { contains: q } }
                ]
              }
            ]
          : [])
      ]
    },
    limit: 20,
    page: parseInt(page),
    sort: '-createdAt'
  })

  return (
    <div>
      <h1>Herbs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.docs.map(herb => (
          <HerbCard key={herb.id} herb={herb} />
        ))}
      </div>
      {/* Pagination component */}
    </div>
  )
}
```

### Detail Page Component

```typescript
// app/[lang]/herbs/[slug]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export default async function HerbDetailPage({ params }: PageProps) {
  const { lang, slug } = await params

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'herbs',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }]
    },
    limit: 1,
    depth: 2 // Populate relationships
  })

  const herb = result.docs[0]

  if (!herb) {
    notFound()
  }

  return (
    <div>
      <h1>{herb.title}</h1>
      <p>{herb.botanicalInfo.scientificName}</p>
      {/* Render herb details */}
    </div>
  )
}
```

---

## 🌐 API Routes

### GET Endpoint

```typescript
// app/api/herbs/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'herbs',
      where: {
        slug: { equals: slug }
      },
      limit: 1
    })

    const herb = result.docs[0]

    if (!herb) {
      return NextResponse.json({ error: 'Herb not found' }, { status: 404 })
    }

    return NextResponse.json(herb)
  } catch (error) {
    console.error('Error fetching herb:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### POST Endpoint

```typescript
// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const payload = await getPayload({ config })

    const review = await payload.create({
      collection: 'reviews',
      data: {
        title: body.title,
        content: body.content,
        rating: body.rating,
        reviewedEntity: body.reviewedEntity,
        reviewedEntityType: body.reviewedEntityType,
        author: session.user.id,
        moderationStatus: 'pending',
        _status: 'published'
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 🎨 TypeScript Types

### Import Generated Types

```typescript
import type { Herb, Formula, Condition, User } from '@/types/payload-types'

// Use in components
interface HerbCardProps {
  herb: Herb
}

export function HerbCard({ herb }: HerbCardProps) {
  return (
    <div>
      <h3>{herb.title}</h3>
      <p>{herb.botanicalInfo?.scientificName}</p>
      {/* TypeScript autocomplete for all fields */}
    </div>
  )
}
```

### Type-Safe Queries

```typescript
import type { Herb } from '@/types/payload-types'

const result = await payload.find({
  collection: 'herbs'
})

// result.docs is typed as Herb[]
result.docs.forEach((herb: Herb) => {
  console.log(herb.title)
  console.log(herb.botanicalInfo.scientificName)
  // TypeScript knows all available fields
})
```

---

## ⚡ Performance Tips

### Use Depth Wisely

```typescript
// Slow: Populates everything
const result = await payload.find({
  collection: 'formulas',
  depth: 10 // Too deep!
})

// Fast: Only populate what you need
const result = await payload.find({
  collection: 'formulas',
  depth: 1 // Just immediate relationships
})
```

### Limit Fields (Select)

```typescript
// Get only specific fields
const result = await payload.find({
  collection: 'herbs',
  select: {
    title: true,
    slug: true,
    'botanicalInfo.scientificName': true
  }
})
```

### Add Caching (DragonflyDB)

```typescript
import { redis } from '@/lib/redis'

// Try cache first
const cacheKey = `herb:${slug}`
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

// Query Payload
const result = await payload.find({
  collection: 'herbs',
  where: { slug: { equals: slug } }
})

// Cache result (1 hour TTL)
await redis.setex(cacheKey, 3600, JSON.stringify(result.docs[0]))

return result.docs[0]
```

---

## 🔑 Query Operators

| Operator | Payload | Example |
|----------|---------|---------|
| Equals | `equals` | `{ slug: { equals: 'ginseng' } }` |
| Not equals | `not_equals` | `{ status: { not_equals: 'draft' } }` |
| Greater than | `greater_than` | `{ rating: { greater_than: 4 } }` |
| Greater than or equal | `greater_than_equal` | `{ rating: { greater_than_equal: 4 } }` |
| Less than | `less_than` | `{ price: { less_than: 50 } }` |
| Less than or equal | `less_than_equal` | `{ price: { less_than_equal: 50 } }` |
| Like / Contains | `contains` | `{ title: { contains: 'ginseng' } }` |
| In array | `in` | `{ category: { in: ['tonifying', 'warming'] } }` |
| Not in array | `not_in` | `{ status: { not_in: ['archived', 'deleted'] } }` |
| Exists | `exists` | `{ featuredImage: { exists: true } }` |

---

## 📚 Resources

- **Migration Guide**: `PAYLOAD_MIGRATION.md`
- **Generated Types**: `types/payload-types.ts`
- **Payload Config**: `payload/payload.config.ts`
- **Collections**: `payload/collections/*.ts`
- **Payload Docs**: https://payloadcms.com/docs

---

## 🆘 Common Issues

### Issue: "Cannot find module '@payload-config'"

**Solution:** Check `tsconfig.json` has correct path:
```json
{
  "compilerOptions": {
    "paths": {
      "@payload-config": ["./payload/payload.config.ts"]
    }
  }
}
```

### Issue: "getPayload is not a function"

**Solution:** Make sure you're importing from the correct package:
```typescript
import { getPayload } from 'payload' // ✅ Correct
import { getPayload } from '@payloadcms/next' // ❌ Wrong
```

### Issue: "_status field not found"

**Solution:** Make sure collection has `versions.drafts: true`:
```typescript
export const Herbs: CollectionConfig = {
  slug: 'herbs',
  versions: {
    drafts: true // ✅ Enables _status field
  }
}
```

---

**Quick Reference Last Updated**: November 2, 2025
