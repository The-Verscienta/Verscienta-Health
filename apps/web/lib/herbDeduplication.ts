/**
 * Herb Deduplication Utility
 *
 * Prevents duplicate herbs when importing from multiple sources (Trefle, Perenual)
 * Intelligently merges data from different sources while preserving existing data
 *
 * Features:
 * - Scientific name matching (normalized)
 * - Source ID matching (Trefle ID, Perenual ID)
 * - Common name fallback matching
 * - Data merging without overwriting existing non-null values
 * - Image collection from multiple sources
 * - Synonym combination without duplicates
 *
 * @see docs/PLANT_DATA_INTEGRATIONS.md
 */

import type { Payload } from 'payload'

/**
 * Normalize scientific name for comparison
 * Removes author citations and converts to lowercase
 *
 * Examples:
 * "Lavandula angustifolia Mill." → "lavandula angustifolia"
 * "Panax ginseng C.A.Mey." → "panax ginseng"
 */
export function normalizeScientificName(name: string): string {
  if (!name) return ''

  return name
    .toLowerCase()
    .replace(/\s+(mill\.|l\.|dc\.|c\.a\.mey\.|sw\.|willd\.|ait\.|lam\.|thunb\.).*$/i, '') // Remove author citations
    .replace(/\s+var\.\s+.*$/i, '') // Remove variety
    .replace(/\s+subsp\.\s+.*$/i, '') // Remove subspecies
    .trim()
}

/**
 * Extract genus and species from scientific name
 */
export function extractGenusSpecies(scientificName: string): { genus: string; species: string } | null {
  const normalized = normalizeScientificName(scientificName)
  const parts = normalized.split(/\s+/)

  if (parts.length < 2) return null

  return {
    genus: parts[0],
    species: parts[1],
  }
}

/**
 * Check if two scientific names match (ignoring author citations)
 */
export function scientificNamesMatch(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false

  const normalized1 = normalizeScientificName(name1)
  const normalized2 = normalizeScientificName(name2)

  // Exact match
  if (normalized1 === normalized2) return true

  // Genus + species match (ignore variety/subspecies)
  const parts1 = extractGenusSpecies(name1)
  const parts2 = extractGenusSpecies(name2)

  if (parts1 && parts2) {
    return parts1.genus === parts2.genus && parts1.species === parts2.species
  }

  return false
}

/**
 * Find existing herb by scientific name, source IDs, or common name
 */
export async function findExistingHerb(
  payload: Payload,
  data: {
    scientificName?: string
    trefleId?: number
    perenualId?: number
    commonName?: string
  }
): Promise<any | null> {
  const { scientificName, trefleId, perenualId, commonName } = data

  // Try to find by source IDs first (most reliable)
  if (trefleId) {
    const byTrefleId = await payload.find({
      collection: 'herbs',
      where: {
        'botanicalInfo.trefleId': { equals: trefleId },
      },
      limit: 1,
    })

    if (byTrefleId.docs.length > 0) {
      console.log(`[Deduplication] Found existing herb by Trefle ID: ${trefleId}`)
      return byTrefleId.docs[0]
    }
  }

  if (perenualId) {
    const byPerenualId = await payload.find({
      collection: 'herbs',
      where: {
        'botanicalInfo.perenualId': { equals: perenualId },
      },
      limit: 1,
    })

    if (byPerenualId.docs.length > 0) {
      console.log(`[Deduplication] Found existing herb by Perenual ID: ${perenualId}`)
      return byPerenualId.docs[0]
    }
  }

  // Try to find by scientific name
  if (scientificName) {
    const allHerbs = await payload.find({
      collection: 'herbs',
      limit: 1000, // Get a large batch to search through
      pagination: false,
    })

    for (const herb of allHerbs.docs) {
      const herbScientificName = herb.botanicalInfo?.scientificName

      if (herbScientificName && scientificNamesMatch(scientificName, herbScientificName)) {
        console.log(
          `[Deduplication] Found existing herb by scientific name: ${herbScientificName} matches ${scientificName}`
        )
        return herb
      }
    }
  }

  // Fallback: try common name (least reliable)
  if (commonName) {
    const byCommonName = await payload.find({
      collection: 'herbs',
      where: {
        title: { equals: commonName },
      },
      limit: 1,
    })

    if (byCommonName.docs.length > 0) {
      console.log(`[Deduplication] Found existing herb by common name: ${commonName}`)
      return byCommonName.docs[0]
    }
  }

  console.log(`[Deduplication] No existing herb found for: ${scientificName || commonName}`)
  return null
}

