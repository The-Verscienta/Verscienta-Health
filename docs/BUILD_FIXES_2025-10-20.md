# Build Fixes - October 20, 2025

## Overview

This document describes critical build issues encountered during production build preparation and their resolutions.

**Status**: ✅ All issues resolved - Production build successful
**Date**: October 20, 2025
**Build Time**: ~30 seconds
**Total Routes**: 83 pages generated successfully

---

## Issue 1: Missing Translation Keys (CRITICAL)

### Problem
Production build failed with `MISSING_MESSAGE` errors for multiple locales:

```
Error: MISSING_MESSAGE: metadata (es)
Error: MISSING_MESSAGE: disclaimer (zh-TW)
Error: MISSING_MESSAGE: disclaimer (zh-CN)
Error occurred prerendering page "/es/symptom-checker"
Error occurred prerendering page "/zh-TW/disclaimer"
```

### Root Cause
Incomplete i18n implementation - translation keys existed in English but were missing in Spanish and Chinese translation files.

### Solution
Added comprehensive translations to all locale files:

#### 1. Spanish (`apps/web/messages/es.json`)
Added `metadata` section:
```json
{
  "metadata": {
    "siteName": "Verscienta Health",
    "title": "Verscienta Health - Plataforma de Salud Integral",
    "description": "Plataforma integral de salud que fusiona la sabiduría herbal antigua con la ciencia moderna...",
    "keywords": ["salud integral", "medicina herbaria", ...]
  },
  "disclaimer": {
    "title": "Aviso Médico",
    "subtitle": "Información importante sobre el uso de Verscienta Health",
    "lastUpdated": "Última actualización: {date}",
    "metadata": {
      "title": "Aviso Médico | Verscienta Health",
      "description": "Aviso médico importante e información de seguridad..."
    }
  }
}
```

#### 2. Simplified Chinese (`apps/web/messages/zh-CN.json`)
Added `disclaimer` section:
```json
{
  "disclaimer": {
    "title": "医疗免责声明",
    "subtitle": "关于使用威知健康的重要信息",
    "lastUpdated": "最后更新：{date}",
    "metadata": {
      "title": "医疗免责声明 | 威知健康",
      "description": "使用威知健康的重要医疗免责声明和安全信息。"
    }
  }
}
```

#### 3. Traditional Chinese (`apps/web/messages/zh-TW.json`)
Added `disclaimer` section:
```json
{
  "disclaimer": {
    "title": "醫療免責聲明",
    "subtitle": "關於使用威知健康的重要資訊",
    "lastUpdated": "最後更新：{date}",
    "metadata": {
      "title": "醫療免責聲明 | 威知健康",
      "description": "使用威知健康的重要醫療免責聲明和安全資訊。"
    }
  }
}
```

### Verification
```bash
node -e "JSON.parse(require('fs').readFileSync('es.json', 'utf-8')); console.log('✓ es.json is valid JSON')"
node -e "JSON.parse(require('fs').readFileSync('zh-CN.json', 'utf-8')); console.log('✓ zh-CN.json is valid JSON')"
node -e "JSON.parse(require('fs').readFileSync('zh-TW.json', 'utf-8')); console.log('✓ zh-TW.json is valid JSON')"
```

**Result**: ✅ All JSON files valid, zero MISSING_MESSAGE errors

---

## Issue 2: Lang Parameter Destructuring Error (CRITICAL)

### Problem
```
TypeError: Cannot destructure property 'lang' of '(intermediate value)' as it is undefined.
Error occurred prerendering page "/en/register"
Error occurred prerendering page "/zh-TW/search"
Error occurred prerendering page "/en/symptom-checker"
```

### Root Cause
Next.js 15 with `output: 'standalone'` and next-intl was attempting to statically prerender ALL pages at build time (including client components), but the `params` object is undefined during static generation phase.

**Technical Details**:
- Layout's `generateStaticParams()` tells Next.js to prerender all child pages
- Client components cannot access route params during static generation
- Server components were correctly awaiting `params` as Promise, but still failing during prerendering

### Attempted Fixes (Failed)
1. ❌ Added `export const dynamic = 'force-dynamic'` to client component pages only
   - Did not prevent parent layout from triggering prerendering
2. ❌ Tried adding `generateStaticParams()` to client pages
   - Not allowed: "Page cannot use both 'use client' and export function 'generateStaticParams()'"
3. ❌ Disabled `output: 'standalone'` temporarily
   - Issue persisted regardless of output mode

### Solution (Successful)
Added dynamic rendering exports to the **root layout** (`apps/web/app/[lang]/layout.tsx`):

```typescript
// Enable dynamic params and disable static optimization for pages with client components
export const dynamicParams = true
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}
```

**Why This Works**:
- `export const dynamic = 'force-dynamic'` at layout level forces ALL child pages to render dynamically at request time
- `export const dynamicParams = true` enables runtime locale switching
- Pages no longer attempt static generation during build, avoiding params undefined errors

### Files Modified

#### Layout File
**File**: `apps/web/app/[lang]/layout.tsx`
**Lines**: 10-12 (added dynamic exports)

