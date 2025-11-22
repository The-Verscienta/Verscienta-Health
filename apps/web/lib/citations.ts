/**
 * Citation Utilities
 *
 * Manages fetching and storing evidence-based research citations from PubMed
 * for herbs, formulas, and conditions.
 *
 * Features:
 * - Fetch citations for individual herbs/formulas
 * - Bulk citation updates
 * - Citation caching (24 hours)
 * - Quality scoring and filtering
 * - Automatic deduplication
 *
 * Usage:
 *   import { fetchHerbCitations, updateHerbCitations } from '@/lib/citations'
 *   const citations = await fetchHerbCitations('herb-id')
 *   await updateHerbCitations('herb-id', citations)
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import PubMedClient, {
  type PubMedArticle,
  searchHerbCitations,
  searchClinicalTrials,
  searchSystematicReviews,
} from './pubmed'

// ============================================================================
// Types
// ============================================================================

/**
 * Simplified citation format for storage in Payload
 */
export interface StoredCitation {
  pmid: string
  title: string
  abstract?: string
  authors: string
  journal: string
  publicationDate: string
  doi?: string
  pmcid?: string
  publicationType: string[]
  url: string
  relevanceScore?: number
  lastFetched: string
}

/**
 * Citation fetch options
 */
export interface CitationFetchOptions {
  maxResults?: number // Default: 10
  minYear?: number // Default: 2010 (last 15 years)
  includeAbstract?: boolean // Default: true
  qualityThreshold?: number // Default: 60 (score 0-100)
  publicationTypes?: string[] // Filter by type
}

/**
 * Citation update result
 */
export interface CitationUpdateResult {
  herbId?: string
  formulaId?: string
  conditionId?: string
  citationsAdded: number
  citationsUpdated: number
  totalCitations: number
  errors: string[]
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OPTIONS: Required<CitationFetchOptions> = {
  maxResults: 10,
  minYear: 2010,
  includeAbstract: true,
  qualityThreshold: 60,
  publicationTypes: [],
}

const CITATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// ============================================================================
// Core Citation Functions
// ============================================================================

/**
 * Fetch citations for a herb from PubMed
 */
export async function fetchHerbCitations(
  herbId: string,
  options: CitationFetchOptions = {}
): Promise<StoredCitation[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    console.log(`[Citations] Fetching citations for herb: ${herbId}`)

    // Get herb data from Payload
    const payload = await getPayload({ config })
    const herb = await payload.findByID({
      collection: 'herbs',
      id: herbId,
    })

    if (!herb) {
      throw new Error(`Herb not found: ${herbId}`)
    }

    // Extract search terms
    const scientificName = herb.botanicalInfo?.scientificName || herb.title
    const commonNames =
      herb.commonNames
        ?.filter((cn: any) => cn.language === 'en')
        .map((cn: any) => cn.name)
        .slice(0, 3) || [] // Limit to 3 common names

    console.log(`[Citations] Searching for: ${scientificName}`, commonNames)

    // Search PubMed
    const client = new PubMedClient()
    const result = await client.searchByHerb(scientificName, commonNames, {
      maxResults: opts.maxResults,
      minYear: opts.minYear,
      includeAbstract: opts.includeAbstract,
      publicationTypes: opts.publicationTypes.length > 0 ? opts.publicationTypes : undefined,
      sort: 'date',
    })

    // Filter by quality score
    const topCitations = client.getTopCitations(result.articles, opts.qualityThreshold)

    console.log(
      `[Citations] Found ${topCitations.length} high-quality citations (from ${result.count} total)`
    )

    // Convert to stored format
    const storedCitations = convertToStoredCitations(topCitations)

    return storedCitations
  } catch (error) {
    console.error(`[Citations] Error fetching citations for herb ${herbId}:`, error)
    throw error
  }
}

/**
 * Fetch citations for a formula from PubMed
 */
export async function fetchFormulaCitations(
  formulaId: string,
  options: CitationFetchOptions = {}
): Promise<StoredCitation[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    console.log(`[Citations] Fetching citations for formula: ${formulaId}`)

    // Get formula data from Payload
    const payload = await getPayload({ config })
    const formula = await payload.findByID({
      collection: 'formulas',
      id: formulaId,
    })

    if (!formula) {
      throw new Error(`Formula not found: ${formulaId}`)
    }

    const formulaName = formula.title
    const tradition = (formula.tradition as 'tcm' | 'ayurveda' | 'western') || 'tcm'

    console.log(`[Citations] Searching for formula: ${formulaName} (${tradition})`)

    // Search PubMed
    const client = new PubMedClient()
    const result = await client.searchByFormula(formulaName, tradition, {
      maxResults: opts.maxResults,
      minYear: opts.minYear,
      includeAbstract: opts.includeAbstract,
      publicationTypes: opts.publicationTypes.length > 0 ? opts.publicationTypes : undefined,
      sort: 'date',
    })

    // Filter by quality score
    const topCitations = client.getTopCitations(result.articles, opts.qualityThreshold)

    console.log(
      `[Citations] Found ${topCitations.length} high-quality citations (from ${result.count} total)`
    )

    // Convert to stored format
    const storedCitations = convertToStoredCitations(topCitations)

    return storedCitations
  } catch (error) {
    console.error(`[Citations] Error fetching citations for formula ${formulaId}:`, error)
    throw error
  }
}

