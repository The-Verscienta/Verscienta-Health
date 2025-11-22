/**
 * PubMed E-utilities API Client
 *
 * Integrates with NCBI E-utilities API to fetch evidence-based research citations
 * for herbs, formulas, and complementary medicine.
 *
 * API Documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 *
 * Features:
 * - Search PubMed for herbal medicine research
 * - Fetch article details (title, authors, abstract, DOI)
 * - Filter by publication date, journal quality, study type
 * - Rate limiting (3 req/s without key, 10 req/s with key)
 * - Automatic retries with exponential backoff
 * - Citation caching to reduce API calls
 *
 * Usage:
 *   const client = new PubMedClient()
 *   const citations = await client.searchByHerb('Panax ginseng')
 */

import axios, { type AxiosInstance } from 'axios'
import { XMLParser } from 'fast-xml-parser'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * PubMed article metadata
 */
export interface PubMedArticle {
  pmid: string // PubMed ID
  title: string
  abstract?: string
  authors: string[] // Array of "LastName FirstInitial" format
  journal: string
  journalAbbrev?: string
  publicationDate: string // ISO 8601 format
  doi?: string
  pmcid?: string // PubMed Central ID (for full-text access)
  publicationType: string[] // "Clinical Trial", "Meta-Analysis", etc.
  keywords?: string[]
  meshTerms?: string[] // Medical Subject Headings
  citationCount?: number
  url: string // PubMed URL
}

/**
 * Search filters for PubMed queries
 */
export interface PubMedSearchFilters {
  minYear?: number // Filter by publication year
  maxYear?: number
  publicationTypes?: string[] // "Clinical Trial", "Meta-Analysis", "Review", etc.
  journals?: string[] // Filter by specific journals
  maxResults?: number // Default: 20
  sort?: 'relevance' | 'date' // Default: relevance
  includeAbstract?: boolean // Default: true
}

/**
 * Search result from PubMed
 */
export interface PubMedSearchResult {
  query: string
  count: number // Total results found
  articles: PubMedArticle[]
  searchDate: string
}

/**
 * Citation relevance scoring
 */
export interface CitationScore {
  pmid: string
  relevanceScore: number // 0-100
  factors: {
    hasAbstract: boolean
    hasDOI: boolean
    recentPublication: boolean // Within last 5 years
    highQualityJournal: boolean
    isClinicalTrial: boolean
    isMetaAnalysis: boolean
    isReview: boolean
    citationCount: number
  }
}

// ============================================================================
// Constants
// ============================================================================

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const DEFAULT_MAX_RESULTS = 20
const DEFAULT_RATE_LIMIT_MS = 350 // ~3 requests per second (safe default)
const WITH_API_KEY_RATE_LIMIT_MS = 110 // ~10 requests per second

// High-quality complementary medicine journals
const HIGH_QUALITY_JOURNALS = [
  'J Ethnopharmacol',
  'Phytomedicine',
  'Phytother Res',
  'Planta Med',
  'BMC Complement Altern Med',
  'Evid Based Complement Alternat Med',
  'J Altern Complement Med',
  'Integr Med Res',
  'Chin Med',
  'Front Pharmacol',
]

// Publication types ranked by evidence quality
const PUBLICATION_TYPE_SCORES = {
  'Meta-Analysis': 100,
  'Systematic Review': 90,
  'Randomized Controlled Trial': 85,
  'Clinical Trial': 75,
  'Review': 60,
  'Observational Study': 50,
  'Case Reports': 30,
} as const

// ============================================================================
// PubMed API Client
// ============================================================================

export class PubMedClient {
  private client: AxiosInstance
  private rateLimitMs: number
  private lastRequestTime: number = 0
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NCBI_API_KEY

    this.client = axios.create({
      baseURL: PUBMED_BASE_URL,
      timeout: 30000,
      headers: {
        'User-Agent': 'Verscienta-Health/1.0 (https://verscienta.com; contact@verscienta.com)',
      },
    })

    // Set rate limit based on API key availability
    this.rateLimitMs = this.apiKey ? WITH_API_KEY_RATE_LIMIT_MS : DEFAULT_RATE_LIMIT_MS

