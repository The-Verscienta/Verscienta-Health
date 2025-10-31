# Frontend Refactor Guide: Strapi → Payload CMS

**Status**: Ready to Refactor
**Estimated Time**: 2-3 hours
**Files to Update**: 12 files

---

## ✅ What's Already Done

1. **✅ Payload API Client Created**: `apps/web/lib/payload-api.ts`
   - All collection methods implemented
   - TypeScript types included
   - Drop-in replacement for strapi-api.ts
   - No transformation needed (Payload already returns correct format)

2. **✅ Environment Variables Configured**:
   - `NEXT_PUBLIC_CMS_URL=http://localhost:3001` (already set)
   - Frontend is ready to connect to Payload CMS

---

## 📋 Files That Need Refactoring

### Found 12 files importing from `@/lib/strapi-api`:

1. `apps/web/app/[lang]/herbs/page.tsx`
2. `apps/web/app/[lang]/herbs/[slug]/page.tsx`
3. `apps/web/app/[lang]/formulas/page.tsx`
4. `apps/web/app/[lang]/formulas/[slug]/page.tsx`
5. `apps/web/app/[lang]/conditions/page.tsx`
6. `apps/web/app/[lang]/conditions/[slug]/page.tsx`
7. `apps/web/app/[lang]/practitioners/page.tsx`
8. `apps/web/app/[lang]/practitioners/[slug]/page.tsx`
9. `apps/web/app/[lang]/modalities/page.tsx`
10. `apps/web/app/[lang]/modalities/[slug]/page.tsx`
11. `apps/web/app/sitemap.ts`
12. `apps/web/app/api/herbs/[slug]/route.ts`

---

## 🔄 Refactoring Steps

### Step 1: Simple Import Replacement

**For ALL 12 files, change this:**
```typescript
import { getHerbs, getHerbBySlug, ... } from '@/lib/strapi-api'
```

**To this:**
```typescript
import { getHerbs, getHerbBySlug, ... } from '@/lib/payload-api'
```

**That's it!** The function signatures are identical.

---

### Step 2: Update Type Imports (Optional but Recommended)

**Add type imports for better TypeScript support:**

```typescript
// Before (no types)
import { getHerbs } from '@/lib/payload-api'

// After (with types)
import { getHerbs, type Herb, type PaginatedResponse } from '@/lib/payload-api'
```

**Available types:**
- `Herb`
- `Formula`
- `Condition`
- `Practitioner`
- `Modality`
- `Symptom`
- `Review`
- `PaginatedResponse<T>`
- `SingleDocResponse<T>`

---

### Step 3: Verify Response Format

**The response format is IDENTICAL between Strapi adapter and Payload:**

```typescript
// Both return the same format:
{
  docs: [...],
  totalDocs: 100,
  limit: 12,
  totalPages: 9,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: true,
  prevPage: null,
  nextPage: 2
}
```

**No code changes needed** in your components that use these responses.

---

## 📝 Example Refactors

### Example 1: List Page (Herbs)

**Before:**
```typescript
// apps/web/app/[lang]/herbs/page.tsx
import { getHerbs } from '@/lib/strapi-api'

export default async function HerbsPage() {
  const { docs: herbs, totalDocs, page, totalPages } = await getHerbs(1, 12)

  return (
    <div>
      {herbs.map((herb: any) => (
        <div key={herb.id}>
          <h2>{herb.title}</h2>
          <p>{herb.description}</p>
        </div>
      ))}
    </div>
  )
}
```

**After:**
```typescript
// apps/web/app/[lang]/herbs/page.tsx
import { getHerbs, type Herb } from '@/lib/payload-api'

export default async function HerbsPage() {
  const { docs: herbs, totalDocs, page, totalPages } = await getHerbs(1, 12)

  return (
    <div>
      {herbs.map((herb: Herb) => (
        <div key={herb.id}>
          <h2>{herb.title}</h2>
          <p>{herb.description}</p>
        </div>
      ))}
    </div>
  )
}
```

**Changes:**
- ✅ Changed import from `strapi-api` to `payload-api`
- ✅ Added `Herb` type import (optional but recommended)
- ✅ Changed `herb: any` to `herb: Herb` (optional but recommended)

---

### Example 2: Detail Page (Herb Detail)

**Before:**
```typescript
// apps/web/app/[lang]/herbs/[slug]/page.tsx
import { getHerbBySlug } from '@/lib/strapi-api'

export default async function HerbDetailPage({ params }: { params: { slug: string } }) {
  const { docs } = await getHerbBySlug(params.slug)
  const herb = docs[0]

  if (!herb) return <div>Not found</div>

  return (
    <div>
      <h1>{herb.title}</h1>
      <p>{herb.botanicalInfo?.scientificName}</p>
      <p>{herb.description}</p>
    </div>
  )
}
```