/**
 * Fetch citations for a condition from PubMed
 */
export async function fetchConditionCitations(
  conditionId: string,
  options: CitationFetchOptions = {}
): Promise<StoredCitation[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    console.log(`[Citations] Fetching citations for condition: ${conditionId}`)

    // Get condition data from Payload
    const payload = await getPayload({ config })
    const condition = await payload.findByID({
      collection: 'conditions',
      id: conditionId,
    })

    if (!condition) {
      throw new Error(`Condition not found: ${conditionId}`)
    }

    const conditionName = condition.title

    console.log(`[Citations] Searching for condition: ${conditionName}`)

    // Search PubMed
    const client = new PubMedClient()
    const result = await client.searchByCondition(conditionName, {
      maxResults: opts.maxResults,
      minYear: opts.minYear,
      includeAbstract: opts.includeAbstract,
      publicationTypes: opts.publicationTypes.length > 0 ? opts.publicationTypes : undefined,
      sort: 'date',
    })

    // Filter by quality score
    const topCitations = client.getTopCitations(result.articles, opts.qualityThreshold)

    console.log(
      `[Citations] Found ${topCitations.length} high-quality citations (from ${result.count} total)`
    )

    // Convert to stored format
    const storedCitations = convertToStoredCitations(topCitations)

    return storedCitations
  } catch (error) {
    console.error(`[Citations] Error fetching citations for condition ${conditionId}:`, error)
    throw error
  }
}

// ============================================================================
// Update Functions
// ============================================================================

/**
 * Update herb record with citations
 */
export async function updateHerbCitations(
  herbId: string,
  citations: StoredCitation[]
): Promise<CitationUpdateResult> {
  const result: CitationUpdateResult = {
    herbId,
    citationsAdded: 0,
    citationsUpdated: 0,
    totalCitations: 0,
    errors: [],
  }

  try {
    const payload = await getPayload({ config })

    // Get existing herb
    const herb = await payload.findByID({
      collection: 'herbs',
      id: herbId,
    })

    if (!herb) {
      throw new Error(`Herb not found: ${herbId}`)
    }

    // Get existing citations
    const existingCitations: StoredCitation[] = (herb.citations as any) || []
    const existingPMIDs = new Set(existingCitations.map((c: StoredCitation) => c.pmid))

    // Merge citations (deduplicate by PMID)
    const mergedCitations: StoredCitation[] = [...existingCitations]

    for (const citation of citations) {
      if (existingPMIDs.has(citation.pmid)) {
        // Update existing citation
        const index = mergedCitations.findIndex((c) => c.pmid === citation.pmid)
        mergedCitations[index] = citation
        result.citationsUpdated++
      } else {
        // Add new citation
        mergedCitations.push(citation)
        result.citationsAdded++
      }
    }

    // Update herb record
    await payload.update({
      collection: 'herbs',
      id: herbId,
      data: {
        citations: mergedCitations as any,
        citationsLastUpdated: new Date().toISOString(),
      },
    })

    result.totalCitations = mergedCitations.length

    console.log(
      `[Citations] Updated herb ${herbId}: +${result.citationsAdded} new, ${result.citationsUpdated} updated, ${result.totalCitations} total`
    )

    return result
  } catch (error) {
    const errorMsg = `Failed to update citations for herb ${herbId}: ${error}`
    console.error(`[Citations] ${errorMsg}`)
    result.errors.push(errorMsg)
    return result
  }
}

/**
 * Update formula record with citations
 */
