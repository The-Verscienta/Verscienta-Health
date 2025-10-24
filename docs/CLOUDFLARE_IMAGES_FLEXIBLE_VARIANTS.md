# Cloudflare Images with Flexible Variants

Complete guide to setting up and using Cloudflare Images with Flexible Variants for optimized image delivery in Verscienta Health.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Guide](#setup-guide)
3. [Enabling Flexible Variants](#enabling-flexible-variants)
4. [Configuration](#configuration)
5. [Security Features](#security-features)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Cloudflare Images?

Cloudflare Images is a dedicated image hosting and optimization service that provides:

- **Global CDN** - 300+ locations worldwide with <50ms latency
- **Automatic Optimization** - Automatic WebP/AVIF conversion based on browser support
- **Unlimited Transformations** - Resize, crop, and transform images on-the-fly
- **Cost-Effective** - $5/month for 100K images, $1/100K additional
- **10MB Upload Limit** - Per image

### Named Variants vs Flexible Variants

**Named Variants** (Traditional):
- Pre-configured in Cloudflare dashboard
- Fixed dimensions and settings
- URL: `https://imagedelivery.net/<account>/<id>/thumbnail`

**Flexible Variants** (Recommended):
- On-the-fly transformations via URL parameters
- No pre-configuration needed
- URL: `https://imagedelivery.net/<account>/<id>/public?width=800&quality=85`

**Why Flexible Variants?**
- No dashboard configuration required
- Infinite transformation possibilities
- Simpler URL structure
- Better for dynamic use cases

---

## Setup Guide

### Step 1: Enable Cloudflare Images

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account (or create one)
3. Navigate to **Images** in the sidebar
4. Click **Enable Cloudflare Images**
5. Subscribe to the service ($5/month)

### Step 2: Get API Credentials

#### Account ID
1. In Cloudflare Dashboard, go to **Images**
2. Copy your **Account ID** from the right sidebar
3. Save for environment variables

#### API Token
1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use template: **Edit Cloudflare Images**
4. Set permissions:
   - Account → Cloudflare Images → Edit
5. Click **Continue to Summary** → **Create Token**
6. **COPY THE TOKEN** (shown only once!)
7. Save for environment variables

### Step 3: Configure Environment Variables

#### Strapi CMS (`apps/strapi-cms/.env`)

```env
# Cloudflare Images Configuration
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token-here
CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net
```

#### Web App (`apps/web/.env.local`)

```env
# Cloudflare Images Configuration (Public)
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id-here
NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token-here
```

---

## Enabling Flexible Variants

### In Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **Images**
2. Click **Settings** (gear icon)
3. Scroll to **Flexible Variants**
4. Toggle **Enable flexible variants** to ON
5. Click **Save**

**That's it!** Flexible variants are now enabled.

### Verify Flexible Variants

Test with a URL like:
```
https://imagedelivery.net/<account-id>/<image-id>/public?width=400&quality=80
```

If you see the resized image, flexible variants are working!

---

## Configuration

### Strapi Upload Provider

The project uses a custom Cloudflare Images upload provider for Strapi:

**File**: `apps/strapi-cms/src/extensions/upload/providers/cloudflare-images.ts`

**Features**:
- Automatic upload to Cloudflare Images
- Stores Cloudflare Images ID
- Handles deletion
- Falls back to R2 if not configured

**Provider Selection** (`apps/strapi-cms/config/plugins.ts`):

```typescript
upload: {
  config: {
    provider: env('CLOUDFLARE_IMAGES_API_TOKEN') ? 'cloudflare-images' : 'aws-s3',
    providerOptions: {
      accountId: env('CLOUDFLARE_ACCOUNT_ID'),
      apiToken: env('CLOUDFLARE_IMAGES_API_TOKEN'),
      deliveryUrl: env('CLOUDFLARE_IMAGES_DELIVERY_URL', 'https://imagedelivery.net'),
    },
  },
},
```

### Frontend Integration

The project uses `lib/cloudflare-images.ts` for image transformations:

**Auto-detection**:
- Checks if Cloudflare Images is configured
- Falls back to original URLs if not configured
- Supports both named and flexible variants

### Security Features

The Cloudflare Images upload provider includes comprehensive security features:

**1. Upload Rate Limiting**
- Default: 10 uploads per 15 minutes per user
- Prevents abuse and excessive API usage
- Configurable via `rateLimit` option

**2. File Size Validation**
- Default: 10MB maximum file size
- Validates both buffers and streams
- Prevents memory exhaustion attacks

**3. Content Moderation**
- Allowed file types: JPEG, PNG, GIF, WebP, SVG
- Blocks dangerous file extensions (.exe, .sh, .bat, .cmd, .dll, .scr)
- Validates MIME types and file name patterns

**4. Access Logging**
- Logs all uploads and deletions with timestamps
- Records user ID and IP address
- Maintains audit trail for compliance

**Configuration** (`apps/strapi-cms/config/plugins.ts`):

```typescript
upload: {
  config: {
    provider: 'cloudflare-images',
    providerOptions: {
      accountId: env('CLOUDFLARE_ACCOUNT_ID'),
      apiToken: env('CLOUDFLARE_IMAGES_API_TOKEN'),

      // Security options (all optional)
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 uploads per window
      },
      maxFileSize: 10 * 1024 * 1024, // 10MB
      enableAccessLogging: true,
      enableContentModeration: true,
    },
  },
},
```

**Production Recommendations**:

⚠️ **Important**: The default implementation uses in-memory storage for rate limiting and access logs. For production deployments:

1. **Rate Limiting**: Replace in-memory Map with Redis/DragonflyDB
   ```typescript
   // Production: Use Redis for distributed rate limiting
   const redis = new Redis(process.env.REDIS_URL)
   const attempts = await redis.get(`rate-limit:${userId}`)
   ```

2. **Access Logging**: Store logs in database or external service
   ```typescript
   // Production: Write to database
   await strapi.entityService.create('api::audit-log.audit-log', {
     data: logEntry
   })
   ```

3. **Content Moderation**: Consider integrating AI-based image moderation APIs:
   - Cloudflare Images Moderation API
   - AWS Rekognition
   - Google Cloud Vision API

---

## Usage Examples

### Basic Image Component

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src="image-id-from-cloudflare"
  alt="Herb photo"
  width={800}
  height={600}
  quality={85}
  format="auto"
/>
```

### Using Predefined Variants

```tsx
<OptimizedImage
  src="image-id"
  alt="Card thumbnail"
  variant="card"  // 400x300 cover
/>
```

**Available Variants**:
- `thumbnail` - 150x150 cover
- `small` - 320px scale-down
- `medium` - 640px scale-down
- `large` - 1024px scale-down
- `hero` - 1920x1080 cover
- `avatar` - 200x200 cover
- `card` - 400x300 cover

### Advanced Transformations

```tsx
import { getCloudflareImageUrl } from '@/lib/cloudflare-images'

const imageUrl = getCloudflareImageUrl('image-id', {
  width: 800,
  height: 600,
  fit: 'cover',
  quality: 90,
  format: 'webp',
  gravity: 'center',
  sharpen: 1,
  background: 'transparent',
  rotate: 90,
  dpr: 2,  // For retina displays
})
```

### Responsive Images with srcset

```tsx
import { getCloudflareImageSrcSet } from '@/lib/cloudflare-images'

const srcSet = getCloudflareImageSrcSet(
  'image-id',
  [640, 750, 828, 1080, 1200, 1920],
  { format: 'auto', quality: 85 }
)

<img
  src={defaultUrl}
  srcSet={srcSet}
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Responsive image"
/>
```

### Blur Placeholder for Progressive Loading

```tsx
import { getImageBlurPlaceholder } from '@/lib/cloudflare-images'

const blurUrl = getImageBlurPlaceholder('image-id')

<OptimizedImage
  src="image-id"
  alt="Herb"
  enableBlur={true}  // Enabled by default
/>
```

### Avatar Component

```tsx
import { OptimizedAvatar } from '@/components/ui/optimized-image'

<OptimizedAvatar
  src="practitioner-photo-id"
  alt="Dr. John Doe"
  size={64}
  fallback="/images/default-avatar.jpg"
/>
```

### Hero Image Component

```tsx
import { OptimizedHeroImage } from '@/components/ui/optimized-image'

<OptimizedHeroImage
  src="hero-image-id"
  alt="Traditional Chinese Medicine"
  priority={true}  // Load immediately (above-the-fold)
/>
```

---

## API Reference

### URL Parameters (Flexible Variants)

All parameters are optional and can be combined:

#### Dimensions
- `width=<number>` - Image width in pixels
- `height=<number>` - Image height in pixels
- `dpr=<1|2|3>` - Device pixel ratio for retina displays

#### Fit Modes
- `fit=scale-down` - Shrink to fit (default)
- `fit=contain` - Fit within dimensions, preserve aspect ratio
- `fit=cover` - Fill dimensions, crop if needed
- `fit=crop` - Crop to exact dimensions
- `fit=pad` - Pad with background color

#### Quality & Format
- `quality=<1-100>` - JPEG/WebP quality (default: 85)
- `format=auto` - Auto-select best format (default)
- `format=webp` - Force WebP
- `format=avif` - Force AVIF
- `format=jpeg` - Force JPEG
- `format=png` - Force PNG

#### Positioning
- `gravity=auto` - Smart crop (default)
- `gravity=center` - Center crop
- `gravity=top` - Top-aligned crop
- `gravity=bottom` - Bottom-aligned crop
- `gravity=left` - Left-aligned crop
- `gravity=right` - Right-aligned crop

#### Effects
- `blur=<1-250>` - Blur radius
- `sharpen=<0-10>` - Sharpen amount
- `brightness=<0.1-2.0>` - Brightness multiplier
- `contrast=<0.1-2.0>` - Contrast multiplier
- `gamma=<0.1-2.0>` - Gamma correction

#### Other
- `rotate=<0|90|180|270>` - Rotation degrees
- `background=<hex>` - Background color for padding (e.g., `transparent`, `#FFFFFF`)
- `metadata=keep|copyright|none` - Metadata handling
- `trim=top;right;bottom;left` - Crop whitespace

### URL Examples

```
# Basic resize
https://imagedelivery.net/<account>/<id>/public?width=800

# Resize with quality
https://imagedelivery.net/<account>/<id>/public?width=800&quality=90

# Cover with center gravity
https://imagedelivery.net/<account>/<id>/public?width=400&height=300&fit=cover&gravity=center

# Retina display
https://imagedelivery.net/<account>/<id>/public?width=400&dpr=2

# Effects
https://imagedelivery.net/<account>/<id>/public?width=800&sharpen=2&brightness=1.1

# Rotation with padding
https://imagedelivery.net/<account>/<id>/public?rotate=90&background=%23FFFFFF

# Blur placeholder
https://imagedelivery.net/<account>/<id>/public?width=10&blur=10&quality=20
```

---

## Best Practices

### 1. Always Use Flexible Variants

Prefer flexible variants over named variants for:
- Greater flexibility
- Simpler configuration
- Future-proof implementation

### 2. Optimize for Performance

**Image Sizes**:
- Mobile: 375-768px
- Tablet: 768-1024px
- Desktop: 1024-1920px
- 4K: 1920-3840px

**Quality Settings**:
- Thumbnails: 70-75
- Regular images: 80-85
- Hero images: 90-95

**Format Selection**:
- Use `format=auto` for automatic WebP/AVIF conversion
- Manually specify WebP for modern browsers
- Fallback to JPEG for compatibility

### 3. Use Responsive Images

Always provide srcset for responsive images:

```tsx
const widths = [375, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
const srcSet = getCloudflareImageSrcSet('image-id', widths)
```

### 4. Enable Blur Placeholders

Use blur placeholders for better UX:

```tsx
<OptimizedImage enableBlur={true} />
```

### 5. Lazy Load Below-the-Fold Images

Only use `priority={true}` for above-the-fold images:

```tsx
<OptimizedImage priority={false} />  // Lazy load (default)
<OptimizedHeroImage priority={true} />  // Load immediately
```

### 6. Provide Fallback Images

Always provide fallback for error cases:

```tsx
<OptimizedImage fallback="/images/placeholder.jpg" />
```

### 7. Use Appropriate Gravity

- `gravity=auto` - Product photos, general images
- `gravity=center` - Logos, centered subjects
- `gravity=top` - Portraits, face photos (combine with avatar variant)

### 8. Monitor Costs

- 100K images = $5/month
- Additional images = $1/100K
- Transformations = Unlimited (free)

Track usage in Cloudflare Dashboard → Images → Analytics

---

## Troubleshooting

### Images Not Loading

**Issue**: Images return 404 or don't load

**Solutions**:
1. Verify environment variables are set:
   ```bash
   echo $CLOUDFLARE_ACCOUNT_ID
   echo $CLOUDFLARE_IMAGES_API_TOKEN
   ```

2. Check image ID is correct:
   ```
   https://imagedelivery.net/<account>/<id>/public
   ```

3. Verify flexible variants are enabled in dashboard

4. Check browser console for errors

### Upload Fails

**Issue**: Upload to Cloudflare Images fails

**Solutions**:
1. Verify API token has "Edit" permissions
2. Check image size < 10MB
3. Check supported formats: JPEG, PNG, GIF, WebP
4. Review Strapi logs: `pnpm dev:cms`

### Transformations Not Working

**Issue**: URL parameters don't transform the image

**Solutions**:
1. Enable flexible variants in Cloudflare dashboard
2. Use `/public` variant (not `/thumbnail` or other named variants)
3. Check URL encoding for special characters
4. Verify parameters are supported (see API Reference)

### Poor Image Quality

**Issue**: Images look blurry or pixelated

**Solutions**:
1. Increase `quality` parameter (default: 85)
2. Use larger `width` and `height` values
3. Check source image resolution
4. Avoid over-sharpening (`sharpen` > 2)
5. Use `dpr=2` for retina displays

### Slow Loading

**Issue**: Images take too long to load

**Solutions**:
1. Enable blur placeholders
2. Use appropriate image sizes (don't request 4K for thumbnails)
3. Set correct `sizes` attribute for responsive images
4. Use `priority={true}` only for above-the-fold images
5. Check Cloudflare Images status

### Wrong Format Served

**Issue**: Getting JPEG instead of WebP

**Solutions**:
1. Use `format=auto` (recommended)
2. Check browser supports WebP
3. Verify flexible variants enabled
4. Test with explicit `format=webp`

---

## Resources

- [Cloudflare Images Documentation](https://developers.cloudflare.com/images/)
- [Enable Flexible Variants Guide](https://developers.cloudflare.com/images/manage-images/enable-flexible-variants/)
- [URL Format Documentation](https://developers.cloudflare.com/images/transform-images/transform-via-url/)
- [Cloudflare Images Dashboard](https://dash.cloudflare.com/?to=/:account/images)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- [Next.js Image Component](https://nextjs.org/docs/api-reference/next/image)

---

## Summary Checklist

- [ ] Enable Cloudflare Images in dashboard
- [ ] Get Account ID and API Token
- [ ] Enable flexible variants in dashboard settings
- [ ] Add environment variables to Strapi and Web app
- [ ] Test upload via Strapi admin
- [ ] Verify image transformations work
- [ ] Update existing components to use OptimizedImage
- [ ] Configure responsive images with srcset
- [ ] Enable blur placeholders
- [ ] Monitor usage and costs

---

**Questions?** Check [CLOUDFLARE_IMAGES.md](./CLOUDFLARE_IMAGES.md) for general usage or contact support@verscienta.com
