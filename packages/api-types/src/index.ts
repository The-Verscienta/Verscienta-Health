/**
 * Shared TypeScript types for Verscienta Health API
 * Used by web, mobile (React Native/Flutter), and backend services
 */

// ==================== AUTHENTICATION ====================

export interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  role: 'user' | 'practitioner' | 'admin'
  mfaEnabled: boolean
  emailVerified: boolean
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  user: User
  session: Session
}

// ==================== HERBS ====================

export type TCMTemperature = 'Hot' | 'Warm' | 'Neutral' | 'Cool' | 'Cold'
export type TCMTaste = 'Sweet' | 'Bitter' | 'Sour' | 'Pungent' | 'Salty' | 'Bland'
export type SafetyRating = 'Safe' | 'Generally Safe' | 'Use with Caution' | 'Potentially Toxic'

export interface TCMProperties {
  temperature?: TCMTemperature
  taste?: TCMTaste[]
  meridians?: string[]
  actions?: string[]
}

export interface SafetyInfo {
  rating?: SafetyRating
  contraindications?: string[]
  interactions?: string[]
  sideEffects?: string[]
  pregnancy?: string
  breastfeeding?: string
}

export interface Herb {
  id: string
  slug: string
  name: string
  scientificName?: string
  commonNames?: string[]
  pinyinName?: string
  chineseName?: string
  description?: string
  tcmProperties?: TCMProperties
  westernProperties?: string[]
  safetyInfo?: SafetyInfo
  imageUrl?: string
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface HerbListRequest {
  page?: number
  limit?: number
  temperature?: TCMTemperature
  taste?: string
  meridians?: string
  search?: string
}

// ==================== FORMULAS ====================

export type FormulaTradition = 'TCM' | 'Western' | 'Ayurveda' | 'Other'
export type TCMRole = 'Chief' | 'Deputy' | 'Assistant' | 'Envoy'

export interface FormulaIngredient {
  herb: string
  herbId?: string
  quantity?: string
  unit?: string
  tcmRole?: TCMRole
  notes?: string
}

export interface Formula {
  id: string
  slug: string
  name: string
  pinyinName?: string
  chineseName?: string
  tradition: FormulaTradition
  category?: string
  description?: string
  ingredients: FormulaIngredient[]
  preparation?: string
  dosage?: string
  indications?: string[]
  contraindications?: string[]
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}

// ==================== CONDITIONS ====================

export type ConditionSeverity = 'Mild' | 'Moderate' | 'Severe' | 'Critical'

export interface Condition {
  id: string
  slug: string
  name: string
  westernName?: string
  tcmName?: string
  category?: string
  severity?: ConditionSeverity
  description?: string
  symptoms?: string[]
  affectedSystems?: string[]
  recommendedHerbs?: string[]
  recommendedFormulas?: string[]
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}

// ==================== PRACTITIONERS ====================

export interface PractitionerLocation {
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  latitude?: number
  longitude?: number
}

export interface Practitioner {
  id: string
  slug: string
  name: string
  credentials?: string[]
  specialties?: string[]
  modalities?: string[]
  bio?: string
  location?: PractitionerLocation
  website?: string
  email?: string
  phone?: string
  verified: boolean
  acceptingPatients: boolean
  rating?: number
  reviewCount?: number
  imageUrl?: string
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}

// ==================== SEARCH & PAGINATION ====================

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

export interface SearchRequest extends PaginationParams {
  q: string
  type?: 'herbs' | 'formulas' | 'conditions' | 'practitioners' | 'all'
  filters?: Record<string, unknown>
}

export interface SearchResult {
  id: string
  type: 'herb' | 'formula' | 'condition' | 'practitioner'
  name: string
  slug: string
  description?: string
  imageUrl?: string
  score: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  page: number
  totalPages: number
}

// ==================== AI SYMPTOM ANALYSIS ====================

export interface SymptomAnalysisRequest {
  symptoms: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  existingConditions?: string[]
  currentMedications?: string[]
}

export interface ConditionMatch {
  name: string
  slug: string
  confidence: number
  matchedSymptoms: string[]
}

export interface SymptomAnalysisResponse {
  analysis: string
  conditions: ConditionMatch[]
  recommendedHerbs: string[]
  recommendedFormulas: string[]
  disclaimer: string
  sessionId: string
}

// ==================== API RESPONSES ====================

export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: Record<string, unknown>
}

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}

// ==================== RATE LIMITING ====================

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
}

// ==================== MOBILE-SPECIFIC ====================

export interface AppConfig {
  apiBaseUrl: string
  cmsBaseUrl: string
  version: string
  minSupportedVersion: string
  features: {
    symptomChecker: boolean
    practitionerSearch: boolean
    offlineMode: boolean
    pushNotifications: boolean
  }
}

export interface ImageVariant {
  url: string
  width: number
  height: number
  format: 'webp' | 'jpeg' | 'png'
}

export interface OptimizedImage {
  original: string
  variants: {
    thumbnail: ImageVariant
    small: ImageVariant
    medium: ImageVariant
    large: ImageVariant
  }
}

// ==================== OFFLINE SUPPORT ====================

export interface SyncRequest {
  lastSyncedAt?: string
  collections: ('herbs' | 'formulas' | 'conditions')[]
}

export interface SyncResponse {
  herbs: Herb[]
  formulas: Formula[]
  conditions: Condition[]
  syncedAt: string
  hasMore: boolean
}