export async function updateFormulaCitations(
  formulaId: string,
  citations: StoredCitation[]
): Promise<CitationUpdateResult> {
  const result: CitationUpdateResult = {
    formulaId,
    citationsAdded: 0,
    citationsUpdated: 0,
    totalCitations: 0,
    errors: [],
  }

  try {
    const payload = await getPayload({ config })

    // Get existing formula
    const formula = await payload.findByID({
      collection: 'formulas',
      id: formulaId,
    })

    if (!formula) {
      throw new Error(`Formula not found: ${formulaId}`)
    }

    // Get existing citations
    const existingCitations: StoredCitation[] = (formula.citations as any) || []
    const existingPMIDs = new Set(existingCitations.map((c: StoredCitation) => c.pmid))

    // Merge citations
    const mergedCitations: StoredCitation[] = [...existingCitations]

    for (const citation of citations) {
      if (existingPMIDs.has(citation.pmid)) {
        // Update existing
        const index = mergedCitations.findIndex((c) => c.pmid === citation.pmid)
        mergedCitations[index] = citation
        result.citationsUpdated++
      } else {
        // Add new
        mergedCitations.push(citation)
        result.citationsAdded++
      }
    }

    // Update formula record
    await payload.update({
      collection: 'formulas',
      id: formulaId,
      data: {
        citations: mergedCitations as any,
        citationsLastUpdated: new Date().toISOString(),
      },
    })

    result.totalCitations = mergedCitations.length

    console.log(
      `[Citations] Updated formula ${formulaId}: +${result.citationsAdded} new, ${result.citationsUpdated} updated, ${result.totalCitations} total`
    )

    return result
  } catch (error) {
    const errorMsg = `Failed to update citations for formula ${formulaId}: ${error}`
    console.error(`[Citations] ${errorMsg}`)
    result.errors.push(errorMsg)
    return result
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Fetch and update citations for all herbs in the database
 *
 * Use with caution - respects PubMed rate limits but can take a while
 */
export async function bulkUpdateHerbCitations(
  options: CitationFetchOptions = {},
  limit?: number
): Promise<{ updated: number; failed: number; errors: string[] }> {
  console.log('[Citations] Starting bulk herb citation update...')

  const payload = await getPayload({ config })

  // Get all published herbs
  const herbs = await payload.find({
    collection: 'herbs',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: limit || 1000,
  })

  console.log(`[Citations] Found ${herbs.docs.length} published herbs`)

  let updated = 0
  let failed = 0
  const errors: string[] = []

  for (const herb of herbs.docs) {
    try {
      const herbId = String(herb.id)
      const citations = await fetchHerbCitations(herbId, options)

      if (citations.length > 0) {
        await updateHerbCitations(herbId, citations)
        updated++
      }

      // Small delay to be polite to PubMed API
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      failed++
      const errorMsg = `Failed to update ${herb.title}: ${error}`
      errors.push(errorMsg)
      console.error(`[Citations] ${errorMsg}`)
    }
  }

  console.log(
    `[Citations] Bulk update complete: ${updated} updated, ${failed} failed${errors.length > 0 ? `, ${errors.length} errors` : ''}`
  )

  return { updated, failed, errors }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert PubMedArticle to StoredCitation format
 */
function convertToStoredCitations(articles: PubMedArticle[]): StoredCitation[] {
  const client = new PubMedClient()
  const scored = client.scoreCitations(articles)

  return articles.map((article, index) => {
    const score = scored.find((s) => s.pmid === article.pmid)

    return {
      pmid: article.pmid,
      title: article.title,
      abstract: article.abstract,
      authors: article.authors.join(', '),
      journal: article.journal,
      publicationDate: article.publicationDate,
      doi: article.doi,
      pmcid: article.pmcid,
      publicationType: article.publicationType,
      url: article.url,
      relevanceScore: score?.relevanceScore,
      lastFetched: new Date().toISOString(),
    }
  })
}

/**
 * Check if citations need refresh (>24 hours old)
 */
export function needsCitationRefresh(lastUpdated?: string): boolean {
  if (!lastUpdated) return true

  const lastUpdate = new Date(lastUpdated).getTime()
  const now = Date.now()

  return now - lastUpdate > CITATION_CACHE_TTL_MS
}

/**
 * Get citation statistics for a collection
 */
export async function getCitationStats(collection: 'herbs' | 'formulas' | 'conditions'): Promise<{
  total: number
  withCitations: number
  totalCitations: number
  avgCitationsPerDoc: number
}> {
  const payload = await getPayload({ config })

  const docs = await payload.find({
    collection,
    limit: 10000,
  })

  const total = docs.docs.length
  let withCitations = 0
  let totalCitations = 0

  for (const doc of docs.docs) {
    const citations = (doc.citations as StoredCitation[]) || []
    if (citations.length > 0) {
      withCitations++
      totalCitations += citations.length
    }
  }

  return {
    total,
    withCitations,
    totalCitations,
    avgCitationsPerDoc: total > 0 ? totalCitations / total : 0,
  }
}

// ============================================================================
// Export
// ============================================================================

export default {
  fetchHerbCitations,
  fetchFormulaCitations,
  fetchConditionCitations,
  updateHerbCitations,
  updateFormulaCitations,
  bulkUpdateHerbCitations,
  needsCitationRefresh,
  getCitationStats,
}
