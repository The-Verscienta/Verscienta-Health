/**
 * Verscienta Health API Client
 *
 * Platform-agnostic TypeScript API client for web and mobile apps.
 * Works with React, React Native, and can be adapted for Flutter.
 *
 * @example
 * ```typescript
 * import { VerscientaClient } from '@verscienta/api-client'
 *
 * const client = new VerslientaClient({
 *   baseURL: 'https://verscienta.com',
 *   apiKey: 'your-api-key', // optional
 * })
 *
 * // Fetch herbs
 * const herbs = await client.herbs.list({ page: 1, limit: 20 })
 *
 * // Search
 * const results = await client.search({ q: 'ginseng' })
 * ```
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type {
  Herb,
  Formula,
  Condition,
  Practitioner,
  HerbListRequest,
  PaginatedResponse,
  SearchRequest,
  SearchResponse,
  SymptomAnalysisRequest,
  SymptomAnalysisResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ApiError,
  PaginationParams,
  AppConfig,
  SyncRequest,
  SyncResponse,
} from '@verscienta/api-types'

export interface VerslientaClientConfig {
  baseURL: string
  apiKey?: string
  timeout?: number
  onTokenExpired?: () => void
  onError?: (error: ApiError) => void
}

export class VerslientaClient {
  private axios: AxiosInstance
  private token: string | null = null
  private config: VerslientaClientConfig

  constructor(config: VerslientaClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    }

    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - add auth token
    this.axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      } else if (this.config.apiKey) {
        config.headers['X-API-Key'] = this.config.apiKey
      }
      return config
    })

    // Response interceptor - handle errors
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const apiError: ApiError = error.response?.data || {
          error: 'NetworkError',
          message: error.message || 'Network request failed',
          statusCode: error.response?.status || 0,
        }

        // Handle token expiration
        if (apiError.statusCode === 401 && this.config.onTokenExpired) {
          this.config.onTokenExpired()
        }

        // Call error handler if provided
        if (this.config.onError) {
          this.config.onError(apiError)
        }

        return Promise.reject(apiError)
      }
    )
  }

  /**
   * Set authentication token for subsequent requests
   */
  setToken(token: string | null) {
    this.token = token
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token
  }

  // ==================== AUTHENTICATION ====================

  auth = {
    /**
     * Login with email and password
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await this.axios.post<AuthResponse>('/api/auth/sign-in', data)
      if (response.data.session?.token) {
        this.setToken(response.data.session.token)
      }
      return response.data
    },

    /**
     * Register new user account
     */
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await this.axios.post<AuthResponse>('/api/auth/sign-up', data)
      if (response.data.session?.token) {
        this.setToken(response.data.session.token)
      }
      return response.data
    },

    /**
     * Logout current user
     */
    logout: async (): Promise<void> => {
      await this.axios.post('/api/auth/sign-out')
      this.setToken(null)
    },

    /**
     * Get current user session
     */
    getSession: async (): Promise<{ user: User } | null> => {
      try {
        const response = await this.axios.get<{ user: User }>('/api/auth/get-session')
        return response.data
      } catch {
        return null
      }
    },

    /**
     * Request password reset email
     */
    forgotPassword: async (email: string): Promise<void> => {
      await this.axios.post('/api/auth/forgot-password', { email })
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token: string, password: string): Promise<void> => {
      await this.axios.post('/api/auth/reset-password', { token, password })
    },
  }

  // ==================== HERBS ====================

  herbs = {
    /**
     * Get paginated list of herbs with optional filters
     */
    list: async (params?: HerbListRequest): Promise<PaginatedResponse<Herb>> => {
      const response = await this.axios.get<PaginatedResponse<Herb>>('/api/herbs', { params })
      return response.data
    },

    /**
     * Get single herb by slug
     */
    get: async (slug: string): Promise<Herb> => {
      const response = await this.axios.get<Herb>(`/api/herbs/${slug}`)
      return response.data
    },

    /**
     * Get herb by ID
     */
    getById: async (id: string): Promise<Herb> => {
      const response = await this.axios.get<Herb>(`/api/herbs/${id}`)
      return response.data
    },
  }

  // ==================== FORMULAS ====================

  formulas = {
    /**
     * Get paginated list of formulas
     */
    list: async (params?: PaginationParams): Promise<PaginatedResponse<Formula>> => {
      const response = await this.axios.get<PaginatedResponse<Formula>>('/api/formulas', {
        params,
      })
      return response.data
    },

    /**
     * Get single formula by slug
     */
    get: async (slug: string): Promise<Formula> => {
      const response = await this.axios.get<Formula>(`/api/formulas/${slug}`)
      return response.data
    },
  }

  // ==================== CONDITIONS ====================

  conditions = {
    /**
     * Get paginated list of conditions
     */
    list: async (params?: PaginationParams): Promise<PaginatedResponse<Condition>> => {
      const response = await this.axios.get<PaginatedResponse<Condition>>('/api/conditions', {
        params,
      })
      return response.data
    },

    /**
     * Get single condition by slug
     */
    get: async (slug: string): Promise<Condition> => {
      const response = await this.axios.get<Condition>(`/api/conditions/${slug}`)
      return response.data
    },
  }

  // ==================== PRACTITIONERS ====================

  practitioners = {
    /**
     * Get paginated list of practitioners
     */
    list: async (params?: PaginationParams): Promise<PaginatedResponse<Practitioner>> => {
      const response = await this.axios.get<PaginatedResponse<Practitioner>>(
        '/api/practitioners',
        { params }
      )
      return response.data
    },

    /**
     * Get single practitioner by slug
     */
    get: async (slug: string): Promise<Practitioner> => {
      const response = await this.axios.get<Practitioner>(`/api/practitioners/${slug}`)
      return response.data
    },

    /**
     * Search practitioners by location
     */
    searchByLocation: async (params: {
      latitude: number
      longitude: number
      radius?: number
      limit?: number
    }): Promise<PaginatedResponse<Practitioner>> => {
      const response = await this.axios.get<PaginatedResponse<Practitioner>>(
        '/api/practitioners/nearby',
        { params }
      )
      return response.data
    },
  }

  // ==================== SEARCH ====================

  /**
   * Universal search across all content types
   */
  search = async (params: SearchRequest): Promise<SearchResponse> => {
    const response = await this.axios.get<SearchResponse>('/api/search', { params })
    return response.data
  }

  // ==================== AI SYMPTOM ANALYSIS ====================

  ai = {
    /**
     * Analyze symptoms and get herb recommendations
     * Requires authentication
     */
    analyzeSymptoms: async (
      data: SymptomAnalysisRequest
    ): Promise<SymptomAnalysisResponse> => {
      const response = await this.axios.post<SymptomAnalysisResponse>(
        '/api/grok/symptom-analysis',
        data
      )
      return response.data
    },
  }

  // ==================== MOBILE-SPECIFIC ====================

  mobile = {
    /**
     * Get app configuration (feature flags, version requirements, etc.)
     */
    getConfig: async (): Promise<AppConfig> => {
      const response = await this.axios.get<AppConfig>('/api/mobile/config')
      return response.data
    },

    /**
     * Sync data for offline use
     * Returns updates since last sync
     */
    sync: async (data: SyncRequest): Promise<SyncResponse> => {
      const response = await this.axios.post<SyncResponse>('/api/mobile/sync', data)
      return response.data
    },

    /**
     * Register device for push notifications
     */
    registerDevice: async (deviceToken: string, platform: 'ios' | 'android'): Promise<void> => {
      await this.axios.post('/api/mobile/register-device', { deviceToken, platform })
    },

    /**
     * Unregister device from push notifications
     */
    unregisterDevice: async (deviceToken: string): Promise<void> => {
      await this.axios.post('/api/mobile/unregister-device', { deviceToken })
    },
  }

  // ==================== MEDIA/IMAGES ====================

  media = {
    /**
     * Get optimized image URL for mobile
     */
    getOptimizedImage: (
      url: string,
      options?: { width?: number; height?: number; quality?: number; format?: 'webp' | 'jpeg' }
    ): string => {
      const params = new URLSearchParams()
      if (options?.width) params.set('w', options.width.toString())
      if (options?.height) params.set('h', options.height.toString())
      if (options?.quality) params.set('q', options.quality.toString())
      if (options?.format) params.set('f', options.format)

      return `${this.config.baseURL}/api/images?url=${encodeURIComponent(url)}&${params.toString()}`
    },
  }
}

// Export types
export type * from '@verscienta/api-types'
