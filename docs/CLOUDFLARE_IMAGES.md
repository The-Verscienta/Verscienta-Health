# Cloudflare Images Integration

This guide explains how Cloudflare Images is integrated into Verscienta Health for optimized image delivery.

## 🎯 Overview

Cloudflare Images provides:

- **Global CDN** - Images delivered from 300+ locations worldwide
- **Automatic Optimization** - WebP/AVIF conversion, quality optimization
- **Responsive Images** - On-the-fly resizing and cropping
- **Lazy Loading** - Progressive image loading with blur placeholders
- **Cost-Effective** - Pay per image stored, unlimited transformations

## 📦 Components

### 1. OptimizedImage Component

The main component for rendering optimized images:

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image'

;<OptimizedImage
  src="image-id-or-url"
  alt="Description"
  variant="medium"
  enableBlur={true}
  fallback="/images/placeholder.jpg"
/>
```

**Props:**

- `src` - Image ID (Cloudflare) or URL (fallback)
- `alt` - Alt text for accessibility
- `variant` - Predefined size variant (optional)
- `width` / `height` - Custom dimensions (optional)
- `fit` - How to fit image (`cover`, `contain`, `scale-down`, `crop`, `pad`)
- `quality` - Image quality 1-100 (default: 85)
- `format` - Output format (`auto`, `webp`, `avif`, `jpeg`, `png`)
- `enableBlur` - Enable blur placeholder (default: true)
- `fallback` - Fallback image URL if source fails

### 2. Specialized Components

#### OptimizedAvatar

For user/practitioner profile pictures:

```tsx
import { OptimizedAvatar } from '@/components/ui/optimized-image'

;<OptimizedAvatar
  src="user-avatar-id"
  alt="John Doe"
  size={64}
  fallback="/images/default-avatar.jpg"
/>
```

#### OptimizedCardImage

For card thumbnails:

```tsx
import { OptimizedCardImage } from '@/components/ui/optimized-image'

;<OptimizedCardImage src="herb-image-id" alt="Ginseng" fallback="/images/herb-placeholder.jpg" />
```

#### OptimizedHeroImage

For hero/banner images:

```tsx
import { OptimizedHeroImage } from '@/components/ui/optimized-image'

;<OptimizedHeroImage
  src="hero-image-id"
  alt="Herbal medicine"
  priority={true}
  fallback="/images/hero-placeholder.jpg"
/>
```

## 🔧 Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# Cloudflare Images Configuration
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token
NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net
```

**How to get these values:**

1. **Account ID:**
   - Go to Cloudflare Dashboard
   - Select your domain
   - Copy Account ID from the right sidebar

2. **API Token:**
   - Go to My Profile → API Tokens
   - Create Token → Edit Cloudflare Images
   - Copy the generated token

3. **Delivery URL:**
   - Usually `https://imagedelivery.net`
   - Can be found in Cloudflare Images dashboard

### 2. Image Variants

Predefined variants are available in `lib/cloudflare-images.ts`:

```typescript
export const IMAGE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' },
  small: { width: 320, fit: 'scale-down' },
  medium: { width: 640, fit: 'scale-down' },
  large: { width: 1024, fit: 'scale-down' },
  hero: { width: 1920, height: 1080, fit: 'cover' },
  avatar: { width: 200, height: 200, fit: 'cover' },
  card: { width: 400, height: 300, fit: 'cover' },
}
```

Usage:

```tsx
<OptimizedImage src="image-id" alt="Alt text" variant="hero" />
```

## 📤 Uploading Images

### From Frontend (Client-Side)

```tsx
import { uploadToCloudflareImages } from '@/lib/cloudflare-images'

async function handleUpload(file: File) {
  try {
    const result = await uploadToCloudflareImages(file, {
      // Optional metadata
      alt: 'Herb photo',
      category: 'herbs',
    })

    console.log('Image ID:', result.id)
    console.log('Image URL:', result.url)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### From Backend (Payload CMS)

Cloudflare Images is integrated into the Media collection:

```typescript
// In a Payload hook
import { uploadToCloudflareImages } from '@/lib/cloudflare-images'

const beforeChange = async ({ data, req }) => {
  if (req.file) {
    const result = await uploadToCloudflareImages(req.file)
    data.cloudflareId = result.id
    data.url = result.url
  }
  return data
}
```

## 🎨 Advanced Usage

### Custom Transformations

```tsx
import { getCloudflareImageUrl } from '@/lib/cloudflare-images'

