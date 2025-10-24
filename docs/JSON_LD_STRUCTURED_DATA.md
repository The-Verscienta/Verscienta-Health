# JSON-LD Structured Data Implementation

Complete guide to SEO-optimized structured data for Verscienta Health using JSON-LD and schema.org.

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's Implemented](#whats-implemented)
3. [Quick Start](#quick-start)
4. [Integration Examples](#integration-examples)
5. [Schema Reference](#schema-reference)
6. [Testing & Validation](#testing--validation)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is JSON-LD?

JSON-LD (JavaScript Object Notation for Linked Data) is the recommended format for adding structured data to websites. It:

- **Improves SEO** - Helps search engines understand your content
- **Enables Rich Snippets** - Shows enhanced search results with images, ratings, prices
- **Powers Knowledge Graph** - Appears in Google's knowledge panel
- **Increases Click-Through Rates** - Rich snippets attract more clicks

### Why Schema.org?

[Schema.org](https://schema.org) is the standard vocabulary for structured data, supported by:
- Google
- Bing
- Yahoo
- Yandex

### Schemas Implemented

✅ **Organization** - Company info, contact, social profiles
✅ **WebSite** - Search action, multilingual
✅ **Product** - Herbs and formulas with ratings
✅ **MedicalEntity** - Medical properties and uses
✅ **HealthTopicContent** - Conditions and symptoms
✅ **Person** - Practitioner profiles
✅ **LocalBusiness** - Practitioner offices
✅ **BreadcrumbList** - Navigation breadcrumbs
✅ **FAQPage** - Frequently asked questions
✅ **Article** - Blog posts and educational content
✅ **Review** - User reviews and ratings
✅ **AggregateRating** - Average ratings

---

## What's Implemented

### Core Files

```
apps/web/
├── lib/
│   └── json-ld.ts                    # All schema generators
├── components/
│   └── seo/
│       └── JsonLd.tsx                # React component for rendering
```

### Schema Generators

| Function | Schema Type | Use For |
|----------|-------------|---------|
| `generateOrganizationSchema()` | Organization | Root layout |
| `generateWebsiteSchema()` | WebSite | Root layout |
| `generateBreadcrumbSchema()` | BreadcrumbList | All pages |
| `generateHerbSchema()` | Product + MedicalEntity | Herb detail pages |
| `generateFormulaSchema()` | Product + MedicalTherapy | Formula detail pages |
| `generateConditionSchema()` | HealthTopicContent | Condition pages |
| `generatePractitionerSchema()` | Person + MedicalBusiness | Practitioner pages |
| `generateLocalBusinessSchema()` | LocalBusiness | Office locations |
| `generateFAQSchema()` | FAQPage | FAQ sections |
| `generateArticleSchema()` | Article | Blog posts |
| `generateReviewSchema()` | Review | Individual reviews |

---

## Quick Start

### 1. Add to Root Layout

**File**: `apps/web/app/[lang]/layout.tsx`

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/json-ld'

export default async function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Organization + Website schemas */}
        <JsonLd
          data={[
            generateOrganizationSchema(),
            generateWebsiteSchema(),
          ]}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 2. Add to Herb Detail Page

**File**: `apps/web/app/[lang]/herbs/[slug]/page.tsx`

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { generateHerbSchema, generateBreadcrumbSchema } from '@/lib/json-ld'

export default async function HerbPage({ params }) {
  const herb = await getHerbBySlug(params.slug)

  // Prepare herb data for schema
  const herbSchema = generateHerbSchema({
    id: herb.slug,
    name: herb.title,
    description: herb.description,
    image: herb.featuredImage?.url,
    scientificName: herb.scientificName,
    family: herb.family,
    uses: herb.tcmProperties?.functions || [],
    benefits: herb.westernProperties || [],
    safetyInfo: {
      warnings: herb.contraindications,
      contraindications: herb.drugInteractions,
    },
    rating: herb.averageRating
      ? { value: herb.averageRating, count: herb.reviewCount || 0 }
      : undefined,
  })

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Herbs', url: '/herbs' },
    { name: herb.title, url: `/herbs/${herb.slug}` },
  ])

  return (
    <>
      <JsonLd data={[herbSchema, breadcrumbSchema]} />
      {/* Page content */}
    </>
  )
}
```

### 3. Add to Practitioner Page

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { generatePractitionerSchema, generateBreadcrumbSchema } from '@/lib/json-ld'

export default async function PractitionerPage({ params }) {
  const practitioner = await getPractitionerBySlug(params.slug)

  const practitionerSchema = generatePractitionerSchema({
    id: practitioner.slug,
    name: practitioner.name,
    description: practitioner.bio,
    image: practitioner.photo?.url,
    jobTitle: practitioner.title,
    email: practitioner.email,
    telephone: practitioner.phone,
    address: practitioner.address,
    modalities: practitioner.modalities?.map(m => m.name),
    certifications: practitioner.certifications,
    priceRange: practitioner.priceRange,
    rating: practitioner.averageRating
      ? { value: practitioner.averageRating, count: practitioner.reviewCount }
      : undefined,
  })

  return (
    <>
      <JsonLd data={practitionerSchema} />
      {/* Page content */}
    </>
  )
}
```

---

## Integration Examples

### Herb Detail Page (Complete)

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import {
  generateHerbSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  type HerbData,
} from '@/lib/json-ld'

export default async function HerbPage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params
  setRequestLocale(lang)

  const { docs } = await getHerbBySlug(slug)
  const herb = docs[0]

  if (!herb) {
    notFound()
  }

  // Herb schema (Product + Medical Entity)
  const herbData: HerbData = {
    id: herb.slug,
    name: herb.title,
    description: herb.description,
    image: herb.featuredImage?.url,
    scientificName: herb.scientificName,
    family: herb.family,
    uses: herb.tcmProperties?.functions || [],
    benefits: herb.westernProperties || [],
    safetyInfo: {
      warnings: herb.contraindications || [],
      contraindications: herb.drugInteractions || [],
    },
    rating: herb.averageRating
      ? { value: herb.averageRating, count: herb.reviewCount || 0 }
      : undefined,
  }

  const herbSchema = generateHerbSchema(herbData)

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `/${lang}` },
    { name: 'Herbs', url: `/${lang}/herbs` },
    { name: herb.title, url: `/${lang}/herbs/${herb.slug}` },
  ])

  // FAQ schema (if FAQ section exists)
  const faqSchema = generateFAQSchema([
    {
      question: `What is ${herb.title} used for?`,
      answer: herb.description || '',
    },
    {
      question: `Is ${herb.title} safe to use?`,
      answer: herb.contraindications?.join(', ') || 'Consult a healthcare provider.',
    },
  ])

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={[herbSchema, breadcrumbSchema, faqSchema]} />

      {/* Page Content */}
      <div className="container-custom py-12">
        {/* ... herb details ... */}
      </div>
    </>
  )
}
```

### Formula Detail Page

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { generateFormulaSchema, generateBreadcrumbSchema, type FormulaData } from '@/lib/json-ld'

export default async function FormulaPage({ params }) {
  const formula = await getFormulaBySlug(params.slug)

  const formulaData: FormulaData = {
    id: formula.slug,
    name: formula.title,
    description: formula.description,
    image: formula.featuredImage?.url,
    ingredients: formula.ingredients?.map(ing => ({
      name: ing.herb.name,
      amount: ing.dosage,
    })),
    uses: formula.indications,
    dosage: formula.dosageInfo?.standardDosage,
    rating: formula.averageRating
      ? { value: formula.averageRating, count: formula.reviewCount }
      : undefined,
  }

  return (
    <>
      <JsonLd
        data={[
          generateFormulaSchema(formulaData),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Formulas', url: '/formulas' },
            { name: formula.title, url: `/formulas/${formula.slug}` },
          ]),
        ]}
      />
      {/* Page content */}
    </>
  )
}
```

