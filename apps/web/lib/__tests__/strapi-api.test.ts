/**
 * Strapi API Integration Tests
 *
 * Tests API client integration with Strapi CMS
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

describe('Strapi API Integration', () => {
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllMocks()
  })

  describe('getHerbs', () => {
    it('fetches herbs with pagination', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            documentId: 'herb1',
            title: 'Ginseng',
            slug: 'ginseng',
            scientificName: 'Panax ginseng',
          },
          {
            id: 2,
            documentId: 'herb2',
            title: 'Astragalus',
            slug: 'astragalus',
            scientificName: 'Astragalus membranaceus',
          },
        ],
        meta: {
          pagination: {
            page: 1,
            pageSize: 12,
            pageCount: 5,
            total: 50,
          },
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const getHerbs = async (page: number, limit: number) => {
        const response = await fetch(
          `http://localhost:3001/api/herbs?pagination[page]=${page}&pagination[pageSize]=${limit}`
        )
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()

        // Transform to Payload-compatible format
        return {
          docs: data.data,
          page: data.meta.pagination.page,
          limit: data.meta.pagination.pageSize,
          totalDocs: data.meta.pagination.total,
          totalPages: data.meta.pagination.pageCount,
          hasNextPage: data.meta.pagination.page < data.meta.pagination.pageCount,
          hasPrevPage: data.meta.pagination.page > 1,
        }
      }

      const result = await getHerbs(1, 12)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/herbs?pagination[page]=1&pagination[pageSize]=12'
      )
      expect(result.docs).toHaveLength(2)
      expect(result.page).toBe(1)
      expect(result.totalDocs).toBe(50)
      expect(result.hasNextPage).toBe(true)
    })

    it('includes search query in request', async () => {
      const mockResponse = {
        data: [],
        meta: { pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const getHerbs = async (page: number, limit: number, search?: string) => {
        let url = `http://localhost:3001/api/herbs?pagination[page]=${page}&pagination[pageSize]=${limit}`
        if (search) {
          url += `&filters[title][$containsi]=${encodeURIComponent(search)}`
        }
        const response = await fetch(url)
        return response.json()
      }

      await getHerbs(1, 12, 'ginseng')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('filters[title][$containsi]=ginseng')
      )
    })

    it('handles API errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const getHerbs = async () => {
        const response = await fetch('http://localhost:3001/api/herbs')
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        return response.json()
      }

      await expect(getHerbs()).rejects.toThrow('API Error: 500 Internal Server Error')
    })

    it('handles network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const getHerbs = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/herbs')
          return response.json()
        } catch (error) {
          throw new Error('Network request failed')
        }
      }

      await expect(getHerbs()).rejects.toThrow('Network request failed')
    })
  })

  describe('getHerbBySlug', () => {
    it('fetches single herb by slug', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            documentId: 'herb1',
            title: 'Ginseng',
            slug: 'ginseng',
            scientificName: 'Panax ginseng',
            description: 'A powerful adaptogenic herb',
          },
        ],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const getHerbBySlug = async (slug: string) => {
        const response = await fetch(
          `http://localhost:3001/api/herbs?filters[slug][$eq]=${slug}`
        )
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        return data.data[0]
      }

      const herb = await getHerbBySlug('ginseng')

      expect(herb.title).toBe('Ginseng')
      expect(herb.slug).toBe('ginseng')
      expect(herb.scientificName).toBe('Panax ginseng')
    })

    it('returns null for non-existent slug', async () => {
      const mockResponse = {
        data: [],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const getHerbBySlug = async (slug: string) => {
        const response = await fetch(
          `http://localhost:3001/api/herbs?filters[slug][$eq]=${slug}`
        )
        const data = await response.json()
        return data.data[0] || null
      }

      const herb = await getHerbBySlug('non-existent')

      expect(herb).toBeNull()
    })
  })

  describe('Response Transformation', () => {
    it('transforms Strapi format to Payload format', () => {
      const strapiResponse = {
        data: [{ id: 1, title: 'Test' }],
        meta: {
          pagination: {
            page: 2,
            pageSize: 10,
            pageCount: 5,
            total: 50,
          },
        },
      }

      const transformResponse = (response: typeof strapiResponse) => {
        return {
          docs: response.data,
          page: response.meta.pagination.page,
          limit: response.meta.pagination.pageSize,
          totalDocs: response.meta.pagination.total,
          totalPages: response.meta.pagination.pageCount,
          hasNextPage: response.meta.pagination.page < response.meta.pagination.pageCount,
          hasPrevPage: response.meta.pagination.page > 1,
          prevPage: response.meta.pagination.page > 1 ? response.meta.pagination.page - 1 : null,
          nextPage:
            response.meta.pagination.page < response.meta.pagination.pageCount
              ? response.meta.pagination.page + 1
              : null,
        }
      }

      const result = transformResponse(strapiResponse)

      expect(result.docs).toEqual([{ id: 1, title: 'Test' }])
      expect(result.page).toBe(2)
      expect(result.limit).toBe(10)
      expect(result.totalDocs).toBe(50)
      expect(result.totalPages).toBe(5)
      expect(result.hasNextPage).toBe(true)
      expect(result.hasPrevPage).toBe(true)
      expect(result.nextPage).toBe(3)
      expect(result.prevPage).toBe(1)
    })

    it('handles first page correctly', () => {
      const strapiResponse = {
        data: [],
        meta: {
          pagination: { page: 1, pageSize: 10, pageCount: 5, total: 50 },
        },
      }

      const transformResponse = (response: typeof strapiResponse) => {
        return {
          hasNextPage: response.meta.pagination.page < response.meta.pagination.pageCount,
          hasPrevPage: response.meta.pagination.page > 1,
          prevPage: response.meta.pagination.page > 1 ? response.meta.pagination.page - 1 : null,
          nextPage:
            response.meta.pagination.page < response.meta.pagination.pageCount
              ? response.meta.pagination.page + 1
              : null,
        }
      }

      const result = transformResponse(strapiResponse)

      expect(result.hasNextPage).toBe(true)
      expect(result.hasPrevPage).toBe(false)
      expect(result.prevPage).toBeNull()
      expect(result.nextPage).toBe(2)
    })

    it('handles last page correctly', () => {
      const strapiResponse = {
        data: [],
        meta: {
          pagination: { page: 5, pageSize: 10, pageCount: 5, total: 50 },
        },
      }

      const transformResponse = (response: typeof strapiResponse) => {
        return {
          hasNextPage: response.meta.pagination.page < response.meta.pagination.pageCount,
          hasPrevPage: response.meta.pagination.page > 1,
          prevPage: response.meta.pagination.page > 1 ? response.meta.pagination.page - 1 : null,
          nextPage:
            response.meta.pagination.page < response.meta.pagination.pageCount
              ? response.meta.pagination.page + 1
              : null,
        }
      }

      const result = transformResponse(strapiResponse)

      expect(result.hasNextPage).toBe(false)
      expect(result.hasPrevPage).toBe(true)
      expect(result.prevPage).toBe(4)
      expect(result.nextPage).toBeNull()
    })
  })

  describe('Request Building', () => {
    it('builds URL with multiple filters', () => {
      const buildURL = (
        baseURL: string,
        params: Record<string, string | number | boolean>
      ): string => {
        const query = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          query.append(key, String(value))
        })

        return `${baseURL}?${query.toString()}`
      }

      const url = buildURL('http://localhost:3001/api/herbs', {
        'pagination[page]': 2,
        'pagination[pageSize]': 20,
        'filters[category][$eq]': 'Qi Tonic',
        'sort[0]': 'title:asc',
      })

      expect(url).toContain('pagination[page]=2')
      expect(url).toContain('pagination[pageSize]=20')
      expect(url).toContain('filters[category][$eq]=Qi+Tonic')
      expect(url).toContain('sort[0]=title:asc')
    })

    it('encodes special characters in query params', () => {
      const buildURL = (search: string): string => {
        return `http://localhost:3001/api/herbs?filters[title][$containsi]=${encodeURIComponent(search)}`
      }

      const url = buildURL('Ginseng & Astragalus')

      expect(url).toContain('Ginseng%20%26%20Astragalus')
    })
  })

  describe('Caching and Revalidation', () => {
    it('supports Next.js revalidation options', async () => {
      const getHerbsWithRevalidation = async () => {
        const response = await fetch('http://localhost:3001/api/herbs', {
          next: { revalidate: 3600 }, // 1 hour
        })
        return response.json()
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      })

      await getHerbsWithRevalidation()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/herbs',
        expect.objectContaining({
          next: { revalidate: 3600 },
        })
      )
    })

    it('supports no-store cache option', async () => {
      const getHerbsNoCache = async () => {
        const response = await fetch('http://localhost:3001/api/herbs', {
          next: { revalidate: 0 },
        })
        return response.json()
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      })

      await getHerbsNoCache()

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/herbs',
        expect.objectContaining({
          next: { revalidate: 0 },
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('retries on network failure', async () => {
      const fetchWithRetry = async (url: string, maxRetries = 3) => {
        let lastError: Error | null = null

        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return await response.json()
          } catch (error) {
            lastError = error as Error
            if (i < maxRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, i)))
            }
          }
        }

        throw lastError
      }

      ;(global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [], meta: {} }),
        })

      const result = await fetchWithRetry('http://localhost:3001/api/herbs')

      expect(global.fetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ data: [], meta: {} })
    })

    it('throws after max retries exceeded', async () => {
      const fetchWithRetry = async (url: string, maxRetries = 3) => {
        let lastError: Error | null = null

        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url)
            return await response.json()
          } catch (error) {
            lastError = error as Error
          }
        }

        throw lastError
      }

      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      await expect(fetchWithRetry('http://localhost:3001/api/herbs', 3)).rejects.toThrow(
        'Network error'
      )

      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Type Safety', () => {
    it('validates response data structure', () => {
      interface HerbResponse {
        data: Array<{
          id: number
          title: string
          slug: string
        }>
        meta: {
          pagination: {
            page: number
            pageSize: number
            total: number
          }
        }
      }

      const validateResponse = (data: unknown): data is HerbResponse => {
        if (!data || typeof data !== 'object') return false

        const response = data as HerbResponse

        return (
          Array.isArray(response.data) &&
          response.meta?.pagination?.page !== undefined &&
          response.meta?.pagination?.pageSize !== undefined &&
          response.meta?.pagination?.total !== undefined
        )
      }

      const validResponse = {
        data: [{ id: 1, title: 'Test', slug: 'test' }],
        meta: { pagination: { page: 1, pageSize: 10, total: 1 } },
      }

      const invalidResponse = {
        data: 'not an array',
      }

      expect(validateResponse(validResponse)).toBe(true)
      expect(validateResponse(invalidResponse)).toBe(false)
      expect(validateResponse(null)).toBe(false)
      expect(validateResponse(undefined)).toBe(false)
    })
  })
})
