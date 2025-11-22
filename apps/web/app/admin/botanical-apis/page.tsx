/**
 * Botanical APIs Admin Dashboard
 *
 * Administrative dashboard for monitoring and managing Trefle and Perenual API integrations.
 * Provides real-time statistics, import progress tracking, and manual sync controls.
 *
 * Features:
 * - Import progress monitoring
 * - Detailed statistics dashboard
 * - Manual sync triggers
 * - Health score tracking
 * - Circuit breaker monitoring
 * - Export capabilities
 *
 * Access: Admin only (requires authentication)
 * Route: /admin/botanical-apis
 */

import { Metadata } from 'next'
import { BotanicalImportProgress, BotanicalStatsDashboard } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Botanical APIs Dashboard | Admin | Verscienta Health',
  description: 'Monitor and manage Trefle and Perenual API integrations',
  robots: {
    index: false,
    follow: false,
  },
}

export default function BotanicalAPIsAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Botanical APIs Dashboard</h1>
        <p className="text-gray-600">
          Monitor and manage Trefle and Perenual API integrations, track import progress, and view
          detailed statistics.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Section 1: Import Progress */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Import Progress</h2>
          <BotanicalImportProgress />
        </section>

        {/* Section 2: Statistics Dashboard */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Statistics & Analytics</h2>
          <BotanicalStatsDashboard />
        </section>

        {/* Documentation Section */}
        <section className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trefle Documentation */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-3">Trefle API</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Sync Endpoint:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                    POST /api/admin/trefle-sync
                  </code>
                </div>
                <div>
                  <strong>Health Check:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                    GET /api/health/trefle
                  </code>
                </div>
                <div>
                  <strong>Rate Limits:</strong>
                  <span className="ml-2 text-gray-600">120 req/min, 5,000 req/day</span>
                </div>
                <div>
                  <strong>Schedule:</strong>
                  <span className="ml-2 text-gray-600">
                    Weekly on Wednesday at 3:00 AM (herb enrichment)
                  </span>
                </div>
                <div className="pt-2">
                  <a
                    href="/docs/TREFLE_RETRY_LOGIC.md"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Full Documentation →
                  </a>
                </div>
              </div>
            </div>

            {/* Perenual Documentation */}
            <div className="p-6 border rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-3">Perenual API</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Import Endpoint:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                    POST /api/admin/perenual-sync
                  </code>
                </div>
                <div>
                  <strong>Health Check:</strong>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded">
                    GET /api/health/perenual
                  </code>
                </div>
                <div>
                  <strong>Rate Limits:</strong>
                  <span className="ml-2 text-gray-600">60 req/min, unlimited req/day</span>
                </div>
                <div>
                  <strong>Schedule:</strong>
                  <span className="ml-2 text-gray-600">
                    Every minute when enabled (progressive import)
                  </span>
                </div>
                <div className="pt-2">
                  <a
                    href="/docs/PERENUAL_IMPLEMENTATION_COMPLETE.md"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Full Documentation →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Shared Endpoints */}
          <div className="mt-6 p-6 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Shared Endpoints</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Combined Statistics:</strong>
                <code className="ml-2 px-2 py-1 bg-white rounded">
                  GET /api/admin/botanical-stats
                </code>
                <p className="ml-2 text-gray-600 mt-1">
                  Returns comprehensive statistics for both APIs including health scores, circuit
                  breaker states, and recommendations.
                </p>
              </div>
              <div className="mt-4">
                <strong>Reset Statistics:</strong>
                <code className="ml-2 px-2 py-1 bg-white rounded">
                  POST /api/admin/botanical-stats
                </code>
                <p className="ml-2 text-gray-600 mt-1">
                  Body: <code>{`{ "api": "trefle" | "perenual" | "both" }`}</code>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting Section */}
        <section className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h4 className="font-semibold text-yellow-900 mb-2">Circuit Breaker is OPEN</h4>
              <p className="text-sm text-yellow-800">
                The circuit breaker has detected multiple failures and is blocking requests to
                prevent cascading failures. It will automatically attempt recovery after 60
                seconds. Monitor the health endpoint for status updates.
              </p>
            </div>

            <div className="p-4 border-l-4 border-red-500 bg-red-50">
              <h4 className="font-semibold text-red-900 mb-2">Rate Limit Errors</h4>
              <p className="text-sm text-red-800">
                You're exceeding the API rate limits. Trefle allows 120 requests/minute and 5,000
                requests/day. Perenual allows 60 requests/minute. The enhanced clients automatically
                handle rate limiting with delays, but you may need to reduce import frequency.
              </p>
            </div>

            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-semibold text-blue-900 mb-2">Health Score is Degraded</h4>
              <p className="text-sm text-blue-800">
                The health score is calculated based on success rates, retry rates, timeouts, and
                errors. A degraded score (50-79) indicates performance issues. Check the
                recommendations section for specific actions to take.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
