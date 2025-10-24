# Strapi Plugin Integration Guide

**Last Updated**: 2025-10-20
**Strapi Version**: 5.7.0
**Status**: Evaluation & Recommendations

---

## Overview

This document evaluates Strapi plugins for enhancing the Verscienta Health CMS, focusing on video content management and search optimization.

---

## 1. Video Field Plugin

### Plugin Information

**Plugin**: `@sklinet/strapi-plugin-video-field`
**Version**: Compatible with Strapi v5.1.1+
**NPM**: https://www.npmjs.com/package/@sklinet/strapi-plugin-video-field
**GitHub**: https://github.com/SKLINET/strapi-plugin-video-field
**Marketplace**: https://market.strapi.io/plugins/@sklinet-strapi-plugin-video-field

### Compatibility

✅ **Strapi v5 Compatible**
- Tested on Strapi v5.1.1+
- Requires Node >= v20.x.x
- Actively maintained for Strapi v5

### Features

1. **Multi-Platform Video Support**
   - YouTube integration
   - Vimeo integration
   - Facebook video support

2. **Video Preview**
   - Preview videos directly in Strapi admin panel
   - No need to navigate to external platforms

3. **Custom Field Type**
   - Adds video field to content-type builder
   - Easy to add to any collection type

4. **JSON Response Format**
   ```json
   {
     "provider": "youtube",
     "providerUid": "dQw4w9WgXcQ",
     "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
   }
   ```

### Installation

```bash
cd apps/strapi-cms
npm install @sklinet/strapi-plugin-video-field
```

### Configuration

After installation, the video field appears in the custom fields section of the content-type builder.

### Use Cases for Verscienta Health

#### 1. **Herbal Preparation Videos**
Add instructional videos to herb entries:
- How to prepare herbal teas
- Decoction techniques
- Storage best practices
- Harvesting demonstrations

**Example Schema** (`apps/strapi-cms/src/api/herb/content-types/herb/schema.json`):
```json
{
  "attributes": {
    "preparationVideos": {
      "type": "component",
      "repeatable": true,
      "component": "media.video-tutorial"
    }
  }
}
```

**Component** (`apps/strapi-cms/src/components/media/video-tutorial.json`):
```json
{
  "attributes": {
    "title": { "type": "string" },
    "description": { "type": "text" },
    "video": { "type": "customField", "customField": "plugin::video-field.video" },
    "duration": { "type": "string" },
    "difficulty": { "type": "enumeration", "enum": ["beginner", "intermediate", "advanced"] }
  }
}
```

#### 2. **TCM Practitioner Demonstrations**
Practitioner profiles with video introductions:
- Introduction videos
- Technique demonstrations
- Patient testimonials
- Virtual tour of clinic

#### 3. **Formula Preparation Guides**
Step-by-step video guides for traditional formulas:
- Mixing ratios
- Preparation methods
- Quality assessment
- Storage instructions

#### 4. **Educational Content**
Wellness education videos:
- Acupressure points demonstrations
- Qi Gong exercises
- Breathing techniques
- Meditation guides

### Implementation Priority

**Priority**: Medium
**Effort**: Low (1-2 hours)
**Impact**: Medium-High for user engagement

**Recommendation**: Implement after core content is populated, particularly useful for practitioner profiles and herb preparation guides.

---

## 2. Algolia Search Plugin

### Plugin Information

**Plugin**: `strapi-plugin-strapi-algolia`
**Version**: Compatible with Strapi v5
**GitHub**: https://github.com/wizbii/strapi-plugin-strapi-algolia
**Marketplace**: https://market.strapi.io/plugins/strapi-plugin-strapi-algolia
**Strapi Integration**: https://strapi.io/integrations/algolia

### Compatibility

✅ **Strapi v5 Compatible**
- Evolved alongside Strapi v5
- Maintains compatibility with modern Strapi versions
- Different from v4 plugin (Mattie Bundle)

### Features

1. **Automated Content Indexing**
   - Auto-indexes on content creation/update
   - Real-time synchronization with Algolia
   - Configurable per content type

2. **Bulk Indexing**
   - Manual bulk index button in admin panel
   - Index all existing content at once
   - Useful for initial setup or re-indexing

3. **Multi-Collection Support**
   - Configure multiple content types
   - Separate indexes per collection
   - Custom indexing rules per type

4. **Search-as-You-Type**
   - Instant search results
   - Typo tolerance
   - Faceted search support

### Installation

```bash
cd apps/strapi-cms
npm install strapi-plugin-strapi-algolia
```

### Configuration

#### 1. Environment Variables (`.env`)
```env
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_admin_api_key
ALGOLIA_INDEX_PREFIX=verscienta_
```

