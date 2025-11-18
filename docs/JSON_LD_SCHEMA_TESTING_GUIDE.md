# JSON-LD Schema Testing Guide

**Purpose**: Validate all schema.org structured data implementations across Verscienta Health
**Status**: Ready for Testing
**Date**: 2025-11-17

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing Tools](#testing-tools)
3. [Testing Workflow](#testing-workflow)
4. [Page-by-Page Testing](#page-by-page-testing)
5. [Testing Checklist](#testing-checklist)
6. [Common Issues & Fixes](#common-issues--fixes)
7. [Results Documentation](#results-documentation)

---

## Prerequisites

### 1. Development Server Running

```bash
cd apps/web
pnpm dev
```

Verify server is running at: http://localhost:3000

### 2. Sample Data Required

Ensure you have sample data for testing:
- ✅ At least 1 herb with full data
- ✅ At least 1 formula with ingredients
- ✅ At least 1 condition with symptoms
- ✅ At least 1 practitioner with complete profile
- ✅ At least 1 modality with description
- ✅ FAQ page with questions

### 3. Browser Setup

- Use Chrome, Firefox, or Edge (latest version)
- Enable Developer Tools (F12)
- Clear cache before testing

---

## Testing Tools

### 1. Google Rich Results Test (Primary Tool)

**URL**: https://search.google.com/test/rich-results

**Features**:
- Official Google validation tool
- Shows how Google sees your structured data
- Identifies errors and warnings
- Preview of rich results appearance

**Best For**: Production validation, final checks

### 2. Schema.org Validator

**URL**: https://validator.schema.org/

**Features**:
- Official schema.org validator
- Detailed error messages
- Supports multiple schema types
- JSON-LD format validation

**Best For**: Detailed schema validation, debugging

### 3. Google Search Console (Post-Deployment)

**URL**: https://search.google.com/search-console

**Features**:
- Real-world indexing status
- Rich results performance tracking
- Error monitoring over time

**Best For**: Production monitoring, performance tracking

---

## Testing Workflow

### Step-by-Step Process

```
1. Navigate to page → 2. View source → 3. Copy JSON-LD → 4. Validate → 5. Document results
```

### Method 1: URL Testing (Recommended)

**Best for**: Quick validation of multiple pages

1. Start dev server: `pnpm dev`
2. Open Google Rich Results Test
3. Enter URL: `http://localhost:3000/en/[page-path]`
4. Click "Test URL"
5. Review results
6. Document findings

**Note**: Google Rich Results Test can access localhost URLs.

### Method 2: Code Snippet Testing

**Best for**: Detailed validation, debugging

1. Navigate to page in browser
2. Right-click → "View Page Source"
3. Find `<script type="application/ld+json">` tags
4. Copy entire JSON content (including brackets)
5. Open https://validator.schema.org/
6. Paste JSON into validator
7. Click "Validate"
8. Review results

---

## Page-by-Page Testing

### 1. Root Layout (Organization + WebSite Schemas)

**File**: `apps/web/app/(app)/layout.tsx`
**URL**: http://localhost:3000/en

**Expected Schemas**: 2 schemas
1. Organization schema
2. WebSite schema with SearchAction

**Testing Steps**:

1. Navigate to: http://localhost:3000/en
2. View page source (Ctrl+U or Cmd+U)
3. Search for: `application/ld+json`
4. You should see 2 JSON-LD script tags in `<head>`

**What to Verify**:

**Organization Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Verscienta Health",
  "url": "https://verscienta.com",
  "logo": "https://verscienta.com/logo.png",
  "sameAs": [
    "https://twitter.com/verscienta",
    "https://facebook.com/verscienta"
  ]
}
```

**WebSite Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Verscienta Health",
  "url": "https://verscienta.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://verscienta.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**Validation**:
- [ ] Both schemas present
- [ ] No validation errors
- [ ] URLs are absolute (not relative)
- [ ] Logo URL is valid
- [ ] SearchAction target is correct

**Rich Results Expected**: Site name, logo, search box in Google

---

### 2. Herb Detail Pages

**File**: `apps/web/app/[lang]/herbs/[slug]/page.tsx`
**URL**: http://localhost:3000/en/herbs/[slug]
**Example**: http://localhost:3000/en/herbs/ginseng

**Expected Schemas**: 2 schemas
1. Product + MedicalEntity (herb schema)
2. BreadcrumbList

**Testing Steps**:

1. Navigate to any herb detail page
2. View page source
3. Find 2 JSON-LD script tags (after `<html>` tag in body)
4. Copy both scripts

**What to Verify**:

**Herb Schema** (Product + MedicalEntity):
```json
{
  "@context": "https://schema.org",
  "@type": ["Product", "MedicalEntity"],
  "@id": "https://verscienta.com/herbs/ginseng",
  "name": "Asian Ginseng",
  "description": "...",
  "scientificName": "Panax ginseng",
  "medicineSystem": "Traditional Chinese Medicine",
  "uses": ["Boost energy", "Improve cognition", ...],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 23
  }
}
```

**Breadcrumb Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://verscienta.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Herbs",
      "item": "https://verscienta.com/herbs"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Asian Ginseng",
      "item": "https://verscienta.com/herbs/ginseng"
    }
  ]
}
```

**Validation**:
- [ ] Both schemas present
- [ ] Product type includes dual typing (Product + MedicalEntity)
- [ ] Scientific name present
- [ ] Uses/benefits array populated
- [ ] Safety information included
- [ ] Aggregate rating present (if reviews exist)
- [ ] Breadcrumb has 3 items
- [ ] All URLs are absolute
- [ ] No validation errors

**Rich Results Expected**: Product card with ratings, medical information, breadcrumbs

---

### 3. Formula Detail Pages

**File**: `apps/web/app/[lang]/formulas/[slug]/page.tsx`
**URL**: http://localhost:3000/en/formulas/[slug]
**Example**: http://localhost:3000/en/formulas/liu-wei-di-huang-wan

**Expected Schemas**: 2 schemas
1. Product + MedicalTherapy (formula schema)
2. BreadcrumbList

**Testing Steps**:

1. Navigate to any formula detail page
2. View page source
3. Find 2 JSON-LD script tags
4. Copy both scripts

**What to Verify**:

**Formula Schema** (Product + MedicalTherapy):
```json
{
  "@context": "https://schema.org",
  "@type": ["Product", "MedicalTherapy"],
  "@id": "https://verscienta.com/formulas/liu-wei-di-huang-wan",
  "name": "Liu Wei Di Huang Wan",
  "description": "Six Ingredient Rehmannia Pill...",
  "ingredients": [
    {
      "@type": "HowToSupply",
      "name": "Rehmannia Root",
      "amount": "24g"
    }
  ],
  "indication": ["Kidney Yin deficiency", ...],
  "doseSchedule": {
    "@type": "DoseSchedule",
    "doseValue": "8 pills",
    "frequency": "3 times daily"
  }
}
```

**Breadcrumb Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://verscienta.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Formulas",
      "item": "https://verscienta.com/formulas"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Liu Wei Di Huang Wan",
      "item": "https://verscienta.com/formulas/liu-wei-di-huang-wan"
    }
  ]
}
```

**Validation**:
- [ ] Both schemas present
- [ ] Dual typing (Product + MedicalTherapy)
- [ ] Ingredients array populated
- [ ] Each ingredient has name and amount
- [ ] Indications/uses listed
- [ ] Dosage information included
- [ ] Aggregate rating present (if reviews exist)
- [ ] Breadcrumb has 3 items
- [ ] All URLs are absolute
- [ ] No validation errors

**Rich Results Expected**: Medical therapy card, ingredient list, dosage info, breadcrumbs

---

### 4. Condition Detail Pages

**File**: `apps/web/app/[lang]/conditions/[slug]/page.tsx`
**URL**: http://localhost:3000/en/conditions/[slug]
**Example**: http://localhost:3000/en/conditions/insomnia

**Expected Schemas**: 2 schemas
1. HealthTopicContent
2. BreadcrumbList

**Testing Steps**:

1. Navigate to any condition detail page
2. View page source
3. Find 2 JSON-LD script tags
4. Copy both scripts

**What to Verify**:

**Condition Schema** (HealthTopicContent):
```json
{
  "@context": "https://schema.org",
  "@type": "HealthTopicContent",
  "@id": "https://verscienta.com/conditions/insomnia",
  "name": "Insomnia",
  "description": "Difficulty falling or staying asleep...",
  "about": {
    "@type": "MedicalCondition",
    "name": "Insomnia",
    "signOrSymptom": [
      "Difficulty falling asleep",
      "Waking up during night",
      "Fatigue"
    ]
  },
  "relatedLink": [
    "https://verscienta.com/herbs/valerian",
    "https://verscienta.com/formulas/suan-zao-ren-tang"
  ]
}
```

**Breadcrumb Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://verscienta.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Conditions",
      "item": "https://verscienta.com/conditions"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Insomnia",
      "item": "https://verscienta.com/conditions/insomnia"
    }
  ]
}
```

**Validation**:
- [ ] Both schemas present
- [ ] HealthTopicContent type used
- [ ] MedicalCondition nested in "about"
- [ ] Symptoms array populated
- [ ] Related herbs/formulas linked
- [ ] Breadcrumb has 3 items
- [ ] All URLs are absolute
- [ ] No validation errors

**Rich Results Expected**: Health topic card, symptoms list, related treatments, breadcrumbs

---

### 5. Practitioner Detail Pages

**File**: `apps/web/app/[lang]/practitioners/[slug]/page.tsx`
**URL**: http://localhost:3000/en/practitioners/[slug]
**Example**: http://localhost:3000/en/practitioners/dr-jane-smith

**Expected Schemas**: 2 schemas
1. Person + MedicalBusiness + LocalBusiness (practitioner schema)
2. BreadcrumbList

**Testing Steps**:

1. Navigate to any practitioner detail page
2. View page source
3. Find 2 JSON-LD script tags
4. Copy both scripts

**What to Verify**:

**Practitioner Schema** (Person + MedicalBusiness):
```json
{
  "@context": "https://schema.org",
  "@type": ["Person", "MedicalBusiness", "LocalBusiness"],
  "@id": "https://verscienta.com/practitioners/dr-jane-smith",
  "name": "Dr. Jane Smith",
  "jobTitle": "Licensed Acupuncturist",
  "image": "https://verscienta.com/images/practitioners/jane-smith.jpg",
  "email": "jane@example.com",
  "telephone": "+1-555-123-4567",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "medicalSpecialty": ["Acupuncture", "Traditional Chinese Medicine"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 45
  },
  "priceRange": "$100 - $200"
}
```

**Breadcrumb Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://verscienta.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Practitioners",
      "item": "https://verscienta.com/practitioners"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Dr. Jane Smith",
      "item": "https://verscienta.com/practitioners/dr-jane-smith"
    }
  ]
}
```

**Validation**:
- [ ] Both schemas present
- [ ] Triple typing (Person + MedicalBusiness + LocalBusiness)
- [ ] Contact information complete (email, phone)
- [ ] Full postal address included
- [ ] Modalities/specialties listed
- [ ] Aggregate rating present (if reviews exist)
- [ ] Price range included
- [ ] Breadcrumb has 3 items
- [ ] All URLs are absolute
- [ ] No validation errors

**Rich Results Expected**: Local business card with map, contact info, ratings, hours, breadcrumbs

---

### 6. Modality Detail Pages

**File**: `apps/web/app/[lang]/modalities/[slug]/page.tsx`
**URL**: http://localhost:3000/en/modalities/[slug]
**Example**: http://localhost:3000/en/modalities/acupuncture

**Expected Schemas**: 1 schema
1. MedicalWebPage + MedicalTherapy

**Testing Steps**:

1. Navigate to any modality detail page
2. View page source
3. Find 1 JSON-LD script tag
4. Copy script

**What to Verify**:

**Modality Schema** (MedicalWebPage):
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "@id": "https://verscienta.com/modalities/acupuncture",
  "name": "Acupuncture",
  "description": "Traditional Chinese medicine practice...",
  "url": "https://verscienta.com/modalities/acupuncture",
  "about": {
    "@type": "MedicalTherapy",
    "name": "Acupuncture",
    "description": "...",
    "benefits": "Pain relief, stress reduction, improved circulation",
    "contraindication": ["Bleeding disorders", "Pregnancy"]
  }
}
```

