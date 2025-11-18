# FAQ Schema Implementation Guide

**Status**: ✅ **COMPLETE**
**Created**: 2025-11-17
**Last Updated**: 2025-11-17

## Overview

This document describes the FAQ structured data implementation for SEO optimization and Google rich snippets.

## What Was Implemented

### 1. FAQ Schema Generator (`lib/json-ld.ts`)

The `generateFAQSchema()` function creates schema.org FAQPage structured data:

```typescript
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return createJsonLd({
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  })
}
```

**Location**: `apps/web/lib/json-ld.ts:453`

### 2. FAQ Page Integration (`app/[lang]/faq/page.tsx`)

The FAQ page integrates the schema with the `JsonLd` component:

```typescript
// Combine all FAQs for JSON-LD schema
const allFAQs = [...generalFAQs, ...tcmFAQs, ...practitionerFAQs, ...privacyFAQs]

return (
  <>
    {/* JSON-LD Schema for SEO */}
    <JsonLd data={generateFAQSchema(allFAQs)} />
    {/* Page content */}
  </>
)
```

**Location**: `apps/web/app/[lang]/faq/page.tsx:102-107`

### 3. FAQ Categories

The page includes 4 FAQ categories with 14 total questions:

1. **General Platform FAQs** (4 questions)
   - What is Verscienta Health?
   - Who can benefit from using this platform?
   - Is the information on this platform evidence-based?
   - How often is the content updated?

2. **TCM and Herbs FAQs** (4 questions)
   - What is Traditional Chinese Medicine?
   - How do I know which herbs are right for me?
   - Are Chinese herbs safe?
   - Can I combine herbs with my current medications?

3. **Practitioner Directory FAQs** (3 questions)
   - How do I find a qualified practitioner?
   - Are the practitioners verified?
   - Can I book appointments through the platform?

4. **Privacy and Safety FAQs** (3 questions)
   - Is my personal health information secure?
   - Do you share my data with third parties?
   - How can I delete my account?

## Expected Output

When the FAQ page renders, it includes a JSON-LD script tag in the HTML:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Verscienta Health?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Verscienta Health is a comprehensive..."
      }
    },
    {
      "@type": "Question",
      "name": "Who can benefit from using this platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our platform is designed for..."
      }
    }
    // ... 12 more questions
  ]
}
</script>
```

## Testing the FAQ Schema

### Method 1: Google Rich Results Test (Recommended)

1. **Start the development server**:
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Access the FAQ page**:
   ```
   http://localhost:3000/en/faq
   ```

3. **View page source** (Right-click → View Page Source or Ctrl+U)

4. **Locate the JSON-LD script tag**:
   - Search for `"@type": "FAQPage"`
   - Verify all 14 questions are present
   - Copy the entire JSON-LD object

5. **Test with Google Rich Results Test**:
   - Go to: https://search.google.com/test/rich-results
   - Choose "CODE" tab
   - Paste the entire HTML or just the JSON-LD snippet
   - Click "TEST CODE"

6. **Verify results**:
   - ✅ Should show "Page is eligible for rich results"
   - ✅ FAQPage type should be detected
   - ✅ All 14 questions should be listed
   - ✅ No errors or warnings

### Method 2: Schema Markup Validator

1. Go to: https://validator.schema.org/
2. Paste the JSON-LD code
3. Click "Validate"
4. Check for errors or warnings

### Method 3: Chrome DevTools

1. Open the FAQ page in Chrome
2. Open DevTools (F12)
3. Go to Console tab
4. Run this JavaScript:
   ```javascript
   JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
   ```
5. Verify the structure matches the expected output

### Method 4: Production URL Testing

Once deployed to production:

1. Go to: https://search.google.com/test/rich-results
2. Choose "URL" tab
3. Enter: `https://verscienta.com/en/faq`
4. Click "TEST URL"
5. Google will crawl the live page and validate the schema

## Expected Google Rich Snippet Benefits

### 1. Enhanced Search Results

When users search for questions like:
- "What is Traditional Chinese Medicine?"
- "Are Chinese herbs safe?"
- "How to find a TCM practitioner?"

Google may show the FAQ page with:
- **Accordion-style Q&A** directly in search results
- **Highlighted answers** that expand on click
- **Jump links** to specific questions on your page

### 2. Click-Through Rate (CTR) Improvements

Studies show FAQ rich snippets can improve CTR by:
- **35-45%** on average compared to standard snippets
- **More real estate** in search results (multiple questions visible)
- **Higher visibility** on mobile search

### 3. Voice Search Optimization

FAQ structured data helps with:
- **Google Assistant** voice queries
- **Featured snippets** for question-based searches
- **People Also Ask** box inclusion

## Monitoring Performance

### Google Search Console

1. **Set up Search Console** (if not already):
   - Go to: https://search.google.com/search-console
   - Add property: `https://verscienta.com`
   - Verify ownership

