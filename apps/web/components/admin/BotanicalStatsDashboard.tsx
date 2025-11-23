'use client'

/**
 * Botanical Statistics Dashboard
 *
 * Comprehensive visualization dashboard for Trefle and Perenual API statistics.
 * Displays detailed metrics, error breakdowns, and performance analytics.
 *
 * Features:
 * - Error type breakdown charts
 * - Success/failure rate visualization
 * - Response time statistics
 * - Circuit breaker status tracking
 * - Historical data trends
 * - Export statistics to CSV/JSON
 * - Auto-refresh with configurable interval
 *
 * Usage:
 *   import { BotanicalStatsDashboard } from '@/components/admin/BotanicalStatsDashboard'
 *
 *   <BotanicalStatsDashboard />
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BotanicalStats {
  overall: any
  trefle: {
    configured: boolean
    circuitState: string
    health: {
      score: number
      status: string
      issues: string[]
    }
    stats: {
      totalRequests: number
      successfulRequests: number
      failedRequests: number
      retriedRequests: number
      totalRetries: number
      timeoutErrors: number
      networkErrors: number
      rateLimitErrors: number
      circuitBreakerTrips: number
      avgResponseTimeMs: number
    }
  }
  perenual: {
    configured: boolean
    circuitState: string
    health: {
      score: number
      status: string
      issues: string[]
    }
    stats: {
      totalRequests: number
      successfulRequests: number
      failedRequests: number
      retriedRequests: number
      totalRetries: number
      timeoutErrors: number
      networkErrors: number
      rateLimitErrors: number
      circuitBreakerTrips: number
      avgResponseTimeMs: number
    }
  }
}

export function BotanicalStatsDashboard() {
  const [stats, setStats] = useState<BotanicalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'trefle' | 'perenual' | 'both'>('both')
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [resetting, setResetting] = useState<'trefle' | 'perenual' | 'both' | null>(null)

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

  // Reset statistics
  const resetStats = async (api: 'trefle' | 'perenual' | 'both') => {
    if (!confirm(`Are you sure you want to reset statistics for ${api}? This cannot be undone.`)) {
      return
    }

    setResetting(api)
    try {
      const response = await fetch('/api/admin/botanical-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api }),
      })

      if (!response.ok) throw new Error(`Failed to reset ${api} statistics`)

      // Refresh stats after reset
      await fetchStats()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResetting(null)
    }
  }

  // Export statistics
  const exportStats = (format: 'json' | 'csv') => {
    if (!stats) return

    const data = activeTab === 'both' ? stats : { [activeTab]: stats[activeTab] }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      downloadBlob(blob, `botanical-stats-${activeTab}-${new Date().toISOString()}.json`)
    } else {
      const csv = convertToCSV(data)
      const blob = new Blob([csv], { type: 'text/csv' })
      downloadBlob(blob, `botanical-stats-${activeTab}-${new Date().toISOString()}.csv`)
    }
  }

  // Helper: Download blob
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Helper: Convert to CSV
  const convertToCSV = (data: any): string => {
    const rows: string[] = []

    if (activeTab === 'both') {
      rows.push('API,Metric,Value')
      for (const api of ['trefle', 'perenual']) {
        const apiStats = data[api].stats
        for (const [key, value] of Object.entries(apiStats)) {
          rows.push(`${api},${key},${value}`)
        }
      }
    } else {
      rows.push('Metric,Value')
      const apiStats = data[activeTab].stats
      for (const [key, value] of Object.entries(apiStats)) {
        rows.push(`${key},${value}`)
      }
    }

    return rows.join('\n')
  }

  // Auto-refresh
  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [refreshInterval])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading statistics...</div>
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
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Botanical APIs Statistics Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">
              Real-time monitoring and analytics for Trefle and Perenual APIs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value={10}>Refresh: 10s</option>
              <option value={30}>Refresh: 30s</option>
              <option value={60}>Refresh: 1m</option>
              <option value={300}>Refresh: 5m</option>
            </select>
            <Button onClick={fetchStats} variant="outline" size="sm">
              Refresh Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('both')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'both'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Both APIs
        </button>
        <button
          onClick={() => setActiveTab('trefle')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'trefle'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Trefle
        </button>
        <button
          onClick={() => setActiveTab('perenual')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'perenual'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Perenual
        </button>
      </div>

      {/* Statistics Content */}
      {activeTab === 'both' ? (
        <ComparisonView stats={stats} />
      ) : (
        <DetailedView apiName={activeTab} apiStats={stats[activeTab]} />
      )}

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Actions</h3>
            <p className="text-sm text-gray-500">Export data or reset statistics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => exportStats('json')} variant="outline" size="sm">
              Export JSON
            </Button>
            <Button onClick={() => exportStats('csv')} variant="outline" size="sm">
              Export CSV
            </Button>
            <Button
              onClick={() =>
                resetStats(activeTab as 'trefle' | 'perenual' | 'both')
              }
              variant="outline"
              size="sm"
              disabled={!!resetting}
            >
              {resetting ? 'Resetting...' : 'Reset Stats'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * Comparison view (both APIs)
 */
function ComparisonView({ stats }: { stats: BotanicalStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trefle Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Trefle API</h3>
        <StatsBreakdown stats={stats.trefle.stats} health={stats.trefle.health} />
      </Card>

      {/* Perenual Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Perenual API</h3>
        <StatsBreakdown stats={stats.perenual.stats} health={stats.perenual.health} />
      </Card>
    </div>
  )
}

/**
 * Detailed view (single API)
 */
function DetailedView({ apiName, apiStats }: { apiName: string; apiStats: any }) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 capitalize">{apiName} API Statistics</h3>
        <StatsBreakdown stats={apiStats.stats} health={apiStats.health} detailed />
      </Card>

      {/* Error Breakdown */}
      <ErrorBreakdown stats={apiStats.stats} />
    </div>
  )
}

/**
 * Statistics breakdown
 */
function StatsBreakdown({
  stats,
  health,
  detailed = false,
}: {
  stats: any
  health: any
  detailed?: boolean
}) {
  const successRate =
    stats.totalRequests > 0
      ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
      : '0.0'

  const retryRate =
    stats.totalRequests > 0
      ? ((stats.retriedRequests / stats.totalRequests) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">Health Score</span>
          <span className="text-2xl font-bold text-blue-700">{health.score}/100</span>
        </div>
        <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{ width: `${health.score}%` }}
          />
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Total Requests" value={stats.totalRequests.toLocaleString()} />
        <MetricCard
          label="Success Rate"
          value={`${successRate}%`}
          valueClass={Number(successRate) >= 90 ? 'text-green-600' : 'text-yellow-600'}
        />
        <MetricCard
          label="Successful"
          value={stats.successfulRequests.toLocaleString()}
          valueClass="text-green-600"
        />
        <MetricCard
          label="Failed"
          value={stats.failedRequests.toLocaleString()}
          valueClass="text-red-600"
        />
      </div>

      {/* Detailed Metrics */}
      {detailed && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <MetricCard label="Retry Rate" value={`${retryRate}%`} />
          <MetricCard label="Total Retries" value={stats.totalRetries.toLocaleString()} />
          <MetricCard label="Timeout Errors" value={stats.timeoutErrors.toLocaleString()} />
          <MetricCard label="Network Errors" value={stats.networkErrors.toLocaleString()} />
          <MetricCard label="Rate Limit Errors" value={stats.rateLimitErrors.toLocaleString()} />
          <MetricCard
            label="Circuit Breaker Trips"
            value={stats.circuitBreakerTrips.toLocaleString()}
          />
          <MetricCard
            label="Avg Response Time"
            value={`${stats.avgResponseTimeMs}ms`}
            valueClass={stats.avgResponseTimeMs > 3000 ? 'text-red-600' : 'text-green-600'}
          />
        </div>
      )}

      {/* Issues */}
      {health.issues.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2 text-sm">Issues:</h4>
          <ul className="list-disc list-inside space-y-1">
            {health.issues.map((issue: string, index: number) => (
              <li key={index} className="text-xs text-yellow-800">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Error breakdown visualization
 */
function ErrorBreakdown({ stats }: { stats: any }) {
  const totalErrors =
    stats.timeoutErrors + stats.networkErrors + stats.rateLimitErrors + stats.circuitBreakerTrips

  if (totalErrors === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Error Breakdown</h3>
        <div className="p-8 text-center text-gray-500">No errors detected</div>
      </Card>
    )
  }

  const errors = [
    { label: 'Timeout Errors', value: stats.timeoutErrors, color: 'bg-red-500' },
    { label: 'Network Errors', value: stats.networkErrors, color: 'bg-orange-500' },
    { label: 'Rate Limit Errors', value: stats.rateLimitErrors, color: 'bg-yellow-500' },
    { label: 'Circuit Breaker Trips', value: stats.circuitBreakerTrips, color: 'bg-purple-500' },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Error Breakdown</h3>
      <div className="space-y-4">
        {errors.map((error) => {
          const percentage = ((error.value / totalErrors) * 100).toFixed(1)
          return (
            <div key={error.label}>
              <div className="flex justify-between text-sm mb-2">
                <span>{error.label}</span>
                <span className="font-medium">
                  {error.value} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${error.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

/**
 * Metric card component
 */
function MetricCard({
  label,
  value,
  valueClass = '',
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${valueClass}`}>{value}</div>
    </div>
  )
}
