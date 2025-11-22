/**
 * API Versioning Utilities
 *
 * Helpers for implementing API versioning in Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * API version type
 */
export type ApiVersion = 1 | 2 | 3

/**
 * Current API version
 */
export const CURRENT_API_VERSION: ApiVersion = 1

/**
 * Supported API versions
 */
export const SUPPORTED_API_VERSIONS: ApiVersion[] = [1]

/**
 * Get API version from request
 *
 * Checks in order:
 * 1. URL path (/api/v1/...)
 * 2. X-Api-Version header
 * 3. Query parameter (api_version=1)
 * 4. Default to current version
 */
export function getApiVersion(request: NextRequest): ApiVersion {
  // Check URL path
  const pathMatch = request.nextUrl.pathname.match(/^\/api\/v(\d+)\//)
  if (pathMatch) {
    const version = parseInt(pathMatch[1], 10)
    if (SUPPORTED_API_VERSIONS.includes(version as ApiVersion)) {
      return version as ApiVersion
    }
  }

  // Check header
  const headerVersion = request.headers.get('X-Api-Version')
  if (headerVersion) {
    const version = parseInt(headerVersion, 10)
    if (SUPPORTED_API_VERSIONS.includes(version as ApiVersion)) {
      return version as ApiVersion
    }
  }

  // Check query parameter
  const queryVersion = request.nextUrl.searchParams.get('api_version')
  if (queryVersion) {
    const version = parseInt(queryVersion, 10)
    if (SUPPORTED_API_VERSIONS.includes(version as ApiVersion)) {
      return version as ApiVersion
    }
  }

  // Default to current version
  return CURRENT_API_VERSION
}

/**
 * Check if API version is supported
 */
export function isVersionSupported(version: number): boolean {
  return SUPPORTED_API_VERSIONS.includes(version as ApiVersion)
}

/**
 * Get version-specific response headers
 */
export function getVersionHeaders(version: ApiVersion): Record<string, string> {
  return {
    'X-Api-Version': version.toString(),
    'X-Api-Supported-Versions': SUPPORTED_API_VERSIONS.join(', '),
    'X-Api-Latest-Version': CURRENT_API_VERSION.toString(),
    'X-Api-Deprecation': version < CURRENT_API_VERSION ? 'true' : 'false',
    ...(version < CURRENT_API_VERSION && {
      'X-Api-Deprecation-Date': getDeprecationDate(version),
      'X-Api-Sunset': getSunsetDate(version),
    }),
  }
}

/**
 * Get deprecation date for a version (6 months after new version release)
 */
function getDeprecationDate(version: ApiVersion): string {
  // This would be dynamically calculated based on version release dates
  // For now, return a placeholder
  const date = new Date()
  date.setMonth(date.getMonth() + 6)
  return date.toISOString()
}

/**
 * Get sunset date for a version (12 months after new version release)
 */
function getSunsetDate(version: ApiVersion): string {
  // This would be dynamically calculated based on version release dates
  // For now, return a placeholder
  const date = new Date()
  date.setMonth(date.getMonth() + 12)
  return date.toISOString()
}

/**
 * Create versioned API response
 *
 * Automatically adds versioning headers
 */
export function versionedResponse(
  data: any,
  options: {
    status?: number
    headers?: Record<string, string>
    version?: ApiVersion
  } = {}
): NextResponse {
  const version = options.version || CURRENT_API_VERSION
  const headers = {
    ...getVersionHeaders(version),
    ...options.headers,
  }

  return NextResponse.json(data, {
    status: options.status || 200,
    headers,
  })
}

/**
 * Create unsupported version error response
 */
export function unsupportedVersionResponse(requestedVersion: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Unsupported API version',
      requestedVersion,
      supportedVersions: SUPPORTED_API_VERSIONS,
      latestVersion: CURRENT_API_VERSION,
      message: `API version ${requestedVersion} is not supported. Please use one of: ${SUPPORTED_API_VERSIONS.join(', ')}`,
    },
    {
      status: 400,
      headers: getVersionHeaders(CURRENT_API_VERSION),
    }
  )
}

/**
 * Create version deprecation warning response
 *
 * Returns data with deprecation warning in headers
 */
export function deprecatedVersionResponse(
  data: any,
  version: ApiVersion,
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse {
  return NextResponse.json(data, {
    status: options.status || 200,
    headers: {
      ...getVersionHeaders(version),
      Warning: `299 - "API version ${version} is deprecated and will be removed on ${getSunsetDate(version)}"`,
      ...options.headers,
    },
  })
}

/**
 * Version-based handler wrapper
 *
 * Routes requests to different handlers based on API version
 *
 * Example:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return versionedHandler(request, {
 *     1: handleV1,
 *     2: handleV2,
 *   })
 * }
 * ```
 */
export async function versionedHandler(
  request: NextRequest,
  handlers: Partial<Record<ApiVersion, (request: NextRequest) => Promise<NextResponse>>>
): Promise<NextResponse> {
  const version = getApiVersion(request)

  const handler = handlers[version]
  if (!handler) {
    return unsupportedVersionResponse(version)
  }

  return handler(request)
}

/**
 * Breaking change detector
 *
 * Helps identify breaking changes between versions
 */
export interface BreakingChange {
  version: ApiVersion
  date: string
  description: string
  migration: string
}

/**
 * Known breaking changes (manually maintained)
 */
export const BREAKING_CHANGES: BreakingChange[] = [
  // Example:
  // {
  //   version: 2,
  //   date: '2025-06-01',
  //   description: 'Herb response schema changed: renamed "title" to "name"',
  //   migration: 'Update client code to use herb.name instead of herb.title',
  // },
]

/**
 * Get breaking changes for a version
 */
export function getBreakingChanges(fromVersion: ApiVersion, toVersion: ApiVersion): BreakingChange[] {
  return BREAKING_CHANGES.filter((change) => change.version > fromVersion && change.version <= toVersion)
}