**After:**
```typescript
// apps/web/app/[lang]/herbs/[slug]/page.tsx
import { getHerbBySlug, type Herb } from '@/lib/payload-api'

export default async function HerbDetailPage({ params }: { params: { slug: string } }) {
  const herb = await getHerbBySlug(params.slug)

  if (!herb) return <div>Not found</div>

  return (
    <div>
      <h1>{herb.title}</h1>
      <p>{herb.botanicalInfo?.scientificName}</p>
      <p>{herb.description}</p>
    </div>
  )
}
```

**Changes:**
- ✅ Changed import from `strapi-api` to `payload-api`
- ✅ Added `Herb` type import
- ✅ Simplified: `getHerbBySlug()` now returns `Herb | null` directly (no need to unwrap `docs[0]`)

---

### Example 3: Sitemap Generation

**Before:**
```typescript
// apps/web/app/sitemap.ts
import { getAllSlugs } from '@/lib/strapi-api'

export default async function sitemap() {
  const herbSlugs = await getAllSlugs('herbs')
  const formulaSlugs = await getAllSlugs('formulas')

  return [
    ...herbSlugs.map(slug => ({ url: `/herbs/${slug}` })),
    ...formulaSlugs.map(slug => ({ url: `/formulas/${slug}` })),
  ]
}
```

**After:**
```typescript
// apps/web/app/sitemap.ts
import { getAllSlugs } from '@/lib/payload-api'

export default async function sitemap() {
  const herbSlugs = await getAllSlugs('herbs')
  const formulaSlugs = await getAllSlugs('formulas')

  return [
    ...herbSlugs.map(slug => ({ url: `/herbs/${slug}` })),
    ...formulaSlugs.map(slug => ({ url: `/formulas/${slug}` })),
  ]
}
```

**Changes:**
- ✅ Changed import from `strapi-api` to `payload-api`
- ✅ No other changes needed!

---

## 🎯 Refactoring Checklist

### Phase 1: Simple Refactor (30 minutes)

- [ ] **Replace all imports**: Search and replace `@/lib/strapi-api` → `@/lib/payload-api`
  ```bash
  # In apps/web directory
  find . -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/@\/lib\/strapi-api/@\/lib\/payload-api/g'
  ```

- [ ] **Verify compilation**:
  ```bash
  cd apps/web
  pnpm build
  ```

### Phase 2: Type Safety (30 minutes)

- [ ] Add TypeScript type imports to all 12 files
- [ ] Replace `any` types with specific types (`Herb`, `Formula`, etc.)
- [ ] Update detail pages to use direct return (e.g., `getHerbBySlug()` → `Herb | null`)

### Phase 3: Testing (1 hour)