**Validation**:
- [ ] Schema present
- [ ] MedicalWebPage type used
- [ ] MedicalTherapy nested in "about"
- [ ] Benefits listed
- [ ] Contraindications included
- [ ] All URLs are absolute
- [ ] No validation errors

**Rich Results Expected**: Medical content page, therapy information

---

### 7. FAQ Page

**File**: `apps/web/app/[lang]/faq/page.tsx`
**URL**: http://localhost:3000/en/faq

**Expected Schemas**: 1 schema
1. FAQPage with 14 questions

**Testing Steps**:

1. Navigate to: http://localhost:3000/en/faq
2. View page source
3. Find 1 large JSON-LD script tag
4. Copy script

**What to Verify**:

**FAQ Schema** (FAQPage):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Verscienta Health?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Verscienta Health is a comprehensive platform..."
      }
    },
    {
      "@type": "Question",
      "name": "What is Traditional Chinese Medicine (TCM)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Traditional Chinese Medicine is..."
      }
    }
    // ... 12 more questions
  ]
}
```

**Validation**:
- [ ] Schema present
- [ ] FAQPage type used
- [ ] 14 questions in mainEntity array
- [ ] Each question has name and acceptedAnswer
- [ ] All answers have text content
- [ ] Questions organized by category:
  - [ ] General (4 questions)
  - [ ] TCM (4 questions)
  - [ ] Practitioners (3 questions)
  - [ ] Privacy & Security (3 questions)
- [ ] No validation errors

**Rich Results Expected**: FAQ rich snippets, expandable Q&A in search results

---

## Testing Checklist

### Pre-Testing Checklist

- [ ] Development server running (`pnpm dev`)
- [ ] Sample data exists for all content types
- [ ] Browser cache cleared
- [ ] Developer tools open (F12)

### Per-Page Testing Checklist

For each page type, verify:

- [ ] JSON-LD script tag(s) present in HTML
- [ ] Schema validates without errors
- [ ] All required fields populated
- [ ] URLs are absolute (not relative)
- [ ] Image URLs are valid
- [ ] Aggregate ratings present (when applicable)
- [ ] Breadcrumbs have correct structure
- [ ] No warnings in validator
- [ ] Rich results preview looks correct

### Post-Testing Checklist

- [ ] All 7 page types tested
- [ ] Results documented
- [ ] Issues identified and prioritized
- [ ] Fixes implemented (if needed)
- [ ] Re-tested after fixes
- [ ] Documentation updated

---

## Common Issues & Fixes

### Issue 1: "Missing required property"

**Error**: `The property X is required but missing`

**Cause**: Schema generator not receiving all required data

**Fix**:
1. Check data being passed to schema generator
2. Verify database has all required fields
3. Add fallback values for optional data
4. Update schema generator to handle missing data gracefully

**Example**:
```typescript
// Before (breaks if no rating)
rating: {
  value: herb.averageRating,
  count: herb.reviewCount
}

