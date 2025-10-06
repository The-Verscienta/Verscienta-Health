/**
 * Cloudflare Images Integration
 *
 * Provides utilities for working with Cloudflare Images CDN
 * - Image URL generation with variants
 * - Responsive image helpers
 * - Upload functionality
 */

export interface CloudflareImageVariant {
  width: number
  height?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'avif' | 'webp' | 'json' | 'jpeg' | 'png'
}

export interface CloudflareImageOptions {
  variant?: string
  width?: number
  height?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'avif' | 'webp' | 'json' | 'jpeg' | 'png'
  blur?: number
  sharpen?: number
  brightness?: number
  contrast?: number
  gamma?: number
  metadata?: 'keep' | 'copyright' | 'none'
}

/**
 * Cloudflare Images base configuration
 */
const CLOUDFLARE_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID,
  deliveryUrl: process.env.CLOUDFLARE_IMAGES_DELIVERY_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL,
  apiToken: process.env.CLOUDFLARE_IMAGES_API_TOKEN,
}

/**
 * Check if Cloudflare Images is configured
 */
export function isCloudflareImagesEnabled(): boolean {
  return !!(CLOUDFLARE_CONFIG.accountId && CLOUDFLARE_CONFIG.deliveryUrl)
}

/**
 * Generate Cloudflare Images URL with transformations
 *
 * @param imageId - Cloudflare image ID or filename
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getCloudflareImageUrl(
  imageId: string,
  options: CloudflareImageOptions = {}
): string {
  if (!isCloudflareImagesEnabled()) {
    // Fallback to original image if Cloudflare is not configured
    return imageId
  }

  const { accountId, deliveryUrl } = CLOUDFLARE_CONFIG

  // If using a named variant
  if (options.variant) {
    return `${deliveryUrl}/${accountId}/${imageId}/${options.variant}`
  }

  // Build URL with custom transformations
  const params: string[] = []

  if (options.width) params.push(`width=${options.width}`)
  if (options.height) params.push(`height=${options.height}`)
  if (options.fit) params.push(`fit=${options.fit}`)
  if (options.quality) params.push(`quality=${options.quality}`)
  if (options.format) params.push(`format=${options.format}`)
  if (options.blur) params.push(`blur=${options.blur}`)
  if (options.sharpen) params.push(`sharpen=${options.sharpen}`)
  if (options.brightness) params.push(`brightness=${options.brightness}`)
  if (options.contrast) params.push(`contrast=${options.contrast}`)
  if (options.gamma) params.push(`gamma=${options.gamma}`)
  if (options.metadata) params.push(`metadata=${options.metadata}`)

  const queryString = params.length > 0 ? `?${params.join('&')}` : ''

  return `${deliveryUrl}/${accountId}/${imageId}${queryString}`
}

/**
 * Get responsive image srcset for Cloudflare Images
 *
 * @param imageId - Cloudflare image ID
 * @param widths - Array of widths for responsive images
 * @param options - Additional transformation options
 * @returns srcset string for img or picture elements
 */
export function getCloudflareImageSrcSet(
  imageId: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  options: Omit<CloudflareImageOptions, 'width'> = {}
): string {
  return widths
    .map((width) => {
      const url = getCloudflareImageUrl(imageId, { ...options, width })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Predefined image variants for common use cases
 */
export const IMAGE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' as const },
  small: { width: 320, fit: 'scale-down' as const },
  medium: { width: 640, fit: 'scale-down' as const },
  large: { width: 1024, fit: 'scale-down' as const },
  hero: { width: 1920, height: 1080, fit: 'cover' as const },
  avatar: { width: 200, height: 200, fit: 'cover' as const },
  card: { width: 400, height: 300, fit: 'cover' as const },
} as const

/**
 * Get image URL using a predefined variant
 */
export function getImageVariant(
  imageId: string,
  variant: keyof typeof IMAGE_VARIANTS,
  additionalOptions: Omit<CloudflareImageOptions, 'width' | 'height' | 'fit'> = {}
): string {
  const variantOptions = IMAGE_VARIANTS[variant]
  return getCloudflareImageUrl(imageId, { ...variantOptions, ...additionalOptions })
}

/**
 * Upload an image to Cloudflare Images
 *
 * @param file - File to upload (File or Blob)
 * @param metadata - Optional metadata for the image
 * @returns Upload response with image ID and URL
 */
export async function uploadToCloudflareImages(
  file: File | Blob,
  metadata?: Record<string, string>
): Promise<{
  success: boolean
  id: string
  filename: string
  url: string
  variants: string[]
}> {
  if (!CLOUDFLARE_CONFIG.apiToken || !CLOUDFLARE_CONFIG.accountId) {
    throw new Error('Cloudflare Images API token and account ID are required for uploads')
  }

  const formData = new FormData()
  formData.append('file', file)

  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata))
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to upload image: ${error.errors?.[0]?.message || response.statusText}`)
  }

  const data = await response.json()

  return {
    success: data.success,
    id: data.result.id,
    filename: data.result.filename,
    url: data.result.variants[0], // First variant URL
    variants: data.result.variants,
  }
}

/**
 * Delete an image from Cloudflare Images
 *
 * @param imageId - Image ID to delete
 * @returns Success status
 */
export async function deleteFromCloudflareImages(imageId: string): Promise<boolean> {
  if (!CLOUDFLARE_CONFIG.apiToken || !CLOUDFLARE_CONFIG.accountId) {
    throw new Error('Cloudflare Images API token and account ID are required for deletion')
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/images/v1/${imageId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to delete image: ${error.errors?.[0]?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.success
}

/**
 * Get image blur placeholder for progressive loading
 *
 * @param imageId - Cloudflare image ID
 * @returns Base64 encoded blur placeholder
 */
export function getImageBlurPlaceholder(imageId: string): string {
  // Use a very small width with blur for placeholder
  return getCloudflareImageUrl(imageId, {
    width: 10,
    blur: 10,
    format: 'jpeg',
    quality: 20,
  })
}
