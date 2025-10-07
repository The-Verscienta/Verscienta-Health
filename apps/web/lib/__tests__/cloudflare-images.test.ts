import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCloudflareImageUrl,
  getCloudflareImageSrcSet,
  getImageVariant,
  getImageBlurPlaceholder,
  isCloudflareImagesEnabled,
  IMAGE_VARIANTS,
} from '../cloudflare-images'

describe('cloudflare-images', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.CLOUDFLARE_ACCOUNT_ID
    delete process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
    delete process.env.CLOUDFLARE_IMAGES_DELIVERY_URL
    delete process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL
  })

  describe('isCloudflareImagesEnabled', () => {
    it('should return false when no config is set', () => {
      expect(isCloudflareImagesEnabled()).toBe(false)
    })

    it('should return true when NEXT_PUBLIC vars are set', () => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL = 'https://imagedelivery.net'
      expect(isCloudflareImagesEnabled()).toBe(true)
    })
  })

  describe('getCloudflareImageUrl', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account'
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL = 'https://imagedelivery.net'
    })

    it('should generate basic image URL', () => {
      const url = getCloudflareImageUrl('image-123')
      expect(url).toBe('https://imagedelivery.net/test-account/image-123')
    })

    it('should generate URL with width transformation', () => {
      const url = getCloudflareImageUrl('image-123', { width: 800 })
      expect(url).toBe('https://imagedelivery.net/test-account/image-123?width=800')
    })

    it('should generate URL with multiple transformations', () => {
      const url = getCloudflareImageUrl('image-123', {
        width: 800,
        height: 600,
        fit: 'cover',
        quality: 90,
      })
      expect(url).toContain('width=800')
      expect(url).toContain('height=600')
      expect(url).toContain('fit=cover')
      expect(url).toContain('quality=90')
    })

    it('should use named variant when provided', () => {
      const url = getCloudflareImageUrl('image-123', { variant: 'thumbnail' })
      expect(url).toBe('https://imagedelivery.net/test-account/image-123/thumbnail')
    })

    it('should return original image ID when Cloudflare is not enabled', () => {
      delete process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
      const url = getCloudflareImageUrl('image-123')
      expect(url).toBe('image-123')
    })
  })

  describe('getCloudflareImageSrcSet', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account'
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL = 'https://imagedelivery.net'
    })

    it('should generate srcset for multiple widths', () => {
      const srcSet = getCloudflareImageSrcSet('image-123', [640, 1024, 1920])
      expect(srcSet).toContain('width=640')
      expect(srcSet).toContain('640w')
      expect(srcSet).toContain('width=1024')
      expect(srcSet).toContain('1024w')
      expect(srcSet).toContain('width=1920')
      expect(srcSet).toContain('1920w')
    })

    it('should apply additional options to all widths', () => {
      const srcSet = getCloudflareImageSrcSet('image-123', [640, 1024], {
        format: 'webp',
        quality: 85,
      })
      expect(srcSet).toContain('format=webp')
      expect(srcSet).toContain('quality=85')
    })
  })

  describe('getImageVariant', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account'
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL = 'https://imagedelivery.net'
    })

    it('should generate URL with thumbnail variant', () => {
      const url = getImageVariant('image-123', 'thumbnail')
      expect(url).toContain('width=150')
      expect(url).toContain('height=150')
      expect(url).toContain('fit=cover')
    })

    it('should generate URL with avatar variant', () => {
      const url = getImageVariant('image-123', 'avatar')
      expect(url).toContain('width=200')
      expect(url).toContain('height=200')
      expect(url).toContain('fit=cover')
    })

    it('should generate URL with hero variant', () => {
      const url = getImageVariant('image-123', 'hero')
      expect(url).toContain('width=1920')
      expect(url).toContain('height=1080')
      expect(url).toContain('fit=cover')
    })

    it('should merge additional options with variant options', () => {
      const url = getImageVariant('image-123', 'medium', { quality: 95, format: 'avif' })
      expect(url).toContain('width=640')
      expect(url).toContain('quality=95')
      expect(url).toContain('format=avif')
    })
  })

  describe('getImageBlurPlaceholder', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account'
      process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL = 'https://imagedelivery.net'
    })

    it('should generate blur placeholder URL', () => {
      const url = getImageBlurPlaceholder('image-123')
      expect(url).toContain('width=10')
      expect(url).toContain('blur=10')
      expect(url).toContain('format=jpeg')
      expect(url).toContain('quality=20')
    })
  })

  describe('IMAGE_VARIANTS', () => {
    it('should have correct variant configurations', () => {
      expect(IMAGE_VARIANTS.thumbnail).toEqual({
        width: 150,
        height: 150,
        fit: 'cover',
      })

      expect(IMAGE_VARIANTS.small).toEqual({
        width: 320,
        fit: 'scale-down',
      })

      expect(IMAGE_VARIANTS.medium).toEqual({
        width: 640,
        fit: 'scale-down',
      })

      expect(IMAGE_VARIANTS.large).toEqual({
        width: 1024,
        fit: 'scale-down',
      })

      expect(IMAGE_VARIANTS.hero).toEqual({
        width: 1920,
        height: 1080,
        fit: 'cover',
      })

      expect(IMAGE_VARIANTS.avatar).toEqual({
        width: 200,
        height: 200,
        fit: 'cover',
      })

      expect(IMAGE_VARIANTS.card).toEqual({
        width: 400,
        height: 300,
        fit: 'cover',
      })
    })
  })
})
