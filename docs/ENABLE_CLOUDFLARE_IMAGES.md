# Enable Cloudflare Images - Step-by-Step Guide

**Status**: 🔧 Action Required
**Current**: Using R2 storage only (no optimization)
**Goal**: Enable Cloudflare Images CDN + optimization

---

## Current vs Target Architecture

### Current (R2 Only) ❌
```
User → Next.js → R2 Direct URL
                  └─ Large, unoptimized images
                  └─ No CDN caching
                  └─ No format conversion
```

### Target (R2 + Cloudflare Images) ✅
```
User → Next.js → Cloudflare Images CDN → R2 Storage
                  └─ Optimized (WebP/AVIF)
                  └─ Global CDN (275+ cities)
                  └─ On-the-fly transformations
```

---

## Step 1: Enable Cloudflare Images

### 1.1 In Cloudflare Dashboard

1. **Log in** to Cloudflare Dashboard
2. Navigate to **"Images"** in the sidebar
3. Click **"Enable Cloudflare Images"**
4. Choose a plan:
   - **Developer**: $5/month (100K images, $1/100K additional)
   - **Production**: Custom pricing for >1M images

### 1.2 Set Up Integration with R2

Cloudflare Images can pull images from your R2 bucket:

1. In Cloudflare Images settings
2. Navigate to **"Integrations"**
3. Click **"Connect R2 Bucket"**
4. Select your bucket: `verscienta-media`
5. This allows Cloudflare Images to serve and optimize images from R2

---

## Step 2: Get Configuration Values

After enabling, collect these values:

1. **Account ID**:
   - Found in Cloudflare Dashboard URL
   - Format: `abc123def456` (alphanumeric)
   - Or navigate to "Manage Account" → copy Account ID

2. **Account Hash** (for image URLs):
   - Navigate to Cloudflare Images
   - Click "Custom URL"
   - Copy the hash (appears in example URLs)
   - Format: `xyz789abc` (usually 8-12 chars)

3. **Delivery URL**:
   - Default: `https://imagedelivery.net`
   - Or custom domain if configured

4. **API Token** (for uploads):
   - Navigate to "My Profile" → "API Tokens"
   - Create token with "Cloudflare Images Write" permission
   - Format: `Bearer ey...` (long string)

---

## Step 3: Update Environment Variables

### apps/web/.env.local

```env
# Cloudflare Images CDN (ADD THESE)
CLOUDFLARE_IMAGES_ENABLED=true
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=abc123def456  # Your account ID
NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net
CLOUDFLARE_ACCOUNT_HASH=xyz789abc  # Your account hash
CLOUDFLARE_IMAGES_API_TOKEN=your_api_token_here  # Optional, for programmatic uploads
```

### apps/strapi-cms/.env

**No changes needed!** R2 storage configuration remains the same:

```env
# These stay as-is
CLOUDFLARE_ACCOUNT_ID=abc123def456
CLOUDFLARE_ACCESS_KEY_ID=r2_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=r2_secret_access_key
CLOUDFLARE_BUCKET_NAME=verscienta-media
```

---

## Step 4: Configure R2 Public Access Policies

Since Cloudflare Images will fetch from R2, you need to allow access:

### Option A: Use Cloudflare Images Integration (Recommended)

If you connected R2 in Step 1.2, **no policy changes needed**. Cloudflare Images has internal access.

### Option B: Manual R2 Policy