#### 2. Plugin Configuration (`config/plugins.ts`)
```typescript
export default ({ env }) => ({
  'strapi-algolia': {
    enabled: true,
    config: {
      apiKey: env('ALGOLIA_API_KEY'),
      applicationId: env('ALGOLIA_APP_ID'),
      contentTypes: [
        {
          name: 'api::herb.herb',
          index: 'herbs',
          populate: ['featuredImage', 'tcmProperties'],
        },
        {
          name: 'api::formula.formula',
          index: 'formulas',
          populate: ['ingredients'],
        },
        {
          name: 'api::condition.condition',
          index: 'conditions',
        },
        {
          name: 'api::practitioner.practitioner',
          index: 'practitioners',
          populate: ['photo', 'modalities'],
        },
      ],
    },
  },
});
```

### Current State vs. Strapi Algolia Plugin

**Current Implementation** (`apps/web/lib/algolia.ts`):
- ✅ Frontend-only Algolia integration
- ✅ Manual index configuration
- ✅ Search functionality working
- ❌ No automatic CMS-to-Algolia sync
- ❌ Manual re-indexing required

**With Strapi Algolia Plugin**:
- ✅ Automatic indexing on content changes
- ✅ Bulk index button in admin panel
- ✅ CMS-managed search index
- ✅ Real-time search updates
- ✅ Reduced manual maintenance

### Migration Path

#### Current State
```typescript
// apps/web/lib/algolia.ts
export async function searchHerbs(query: string) {
  const index = algoliaClient.initIndex('herbs')
  const { hits } = await index.search(query)
  return hits
}
```

#### After Strapi Plugin Integration

1. **Install Plugin** (as shown above)

2. **Configure Content Types**
   - Enable Algolia sync for Herb, Formula, Condition, Practitioner

3. **Initial Bulk Index**
   - Use admin panel button to index existing content

4. **Frontend Stays the Same**
   - Existing `apps/web/lib/algolia.ts` continues to work
   - No frontend code changes needed
   - Automatic backend sync keeps indexes fresh

### Benefits for Verscienta Health

#### 1. **Reduced Maintenance**
- No manual re-indexing scripts
- Content creators don't need technical knowledge
- Algolia stays in sync automatically

#### 2. **Improved Search Quality**
- Always up-to-date search results
- New content immediately searchable
- Deleted content removed from search

#### 3. **Better Admin Experience**
- One-click bulk indexing
- Visual feedback on index status
- Error handling in admin UI

#### 4. **Scalability**
- Handles growing content library
- Efficient incremental updates
- Supports multi-language content

### Implementation Priority

**Priority**: High
**Effort**: Medium (4-6 hours including testing)
**Impact**: High for content management workflow

**Recommendation**: Implement soon to reduce manual search maintenance and enable automatic content synchronization.

---

## 3. Combined Integration Strategy

### Phase 1: Algolia Plugin (Immediate)

**Why First**: Currently using Algolia but with manual sync. Plugin adds automation.

**Steps**:
1. Install `strapi-plugin-strapi-algolia`
2. Configure content types in `config/plugins.ts`
3. Set environment variables
4. Bulk index existing content
5. Test auto-indexing with new content
6. Monitor sync performance

**Timeline**: 1 week (including testing)

### Phase 2: Video Plugin (Later)

**Why Second**: Less critical, depends on video content availability.

**Steps**:
1. Install `@sklinet/strapi-plugin-video-field`
2. Add video components to Herb schema
3. Add video field to Practitioner schema
4. Create sample video content
5. Update frontend to display videos
6. Test embedding YouTube/Vimeo content

**Timeline**: 2 weeks (including frontend integration)

---

## 4. Frontend Integration

### Video Display Component

**File**: `apps/web/components/media/VideoEmbed.tsx`

```typescript
'use client'

import { useState } from 'react'

interface VideoEmbedProps {
  provider: 'youtube' | 'vimeo' | 'facebook'
  providerUid: string
  title?: string
}

export function VideoEmbed({ provider, providerUid, title }: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)

  const getEmbedUrl = () => {
    switch (provider) {
      case 'youtube':
        return `https://www.youtube.com/embed/${providerUid}`
      case 'vimeo':
        return `https://player.vimeo.com/video/${providerUid}`
      case 'facebook':
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(providerUid)}`
      default:
        return ''
    }
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-earth-500 border-t-transparent" />
        </div>
      )}
      <iframe
        src={getEmbedUrl()}
        title={title || 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
```