### Condition Page

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { generateConditionSchema, generateBreadcrumbSchema, type ConditionData } from '@/lib/json-ld'

export default async function ConditionPage({ params }) {
  const condition = await getConditionBySlug(params.slug)

  const conditionData: ConditionData = {
    id: condition.slug,
    name: condition.title,
    description: condition.description,
    image: condition.featuredImage?.url,
    symptoms: condition.symptoms?.map(s => s.name),
    relatedHerbs: condition.relatedHerbs?.map(h => h.name),
    relatedFormulas: condition.relatedFormulas?.map(f => f.name),
  }

  return (
    <>
      <JsonLd data={generateConditionSchema(conditionData)} />
      {/* Page content */}
    </>
  )
}
```

### Practitioner with Local Business

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import {
  generatePractitionerSchema,
  generateLocalBusinessSchema,
  type PractitionerData,
} from '@/lib/json-ld'

export default async function PractitionerPage({ params }) {
  const practitioner = await getPractitionerBySlug(params.slug)

  const practitionerData: PractitionerData = {
    id: practitioner.slug,
    name: practitioner.name,
    description: practitioner.bio,
    image: practitioner.photo?.url,
    jobTitle: practitioner.title,
    email: practitioner.email,
    telephone: practitioner.phone,
    address: {
      streetAddress: practitioner.address?.street,
      addressLocality: practitioner.address?.city,
      addressRegion: practitioner.address?.state,
      postalCode: practitioner.address?.zip,
      addressCountry: 'US',
    },
    modalities: practitioner.modalities?.map(m => m.name),
    certifications: practitioner.certifications,
    priceRange: '$$',
    rating: practitioner.averageRating
      ? { value: practitioner.averageRating, count: practitioner.reviewCount }
      : undefined,
  }

  // If practitioner has a physical office, add LocalBusiness schema
  const schemas = [generatePractitionerSchema(practitionerData)]

  if (practitioner.hasPhysicalOffice && practitioner.address) {
    schemas.push(
      generateLocalBusinessSchema({
        name: `${practitioner.name} - ${practitioner.practiceName}`,
        description: practitioner.bio,
        image: practitioner.officePhoto?.url,
        telephone: practitioner.phone,
        email: practitioner.email,
        address: practitionerData.address!,
        geo: practitioner.location
          ? {
              latitude: practitioner.location.lat,
              longitude: practitioner.location.lng,
            }
          : undefined,
        openingHours: practitioner.hours || [],
        priceRange: '$$',
        rating: practitionerData.rating,
      })
    )
  }

  return (
    <>
      <JsonLd data={schemas} />
      {/* Page content */}
    </>
  )
}
```