/**
 * Helper: Prefer filled value (don't overwrite with null/undefined)
 */
function preferFilled<T>(existing: T | null | undefined, newValue: T | null | undefined): T | null | undefined {
  if (existing !== null && existing !== undefined && existing !== '') {
    return existing
  }
  return newValue
}

/**
 * Helper: Combine arrays without duplicates
 */
function combineArrays<T>(existing: T[] | undefined, newItems: T[] | undefined): T[] {
  if (!existing || existing.length === 0) return newItems || []
  if (!newItems || newItems.length === 0) return existing

  const combined = [...existing]

  for (const item of newItems) {
    // For strings, do case-insensitive comparison
    if (typeof item === 'string') {
      const exists = existing.some((e) => typeof e === 'string' && e.toLowerCase() === item.toLowerCase())
      if (!exists) {
        combined.push(item)
      }
    } else {
      // For objects/numbers, use includes
      if (!existing.includes(item)) {
        combined.push(item)
      }
    }
  }

  return combined
}

/**
 * Helper: Combine images from different sources
 */
function combineImages(existing: any[] | undefined, newImages: any[] | undefined): any[] {
  if (!existing || existing.length === 0) return newImages || []
  if (!newImages || newImages.length === 0) return existing

  const combined = [...existing]

  for (const newImage of newImages) {
    const exists = existing.some((img) => img.url === newImage.url || img.id === newImage.id)

    if (!exists) {
      combined.push(newImage)
    }
  }

  return combined
}

/**
 * Merge herb data from new import with existing herb
 * Preserves existing non-null values and combines arrays
 */