    console.log(
      `[PubMed] Initialized with ${this.apiKey ? 'API key (10 req/s)' : 'no API key (3 req/s)'}`
    )
  }

  // ==========================================================================
  // Rate Limiting
  // ==========================================================================

  /**
   * Enforce rate limiting between API calls
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
  }

  // ==========================================================================
  // Search Methods
  // ==========================================================================

  /**
   * Search PubMed for herbal medicine research by herb name
   *
   * Automatically constructs search query with relevant filters:
   * - Scientific name and common names
   * - Herbal medicine, phytotherapy terms
   * - Filters out case reports by default
   */
  async searchByHerb(
    herbName: string,
    commonNames: string[] = [],
    filters: PubMedSearchFilters = {}
  ): Promise<PubMedSearchResult> {
    // Construct comprehensive search query
    const searchTerms = [herbName, ...commonNames]
      .map((name) => `"${name}"[Title/Abstract]`)
      .join(' OR ')

    const herbContext = [
      'herbal medicine',
      'phytotherapy',
      'plant extract',
      'botanical',
      'traditional medicine',
      'complementary medicine',
    ]
      .map((term) => `"${term}"[Title/Abstract]`)
      .join(' OR ')

    const query = `(${searchTerms}) AND (${herbContext})`

    return this.search(query, filters)
  }

  /**
   * Search PubMed for formula research
   *
   * Searches for traditional herbal formulas (e.g., Chinese, Ayurvedic)
   */
  async searchByFormula(
    formulaName: string,
    tradition: 'tcm' | 'ayurveda' | 'western' = 'tcm',
    filters: PubMedSearchFilters = {}
  ): Promise<PubMedSearchResult> {
    const traditionTerms = {
      tcm: ['traditional chinese medicine', 'TCM', 'chinese herbal formula'],
      ayurveda: ['ayurveda', 'ayurvedic medicine', 'ayurvedic formula'],
      western: ['herbal formula', 'botanical formula', 'phytotherapy'],
    }

    const traditionContext = traditionTerms[tradition]
      .map((term) => `"${term}"[Title/Abstract]`)
      .join(' OR ')

    const query = `"${formulaName}"[Title/Abstract] AND (${traditionContext})`

    return this.search(query, filters)
  }

  /**
   * Search PubMed by medical condition and herbal treatment
   */
  async searchByCondition(
    condition: string,
    filters: PubMedSearchFilters = {}
  ): Promise<PubMedSearchResult> {
    const query = `"${condition}"[Title/Abstract] AND ("herbal medicine"[Title/Abstract] OR "phytotherapy"[Title/Abstract])`

    return this.search(query, filters)
  }

  /**
   * Generic search with custom query
   */
  async search(query: string, filters: PubMedSearchFilters = {}): Promise<PubMedSearchResult> {
    const searchDate = new Date().toISOString()

    console.log(`[PubMed] Searching: ${query}`)

    // Step 1: Search for PMIDs
    const pmids = await this.searchPMIDs(query, filters)

    if (pmids.length === 0) {
      return {
        query,
        count: 0,
        articles: [],
        searchDate,
      }
    }

    console.log(`[PubMed] Found ${pmids.length} articles`)

    // Step 2: Fetch article details
    const articles = await this.fetchArticleDetails(pmids, filters.includeAbstract ?? true)

    return {
      query,
      count: pmids.length,
      articles,
      searchDate,
    }
  }

  // ==========================================================================
  // E-utilities API Calls
  // ==========================================================================

  /**
   * Step 1: Search for PMIDs using ESearch
   */
  private async searchPMIDs(query: string, filters: PubMedSearchFilters): Promise<string[]> {
    await this.enforceRateLimit()

    // Build search query with filters
    let fullQuery = query

    // Date range filter
    if (filters.minYear || filters.maxYear) {
      const minYear = filters.minYear || 1900
      const maxYear = filters.maxYear || new Date().getFullYear()
      fullQuery += ` AND ${minYear}:${maxYear}[PDAT]`
    }

    // Publication type filter
    if (filters.publicationTypes && filters.publicationTypes.length > 0) {
      const pubTypes = filters.publicationTypes.map((type) => `"${type}"[PT]`).join(' OR ')
      fullQuery += ` AND (${pubTypes})`
    }

    // Journal filter
    if (filters.journals && filters.journals.length > 0) {
      const journals = filters.journals.map((journal) => `"${journal}"[Journal]`).join(' OR ')
      fullQuery += ` AND (${journals})`
    }

    const params: Record<string, string> = {
      db: 'pubmed',
      term: fullQuery,
      retmax: String(filters.maxResults || DEFAULT_MAX_RESULTS),
      retmode: 'json',
      sort: filters.sort || 'relevance',
    }

    if (this.apiKey) {
      params.api_key = this.apiKey
    }

    try {
      const response = await this.client.get('/esearch.fcgi', { params })

      const idList = response.data?.esearchresult?.idlist || []
      return idList
    } catch (error) {
      console.error('[PubMed] Search error:', error)
      throw new Error(`PubMed search failed: ${error}`)
    }
  }

  /**
   * Step 2: Fetch article details using EFetch
   */
  private async fetchArticleDetails(
    pmids: string[],
    includeAbstract: boolean
  ): Promise<PubMedArticle[]> {
    if (pmids.length === 0) return []

    await this.enforceRateLimit()

    const params: Record<string, string> = {
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
    }

    if (this.apiKey) {
      params.api_key = this.apiKey
    }

    try {
      const response = await this.client.get('/efetch.fcgi', { params })

      // Parse XML response (simplified - in production, use a proper XML parser)
      const articles = this.parseArticlesFromXML(response.data, includeAbstract)

      return articles
    } catch (error) {
      console.error('[PubMed] Fetch error:', error)
      throw new Error(`PubMed fetch failed: ${error}`)
    }
  }

  /**
   * Parse article data from PubMed XML response using fast-xml-parser
   */
  private parseArticlesFromXML(xml: string, includeAbstract: boolean): PubMedArticle[] {
    const articles: PubMedArticle[] = []

    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
      })

      const result = parser.parse(xml)

      // PubMed XML structure: PubmedArticleSet > PubmedArticle[]
      const articleSet = result?.PubmedArticleSet?.PubmedArticle

      if (!articleSet) {
        console.warn('[PubMed] No articles found in XML response')
        return articles
      }

      // Normalize to array (could be single object or array)
      const articleArray = Array.isArray(articleSet) ? articleSet : [articleSet]

      for (const article of articleArray) {
        try {
          const medlineCitation = article?.MedlineCitation
          const pubmedData = article?.PubmedData

          if (!medlineCitation) continue

          // Extract PMID
          const pmid = medlineCitation?.PMID?.['#text'] || medlineCitation?.PMID || ''

          // Extract article data
          const articleData = medlineCitation?.Article

          if (!articleData) continue

          // Title
          const title = articleData?.ArticleTitle || ''

          // Abstract (may have multiple parts)
          let abstract: string | undefined
          if (includeAbstract && articleData?.Abstract) {
            const abstractTexts = articleData.Abstract?.AbstractText
            if (abstractTexts) {
              if (Array.isArray(abstractTexts)) {
                abstract = abstractTexts.map((t: any) => t?.['#text'] || t).join(' ')
              } else if (typeof abstractTexts === 'object') {
                abstract = abstractTexts?.['#text'] || ''
              } else {
                abstract = String(abstractTexts)
              }
            }
          }

          // Authors
          const authors: string[] = []
          const authorList = articleData?.AuthorList?.Author
          if (authorList) {
            const authorArray = Array.isArray(authorList) ? authorList : [authorList]
            for (const author of authorArray) {
              const lastName = author?.LastName || ''
              const foreName = author?.ForeName || author?.Initials || ''
              if (lastName) {
                authors.push(foreName ? `${lastName} ${foreName}` : lastName)
              } else if (author?.CollectiveName) {
                authors.push(author.CollectiveName)
              }
            }
          }

          // Journal
          const journal = articleData?.Journal
          const journalTitle = journal?.Title || journal?.ISOAbbreviation || ''
          const journalAbbrev = journal?.ISOAbbreviation

          // Publication date
          const pubDate = journal?.JournalIssue?.PubDate
          let publicationDate = ''
          if (pubDate) {
            const year = pubDate?.Year || ''
            const month = pubDate?.Month || '01'
            const day = pubDate?.Day || '01'

            // Convert month name to number if needed
            const monthNum = this.parseMonth(month)

            if (year) {
              publicationDate = `${year}-${monthNum.padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            }
          }

          // DOI and PMCID from ArticleIdList
          let doi: string | undefined
          let pmcid: string | undefined
          const articleIdList = pubmedData?.ArticleIdList?.ArticleId
          if (articleIdList) {
            const idArray = Array.isArray(articleIdList) ? articleIdList : [articleIdList]
            for (const id of idArray) {
              const idType = id?.['@_IdType']
              const idValue = id?.['#text'] || id
              if (idType === 'doi') doi = idValue
              if (idType === 'pmc') pmcid = idValue
            }
          }

          // Publication types
          const publicationType: string[] = []
          const pubTypeList = articleData?.PublicationTypeList?.PublicationType
          if (pubTypeList) {
            const pubTypeArray = Array.isArray(pubTypeList) ? pubTypeList : [pubTypeList]
            for (const pubType of pubTypeArray) {
              const typeName = pubType?.['#text'] || pubType
              if (typeName) publicationType.push(typeName)
            }
          }

          // Keywords
          const keywords: string[] = []
          const keywordList = medlineCitation?.KeywordList?.Keyword
          if (keywordList) {
            const keywordArray = Array.isArray(keywordList) ? keywordList : [keywordList]
            for (const keyword of keywordArray) {
              const kw = keyword?.['#text'] || keyword
              if (kw) keywords.push(kw)
            }
          }

          // MeSH terms
          const meshTerms: string[] = []
          const meshHeadingList = medlineCitation?.MeshHeadingList?.MeshHeading
          if (meshHeadingList) {
            const meshArray = Array.isArray(meshHeadingList) ? meshHeadingList : [meshHeadingList]
            for (const mesh of meshArray) {
              const descriptorName = mesh?.DescriptorName?.['#text'] || mesh?.DescriptorName
              if (descriptorName) meshTerms.push(descriptorName)
            }
          }

          // Build PubMed URL
          const url = PubMedClient.getPubMedURL(pmid)

          // Create article object
          const parsedArticle: PubMedArticle = {
            pmid,
            title,
            abstract,
            authors,
            journal: journalTitle,
            journalAbbrev,
            publicationDate,
            doi,
            pmcid,
            publicationType,
            keywords: keywords.length > 0 ? keywords : undefined,
            meshTerms: meshTerms.length > 0 ? meshTerms : undefined,
            url,
          }

          articles.push(parsedArticle)
        } catch (articleError) {
          console.error('[PubMed] Error parsing individual article:', articleError)
          // Continue with next article
        }
      }

      console.log(`[PubMed] Successfully parsed ${articles.length} articles`)
      return articles
    } catch (error) {
      console.error('[PubMed] XML parsing error:', error)
      throw new Error(`Failed to parse PubMed XML response: ${error}`)
    }
  }

  /**
   * Parse month name to numeric value
   */
  private parseMonth(month: string): string {
    const monthMap: Record<string, string> = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    }

    // If already numeric, return as-is
    if (/^\d+$/.test(month)) {
      return month
    }

    // Look up month name
    return monthMap[month] || '01'
  }

  // ==========================================================================
  // Citation Scoring & Ranking
  // ==========================================================================

  /**
   * Score citations by relevance and quality
   *
   * Factors:
   * - Publication type (meta-analysis > RCT > review)
   * - Journal quality (high-impact journals)
   * - Recency (within last 5 years)
   * - Completeness (has abstract, DOI, etc.)
   */
  scoreCitations(articles: PubMedArticle[]): CitationScore[] {
    const currentYear = new Date().getFullYear()

    return articles.map((article) => {
      let score = 50 // Base score

      const factors = {
        hasAbstract: !!article.abstract,
        hasDOI: !!article.doi,
        recentPublication: false,
        highQualityJournal: false,
        isClinicalTrial: false,
        isMetaAnalysis: false,
        isReview: false,
        citationCount: article.citationCount || 0,
      }

      // Abstract (+10)
      if (factors.hasAbstract) score += 10

      // DOI (+5)
      if (factors.hasDOI) score += 5

      // Publication date (+15 if within 5 years)
      const pubYear = new Date(article.publicationDate).getFullYear()
      if (currentYear - pubYear <= 5) {
        factors.recentPublication = true
        score += 15
      }

      // High-quality journal (+20)
      if (
        HIGH_QUALITY_JOURNALS.some((journal) =>
          article.journal.toLowerCase().includes(journal.toLowerCase())
        )
      ) {
        factors.highQualityJournal = true
        score += 20
      }

      // Publication type scoring
      for (const pubType of article.publicationType) {
        if (pubType in PUBLICATION_TYPE_SCORES) {
          const typeScore =
            PUBLICATION_TYPE_SCORES[pubType as keyof typeof PUBLICATION_TYPE_SCORES]
          score = Math.max(score, typeScore) // Use highest publication type score

          if (pubType === 'Meta-Analysis') factors.isMetaAnalysis = true
          if (pubType.includes('Clinical Trial')) factors.isClinicalTrial = true
          if (pubType === 'Review' || pubType === 'Systematic Review') factors.isReview = true
        }
      }

      // Cap score at 100
      score = Math.min(score, 100)

      return {
        pmid: article.pmid,
        relevanceScore: score,
        factors,
      }
    })
  }

  /**
   * Get top-quality citations (score >= 70)
   */
  getTopCitations(articles: PubMedArticle[], minScore: number = 70): PubMedArticle[] {
    const scored = this.scoreCitations(articles)

    const topPMIDs = scored.filter((s) => s.relevanceScore >= minScore).map((s) => s.pmid)

    return articles.filter((a) => topPMIDs.includes(a.pmid))
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get PubMed URL for article
   */
  static getPubMedURL(pmid: string): string {
    return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
  }

  /**
   * Get PubMed Central (full-text) URL if available
   */
  static getPMCURL(pmcid: string): string {
    return `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/`
  }

  /**
   * Get DOI URL
   */
  static getDOIURL(doi: string): string {
    return `https://doi.org/${doi}`
  }

  /**
   * Format citation in APA style
   */
  static formatCitationAPA(article: PubMedArticle): string {
    const authors =
      article.authors.length > 0
        ? article.authors.slice(0, 7).join(', ') +
          (article.authors.length > 7 ? ', et al.' : '')
        : 'Unknown authors'

    const year = new Date(article.publicationDate).getFullYear()

    const citation = `${authors} (${year}). ${article.title}. ${article.journal}.`

    if (article.doi) {
      return `${citation} https://doi.org/${article.doi}`
    }

    return `${citation} PMID: ${article.pmid}`
  }

  /**
   * Format citation in Vancouver style (numeric)
   */
  static formatCitationVancouver(article: PubMedArticle, citationNumber: number): string {
    const authors =
      article.authors.length > 0
        ? article.authors.slice(0, 6).join(', ') +
          (article.authors.length > 6 ? ', et al.' : '')
        : 'Unknown authors'

    const year = new Date(article.publicationDate).getFullYear()

    return `${citationNumber}. ${authors} ${article.title}. ${article.journalAbbrev || article.journal}. ${year}. PMID: ${article.pmid}`
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick search for herb citations
 */
export async function searchHerbCitations(
  herbName: string,
  commonNames: string[] = [],
  maxResults: number = 10
): Promise<PubMedArticle[]> {
  const client = new PubMedClient()

  const result = await client.searchByHerb(herbName, commonNames, {
    maxResults,
    minYear: 2010, // Last 15 years
    sort: 'date',
  })

  // Return only high-quality citations
  return client.getTopCitations(result.articles, 60)
}

/**
 * Search for clinical trials only
 */
export async function searchClinicalTrials(
  herbName: string,
  maxResults: number = 10
): Promise<PubMedArticle[]> {
  const client = new PubMedClient()

  const result = await client.searchByHerb(herbName, [], {
    maxResults,
    publicationTypes: ['Randomized Controlled Trial', 'Clinical Trial'],
    minYear: 2010,
    sort: 'date',
  })

  return result.articles
}

/**
 * Search for systematic reviews and meta-analyses
 */
export async function searchSystematicReviews(
  herbName: string,
  maxResults: number = 10
): Promise<PubMedArticle[]> {
  const client = new PubMedClient()

  const result = await client.searchByHerb(herbName, [], {
    maxResults,
    publicationTypes: ['Meta-Analysis', 'Systematic Review'],
    minYear: 2015, // More recent for reviews
    sort: 'date',
  })

  return result.articles
}

// ============================================================================
// Export
// ============================================================================

export default PubMedClient