### Blog/Article Page

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { generateArticleSchema } from '@/lib/json-ld'

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug)

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: article.title,
          description: article.excerpt,
          url: `/blog/${article.slug}`,
          image: article.featuredImage?.url,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          author: article.author?.name,
        })}
      />
      {/* Page content */}
    </>
  )
}
```

### FAQ Page

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { generateFAQSchema } from '@/lib/json-ld'

export default async function FAQPage() {
  const faqs = [
    {
      question: 'What is Traditional Chinese Medicine (TCM)?',
      answer: 'TCM is a holistic medical system that has been practiced for over 2,000 years...',
    },
    {
      question: 'Are Chinese herbs safe?',
      answer: 'When prescribed by a qualified practitioner, Chinese herbs are generally safe...',
    },
    // ... more FAQs
  ]

  return (
    <>
      <JsonLd data={generateFAQSchema(faqs)} />
      <div className="container-custom py-12">
        <h1>Frequently Asked Questions</h1>
        {/* FAQ content */}
      </div>
    </>
  )
}
```

---

## Schema Reference

### Organization Schema

```typescript
generateOrganizationSchema()
```

**Output**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://verscienta.com/#organization",
  "name": "Verscienta Health",
  "description": "Comprehensive TCM database",
  "url": "https://verscienta.com",
  "logo": "https://verscienta.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@verscienta.com"
  }
}
```

### Product + Medical Entity (Herb)

```typescript
generateHerbSchema({
  id: 'ginseng',
  name: 'Ginseng',
  description: 'Adaptogenic herb for energy and vitality',
  image: 'image-url',
  scientificName: 'Panax ginseng',
  family: 'Araliaceae',
  uses: ['Increase energy', 'Boost immunity'],
  benefits: ['Reduces stress', 'Improves cognition'],
  safetyInfo: {
    warnings: ['Not for pregnant women'],
    contraindications: ['High blood pressure'],
  },
  rating: { value: 4.5, count: 120 },
})
```

**Key Features**:
- `@type: ["Product", "MedicalEntity"]` - Dual type for e-commerce and medical
- `additionalProperty` - Scientific classification
- `applicationSubCategory` - Medical uses
- `warning` - Safety information
- `aggregateRating` - User ratings

### Practitioner Schema

```typescript
generatePractitionerSchema({
  id: 'dr-john-doe',
  name: 'Dr. John Doe',
  description: 'Licensed acupuncturist and herbalist',
  image: 'photo-url',
  jobTitle: 'Doctor of Acupuncture',
  email: 'john@example.com',
  telephone: '+1-555-1234',
  address: {
    streetAddress: '123 Main St',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94102',
    addressCountry: 'US',
  },
  modalities: ['Acupuncture', 'Herbal Medicine'],
  certifications: ['L.Ac.', 'NCCAOM'],
  priceRange: '$$',
  rating: { value: 4.8, count: 45 },
})
```

**Key Features**:
- `@type: ["Person", "MedicalBusiness"]` - Dual type
- `medicalSpecialty` - Modalities
- `hasCredential` - Certifications
- `priceRange` - Cost indicator
- `aggregateRating` - Patient reviews

---

## Testing & Validation

### Google Rich Results Test

1. Go to [Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your page URL
3. Click **Test URL**
4. Review detected schemas
5. Fix any warnings or errors

### Schema Markup Validator

1. Go to [Schema.org Validator](https://validator.schema.org/)
2. Paste your JSON-LD code
3. Check for errors
4. Validate schema structure

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Navigate to **Enhancements**
3. Check **Products**, **FAQ**, **How-to**, etc.
4. Monitor for errors

### Manual Testing

```bash
# View page source
curl https://verscienta.com/herbs/ginseng | grep 'application/ld+json'

