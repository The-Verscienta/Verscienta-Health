/**
 * Herb Deduplication Utilities
 *
 * Ensures no duplicate herbs are created when importing from multiple sources
 * (Trefle, Perenual, manual entry, etc.)
 */

import type { Payload } from 'payload'

interface HerbIdentifiers {
  scientificName: string
  commonName?: string
  trefleId?: number
  perenualId?: number
}

interface ExistingHerb {
  id: string
  name: string
  scientificName: string
  botanicalData?: {
    trefleId?: number
    perenualId?: number
  }
}

/**
 * Find existing herb by various identifiers
 * Checks scientific name, common name, Trefle ID, and Perenual ID
 */
export async function findExistingHerb(
  payload: Payload,
  identifiers: HerbIdentifiers
): Promise<ExistingHerb | null> {
  const { scientificName, commonName, trefleId, perenualId } = identifiers

  // Build query conditions
  const conditions: any[] = []

  // Check by scientific name (primary identifier)
  if (scientificName) {
    conditions.push({
      scientificName: {
        equals: scientificName,
      },
    })
  }

  // Check by Trefle ID
  if (trefleId) {
    conditions.push({
      'botanicalData.trefleId': {
        equals: trefleId,
      },
    })
  }

  // Check by Perenual ID
  if (perenualId) {
    conditions.push({
      'botanicalData.perenualId': {
        equals: perenualId,
      },
    })
  }

  // Check by common name (secondary)
  if (commonName) {
    conditions.push({
      name: {
        equals: commonName,
      },
    })
  }

  if (conditions.length === 0) {
    return null
  }

  try {
    const result = await payload.find({
      collection: 'herbs',
      where: {
        or: conditions,
      },
      limit: 1,
    })

    return result.docs.length > 0 ? (result.docs[0] as ExistingHerb) : null
  } catch (error) {
    console.error('Error finding existing herb:', error)
    return null
  }
}

/**
 * Normalize scientific name for comparison
 * Handles variations like "Lavandula angustifolia" vs "Lavandula angustifolia Mill."
 */
export function normalizeScientificName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\s+(l\.|mill\.|dc\.|linn\.|linnaeus)$/i, '') // Remove common author abbreviations
}

/**
 * Check if two scientific names are similar
 */
export function areScientificNamesSimilar(name1: string, name2: string): boolean {
  const normalized1 = normalizeScientificName(name1)
  const normalized2 = normalizeScientificName(name2)

  // Exact match
  if (normalized1 === normalized2) {
    return true
  }

  // Check if genus matches (first word)
  const genus1 = normalized1.split(' ')[0]
  const genus2 = normalized2.split(' ')[0]

  if (genus1 !== genus2) {
    return false
  }

  // Check if species matches (second word)
  const species1 = normalized1.split(' ')[1]
  const species2 = normalized2.split(' ')[1]

  return species1 === species2
}

/**
 * Merge data from multiple sources without overwriting existing data
 */
export function mergeHerbData(
  existing: any,
  newData: any,
  source: 'trefle' | 'perenual' | 'manual'
): any {
  const merged = { ...existing }

  // Helper to merge arrays without duplicates
  const mergeArrays = (arr1: any[] = [], arr2: any[] = []): any[] => {
    const combined = [...arr1, ...arr2]
    return Array.from(new Set(combined.map(JSON.stringify))).map(JSON.parse)
  }

  // Helper to merge images specifically (checks URL to avoid exact duplicates)
  const mergeImages = (
    existing: any[] = [],
    newImages: any[] = []
  ): any[] => {
    const existingUrls = new Set(existing.map((img) => img.url))
    const uniqueNewImages = newImages.filter(
      (img) => !existingUrls.has(img.url)
    )
    return [...existing, ...uniqueNewImages]
  }

  // Helper to prefer non-null/non-empty values
  const preferFilled = (val1: any, val2: any): any => {
    if (val1 === null || val1 === undefined || val1 === '') return val2
    if (val2 === null || val2 === undefined || val2 === '') return val1
    return val1 // Prefer existing if both filled
  }

  // Merge basic fields (don't overwrite existing)
  merged.name = preferFilled(existing.name, newData.name)
  merged.family = preferFilled(existing.family, newData.family)

  // Merge synonyms
  if (newData.synonyms) {
    merged.synonyms = mergeArrays(existing.synonyms, newData.synonyms)
  }

  // Merge images (combines images from both Trefle and Perenual)
  if (newData.images) {
    merged.images = mergeImages(existing.images || [], newData.images)
    console.log(
      `  📸 Merged images: ${existing.images?.length || 0} existing + ${newData.images.length} new = ${merged.images.length} total`
    )
  }

  // Merge habitat information
  if (newData.habitat) {
    merged.habitat = existing.habitat
      ? `${existing.habitat}\n\n${newData.habitat}`
      : newData.habitat
  }

  // Merge botanical data
  merged.botanicalData = {
    ...existing.botanicalData,
    ...newData.botanicalData,
  }

  // Source-specific data
  if (source === 'trefle' && newData.botanicalData?.trefleData) {
    merged.botanicalData.trefleId = newData.botanicalData.trefleId
    merged.botanicalData.trefleSlug = newData.botanicalData.trefleSlug
    merged.botanicalData.trefleData = newData.botanicalData.trefleData
    merged.botanicalData.lastSyncedAt = new Date()
  }

  if (source === 'perenual' && newData.botanicalData?.perenualData) {
    merged.botanicalData.perenualId = newData.botanicalData.perenualId
    merged.botanicalData.perenualData = newData.botanicalData.perenualData
    merged.botanicalData.lastPerenualSyncAt = new Date()
  }

  // Merge cultivation data
  if (newData.cultivation) {
    merged.cultivation = {
      ...existing.cultivation,
      ...newData.cultivation,
    }
  }

  // Merge safety information
  if (newData.safetyInfo) {
    merged.safetyInfo = {
      warnings: mergeArrays(
        existing.safetyInfo?.warnings,
        newData.safetyInfo?.warnings
      ),
      contraindications: mergeArrays(
        existing.safetyInfo?.contraindications,
        newData.safetyInfo?.contraindications
      ),
      interactions: mergeArrays(
        existing.safetyInfo?.interactions,
        newData.safetyInfo?.interactions
      ),
    }
  }

  return merged
}

