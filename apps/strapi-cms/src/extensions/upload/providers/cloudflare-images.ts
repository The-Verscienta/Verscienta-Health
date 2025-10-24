/**
 * Cloudflare Images Upload Provider for Strapi
 *
 * Uploads media files to Cloudflare Images service for optimized delivery.
 * Includes security features: rate limiting, size validation, access logging.
 *
 * @see https://developers.cloudflare.com/images/upload-images/
 */

import type { Core } from '@strapi/strapi'
import { ReadStream } from 'fs'

interface CloudflareImagesConfig {
  accountId: string
  apiToken: string
  deliveryUrl?: string
  rateLimit?: {
    windowMs: number // Time window in milliseconds
    max: number // Max uploads per window
  }
  maxFileSize?: number // Max file size in bytes
  enableAccessLogging?: boolean // Log image access for audit
  enableContentModeration?: boolean // Basic content filtering
}

// Rate limiting state (in-memory, replace with Redis in production)
const uploadAttempts = new Map<string, { count: number; resetTime: number }>()

// Access log (in-memory, replace with database/external service in production)
const accessLog: Array<{
  timestamp: string
  imageId: string
  action: string
  userId?: string
  ip?: string
}> = []

interface CloudflareUploadResponse {
  success: boolean
  result: {
    id: string
    filename: string
    uploaded: string
    requireSignedURLs: boolean
    variants: string[]
  }
  errors: Array<{
    code: number
    message: string
  }>
}

/**
 * Security Utilities
 */

// Rate limiting check
function checkRateLimit(userId: string, config: CloudflareImagesConfig): boolean {
  if (!config.rateLimit) return true // No rate limiting configured

  const now = Date.now()
  const userAttempts = uploadAttempts.get(userId)

  if (!userAttempts || now > userAttempts.resetTime) {
    // Reset or initialize
    uploadAttempts.set(userId, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    })
    return true
  }

  if (userAttempts.count >= config.rateLimit.max) {
    console.warn(`⚠️ Rate limit exceeded for user: ${userId}`)
    return false // Rate limit exceeded
  }

  // Increment count
  userAttempts.count++
  return true
}

// Size validation for streams
async function validateStreamSize(
  stream: ReadStream,
  maxSize: number
): Promise<{ valid: boolean; buffer?: Buffer }> {
  const chunks: Buffer[] = []
  let totalSize = 0

  try {
    for await (const chunk of stream) {
      const buffer = Buffer.from(chunk)
      totalSize += buffer.length

      if (totalSize > maxSize) {
        console.warn(`⚠️ File size exceeds limit: ${totalSize} > ${maxSize}`)
        return { valid: false }
      }

      chunks.push(buffer)
    }

    return {
      valid: true,
      buffer: Buffer.concat(chunks),
    }
  } catch (error) {
    console.error('❌ Stream validation error:', error)
    return { valid: false }
  }
}

// Basic content moderation (file type validation)
function moderateContent(file: { name: string; mime: string }): {
  allowed: boolean
  reason?: string
} {
  // Allowed image types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ]

  if (!allowedMimeTypes.includes(file.mime)) {
    return {
      allowed: false,
      reason: `File type not allowed: ${file.mime}`,
    }
  }

  // Blocked filename patterns
  const blockedPatterns = [
    /\.exe$/i,
    /\.sh$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.dll$/i,
    /\.scr$/i,
  ]

  for (const pattern of blockedPatterns) {
    if (pattern.test(file.name)) {
      return {
        allowed: false,
        reason: `Filename pattern not allowed: ${file.name}`,
      }
    }
  }

  return { allowed: true }
}

// Log image access
function logAccess(action: string, imageId: string, userId?: string, ip?: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    imageId,
    action,
    userId,
    ip,
  }

  accessLog.push(logEntry)

  // Keep only last 1000 entries (in production, write to database)
  if (accessLog.length > 1000) {
    accessLog.shift()
  }

  // In production: write to database or external logging service
  // await strapi.entityService.create('api::audit-log.audit-log', { data: logEntry })
}

