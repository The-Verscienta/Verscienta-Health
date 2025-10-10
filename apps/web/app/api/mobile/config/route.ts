import type { AppConfig } from '@verscienta/api-types'
import { NextResponse } from 'next/server'

/**
 * Mobile App Configuration API
 *
 * Returns configuration for mobile apps including:
 * - Feature flags
 * - API URLs
 * - Version requirements
 * - Remote config
 *
 * This allows updating app behavior without releasing a new version
 */

export async function GET() {
  const config: AppConfig = {
    apiBaseUrl: process.env.NEXT_PUBLIC_WEB_URL || 'https://verscienta.com',
    cmsBaseUrl: process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.verscienta.com',
    version: '1.0.0',
    minSupportedVersion: '1.0.0', // Minimum app version required
    features: {
      symptomChecker: true,
      practitionerSearch: true,
      offlineMode: process.env.MOBILE_OFFLINE_MODE === 'true',
      pushNotifications: process.env.MOBILE_PUSH_NOTIFICATIONS === 'true',
    },
  }

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