**Usage in Herb Page**:
```typescript
// apps/web/app/[lang]/herbs/[slug]/page.tsx
import { VideoEmbed } from '@/components/media/VideoEmbed'

export default async function HerbPage({ params }) {
  const herb = await getHerb(params.slug)

  return (
    <div>
      {/* Herb details */}

      {herb.preparationVideos?.length > 0 && (
        <section>
          <h2>Preparation Videos</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {herb.preparationVideos.map((video) => (
              <div key={video.id}>
                <VideoEmbed
                  provider={video.video.provider}
                  providerUid={video.video.providerUid}
                  title={video.title}
                />
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

---

## 5. Cost Analysis

### Algolia Search

**Current Plan**: Free tier (10,000 records, 100,000 operations/month)
**Estimated Usage**:
- ~15,000 herbs + formulas + conditions + practitioners
- ~50,000 searches/month (estimated)

**Recommendation**: May need to upgrade to Essential plan ($99/month) as content grows

### Video Plugin

**Cost**: Free (open-source)
**Hosting**: External (YouTube/Vimeo)
- YouTube: Free unlimited
- Vimeo Free: 500MB storage/week
- Vimeo Plus: $7/month for 5GB storage

**Recommendation**: Start with YouTube for free unlimited hosting

---

## 6. Security Considerations

### Algolia API Keys

**Admin API Key**: Backend only (Strapi)
- Keep in `.env` file
- Never expose to frontend
- Used for indexing operations

**Search-Only API Key**: Frontend (Next.js)
- Public-facing
- Read-only access
- Rate-limited by Algolia

**Configuration**:
```env
# Strapi CMS (.env)
ALGOLIA_APP_ID=XXXXXX
ALGOLIA_ADMIN_KEY=xxxxxxxxx  # Admin key (secret)

# Web App (.env.local)
NEXT_PUBLIC_ALGOLIA_APP_ID=XXXXXX
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=yyyyyyy  # Search-only key (public)
```

### Video Embeds

**Security Measures**:
1. **CSP Headers**: Allow YouTube/Vimeo embeds
   ```typescript
   // next.config.ts
   headers() {
     return [
       {
         source: '/:path*',
         headers: [
           {
             key: 'Content-Security-Policy',
             value: "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.facebook.com;",
           },
         ],
       },
     ]
   }
   ```

2. **Validation**: Validate video URLs in Strapi admin
3. **Sanitization**: Escape user-generated video titles/descriptions

---

## 7. Testing Checklist

### Algolia Plugin Testing

- [ ] Install plugin successfully
- [ ] Configure content types in `config/plugins.ts`
- [ ] Environment variables set correctly
- [ ] Bulk index existing herbs (test with 10 items first)
- [ ] Create new herb → verify auto-indexing
- [ ] Update existing herb → verify re-indexing
- [ ] Delete herb → verify removal from index
- [ ] Frontend search returns updated results
- [ ] Monitor Algolia dashboard for operations
- [ ] Test multi-language search (if applicable)

### Video Plugin Testing

- [ ] Install plugin successfully
- [ ] Video field appears in custom fields
- [ ] Add video field to Herb schema
- [ ] Create new herb with YouTube video
- [ ] Test video preview in Strapi admin
- [ ] Test video preview in frontend
- [ ] Try Vimeo video
- [ ] Test responsive video embeds
- [ ] Verify video metadata (provider, UID, URL)
- [ ] Test with invalid video URLs

---

## 8. Related Documentation

- [STRAPI_CMS_SETUP.md](./STRAPI_CMS_SETUP.md) - Strapi CMS configuration
- [ALGOLIA_INTEGRATION.md](./ALGOLIA_INTEGRATION.md) - Current Algolia setup
- [BUILD_FIXES_2025-10-20.md](./BUILD_FIXES_2025-10-20.md) - Build troubleshooting
- [TODO_MASTER.md](./TODO_MASTER.md) - Project task tracking

---

## 9. Recommendations Summary

### Immediate Actions (Week 1-2)

1. ✅ **Implement Algolia Plugin**
   - High priority
   - Reduces manual maintenance
   - Improves content workflow
   - Estimated effort: 4-6 hours

### Medium-Term Actions (Month 1-2)

2. **Implement Video Plugin**
   - Medium priority
   - Enhances user engagement
   - Requires video content creation
   - Estimated effort: 2 weeks (including frontend)

### Long-Term Considerations

3. **Monitor Algolia Usage**
   - Track search operations
   - Plan for plan upgrade if needed
   - Optimize search indexes

4. **Video Content Strategy**
   - Identify high-value video content
   - Partner with practitioners for demos
   - Create herb preparation library
   - Consider YouTube channel for Verscienta Health

---

## 10. Next Steps

1. **Decision Point**: Approve Algolia plugin integration?
2. **Decision Point**: Approve Video plugin integration?
3. **If approved**: Add to TODO_MASTER.md
4. **If approved**: Create implementation tickets
5. **If approved**: Allocate development time

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-20 | 1.0.0 | Initial plugin evaluation and recommendations |

---

**Questions or Feedback?** Contact the development team or create an issue in the repository.