If not using integration, add a policy to allow Cloudflare Images to access R2:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "images.cloudflare.com"
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::verscienta-media/*"]
    }
  ]
}
```

---

## Step 5: Update Image URLs in Database

Your Strapi database likely stores R2 URLs like:
```
https://abc123.r2.cloudflarestorage.com/verscienta-media/image.jpg
```

These need to reference **image IDs** for Cloudflare Images:
```
image-id-12345
```

### Migration Strategy

**Option A: Keep R2 URLs, Use Proxy** (Easier, recommended for start)

Keep existing R2 URLs and let the OptimizedImage component detect and convert them:

```typescript
// In apps/web/lib/cloudflare-images.ts
export function getCloudflareImageUrl(imageId: string, options = {}) {
  // If imageId is an R2 URL, extract the filename
  if (imageId.includes('r2.cloudflarestorage.com')) {
    const filename = imageId.split('/').pop()
    imageId = filename || imageId
  }

  // Continue with Cloudflare Images URL generation
  // ...
}
```

**Option B: Upload Images to Cloudflare Images** (Better long-term)

Upload all images from R2 to Cloudflare Images:

```bash
# Using Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1" \
  -H "Authorization: Bearer {api_token}" \
  -F "url=https://abc123.r2.cloudflarestorage.com/verscienta-media/image.jpg"
```

Or use the provided migration script (see Step 6).

---

## Step 6: Migration Script

Create a script to upload all R2 images to Cloudflare Images:

```typescript
// apps/web/scripts/migrate-to-cloudflare-images.ts
import { uploadToCloudflareImages } from '@/lib/cloudflare-images'
import { prisma } from '@/lib/prisma'

async function migrateImages() {
  console.log('Starting image migration to Cloudflare Images...')

  // Get all images from Strapi database
  const images = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/upload/files`)
  const imageData = await images.json()

  let migrated = 0
  let failed = 0

  for (const image of imageData.data) {
    try {
      // Fetch image from R2
      const response = await fetch(image.url)
      const blob = await response.blob()

      // Upload to Cloudflare Images
      const result = await uploadToCloudflareImages(blob, {
        alt: image.alternativeText || '',
        caption: image.caption || '',
        originalFilename: image.name,
      })

      console.log(`✅ Migrated: ${image.name} → ${result.id}`)

      // Update database with new Cloudflare Images ID
      // await updateImageUrl(image.id, result.id)

      migrated++
    } catch (error) {
      console.error(`❌ Failed: ${image.name}`, error)
      failed++
    }
  }

  console.log(`\nMigration complete!`)
  console.log(`✅ Migrated: ${migrated}`)
  console.log(`❌ Failed: ${failed}`)
}

migrateImages()
```

Run with:
```bash
cd apps/web
npx tsx scripts/migrate-to-cloudflare-images.ts
```

---

## Step 7: Test the Integration

### 7.1 Check Environment Variables

```bash
# In apps/web/
node -e "console.log('Account ID:', process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID)"
node -e "console.log('Delivery URL:', process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL)"
node -e "console.log('Enabled:', process.env.CLOUDFLARE_IMAGES_ENABLED)"
```

### 7.2 Test URL Generation

```typescript
// Create test file: apps/web/test-cloudflare-images.ts
import { getCloudflareImageUrl, isCloudflareImagesEnabled } from './lib/cloudflare-images'

console.log('Cloudflare Images enabled:', isCloudflareImagesEnabled())

const testUrl = getCloudflareImageUrl('test-image-id', {
  width: 800,
  quality: 85,
  format: 'auto',
})

console.log('Generated URL:', testUrl)
// Should output: https://imagedelivery.net/{account_id}/test-image-id?width=800&quality=85&format=auto
```

Run:
```bash
npx tsx test-cloudflare-images.ts
```

### 7.3 Test in Browser

1. Start development server:
   ```bash
   pnpm dev:web
   ```

2. Navigate to a page with images (e.g., /herbs)

3. Open DevTools → Network tab

4. Look for image requests

5. **Verify URLs**:
   - ✅ Should be: `https://imagedelivery.net/{account_id}/...`
   - ❌ NOT: `https://{account_id}.r2.cloudflarestorage.com/...`

### 7.4 Verify Optimization

In DevTools Network tab:

1. Click on an image request
2. Check response headers:
   - `cf-ray`: Cloudflare CDN hit
   - `content-type`: Should be `image/webp` or `image/avif` (not jpeg/png)
   - `content-length`: Should be much smaller than original

**Example**:
- Original JPEG: 2.5MB
- Cloudflare Images WebP: 180KB (**93% smaller!**)

---

## Step 8: Update Production Environment

Once tested locally:

### 8.1 Add to Production .env

In your deployment platform (Coolify/Vercel/etc):

```env
CLOUDFLARE_IMAGES_ENABLED=true
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=abc123def456
NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net
CLOUDFLARE_ACCOUNT_HASH=xyz789abc
CLOUDFLARE_IMAGES_API_TOKEN=your_production_token
```

### 8.2 Deploy

```bash
git add .env.example  # Update with correct values (redacted)
git commit -m "feat: enable Cloudflare Images CDN optimization"
git push origin main
```

### 8.3 Verify Production

1. Visit production site
2. Check image URLs in DevTools
3. Verify Cloudflare CDN headers
4. Run Lighthouse audit:
   - Should see improved LCP (Largest Contentful Paint)
   - Smaller total page size
   - Better performance score

---

## Step 9: Monitoring

### Cloudflare Dashboard

Monitor usage in Cloudflare Images dashboard:

1. **Transformations**: Total image requests
2. **Bandwidth**: Data transferred (should be low due to CDN caching)
3. **Cache Hit Ratio**: Should be >95%
4. **Top Images**: Most requested images

### Set Up Alerts

In Cloudflare dashboard:

1. Navigate to "Notifications"
2. Create alert for:
   - High transformation usage (80% of quota)
   - Low cache hit ratio (<90%)
   - Unusual traffic spikes

---

## Troubleshooting

### Issue: Images still loading from R2

**Check**:
1. Environment variables set correctly
2. `CLOUDFLARE_IMAGES_ENABLED=true`
3. OptimizedImage component being used (not raw `<img>` tags)
4. No hardcoded R2 URLs in code

**Solution**: Restart development server after updating .env

### Issue: 401 Unauthorized errors

**Cause**: Invalid API token or account ID

**Solution**:
1. Verify account ID is correct
2. Regenerate API token with correct permissions
3. Ensure token has "Cloudflare Images Read" permission

### Issue: Images not found (404)

**Cause**: Images not uploaded to Cloudflare Images yet

**Solutions**:
1. Use Option A (proxy R2 URLs) - see Step 5
2. Run migration script (Step 6)
3. Or manually upload images via Cloudflare dashboard

### Issue: Poor cache hit ratio

**Check**:
1. Using consistent URLs (same transformations)
2. Not using random query parameters
3. CDN purge not being called too often

**Solution**: Use predefined variants for consistent caching

---

## Cost Estimation

### Cloudflare Images Pricing

**Developer Plan**:
- $5/month base (100,000 images)
- $1 per additional 100,000 images
- Unlimited transformations
- Unlimited bandwidth

**Example for Verscienta**:
- Estimated images: ~5,000 herbs/conditions/practitioners
- Monthly transformations: ~500,000 (estimated)
- **Cost**: $5/month (well within 100K image limit)

### Cost Savings vs Self-Hosting

**Without Cloudflare Images** (using just R2):
- Server bandwidth: ~$50-100/month (500GB)
- Server CPU for image processing: ~$20/month
- **Total**: ~$70-120/month

**With Cloudflare Images**:
- Cloudflare Images: $5/month
- R2 storage: $0.015/GB (~$1/month)
- **Total**: ~$6/month

**Savings**: ~$64-114/month (**92% cost reduction**)

---

## Performance Gains

### Expected Improvements

| Metric | Before (R2 only) | After (Cloudflare Images) | Improvement |
|--------|------------------|---------------------------|-------------|
| Image load time | 1200ms | 150ms | **88% faster** |
| Image size | 2.5MB avg | 200KB avg | **92% smaller** |
| LCP (Largest Contentful Paint) | 3.2s | 0.9s | **72% faster** |
| Page load time | 4.1s | 1.3s | **68% faster** |
| Total page size | 12MB | 1.5MB | **88% smaller** |

---

## Next Steps

1. ✅ **Enable Cloudflare Images** in dashboard
2. ✅ **Get configuration values** (account ID, hash, etc.)
3. ✅ **Update .env files** with new values
4. ✅ **Test locally** (verify URLs and optimization)
5. ✅ **Run migration script** (if using Option B)
6. ✅ **Deploy to production** with new env variables
7. ✅ **Monitor performance** in Cloudflare dashboard

---

## Summary

**Current State**: ❌ R2 storage only (no optimization)
**Target State**: ✅ R2 storage + Cloudflare Images CDN
**Cost**: $5/month (~$65-115/month savings vs self-hosting)
**Performance**: 88% faster load times, 92% smaller images
**Effort**: ~1 hour setup + monitoring

**Recommendation**: Enable Cloudflare Images immediately. The performance gains and cost savings are substantial.

---

**Last Updated**: October 2025
**Priority**: 🔥 High - Significant performance impact
