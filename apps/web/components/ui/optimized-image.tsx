'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import {
  getCloudflareImageUrl,
  getCloudflareImageSrcSet,
  getImageBlurPlaceholder,
  isCloudflareImagesEnabled,
  IMAGE_VARIANTS,
} from '@/lib/cloudflare-images'

export interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'loader'> {
  /**
   * Image source - can be a Cloudflare Images ID or regular URL
   */
  src: string

  /**
   * Predefined variant (thumbnail, small, medium, large, hero, avatar, card)
   */
  variant?: keyof typeof IMAGE_VARIANTS

  /**
   * Custom width (overrides variant width)
   */
  width?: number

  /**
   * Custom height (overrides variant height)
   */
  height?: number

  /**
   * Image fit mode
   */
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'

  /**
   * Image quality (1-100)
   */
  quality?: number

  /**
   * Image format
   */
  format?: 'auto' | 'avif' | 'webp' | 'json' | 'jpeg' | 'png'

  /**
   * Enable blur placeholder for progressive loading
   */
  enableBlur?: boolean

  /**
   * Fallback image URL if source fails to load
   */
  fallback?: string
}

/**
 * Optimized Image Component with Cloudflare Images Integration
 *
 * Features:
 * - Automatic Cloudflare Images integration when configured
 * - Responsive images with srcset
 * - Blur placeholder for progressive loading
 * - Lazy loading by default
 * - Fallback support
 * - Predefined variants for common use cases
 */
export function OptimizedImage({
  src,
  alt,
  variant,
  width,
  height,
  fit = 'cover',
  quality = 85,
  format = 'auto',
  enableBlur = true,
  fallback,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset error state when src changes
  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  // Determine dimensions from variant or props
  const dimensions = variant
    ? IMAGE_VARIANTS[variant]
    : { width: width || 800, height: height }

  const imgWidth = width || dimensions.width
  const imgHeight = height || (dimensions as any).height

  // Handle image load error
  const handleError = () => {
    if (fallback && imgSrc !== fallback) {
      setImgSrc(fallback)
      setHasError(true)
    } else {
      setHasError(true)
    }
    setIsLoading(false)
  }

  // Handle image load complete
  const handleLoad = () => {
    setIsLoading(false)
  }

  // If Cloudflare Images is enabled, use it
  if (isCloudflareImagesEnabled() && !hasError) {
    const cloudflareUrl = getCloudflareImageUrl(imgSrc, {
      width: imgWidth,
      height: imgHeight,
      fit,
      quality,
      format,
    })

    const blurDataURL = enableBlur ? getImageBlurPlaceholder(imgSrc) : undefined

    return (
      <div className={`relative ${className || ''}`}>
        <Image
          src={cloudflareUrl}
          alt={alt}
          width={imgWidth}
          height={imgHeight}
          quality={quality}
          placeholder={enableBlur ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
      </div>
    )
  }

  // Fallback to regular Next.js Image if Cloudflare is not configured
  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={imgSrc}
        alt={alt}
        width={imgWidth}
        height={imgHeight}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  )
}

/**
 * Optimized Avatar Image
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  fallback,
  className = '',
}: {
  src: string
  alt: string
  size?: number
  fallback?: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      variant="avatar"
      width={size}
      height={size}
      fallback={fallback}
      className={`rounded-full ${className}`}
    />
  )
}

/**
 * Optimized Card Image
 */
export function OptimizedCardImage({
  src,
  alt,
  fallback,
  className = '',
}: {
  src: string
  alt: string
  fallback?: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      variant="card"
      fallback={fallback}
      className={className}
    />
  )
}

/**
 * Optimized Hero Image
 */
export function OptimizedHeroImage({
  src,
  alt,
  fallback,
  className = '',
  priority = true,
}: {
  src: string
  alt: string
  fallback?: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      variant="hero"
      fallback={fallback}
      priority={priority}
      className={className}
    />
  )
}