- [ ] Start Payload CMS: `cd apps/payload-cms && pnpm dev`
- [ ] Start frontend: `cd apps/web && pnpm dev`
- [ ] Create test content in Payload admin (http://localhost:3001/admin)
- [ ] Test each page:
  - [ ] Herbs list page
  - [ ] Herb detail page
  - [ ] Formulas list page
  - [ ] Formula detail page
  - [ ] Conditions list page
  - [ ] Condition detail page
  - [ ] Practitioners list page
  - [ ] Practitioner detail page
  - [ ] Modalities list page
  - [ ] Modality detail page
  - [ ] Sitemap generation

### Phase 4: Cleanup (15 minutes)

- [ ] Delete `apps/web/lib/strapi-api.ts` (no longer needed)
- [ ] Delete `apps/web/lib/__tests__/strapi-api.test.ts` (no longer needed)
- [ ] Update any remaining references

---

## 🚀 Quick Refactor Command

**For a quick automated refactor, run:**

```bash
cd apps/web

# 1. Replace all strapi-api imports with payload-api
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i 's/@\/lib\/strapi-api/@\/lib\/payload-api/g' {} +

# 2. Verify build
pnpm build

# 3. Start dev server
pnpm dev
```

---

## 🔍 Key Differences: Strapi vs Payload

### Query Syntax

**Strapi:**
```typescript
'filters[title][$containsi]': query
'filters[slug][$eq]': slug
'pagination[page]': page.toString()
```

**Payload:**
```typescript
'where[title][contains]': query
'where[slug][equals]': slug
'page': page.toString()
```

**Good news**: The `payload-api.ts` client handles this automatically!

---

### Response Format

**Both return identical format** (Strapi was using an adapter):

```typescript
{
  docs: [...],
  totalDocs: number,
  limit: number,
  totalPages: number,
  page: number,
  pagingCounter: number,
  hasPrevPage: boolean,
  hasNextPage: boolean,
  prevPage: number | null,
  nextPage: number | null
}
```

**No component changes needed!**

---

## 💡 New Features in payload-api.ts

### 1. Direct Single Document Returns

**Old (Strapi adapter):**
```typescript
const { docs } = await getHerbBySlug('ginseng')
const herb = docs[0] // Have to unwrap
```

**New (Payload):**
```typescript
const herb = await getHerbBySlug('ginseng') // Returns Herb | null directly
```

### 2. Additional Utility Functions

```typescript
// Search across multiple collections
const results = await searchGlobal('ginseng', ['herbs', 'formulas'], 5)
// Returns: { herbs: [...], formulas: [...] }

// Get collection statistics
const stats = await getCollectionStats('herbs')
// Returns: { total: 150 }

// Get featured items (by rating)
const featured = await getFeaturedItems<Herb>('herbs', 6)
// Returns: Herb[]

// Get reviews for an entity
const reviews = await getReviewsForEntity('herb-id-123', 1, 10)
// Returns: PaginatedResponse<Review>
```

---

## 🧪 Testing Strategy

### 1. Unit Testing (Optional)

Create `apps/web/lib/__tests__/payload-api.test.ts`:

```typescript
import { getHerbs, getHerbBySlug } from '@/lib/payload-api'

describe('Payload API Client', () => {
  it('should fetch herbs', async () => {
    const response = await getHerbs(1, 12)
    expect(response.docs).toBeDefined()
    expect(response.totalDocs).toBeGreaterThanOrEqual(0)
  })

  it('should fetch herb by slug', async () => {
    const herb = await getHerbBySlug('ginseng')
    expect(herb?.title).toBe('Ginseng')
  })
})
```

### 2. Integration Testing

```bash
# Terminal 1: Start Payload CMS
cd apps/payload-cms
pnpm dev

# Terminal 2: Start Frontend
cd apps/web
pnpm dev

# Terminal 3: Run tests
cd apps/web
pnpm test
```

---

## 🐛 Troubleshooting

### "Cannot fetch from Payload CMS"

**Solution:**
1. Ensure Payload CMS is running: `http://localhost:3001/admin`
2. Check `NEXT_PUBLIC_CMS_URL` in `.env.local`
3. Verify Payload API is accessible: `curl http://localhost:3001/api/herbs`

### "Type errors after refactor"

**Solution:**
1. Import types from `payload-api`: `import { type Herb } from '@/lib/payload-api'`
2. Replace `any` with specific types
3. Run `pnpm build` to see all type errors

### "Empty responses from API"

**Solution:**
1. Create test content in Payload admin
2. Ensure content is **published** (not draft)
3. Check `_status: 'published'` in your queries

---

## 📊 Progress Tracker

| File | Status | Notes |
|------|--------|-------|
| `herbs/page.tsx` | ⏳ Pending | List page |
| `herbs/[slug]/page.tsx` | ⏳ Pending | Detail page |
| `formulas/page.tsx` | ⏳ Pending | List page |
| `formulas/[slug]/page.tsx` | ⏳ Pending | Detail page |
| `conditions/page.tsx` | ⏳ Pending | List page |
| `conditions/[slug]/page.tsx` | ⏳ Pending | Detail page |
| `practitioners/page.tsx` | ⏳ Pending | List page |
| `practitioners/[slug]/page.tsx` | ⏳ Pending | Detail page |
| `modalities/page.tsx` | ⏳ Pending | List page |
| `modalities/[slug]/page.tsx` | ⏳ Pending | Detail page |
| `sitemap.ts` | ⏳ Pending | Sitemap |
| `api/herbs/[slug]/route.ts` | ⏳ Pending | API route |

---

## 🎉 After Refactoring

### Next Steps:

1. **Deploy Payload CMS to Coolify** (see `READY_TO_DEPLOY.md`)
2. **Update frontend environment variables** for production
3. **Deploy frontend to Coolify**
4. **Test end-to-end** in production

---

## 📚 Resources

- **Payload API Client**: `apps/web/lib/payload-api.ts`
- **Payload Docs**: https://payloadcms.com/docs/rest-api
- **Migration Guide**: `MIGRATION_STATUS.md`
- **Deployment Guide**: `READY_TO_DEPLOY.md`

---

**Ready to refactor? Start with Phase 1 and work through the checklist!** 🚀