2. **Monitor Rich Results**:
   - Navigate to **Enhancements** → **FAQ**
   - View stats:
     - Total valid FAQs
     - Errors and warnings
     - Impressions and clicks

3. **Performance Tracking**:
   - Go to **Performance** tab
   - Filter by page: `/en/faq`
   - Track:
     - Impressions (how often shown in search)
     - Clicks (how often clicked)
     - CTR (Click-Through Rate)
     - Average position

### Expected Timeline

- **Indexing**: 1-7 days after deployment
- **Rich snippets appear**: 2-4 weeks (varies by query)
- **Full SEO impact**: 2-3 months

## Additional Optimization Tips

### 1. Add More FAQs Over Time

The more relevant questions you answer, the better:
- Aim for 20-30 FAQs per page
- Group by topic (we have 4 categories now)
- Answer common user queries from analytics

### 2. Keep Answers Concise

Google prefers:
- **50-300 words** per answer
- Clear, direct language
- Avoid jargon when possible

### 3. Update Content Regularly

- Review FAQs quarterly
- Add new questions based on user feedback
- Update answers as information changes

### 4. Consider Category-Specific FAQ Pages

Future expansion could include:
- `/en/herbs/faq` - Herb-specific FAQs
- `/en/practitioners/faq` - Practitioner FAQs
- `/en/symptom-checker/faq` - Symptom checker FAQs

Each would have its own FAQ schema for better targeting.

## Technical Details

### Schema Properties

| Property | Type | Description |
|----------|------|-------------|
| `@context` | String | Always `https://schema.org` |
| `@type` | String | Always `FAQPage` |
| `mainEntity` | Array | List of Question objects |
| `mainEntity[].@type` | String | Always `Question` |
| `mainEntity[].name` | String | The question text |
| `mainEntity[].acceptedAnswer` | Object | Answer object |
| `mainEntity[].acceptedAnswer.@type` | String | Always `Answer` |
| `mainEntity[].acceptedAnswer.text` | String | The answer text |

### Internationalization (i18n)

FAQ content is fully translated for all supported languages:
- English (`en`)
- Spanish (`es`)
- Simplified Chinese (`zh-CN`)
- Traditional Chinese (`zh-TW`)

Each language has its own FAQ schema with translated questions/answers.

**Translation files**: `messages/{locale}.json` → `faq` namespace

## Troubleshooting

### Issue: Schema not detected by Google

**Solution**:
1. Verify JSON-LD is valid (use validator.schema.org)
2. Check that script tag is in the `<head>` or `<body>`
3. Ensure no JavaScript errors on page
4. Wait 1-2 weeks for Google to recrawl

### Issue: Warnings in Rich Results Test

Common warnings and fixes:

| Warning | Fix |
|---------|-----|
| "Answer is too long" | Keep answers under 300 words |
| "Question duplicated" | Ensure all questions are unique |
| "Missing required property" | Check `@type`, `name`, `acceptedAnswer` |

### Issue: FAQs not showing in search results

**Reasons**:
1. **Not yet indexed** - Wait 2-4 weeks
2. **Low search volume** - Questions not commonly searched
3. **Competition** - Other sites rank higher for same questions
4. **Quality issues** - Google may not consider content authoritative

**Solutions**:
- Focus on long-tail questions (more specific)
- Build page authority with backlinks
- Ensure answers are comprehensive and accurate

## Files Modified

| File | Lines | Changes |
|------|-------|---------|
| `lib/json-ld.ts` | 453-465 | ✅ Already exists |
| `app/[lang]/faq/page.tsx` | 102-107 | ✅ Already integrated |
| `components/seo/JsonLd.tsx` | 26-49 | ✅ Already exists |

## References

- Schema.org FAQPage: https://schema.org/FAQPage
- Google FAQ Rich Results: https://developers.google.com/search/docs/appearance/structured-data/faqpage
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/

## Next Steps

- [ ] Deploy to production (Coolify)
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor FAQ rich results performance (2-4 weeks)
- [ ] Add more FAQs based on user questions
- [ ] Create category-specific FAQ pages (Phase 6)

## Success Metrics

Track these metrics in Google Search Console after 4-8 weeks:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| FAQ pages indexed | 1+ | TBD | 🟡 Pending |
| FAQ rich results shown | 100+ impressions/month | TBD | 🟡 Pending |
| CTR for FAQ page | 5-10% | TBD | 🟡 Pending |
| Average position | Top 10 | TBD | 🟡 Pending |
| Errors/Warnings | 0 | TBD | 🟡 Pending |

---

**Implementation Status**: ✅ **COMPLETE**
**Testing Status**: 🟡 **Pending Production Deployment**
**SEO Impact**: 🟡 **To Be Measured (2-3 months)**