/**
 * Find or create herb with deduplication
 */
export async function findOrCreateHerb(
  payload: Payload,
  herbData: any,
  source: 'trefle' | 'perenual' | 'manual'
): Promise<{
  id: string
  isNew: boolean
  wasUpdated: boolean
}> {
  const identifiers: HerbIdentifiers = {
    scientificName: herbData.scientificName,
    commonName: herbData.name,
    trefleId: herbData.botanicalData?.trefleId,
    perenualId: herbData.botanicalData?.perenualId,
  }

  const existing = await findExistingHerb(payload, identifiers)

  if (existing) {
    // Herb exists - merge data
    const mergedData = mergeHerbData(existing, herbData, source)

    await payload.update({
      collection: 'herbs',
      id: existing.id,
      data: mergedData,
    })

    return {
      id: existing.id,
      isNew: false,
      wasUpdated: true,
    }
  } else {
    // Create new herb
    const newHerb = await payload.create({
      collection: 'herbs',
      data: {
        ...herbData,
        status: 'draft', // Always create as draft for review
      },
    })

    return {
      id: newHerb.id,
      isNew: true,
      wasUpdated: false,
    }
  }
}

/**
 * Check for potential duplicates before import
 */
export async function checkForDuplicates(
  payload: Payload,
  scientificName: string
): Promise<{
  hasDuplicate: boolean
  duplicates: Array<{
    id: string
    name: string
    scientificName: string
    sources: string[]
  }>
}> {
  try {
    const results = await payload.find({
      collection: 'herbs',
      where: {
        scientificName: {
          equals: scientificName,
        },
      },
      limit: 10,
    })

    const duplicates = results.docs.map((herb: any) => {
      const sources: string[] = []
      if (herb.botanicalData?.trefleId) sources.push('Trefle')
      if (herb.botanicalData?.perenualId) sources.push('Perenual')
      if (!herb.botanicalData?.trefleId && !herb.botanicalData?.perenualId)
        sources.push('Manual')

      return {
        id: herb.id,
        name: herb.name,
        scientificName: herb.scientificName,
        sources,
      }
    })

    return {
      hasDuplicate: duplicates.length > 0,
      duplicates,
    }
  } catch (error) {
    console.error('Error checking for duplicates:', error)
    return {
      hasDuplicate: false,
      duplicates: [],
    }
  }
}

/**
 * Bulk deduplicate herbs (for cleanup)
 */
export async function bulkDeduplicate(
  payload: Payload
): Promise<{
  processed: number
  merged: number
  deleted: number
  errors: number
}> {
  const stats = {
    processed: 0,
    merged: 0,
    deleted: 0,
    errors: 0,
  }

  try {
    // Get all herbs
    const allHerbs = await payload.find({
      collection: 'herbs',
      limit: 10000,
    })

    // Group by normalized scientific name
    const groups = new Map<string, any[]>()

    for (const herb of allHerbs.docs) {
      stats.processed++

      const normalized = normalizeScientificName(herb.scientificName)
      if (!groups.has(normalized)) {
        groups.set(normalized, [])
      }
      groups.get(normalized)!.push(herb)
    }

    // Process duplicates
    for (const [normalized, herbs] of groups.entries()) {
      if (herbs.length <= 1) continue

      try {
        // Sort by priority: Manual > Perenual > Trefle > Published > Draft
        herbs.sort((a, b) => {
          const aScore =
            (a.botanicalData?.trefleId ? 0 : 100) +
            (a.botanicalData?.perenualId ? 0 : 50) +
            (a.status === 'published' ? 10 : 0)

          const bScore =
            (b.botanicalData?.trefleId ? 0 : 100) +
            (b.botanicalData?.perenualId ? 0 : 50) +
            (b.status === 'published' ? 10 : 0)

          return bScore - aScore // Higher score = better
        })

        // Keep the best one, merge others into it
        const primary = herbs[0]
        const duplicates = herbs.slice(1)

        for (const duplicate of duplicates) {
          // Merge data
          const source = duplicate.botanicalData?.perenualId
            ? 'perenual'
            : duplicate.botanicalData?.trefleId
              ? 'trefle'
              : 'manual'

          const mergedData = mergeHerbData(primary, duplicate, source)

          await payload.update({
            collection: 'herbs',
            id: primary.id,
            data: mergedData,
          })

          // Delete duplicate
          await payload.delete({
            collection: 'herbs',
            id: duplicate.id,
          })

          stats.merged++
          stats.deleted++
        }
      } catch (error) {
        console.error(`Error deduplicating ${normalized}:`, error)
        stats.errors++
      }
    }

    return stats
  } catch (error) {
    console.error('Bulk deduplication error:', error)
    throw error
  }
}
