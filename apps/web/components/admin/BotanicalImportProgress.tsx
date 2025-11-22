'use client'

/**
 * Botanical Import Progress Tracking Component
 *
 * Real-time monitoring dashboard for Trefle and Perenual API imports.
 * Displays import progress, health scores, circuit breaker states, and statistics.
 *
 * Features:
 * - Live progress bars for both imports
 * - Health score visualization with color coding
 * - Circuit breaker state indicators
 * - Statistics overview (success rates, errors)
 * - Auto-refresh every 30 seconds
 * - Manual sync triggers
 * - Responsive design
 *
 * Usage:
 *   import { BotanicalImportProgress } from '@/components/admin/BotanicalImportProgress'
 *
 *   <BotanicalImportProgress />
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BotanicalStats {
  overall: {
    health: {
      score: number
      status: 'healthy' | 'degraded' | 'unhealthy'
      issues: string[]
    }
    stats: {
      totalRequests: number
      successfulRequests: number
      failedRequests: number
    }
    configured: {
      trefle: boolean
      perenual: boolean
    }
    circuitBreakerStates: {
      trefle: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
      perenual: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    }
  }
  trefle: {
    configured: boolean
    circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    health: {
      score: number
      status: 'healthy' | 'degraded' | 'unhealthy'
      issues: string[]
    }
    stats: any
    sync: {
      totalHerbs: number
      herbsSynced: number
      herbsNeedingSync: number
      lastSyncAt: string | null
      syncCoverage: string
    }
    rateLimits: {
      perMinute: number
      perDay: number
      currentUsage: number
    }
  }
  perenual: {
    configured: boolean
    circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    health: {
      score: number
      status: 'healthy' | 'degraded' | 'unhealthy'
      issues: string[]
    }
    stats: any
    import: {
      currentPage: number
      herbsCreated: number
      herbsUpdated: number
      estimatedRemaining: number
      isComplete: boolean
      lastRunAt: string | null
    }
    rateLimits: {
      perMinute: number
      perDay: number
      currentUsage: number
    }
  }
  recommendations: string[]
}

export function BotanicalImportProgress() {
  const [stats, setStats] = useState<BotanicalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<'trefle' | 'perenual' | null>(null)

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/botanical-stats')
      if (!response.ok) throw new Error('Failed to fetch statistics')

      const result = await response.json()
      setStats(result.data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Trigger manual sync
  const triggerSync = async (api: 'trefle' | 'perenual') => {
    setSyncing(api)
    try {
      const response = await fetch(`/api/admin/${api}-sync`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error(`Failed to trigger ${api} sync`)

      // Refresh stats after sync
      await fetchStats()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSyncing(null)
    }
  }

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading botanical import statistics...</div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="text-red-800">Error: {error}</div>
          <Button onClick={fetchStats} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Botanical APIs Health</h3>
          <HealthBadge status={stats.overall.health.status} score={stats.overall.health.score} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard
            label="Total Requests"
            value={stats.overall.stats.totalRequests.toLocaleString()}
          />
          <StatCard
            label="Successful"
            value={stats.overall.stats.successfulRequests.toLocaleString()}
            className="text-green-600"
          />
          <StatCard
            label="Failed"
            value={stats.overall.stats.failedRequests.toLocaleString()}
            className="text-red-600"
          />
        </div>

        {stats.overall.health.issues.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Issues Detected:</h4>
            <ul className="list-disc list-inside space-y-1">
              {stats.overall.health.issues.map((issue, index) => (
                <li key={index} className="text-sm text-yellow-800">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Trefle Sync Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Trefle Botanical Data Sync</h3>
            <p className="text-sm text-gray-500">
              Enriches existing herbs with scientific validation and botanical data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CircuitBreakerBadge state={stats.trefle.circuitState} />
            <HealthBadge status={stats.trefle.health.status} score={stats.trefle.health.score} />
          </div>
        </div>

        {stats.trefle.configured ? (
          <>
            <ProgressBar
              current={stats.trefle.sync.herbsSynced}
              total={stats.trefle.sync.totalHerbs}
              label={`${stats.trefle.sync.herbsSynced} / ${stats.trefle.sync.totalHerbs} herbs synced`}
              percentage={stats.trefle.sync.syncCoverage}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <StatCard label="Herbs Synced" value={stats.trefle.sync.herbsSynced.toLocaleString()} />
              <StatCard
                label="Needs Sync"
                value={stats.trefle.sync.herbsNeedingSync.toLocaleString()}
              />
              <StatCard
                label="Success Rate"
                value={
                  stats.trefle.stats.totalRequests > 0
                    ? `${((stats.trefle.stats.successfulRequests / stats.trefle.stats.totalRequests) * 100).toFixed(1)}%`
                    : '0%'
                }
              />
              <StatCard
                label="Last Sync"
                value={
                  stats.trefle.sync.lastSyncAt
                    ? new Date(stats.trefle.sync.lastSyncAt).toLocaleDateString()
                    : 'Never'
                }
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => triggerSync('trefle')}
                disabled={syncing === 'trefle' || stats.trefle.circuitState === 'OPEN'}
                size="sm"
              >
                {syncing === 'trefle' ? 'Syncing...' : 'Trigger Sync Now'}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            Trefle API is not configured. Add TREFLE_API_KEY to environment variables.
          </div>
        )}
      </Card>

      {/* Perenual Import Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Perenual Plant Database Import</h3>
            <p className="text-sm text-gray-500">Progressive import of 10,000+ plant species</p>
          </div>
          <div className="flex items-center gap-2">
            <CircuitBreakerBadge state={stats.perenual.circuitState} />
            <HealthBadge
              status={stats.perenual.health.status}
              score={stats.perenual.health.score}
            />
          </div>
        </div>

        {stats.perenual.configured ? (
          <>
            <div className="mb-4">
              {stats.perenual.import.isComplete ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-green-800 font-medium">Import Complete!</div>
                  <div className="text-sm text-green-600 mt-1">
                    All available plants have been imported
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Import Progress (Page {stats.perenual.import.currentPage})</span>
                    <span className="text-gray-500">
                      ~{stats.perenual.import.estimatedRemaining.toLocaleString()} plants remaining
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (stats.perenual.import.currentPage / 1000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Herbs Created"
                value={stats.perenual.import.herbsCreated.toLocaleString()}
              />
              <StatCard
                label="Herbs Updated"
                value={stats.perenual.import.herbsUpdated.toLocaleString()}
              />
              <StatCard
                label="Success Rate"
                value={
                  stats.perenual.stats.totalRequests > 0
                    ? `${((stats.perenual.stats.successfulRequests / stats.perenual.stats.totalRequests) * 100).toFixed(1)}%`
                    : '0%'
                }
              />
              <StatCard
                label="Last Run"
                value={
                  stats.perenual.import.lastRunAt
                    ? new Date(stats.perenual.import.lastRunAt).toLocaleDateString()
                    : 'Never'
                }
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => triggerSync('perenual')}
                disabled={
                  syncing === 'perenual' ||
                  stats.perenual.circuitState === 'OPEN' ||
                  stats.perenual.import.isComplete
                }
                size="sm"
              >
                {syncing === 'perenual' ? 'Importing...' : 'Trigger Import Now'}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            Perenual API is not configured. Add PERENUAL_API_KEY to environment variables.
          </div>
        )}
      </Card>

      {/* Recommendations */}
      {stats.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {stats.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm p-3 bg-gray-50 rounded-lg"
              >
                <span className="mt-0.5">{getRecommendationIcon(recommendation)}</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

/**
 * Health status badge
 */
function HealthBadge({ status, score }: { status: string; score: number }) {
  const colors = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unhealthy: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <Badge className={colors[status as keyof typeof colors] || colors.healthy}>
      {status.toUpperCase()} ({score}/100)
    </Badge>
  )
}

/**
 * Circuit breaker state badge
 */
function CircuitBreakerBadge({ state }: { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }) {
  const colors = {
    CLOSED: 'bg-green-100 text-green-800 border-green-200',
    HALF_OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    OPEN: 'bg-red-100 text-red-800 border-red-200',
  }

  const labels = {
    CLOSED: 'Circuit: Closed',
    HALF_OPEN: 'Circuit: Half-Open',
    OPEN: 'Circuit: Open',
  }

  return <Badge className={colors[state]}>{labels[state]}</Badge>
}

/**
 * Progress bar component
 */
function ProgressBar({
  current,
  total,
  label,
  percentage,
}: {
  current: number
  total: number
  label: string
  percentage: string
}) {
  const percent = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{percentage}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Stat card component
 */
function StatCard({
  label,
  value,
  className = '',
}: {
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${className}`}>{value}</div>
    </div>
  )
}

/**
 * Get icon for recommendation
 */
function getRecommendationIcon(recommendation: string): string {
  if (recommendation.includes('✅')) return ''
  if (recommendation.includes('🚨')) return ''
  if (recommendation.includes('⚠️')) return ''
  if (recommendation.includes('💡')) return ''
  if (recommendation.includes('ℹ️')) return ''
  return '•'
}