# Pretty print JSON-LD
curl -s https://verscienta.com/herbs/ginseng | \
  grep -o '<script type="application/ld+json">.*</script>' | \
  sed 's/<[^>]*>//g' | jq .
```

---

## Best Practices

### 1. Always Include Required Fields

✅ **Do**:
```typescript
generateHerbSchema({
  id: 'herb-123',      // Required: Unique ID
  name: 'Ginseng',     // Required: Name
  description: '...',   // Required: Description
})
```

❌ **Don't**:
```typescript
generateHerbSchema({
  name: 'Ginseng',
  // Missing ID and description
})
```

### 2. Use Absolute URLs

✅ **Do**:
```typescript
url: 'https://verscienta.com/herbs/ginseng'
image: 'https://imagedelivery.net/...'
```

❌ **Don't**:
```typescript
url: '/herbs/ginseng'           // Relative URL
image: 'herb-photo.jpg'          // Relative path
```

### 3. Provide High-Quality Images

✅ **Do**:
- Minimum 1200x800px
- Use Cloudflare Images optimized URLs
- Provide alt text

❌ **Don't**:
- Use low-resolution images
- Use placeholder images in production
- Omit images for key entities

### 4. Keep Data Current

✅ **Do**:
- Update ratings regularly
- Refresh review counts
- Update availability status

❌ **Don't**:
- Hardcode outdated values
- Cache schemas indefinitely
- Ignore schema updates

### 5. Combine Related Schemas

✅ **Do**:
```tsx
<JsonLd data={[
  generateHerbSchema(herb),
  generateBreadcrumbSchema(breadcrumbs),
  generateFAQSchema(faqs),
]} />
```

❌ **Don't**:
```tsx
<JsonLd data={generateHerbSchema(herb)} />
<JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
<JsonLd data={generateFAQSchema(faqs)} />
```

### 6. Handle Missing Data Gracefully

✅ **Do**:
```typescript
rating: herb.averageRating
  ? { value: herb.averageRating, count: herb.reviewCount || 0 }
  : undefined  // Omit if no rating
```

❌ **Don't**:
```typescript
rating: { value: herb.averageRating || 0, count: herb.reviewCount || 0 }
// Don't include empty ratings
```

---

## Troubleshooting

### Schema Not Showing in Rich Results

**Issue**: Google doesn't show rich snippets

**Solutions**:
1. Verify schema is valid (use Rich Results Test)
2. Ensure all required fields are present
3. Check `robots.txt` doesn't block Googlebot
4. Wait 1-2 weeks for indexing
5. Ensure sufficient content quality

### Invalid Schema Errors

**Issue**: Validator shows errors

**Solutions**:
1. Check required fields: `name`, `@type`, `@id`
2. Use absolute URLs (not relative)
3. Validate JSON syntax (use `jq` or JSON linter)
4. Ensure proper TypeScript types
5. Check schema.org documentation

### Duplicate Schemas

**Issue**: Multiple conflicting schemas on same page

**Solutions**:
1. Use array syntax: `<JsonLd data={[schema1, schema2]} />`
2. Don't render same schema type twice
3. Combine related data into single schema

### Images Not Displaying

**Issue**: Rich results don't show images

**Solutions**:
1. Use high-resolution images (min 1200px wide)
2. Ensure images are publicly accessible
3. Use Cloudflare Images optimized URLs
4. Include proper image dimensions

---

## Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

---

## Summary Checklist

- [ ] Add Organization + WebSite schemas to root layout
- [ ] Add Product schemas to all herb pages
- [ ] Add Person schemas to all practitioner pages
- [ ] Add HealthTopicContent to condition pages
- [ ] Add Breadcrumb schemas to all pages
- [ ] Add FAQ schemas where applicable
- [ ] Test with Rich Results Test
- [ ] Monitor Google Search Console
- [ ] Validate all schemas
- [ ] Ensure images are optimized and accessible

---

**Questions?** Check the [lib/json-ld.ts](../apps/web/lib/json-ld.ts) source code or contact support@verscienta.com