export function mergeHerbData(existing: any, newData: any): any {
  const merged = { ...existing }

  // Basic fields - prefer existing
  merged.title = preferFilled(existing.title, newData.title) || merged.title
  merged.description = preferFilled(existing.description, newData.description) || merged.description

  // Botanical info - merge carefully
  if (!merged.botanicalInfo) {
    merged.botanicalInfo = {}
  }

  merged.botanicalInfo.scientificName = preferFilled(
    existing.botanicalInfo?.scientificName,
    newData.botanicalInfo?.scientificName
  )
  merged.botanicalInfo.family = preferFilled(existing.botanicalInfo?.family, newData.botanicalInfo?.family)
  merged.botanicalInfo.genus = preferFilled(existing.botanicalInfo?.genus, newData.botanicalInfo?.genus)

  // Source-specific IDs
  if (newData.botanicalInfo?.trefleId) {
    merged.botanicalInfo.trefleId = newData.botanicalInfo.trefleId
  }
  if (newData.botanicalInfo?.perenualId) {
    merged.botanicalInfo.perenualId = newData.botanicalInfo.perenualId
  }
  if (newData.botanicalInfo?.trefleSlug) {
    merged.botanicalInfo.trefleSlug = newData.botanicalInfo.trefleSlug
  }

  // Source-specific data objects
  if (newData.botanicalInfo?.trefleData) {
    merged.botanicalInfo.trefleData = {
      ...(existing.botanicalInfo?.trefleData || {}),
      ...newData.botanicalInfo.trefleData,
    }
  }
  if (newData.botanicalInfo?.perenualData) {
    merged.botanicalInfo.perenualData = {
      ...(existing.botanicalInfo?.perenualData || {}),
      ...newData.botanicalInfo.perenualData,
    }
  }

  // Combine synonyms
  if (newData.botanicalInfo?.synonyms) {
    merged.botanicalInfo.synonyms = combineArrays(
      existing.botanicalInfo?.synonyms,
      newData.botanicalInfo?.synonyms
    )
  }

  // Cultivation data - prefer new if existing is empty
  if (newData.cultivation) {
    if (!merged.cultivation || Object.keys(merged.cultivation).length === 0) {
      merged.cultivation = newData.cultivation
    } else {
      // Merge cultivation fields
      merged.cultivation = {
        ...merged.cultivation,
        ...newData.cultivation,
      }
    }
  }

  // Combine images from both sources
  if (newData.photoGallery) {
    merged.photoGallery = combineImages(existing.photoGallery, newData.photoGallery)
  }

  // Combine origin locations
  if (newData.botanicalInfo?.origin) {
    merged.botanicalInfo.origin = combineArrays(existing.botanicalInfo?.origin, newData.botanicalInfo?.origin)
  }

  // Cultivation notes - append if both exist
  if (newData.cultivation_notes) {
    if (existing.cultivation_notes) {
      merged.cultivation_notes = `${existing.cultivation_notes}\n\n---\n\n${newData.cultivation_notes}`
    } else {
      merged.cultivation_notes = newData.cultivation_notes
    }
  }

  // Pest management - append if both exist
  if (newData.pest_management) {
    if (existing.pest_management) {
      merged.pest_management = `${existing.pest_management}\n\n---\n\n${newData.pest_management}`
    } else {
      merged.pest_management = newData.pest_management
    }
  }

  // Safety info - combine warnings
  if (newData.safetyInfo?.warnings) {
    if (!merged.safetyInfo) {
      merged.safetyInfo = {}
    }
    merged.safetyInfo.warnings = combineArrays(existing.safetyInfo?.warnings, newData.safetyInfo?.warnings)
  }

  // Update sync timestamps
  if (newData.botanicalInfo?.lastSyncedAt) {
    merged.botanicalInfo.lastSyncedAt = newData.botanicalInfo.lastSyncedAt
  }
  if (newData.botanicalInfo?.lastPerenualSyncAt) {
    merged.botanicalInfo.lastPerenualSyncAt = newData.botanicalInfo.lastPerenualSyncAt
  }

  return merged
}

/**
 * Create or update herb with deduplication
 */
export async function createOrUpdateHerb(
  payload: Payload,
  herbData: any,
  source: 'trefle' | 'perenual' | 'manual'
): Promise<{ herb: any; created: boolean }> {
  // Try to find existing herb
  const existing = await findExistingHerb(payload, {
    scientificName: herbData.botanicalInfo?.scientificName,
    trefleId: herbData.botanicalInfo?.trefleId,
    perenualId: herbData.botanicalInfo?.perenualId,
    commonName: herbData.title,
  })

  if (existing) {
    console.log(`[Deduplication] Updating existing herb: ${existing.title} (ID: ${existing.id})`)

    // Merge data
    const merged = mergeHerbData(existing, herbData)

    // Update herb
    const updated = await payload.update({
      collection: 'herbs',
      id: existing.id,
      data: merged,
    })

    console.log(`[Deduplication] ✅ Updated herb: ${updated.title} (merged ${source} data)`)

    return { herb: updated, created: false }
  } else {
    console.log(`[Deduplication] Creating new herb: ${herbData.title}`)

    // Create new herb as draft for review
    const created = await payload.create({
      collection: 'herbs',
      data: {
        ...herbData,
        _status: 'draft', // Create as draft for manual review
      },
    })

    console.log(`[Deduplication] ✅ Created new herb: ${created.title} (${source} source)`)

    return { herb: created, created: true }
  }
}

/**
 * Check for duplicate herbs in database
 */