const imageUrl = getCloudflareImageUrl('image-id', {
  width: 800,
  height: 600,
  fit: 'cover',
  quality: 90,
  format: 'webp',
  sharpen: 1,
  brightness: 1.1,
  contrast: 1.05,
})
```

### Responsive Images (srcset)

```tsx
import { getCloudflareImageSrcSet } from '@/lib/cloudflare-images'

const srcSet = getCloudflareImageSrcSet(
  'image-id',
  [640, 750, 828, 1080, 1200],
  { format: 'webp', quality: 85 }
)

// Use with img tag
<img
  src={defaultUrl}
  srcSet={srcSet}
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Description"
/>
```

### Blur Placeholders

```tsx
import { getImageBlurPlaceholder } from '@/lib/cloudflare-images'

const blurDataURL = getImageBlurPlaceholder('image-id')

// Use with Next.js Image
<Image
  src={imageUrl}
  alt="Description"
  placeholder="blur"
  blurDataURL={blurDataURL}
/>
```

## 🔄 Fallback Behavior

If Cloudflare Images is not configured (missing env variables), the system automatically falls back to:

1. Direct image URLs (no optimization)
2. Next.js Image component for basic optimization
3. Original image source

This allows development without Cloudflare Images and graceful degradation.

## 📊 Performance

### Optimization Benefits

- **Automatic Format Selection:** WebP for Chrome/Edge, AVIF for supported browsers, JPEG for fallback
- **Bandwidth Savings:** Up to 80% smaller file sizes with modern formats
- **Global CDN:** <50ms latency from 300+ locations
- **Lazy Loading:** Only load images when visible
- **Progressive Loading:** Blur placeholder → Full image

### Best Practices

1. **Always set alt text** for accessibility
2. **Use appropriate variants** for different contexts
3. **Enable blur placeholders** for better UX
4. **Provide fallback images** for error cases
5. **Use priority={true}** only for above-the-fold images

## 🛠️ Troubleshooting

### Images not loading

1. Check environment variables are set correctly
2. Verify Account ID and API Token are valid
3. Check browser console for errors
4. Ensure image IDs are correct

### Images look blurry

1. Increase quality parameter (default: 85)
2. Use larger width/height values
3. Check source image resolution
4. Avoid over-sharpening (sharpen > 2)

### Slow image loading

1. Use blur placeholders for better UX
2. Set appropriate sizes attribute for responsive images
3. Use priority={true} for above-the-fold images
4. Check Cloudflare Images dashboard for issues

## 📚 API Reference

### getCloudflareImageUrl(imageId, options)

Generate optimized image URL.

**Parameters:**

- `imageId` (string) - Image ID or filename
- `options` (object) - Transformation options
  - `variant` (string) - Named variant
  - `width` (number) - Image width
  - `height` (number) - Image height
  - `fit` (string) - Fit mode
  - `quality` (number) - Quality 1-100
  - `format` (string) - Output format
  - `blur` (number) - Blur amount
  - `sharpen` (number) - Sharpen amount
  - `brightness` (number) - Brightness multiplier
  - `contrast` (number) - Contrast multiplier
  - `gamma` (number) - Gamma correction

**Returns:** Optimized image URL

### getCloudflareImageSrcSet(imageId, widths, options)

Generate responsive srcset string.

**Parameters:**

- `imageId` (string) - Image ID
- `widths` (number[]) - Array of widths
- `options` (object) - Transformation options (except width)

**Returns:** srcset string

### uploadToCloudflareImages(file, metadata)

Upload image to Cloudflare.

**Parameters:**

- `file` (File | Blob) - File to upload
- `metadata` (object) - Optional metadata

**Returns:** Promise with upload result

### deleteFromCloudflareImages(imageId)

Delete image from Cloudflare.

**Parameters:**

- `imageId` (string) - Image ID to delete

**Returns:** Promise with success status

### isCloudflareImagesEnabled()

Check if Cloudflare Images is configured.

**Returns:** boolean

## 🔗 Resources

- [Cloudflare Images Docs](https://developers.cloudflare.com/images/)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- [Next.js Image Component](https://nextjs.org/docs/api-reference/next/image)

---

**Need help?** Check the [Cloudflare Images Dashboard](https://dash.cloudflare.com/?to=/:account/images) or contact support@verscientahealth.com