// After (conditional rating)
rating: herb.averageRating && herb.reviewCount
  ? {
      value: herb.averageRating,
      count: herb.reviewCount
    }
  : undefined
```

### Issue 2: "Invalid URL"

**Error**: `The value provided for X must be a valid URL`

**Cause**: Relative URLs used instead of absolute URLs

**Fix**:
1. Use `getAbsoluteUrl()` helper function
2. Ensure all URLs start with `https://`
3. Check environment variables (NEXT_PUBLIC_APP_URL)

**Example**:
```typescript
// Before (relative URL)
url: `/herbs/${herb.slug}`

// After (absolute URL)
url: getAbsoluteUrl(`/herbs/${herb.slug}`)
```

### Issue 3: "Multiple schemas with same @id"

**Error**: `Multiple entities with the same @id`

**Cause**: Duplicate schema scripts or ID conflicts

**Fix**:
1. Check for duplicate JsonLd components
2. Ensure unique @id for each schema
3. Remove any hardcoded JSON-LD scripts

### Issue 4: "Image URL not accessible"

**Error**: `Image URL returns 404 or is not accessible`

**Cause**: Image URL is broken or behind authentication

**Fix**:
1. Verify image URLs are publicly accessible
2. Use Cloudflare Images URLs with public variants
3. Add fallback images for missing photos