export async function checkForDuplicates(
  payload: Payload,
  scientificName?: string
): Promise<{
  hasDuplicate: boolean
  duplicates: Array<{
    id: string
    title: string
    scientificName: string
    sources: string[]
  }>
}> {
  const query: any = {}

  if (scientificName) {
    // This is a simplified check - in reality we'd need to iterate and use scientificNamesMatch
    query['botanicalInfo.scientificName'] = { contains: scientificName }
  }

  const herbs = await payload.find({
    collection: 'herbs',
    where: query,
    limit: 1000,
  })

  const duplicateGroups: Map<string, any[]> = new Map()

  // Group herbs by normalized scientific name
  for (const herb of herbs.docs) {
    const scientificName = herb.botanicalInfo?.scientificName
    if (!scientificName) continue

    const normalized = normalizeScientificName(scientificName)

    if (!duplicateGroups.has(normalized)) {
      duplicateGroups.set(normalized, [])
    }
    duplicateGroups.get(normalized)!.push(herb)
  }

  // Find groups with more than one herb
  const duplicates: any[] = []

  for (const [normalized, group] of duplicateGroups) {
    if (group.length > 1) {
      for (const herb of group) {
        const sources: string[] = []
        if (herb.botanicalInfo?.trefleId) sources.push('Trefle')
        if (herb.botanicalInfo?.perenualId) sources.push('Perenual')
        if (sources.length === 0) sources.push('Manual')

        duplicates.push({
          id: herb.id,
          title: herb.title,
          scientificName: herb.botanicalInfo?.scientificName,
          sources,
        })
      }
    }
  }

  return {
    hasDuplicate: duplicates.length > 0,
    duplicates,
  }
}

/**
 * Bulk deduplicate all herbs in database
 * Merges herbs with matching scientific names
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

  console.log('[Bulk Deduplication] Starting...')

  // Get all herbs
  const allHerbs = await payload.find({
    collection: 'herbs',
    limit: 10000,
    pagination: false,
  })

  // Group by normalized scientific name
  const groups: Map<string, any[]> = new Map()

  for (const herb of allHerbs.docs) {
    const scientificName = herb.botanicalInfo?.scientificName
    if (!scientificName) continue

    const normalized = normalizeScientificName(scientificName)

    if (!groups.has(normalized)) {
      groups.set(normalized, [])
    }
    groups.get(normalized)!.push(herb)
  }

  // Process duplicate groups
  for (const [normalized, group] of groups) {
    if (group.length <= 1) continue

    stats.processed += group.length

    try {
      console.log(`[Bulk Deduplication] Found ${group.length} duplicates for: ${normalized}`)

      // Sort by: published > draft, more data > less data
      const sorted = group.sort((a, b) => {
        // Prefer published over draft
        if (a._status === 'published' && b._status === 'draft') return -1
        if (a._status === 'draft' && b._status === 'published') return 1

        // Prefer herb with more source IDs
        const aSourceCount =
          (a.botanicalInfo?.trefleId ? 1 : 0) + (a.botanicalInfo?.perenualId ? 1 : 0)
        const bSourceCount =
          (b.botanicalInfo?.trefleId ? 1 : 0) + (b.botanicalInfo?.perenualId ? 1 : 0)

        return bSourceCount - aSourceCount
      })

      // Keep first (best) herb, merge others into it
      const primary = sorted[0]
      const duplicates = sorted.slice(1)

      console.log(`[Bulk Deduplication] Keeping: ${primary.title} (ID: ${primary.id})`)

      for (const duplicate of duplicates) {
        console.log(`[Bulk Deduplication] Merging: ${duplicate.title} (ID: ${duplicate.id})`)

        // Merge data
        const merged = mergeHerbData(primary, duplicate)

        // Update primary herb
        await payload.update({
          collection: 'herbs',
          id: primary.id,
          data: merged,
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
      console.error(`[Bulk Deduplication] Error processing group ${normalized}:`, error)
      stats.errors++
    }
  }

  console.log('[Bulk Deduplication] Complete:', stats)

  return stats
}