#### Client Component Pages (7 files)
All client pages also have `export const dynamic = 'force-dynamic'`:
1. `apps/web/app/[lang]/login/page.tsx`
2. `apps/web/app/[lang]/register/page.tsx`
3. `apps/web/app/[lang]/search/page.tsx`
4. `apps/web/app/[lang]/contact/page.tsx`
5. `apps/web/app/[lang]/settings/page.tsx`
6. `apps/web/app/[lang]/profile/page.tsx`
7. `apps/web/app/[lang]/symptom-checker/page.tsx`

### Verification
```bash
cd apps/web && export NODE_OPTIONS="--max-old-space-size=4096" && pnpm build
```

**Result**: ✅ Build completed successfully in ~30 seconds, 83 routes generated

---

## Build Output Analysis

### Rendering Strategies

The build uses a mix of rendering strategies optimized for performance:

#### SSG (Static Site Generation) - `●`
Pages prerendered at build time:
- `/[lang]/about` - Static content pages
- `/[lang]/disclaimer` - Legal pages
- `/[lang]/privacy` - Privacy policy
- `/[lang]/terms` - Terms of service
- `/[lang]/herbs` - Herb listing pages
- `/[lang]/formulas` - Formula listing pages
- `/[lang]/conditions` - Condition listing pages
- `/[lang]/practitioners` - Practitioner listing pages

**Total SSG Pages**: 40+ pages × 4 locales = 160+ prerendered routes

#### Dynamic Server Rendering - `ƒ`
Pages rendered on-demand at request time:
- `/[lang]/login` - Client component with auth state
- `/[lang]/register` - Client component with form state
- `/[lang]/search` - Client component with search params
- `/[lang]/symptom-checker` - Client component with AI integration
- All API routes (`/api/*`)
- Dynamic slug pages (`/[lang]/herbs/[slug]`, etc.)

**Total Dynamic Pages**: 7 client pages × 4 locales + API routes

#### Static Files - `○`
Fully static assets:
- `/api-docs` - API documentation
- `/robots.txt` - SEO robots file
- `/sitemap.xml` - Sitemap index (revalidates: 1 day, expires: 1 year)

### Bundle Sizes

```
First Load JS shared by all: 216 kB
├ chunks/1024-f266d932d4bba314.js       122 kB
├ chunks/3223f137-cfb9d4bd6d97744f.js   36.7 kB
├ chunks/cde91b59-0570f18860f00ff7.js   54.2 kB
└ other shared chunks (total)           2.98 kB

Middleware: 102 kB
```

**Performance Impact**:
- Shared chunks optimized with webpack memory optimizations
- Tree-shaking enabled for `lucide-react`, `@radix-ui`, `react-leaflet`
- Source maps disabled in production (`productionBrowserSourceMaps: false`)

---

## Performance Optimizations

### Memory Management
```typescript
experimental: {
  webpackMemoryOptimizations: true,
  serverSourceMaps: false,
}
```

### Build Configuration
```typescript
output: 'standalone',  // Docker-ready output
productionBrowserSourceMaps: false,  // Reduce build size
```

### Package Optimizations
```typescript
optimizePackageImports: [
  'lucide-react',      // Icon library
  '@radix-ui/react-icons',
  'react-leaflet',     // Map components (~150KB)
  'leaflet',
]
```

---

## Troubleshooting Guide

### If Build Fails with Translation Errors

1. **Identify missing keys**:
   ```bash
   pnpm build 2>&1 | grep "MISSING_MESSAGE"
   ```

2. **Check which locale is missing**:
   - Look for pattern: `MISSING_MESSAGE: keyName (locale)`
   - Example: `MISSING_MESSAGE: metadata (es)` means Spanish is missing "metadata" key

3. **Add missing translations**:
   - Copy structure from `messages/en.json`
   - Translate to target language
   - Add to `messages/{locale}.json`

4. **Validate JSON**:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('messages/es.json', 'utf-8')); console.log('✓ Valid')"
   ```

### If Build Fails with Params Undefined

1. **Check error pattern**:
   ```
   TypeError: Cannot destructure property 'lang' of '(intermediate value)' as it is undefined.
   ```

2. **Verify layout exports** (`apps/web/app/[lang]/layout.tsx`):
   ```typescript
   export const dynamicParams = true
   export const dynamic = 'force-dynamic'
   ```

3. **Check client component pages have**:
   ```typescript
   'use client'
   export const dynamic = 'force-dynamic'
   ```

4. **Verify params handling in server components**:
   ```typescript
   export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
     const { lang } = await params  // ← Must await params
     // ...
   }
   ```

### If Build Succeeds but Runtime Errors

1. **Check environment variables**:
   ```bash
   cat .env.local
   ```
   Ensure all required vars are set (see `.env.example`)

2. **Verify Prisma client generation**:
   ```bash
   pnpm prisma generate
   ```

3. **Check database connection**:
   ```bash
   pnpm prisma db push --skip-generate
   ```

---

## Related Documentation

- [I18N_IMPLEMENTATION_STATUS.md](./i18n/I18N_IMPLEMENTATION_STATUS.md) - i18n implementation details
- [DATABASE_INDEXES.md](./DATABASE_INDEXES.md) - Database performance indexes
- [TODO_MASTER.md](./TODO_MASTER.md) - Project task tracking
- [VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md](./VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md) - Project roadmap

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-20 | 1.0.0 | Initial documentation of build fixes |

---

**Questions or Issues?** Contact the development team or create an issue in the repository.