### Issue 5: "Incorrect schema type"

**Error**: `The property X is not recognized for type Y`

**Cause**: Wrong schema type or property name

**Fix**:
1. Check schema.org documentation for correct type
2. Verify property names match spec
3. Use correct nested types (e.g., MedicalCondition inside HealthTopicContent)

### Issue 6: "Localhost URL in production"

**Error**: `URL contains localhost or development domain`

**Cause**: Environment variable not set correctly

**Fix**:
1. Set `NEXT_PUBLIC_APP_URL` in production
2. Use conditional URL generation based on environment
3. Verify build-time environment variables

---

## Results Documentation

### Testing Results Template

Use this template to document your findings:

```markdown
# JSON-LD Schema Testing Results

**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: Development / Staging / Production
**Browser**: Chrome 120 / Firefox 121 / etc.

## Summary

- Total Pages Tested: X
- Pages Passing: X
- Pages with Warnings: X
- Pages with Errors: X
- Overall Status: ✅ Pass / ⚠️ Warnings / ❌ Fail

## Detailed Results

### 1. Root Layout (Organization + WebSite)
**URL**: http://localhost:3000/en
**Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
**Schemas Found**: 2 (Organization, WebSite)
**Errors**: None / [List errors]
**Warnings**: None / [List warnings]
**Notes**: [Any observations]

### 2. Herb Detail Page
**URL**: http://localhost:3000/en/herbs/ginseng
**Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
**Schemas Found**: 2 (Product+MedicalEntity, Breadcrumb)
**Errors**: None / [List errors]
**Warnings**: None / [List warnings]
**Notes**: [Any observations]

### 3. Formula Detail Page
**URL**: http://localhost:3000/en/formulas/liu-wei-di-huang-wan
**Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
**Schemas Found**: 2 (Product+MedicalTherapy, Breadcrumb)
**Errors**: None / [List errors]
**Warnings**: None / [List warnings]
**Notes**: [Any observations]

### 4. Condition Detail Page
**URL**: http://localhost:3000/en/conditions/insomnia
**Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
**Schemas Found**: 2 (HealthTopicContent, Breadcrumb)
**Errors**: None / [List errors]
**Warnings**: None / [List warnings]
**Notes**: [Any observations]

### 5. Practitioner Detail Page
**URL**: http://localhost:3000/en/practitioners/dr-jane-smith
**Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
**Schemas Found**: 2 (Person+MedicalBusiness, Breadcrumb)
**Errors**: None / [List errors]
**Warnings**: None / [List warnings]
**Notes**: [Any observations]

### 6. Modality Detail Page
**URL**: http://localhost:3000/en/modalities/acupuncture
**Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
**Schemas Found**: 1 (MedicalWebPage+MedicalTherapy)
**Errors**: None / [List errors]
**Warnings**: None / [List warnings]
**Notes**: [Any observations]

### 7. FAQ Page
**URL**: http://localhost:3000/en/faq
**Status**: ✅ Pass / ⚠️ Warning / ❌ Fail
**Schemas Found**: 1 (FAQPage with 14 questions)
**Errors**: None / [List errors]
**Warnings**: None / [List warnings]
**Notes**: [Any observations]

## Issues Identified

### High Priority (Blocking)
1. [Issue description]
   - **Page**: [Affected page]
   - **Error**: [Error message]
   - **Fix**: [Proposed solution]

### Medium Priority (Warnings)
1. [Issue description]
   - **Page**: [Affected page]
   - **Warning**: [Warning message]
   - **Fix**: [Proposed solution]

### Low Priority (Improvements)
1. [Issue description]
   - **Page**: [Affected page]
   - **Suggestion**: [Improvement idea]

## Screenshots

[Attach screenshots of validation results]

## Next Steps

- [ ] Fix high-priority issues
- [ ] Address warnings
- [ ] Re-test affected pages
- [ ] Deploy to staging
- [ ] Final production validation

## Sign-off

- [ ] All schemas validated
- [ ] No blocking errors
- [ ] Ready for deployment

**Tested by**: [Your Name]
**Date**: [Date]
**Approved by**: [Reviewer Name]
```

