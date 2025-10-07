'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveImageProps extends Omit<ImageProps, 'placeholder'> {
  containerClassName?: string
  blurDataURL?: string
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2' | '21/9'
  priority?: boolean
  quality?: number
}

const aspectRatios = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-4/3',
  '1/1': 'aspect-square',
  '3/2': 'aspect-3/2',
  '21/9': 'aspect-21/9',
}

export function ResponsiveImage({
  src,
  alt,
  className,
  containerClassName,
  blurDataURL,
  aspectRatio,
  priority = false,
  quality = 90,
  fill,
  sizes,
  ...props
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Default sizes for responsive images
  const defaultSizes =
    sizes ||
    `
    (max-width: 640px) 100vw,
    (max-width: 768px) 90vw,
    (max-width: 1024px) 80vw,
    (max-width: 1280px) 70vw,
    60vw
  `

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-earth-100 text-earth-600 flex items-center justify-center',
          aspectRatio && aspectRatios[aspectRatio],
          containerClassName
        )}
        aria-label={`Image failed to load: ${alt}`}
      >
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatio && aspectRatios[aspectRatio],
        containerClassName
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill !== undefined ? fill : true}
        sizes={defaultSizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-all duration-300',
          isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        {...props}
      />
      {isLoading && (
        <div className="bg-earth-100 absolute inset-0 animate-pulse" aria-hidden="true" />
      )}
    </div>
  )
}

// Specialized image components for common use cases

interface HerbImageProps extends Omit<ResponsiveImageProps, 'aspectRatio'> {
  variant?: 'card' | 'detail' | 'thumbnail'
}

export function HerbImage({ variant = 'card', ...props }: HerbImageProps) {
  const aspectRatioMap = {
    card: '4/3' as const,
    detail: '16/9' as const,
    thumbnail: '1/1' as const,
  }

  return <ResponsiveImage aspectRatio={aspectRatioMap[variant]} {...props} />
}

interface PractitionerImageProps extends Omit<ResponsiveImageProps, 'aspectRatio'> {
  variant?: 'avatar' | 'profile' | 'card'
}

export function PractitionerImage({
  variant = 'avatar',
  className,
  ...props
}: PractitionerImageProps) {
  const variantStyles = {
    avatar: 'rounded-full',
    profile: 'rounded-lg',
    card: 'rounded-md',
  }

  return (
    <ResponsiveImage
      aspectRatio="1/1"
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  )
}

// Gallery component with lazy loading
interface ImageGalleryProps {
  images: {
    src: string
    alt: string
    caption?: string
  }[]
  columns?: 1 | 2 | 3 | 4
}

export function ImageGallery({ images, columns = 3 }: ImageGalleryProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {images.map((image, index) => (
        <figure key={index} className="group">
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            aspectRatio="4/3"
            containerClassName="rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow"
            priority={index < 3} // Prioritize first 3 images
          />
          {image.caption && (
            <figcaption className="mt-2 text-sm text-gray-600">{image.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