export default {
  init(config: CloudflareImagesConfig) {
    const accountId = config.accountId || process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = config.apiToken || process.env.CLOUDFLARE_IMAGES_API_TOKEN
    const deliveryUrl =
      config.deliveryUrl || process.env.CLOUDFLARE_IMAGES_DELIVERY_URL || 'https://imagedelivery.net'

    // Security configuration
    const rateLimit = config.rateLimit || {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 uploads per 15 minutes
    }
    const maxFileSize = config.maxFileSize || 10 * 1024 * 1024 // 10MB default
    const enableAccessLogging = config.enableAccessLogging ?? true // Enabled by default
    const enableContentModeration = config.enableContentModeration ?? true // Enabled by default

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare Images: accountId and apiToken are required')
    }

    console.log('🔒 Cloudflare Images security features:')
    console.log(`   - Rate limiting: ${rateLimit.max} uploads per ${rateLimit.windowMs / 1000}s`)
    console.log(`   - Max file size: ${maxFileSize / 1024 / 1024}MB`)
    console.log(`   - Access logging: ${enableAccessLogging ? 'enabled' : 'disabled'}`)
    console.log(`   - Content moderation: ${enableContentModeration ? 'enabled' : 'disabled'}`)

    return {
      /**
       * Upload a file to Cloudflare Images
       */
      async upload(
        file: {
          name: string
          alternativeText?: string
          caption?: string
          path?: string
          hash: string
          ext: string
          mime: string
          size: number
          buffer?: Buffer
          stream?: ReadStream
        },
        { user }: { user?: { id: string; ip?: string } } = {}
      ) {
        try {
          // Security: Check rate limit
          const userId = user?.id || 'anonymous'
          if (!checkRateLimit(userId, { ...config, rateLimit })) {
            throw new Error('Upload rate limit exceeded. Please try again later.')
          }

          // Security: Content moderation
          if (enableContentModeration) {
            const moderationResult = moderateContent(file)
            if (!moderationResult.allowed) {
              throw new Error(`Upload rejected: ${moderationResult.reason}`)
            }
          }

          // Security: Size validation for buffers
          if (file.buffer && file.buffer.length > maxFileSize) {
            throw new Error(
              `File size exceeds limit: ${file.buffer.length} > ${maxFileSize} bytes`
            )
          }

          const formData = new FormData()
          let uploadBuffer: Buffer

          // Add file
          if (file.buffer) {
            uploadBuffer = file.buffer
            const blob = new Blob([file.buffer], { type: file.mime })
            formData.append('file', blob, file.name)
          } else if (file.stream) {
            // Security: Validate stream size
            const validationResult = await validateStreamSize(file.stream, maxFileSize)
            if (!validationResult.valid || !validationResult.buffer) {
              throw new Error('File size validation failed or file exceeds size limit')
            }
            uploadBuffer = validationResult.buffer
            const blob = new Blob([validationResult.buffer], { type: file.mime })
            formData.append('file', blob, file.name)
          } else {
            throw new Error('No file buffer or stream provided')
          }

          // Add metadata
          const metadata = {
            alt: file.alternativeText || file.name,
            caption: file.caption || '',
            originalName: file.name,
            hash: file.hash,
          }
          formData.append('metadata', JSON.stringify(metadata))

          // Upload to Cloudflare Images
          const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiToken}`,
              },
              body: formData,
            }
          )

          if (!response.ok) {
            const errorData = (await response.json()) as CloudflareUploadResponse
            const errorMessage =
              errorData.errors?.[0]?.message || `Upload failed with status ${response.status}`
            throw new Error(`Cloudflare Images upload error: ${errorMessage}`)
          }

          const data = (await response.json()) as CloudflareUploadResponse

          if (!data.success) {
            throw new Error(
              `Cloudflare Images upload failed: ${data.errors?.[0]?.message || 'Unknown error'}`
            )
          }

          // Update file object with Cloudflare Images data
          ;(file as any).url = `${deliveryUrl}/${accountId}/${data.result.id}/public`
          file.hash = data.result.id // Store Cloudflare Images ID as hash
          ;(file as any).provider_metadata = {
            cloudflare_id: data.result.id,
            cloudflare_variants: data.result.variants,
            uploaded_at: data.result.uploaded,
          }

          // Security: Log access
          if (enableAccessLogging) {
            logAccess('upload', data.result.id, userId, user?.ip)
          }

          console.log(`✅ Uploaded to Cloudflare Images: ${file.name} (ID: ${data.result.id})`)
        } catch (error) {
          console.error('❌ Cloudflare Images upload error:', error)
          throw error
        }
      },

      /**
       * Upload from stream
       */
      async uploadStream(
        file: {
          name: string
          alternativeText?: string
          caption?: string
          path?: string
          hash: string
          ext: string
          mime: string
          size: number
          stream: ReadStream
        },
        customParams?: { user?: { id: string; ip?: string } }
      ) {
        return this.upload(file, customParams || {})
      },

      /**
       * Delete a file from Cloudflare Images
       */
      async delete(
        file: {
          hash: string
          provider_metadata?: {
            cloudflare_id?: string
          }
        },
        { user }: { user?: { id: string; ip?: string } } = {}
      ) {
        try {
          // Get Cloudflare Images ID from hash or provider_metadata
          const imageId = (file.provider_metadata as any)?.cloudflare_id || file.hash

          if (!imageId) {
            console.warn('⚠️ No Cloudflare Images ID found for deletion')
            return
          }

          const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${apiToken}`,
              },
            }
          )

          if (!response.ok) {
            const errorData = (await response.json()) as CloudflareUploadResponse
            throw new Error(
              `Delete failed: ${errorData.errors?.[0]?.message || response.statusText}`
            )
          }

          // Security: Log deletion
          if (enableAccessLogging) {
            const userId = user?.id || 'anonymous'
            logAccess('delete', imageId, userId, user?.ip)
          }

          console.log(`🗑️ Deleted from Cloudflare Images: ${imageId}`)
        } catch (error) {
          console.error('❌ Cloudflare Images delete error:', error)
          // Don't throw - allow Strapi to continue even if Cloudflare delete fails
        }
      },

      /**
       * Check if a file exists
       */
      async checkFileSize() {
        // Cloudflare Images has a 10MB limit per image
        return {
          maxSize: 10 * 1024 * 1024, // 10MB in bytes
        }
      },

      /**
       * Get file size (not applicable for Cloudflare Images)
       */
      async getSignedUrl() {
        // Cloudflare Images doesn't use signed URLs by default
        return { url: '' }
      },

      /**
       * Check if provider is private
       */
      isPrivate() {
        return false
      },
    }
  },
}