---

## Quick Testing Commands

### Start Development Server
```bash
cd apps/web
pnpm dev
```

### View All Routes
```bash
# List all pages with schemas
echo "Pages to test:"
echo "1. http://localhost:3000/en"
echo "2. http://localhost:3000/en/herbs/[slug]"
echo "3. http://localhost:3000/en/formulas/[slug]"
echo "4. http://localhost:3000/en/conditions/[slug]"
echo "5. http://localhost:3000/en/practitioners/[slug]"
echo "6. http://localhost:3000/en/modalities/[slug]"
echo "7. http://localhost:3000/en/faq"
```

### Extract JSON-LD from Page Source (Browser Console)
```javascript
// Run this in browser console on any page
const scripts = document.querySelectorAll('script[type="application/ld+json"]')
scripts.forEach((script, index) => {
  console.log(`Schema ${index + 1}:`)
  console.log(JSON.parse(script.textContent))
})
```

---

## Expected Timeline

- **Testing Duration**: 1-2 hours
- **Issue Fixes**: 1-2 hours (if issues found)
- **Re-testing**: 30 minutes
- **Documentation**: 30 minutes
- **Total**: 3-5 hours

---

## Success Criteria

### All Pages Must Have:
- ✅ Valid JSON-LD syntax
- ✅ Correct schema.org types
- ✅ All required properties
- ✅ Absolute URLs (not relative)
- ✅ No validation errors
- ✅ Warnings addressed or documented

### Bonus (Nice to Have):
- ✅ Rich results preview looks professional
- ✅ All optional properties populated
- ✅ Images optimized and accessible
- ✅ Aggregate ratings on all applicable pages

---

## Post-Testing Actions

After successful testing:

1. **Document Results**: Save testing results template
2. **Update TODO_MASTER.md**: Mark testing task as complete
3. **Create GitHub Issue** (if issues found): Document bugs and fixes needed
4. **Deploy to Staging**: Test in staging environment
5. **Submit to Google Search Console**: Request indexing
6. **Monitor**: Track rich results appearance (2-4 weeks)

---

## Resources

- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/
- Schema.org Documentation: https://schema.org/
- Google Search Central: https://developers.google.com/search/docs/appearance/structured-data
- JSON-LD Playground: https://json-ld.org/playground/

---

**Testing Status**: 🟡 Ready to Begin
**Expected Outcome**: ✅ All schemas valid and production-ready
**Next Step**: Start testing with Root Layout, then proceed through each page type

