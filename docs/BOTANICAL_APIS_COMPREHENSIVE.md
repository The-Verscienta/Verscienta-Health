# Botanical APIs - Comprehensive Implementation Guide

Complete documentation for the Trefle and Perenual API integrations, including enhanced clients, monitoring systems, admin dashboards, and automated import workflows.

## Table of Contents

1. [Overview](#overview)
2. [API Clients](#api-clients)
3. [API Endpoints](#api-endpoints)
4. [Cron Jobs](#cron-jobs)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Admin Dashboard](#admin-dashboard)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This implementation provides a comprehensive, production-ready integration with two major botanical APIs:

- **Trefle API**: 1M+ plant species with scientific validation, botanical data, and taxonomic information
- **Perenual API**: 10K+ plant species with detailed care instructions and cultivation data

### Key Features

- ✅ Enhanced API clients with timeout, circuit breaker, retry logic, and statistics tracking
- ✅ Automated cron jobs for progressive imports and weekly synchronization
- ✅ Manual trigger endpoints for on-demand imports
- ✅ Comprehensive monitoring dashboard with health scores
- ✅ Circuit breaker alert system with email/webhook notifications
- ✅ React components for admin visualization
- ✅ Health check endpoints for external monitoring
- ✅ Rate limiting and error handling
- ✅ Export capabilities (JSON/CSV)

---

## API Clients

### Enhanced Client Architecture

Both Trefle and Perenual use the same enhanced client pattern with production-grade resilience features:

```typescript
import { trefleClientEnhanced } from '@/lib/trefle'
import { perenualClientEnhanced } from '@/lib/perenual'
```

### Features

#### 1. Timeout Handling
- Default timeout: 10 seconds
- Prevents requests from hanging indefinitely
- Throws `TrefleTimeoutError` / `PerenualTimeoutError`

#### 2. Circuit Breaker Pattern
- **States**: CLOSED → OPEN → HALF_OPEN → CLOSED
- **Failure Threshold**: 5 consecutive failures
- **Recovery Timeout**: 60 seconds
- **Test Requests**: 1 test request in HALF_OPEN state

#### 3. Exponential Backoff Retry
- **Max Retries**: 3 attempts
- **Delays**: 1s, 2s, 4s (with jitter)
- **Retry Conditions**: Network errors, timeouts, 5xx errors

#### 4. Statistics Tracking
Tracks 10 metrics per API:
- `totalRequests` - Total API calls made
- `successfulRequests` - Successful responses
- `failedRequests` - Failed requests
- `retriedRequests` - Requests that required retries
- `totalRetries` - Total retry attempts
- `timeoutErrors` - Timeout occurrences
- `networkErrors` - Network failures
- `rateLimitErrors` - Rate limit hits
- `circuitBreakerTrips` - Circuit breaker activations
- `avgResponseTimeMs` - Average response time

#### 5. Rate Limiting
- **Trefle**: 500ms delay = 120 req/min
- **Perenual**: 1s delay = 60 req/min
- Automatic throttling between requests

### Usage Example

```typescript
// Get statistics
const stats = trefleClientEnhanced.getStats()
console.log('Success rate:', (stats.successfulRequests / stats.totalRequests) * 100)

// Get circuit breaker state
const state = trefleClientEnhanced.getCircuitState()
// Returns: 'CLOSED' | 'OPEN' | 'HALF_OPEN'

// Check if configured
if (trefleClientEnhanced.isConfigured()) {
  // Make API calls
}

// Reset statistics
trefleClientEnhanced.reset()
```

---

## API Endpoints

### Admin Endpoints (Authentication Required)

#### 1. Botanical Statistics
**GET /api/admin/botanical-stats**

Returns comprehensive statistics for both APIs.

**Response:**
```json
{
  "status": "success",
  "timestamp": "2025-01-22T10:30:00.000Z",
  "data": {
    "overall": {
      "health": {
        "score": 95,
        "status": "healthy",
        "issues": []
      },
      "stats": {
        "totalRequests": 1000,
        "successfulRequests": 950,
        "failedRequests": 50
      },
      "configured": {
        "trefle": true,
        "perenual": true
      },
      "circuitBreakerStates": {
        "trefle": "CLOSED",
        "perenual": "CLOSED"
      }
    },
    "trefle": {
      "health": { ... },
      "stats": { ... },
      "sync": {
        "totalHerbs": 500,
        "herbsSynced": 450,
        "herbsNeedingSync": 50,
        "lastSyncAt": "2025-01-22T03:00:00.000Z",
        "syncCoverage": "90.0%"
      },
      "rateLimits": {
        "perMinute": 120,
        "perDay": 5000,
        "currentUsage": 1000
      }
    },
    "perenual": {
      "health": { ... },
      "stats": { ... },
      "import": {
        "currentPage": 50,
        "herbsCreated": 200,
        "herbsUpdated": 150,
        "estimatedRemaining": 9500,
        "isComplete": false,
        "lastRunAt": "2025-01-22T10:25:00.000Z"
      },
      "rateLimits": {
        "perMinute": 60,
        "perDay": Infinity,
        "currentUsage": 500
      }
    },
    "recommendations": [
      "✅ All botanical APIs are healthy - no action needed."
    ]
  }
}
```

**POST /api/admin/botanical-stats**

Reset statistics for specified API.

**Request Body:**
```json
{
  "api": "trefle" | "perenual" | "both"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Statistics reset successfully for both",
  "data": {
    "reset": "both",
    "timestamp": "2025-01-22T10:30:00.000Z"
  }
}
```

---

#### 2. Trefle Sync (Herb Enrichment)
**GET /api/admin/trefle-sync**

Get current Trefle sync status and progress.

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalHerbs": 500,
    "herbsSynced": 450,
    "herbsNeedingSync": 50,
    "lastSyncAt": "2025-01-22T03:00:00.000Z",
    "circuitState": "CLOSED",
    "apiStats": { ... },
    "syncSchedule": "Every Wednesday at 3:00 AM",
    "configured": true
  }
}
```

**POST /api/admin/trefle-sync**

Manually trigger Trefle sync (enriches up to 100 herbs).

**Response:**
```json
{
  "status": "success",
  "message": "Trefle sync completed successfully",
  "data": {
    "before": {
      "herbsSynced": 450,
      "herbsNeedingSync": 50
    },
    "after": {
      "herbsSynced": 480,
      "herbsNeedingSync": 20
    },
    "enriched": 30,
    "circuitState": "CLOSED",
    "apiStats": { ... }
  }
}
```

---

#### 3. Perenual Import (Progressive Database Import)
**GET /api/admin/perenual-sync**

Get current Perenual import status and progress.

**Response:**
```json
{
  "status": "success",
  "data": {
    "currentPage": 50,
    "herbsCreated": 200,
    "herbsUpdated": 150,
    "estimatedPlantsRemaining": 9500,
    "isComplete": false,
    "lastRunAt": "2025-01-22T10:25:00.000Z",
    "circuitState": "CLOSED",
    "apiStats": { ... },
    "importSchedule": "Every minute (when enabled)",
    "enabled": true,
    "configured": true
  }
}
```

**POST /api/admin/perenual-sync**

Manually trigger Perenual import (imports up to 40 plants).

**Response:**
```json
{
  "status": "success",
  "message": "Perenual import completed successfully",
  "data": {
    "before": {
      "currentPage": 50,
      "herbsCreated": 200,
      "herbsUpdated": 150
    },
    "after": {
      "currentPage": 52,
      "herbsCreated": 210,
      "herbsUpdated": 155
    },
    "imported": {
      "created": 10,
      "updated": 5
    },
    "circuitState": "CLOSED",
    "apiStats": { ... },
    "estimatedPlantsRemaining": 9450
  }
}
```

---

### Public Health Check Endpoints (No Authentication)

#### 4. Trefle Health Check
**GET /api/health/trefle**

Public endpoint for monitoring Trefle API health.

**HTTP Status Codes:**
- `200` - Healthy or degraded but operational
- `503` - Unhealthy or circuit breaker open

**Response:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy" | "unconfigured",
  "score": 95,
  "circuitState": "CLOSED",
  "stats": {
    "totalRequests": 1000,
    "successfulRequests": 950,
    "failedRequests": 50,
    "successRate": "95.0%",
    "avgResponseTimeMs": 250,
    "retriedRequests": 20,
    "timeoutErrors": 5,
    "networkErrors": 3,
    "rateLimitErrors": 0,
    "circuitBreakerTrips": 0
  },
  "issues": [],
  "timestamp": "2025-01-22T10:30:00.000Z"
}
```

**Use Cases:**
- External monitoring services (Pingdom, UptimeRobot)
- Status pages
- Load balancer health checks
- Automated alerting systems

---

#### 5. Perenual Health Check
**GET /api/health/perenual**

Public endpoint for monitoring Perenual API health (same format as Trefle).

---

## Cron Jobs

### 1. Trefle Sync (Weekly Herb Enrichment)
**File:** `lib/cron/sync-trefle-data.ts`

**Schedule:** Every Wednesday at 3:00 AM
**Processing:** 100 herbs per run
**Priority:** Never synced OR last synced > 30 days ago

**What It Does:**
- Validates scientific names against Trefle database
- Adds distribution data (native/introduced regions)
- Enriches with toxicity and edibility information
- Adds plant images, taxonomy, growth data
- Creates validation reports for mismatches

**Manual Execution:**
```typescript
import { syncTrefleData } from '@/lib/cron/sync-trefle-data'
await syncTrefleData()
```

**Logging:**
- Creates `importLogs` records with sync statistics
- Creates `validationReports` for scientific name mismatches

---

### 2. Trefle Import (Progressive Plant Database Import)
**File:** `lib/cron/import-trefle-data.ts`

**Schedule:** Every minute (when `ENABLE_TREFLE_IMPORT=true`)
**Processing:** 100 plants per run (5 pages × 20 plants)
**Total Dataset:** 1M+ plant species

**What It Does:**
- Progressively imports plants from Trefle API
- Creates draft herbs for manual review
- Deduplicates based on Trefle ID
- Tracks import state via PayloadCMS
- Caches API responses (24-hour TTL)

**Environment Variables:**
```bash
ENABLE_TREFLE_IMPORT=false  # Enable progressive import
TREFLE_FILTER_MEDICINAL=false  # Only import medicinal plants
```

**Manual Execution:**
```typescript
import { importTrefleData } from '@/lib/cron/import-trefle-data'
await importTrefleData()
```

---

### 3. Perenual Import (Progressive Plant Database Import)
**File:** `lib/cron/import-perenual-data.ts`

**Schedule:** Every minute (when `ENABLE_PERENUAL_IMPORT=true`)
**Processing:** 40 plants per run (2 pages × 20 plants)
**Total Dataset:** 10K+ plant species

**What It Does:**
- Progressively imports plants from Perenual API
- Creates draft herbs with care instructions
- Deduplicates based on Perenual ID
- Tracks import state via PayloadCMS
- Caches API responses (24-hour TTL)

**Environment Variables:**
```bash
ENABLE_PERENUAL_IMPORT=false  # Enable progressive import
PERENUAL_FILTER_MEDICINAL=false  # Only import medicinal plants
```

---

### 4. Circuit Breaker Monitoring
**File:** `lib/monitoring/circuit-breaker-alerts.ts`

**Schedule:** Every 30 seconds
**Function:** `scheduleCircuitBreakerMonitoring()`

**What It Does:**
- Monitors circuit breaker state changes
- Calculates health scores (0-100)
- Sends email alerts for critical events
- Sends webhook notifications (Slack/Discord)
- Logs alerts to database
- Prevents alert spam with 5-minute cooldown

**Alert Severity Levels:**
- **CRITICAL**: Circuit breaker opened, service blocked
- **WARNING**: Degraded health, half-open state
- **INFO**: Recovery, closure events

**Alert Channels:**
- Console logging (always)
- Email (critical/warning only, requires `ADMIN_EMAIL`)
- Webhook (all severities, requires `ALERT_WEBHOOK_URL`)
- Database (always, via `systemLogs` collection)

**Manual Execution:**
```typescript
import { circuitBreakerAlerts } from '@/lib/monitoring'

// Check and send alerts
await circuitBreakerAlerts.checkAndAlert('trefle')
await circuitBreakerAlerts.checkAndAlert('perenual')

// Get alert history
const history = circuitBreakerAlerts.getAlertHistory('trefle', 50)

// Get monitoring state
const state = circuitBreakerAlerts.getMonitoringState('trefle')

// Reset alert history
circuitBreakerAlerts.resetAlertHistory('trefle')

// Configure cooldown
circuitBreakerAlerts.setAlertCooldown(10 * 60 * 1000) // 10 minutes
```

---

## Monitoring & Alerts

### Health Score Calculation

Health scores are calculated from 100 and reduced based on issues:

```typescript
function calculateHealthScore(stats):
  score = 100

  // Success rate
  if successRate < 90%: score -= 20
  if successRate < 70%: score -= 20

  // Retry rate
  if retryRate > 30%: score -= 15

  // Timeout rate
  if timeoutRate > 10%: score -= 15

  // Network errors
  if networkRate > 5%: score -= 15

  // Rate limiting
  if rateLimitErrors > 0: score -= 10

  // Circuit breaker trips
  if circuitBreakerTrips > 0: score -= 20

  return max(0, score)
```

**Health Status:**
- **Healthy**: Score >= 80
- **Degraded**: Score 50-79
- **Unhealthy**: Score < 50

---

### Email Alerts

**Configuration:**
```bash
ADMIN_EMAIL=admin@example.com  # Required for email alerts
```

**Email Content:**
- Alert severity and message
- API name and event type
- Circuit breaker state
- Health score
- Detailed statistics table
- Action recommendations

**Example Alert:**
```
Subject: 🚨 TREFLE API OPENED

Message: CRITICAL: TREFLE API circuit breaker has OPENED.
All requests are being blocked.

Details:
- Severity: CRITICAL
- Circuit State: OPEN
- Health Score: 45/100
- Success Rate: 62.5%

Action Required:
The circuit breaker has opened to prevent cascading failures.
Wait 60 seconds for automatic recovery attempt. If issues persist,
check API status and rate limits.
```

---

### Webhook Alerts (Slack/Discord)

**Configuration:**
```bash
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Payload Format (Slack-compatible):**
```json
{
  "username": "Circuit Breaker Monitor",
  "icon_emoji": ":warning:",
  "attachments": [{
    "color": "#dc2626",
    "title": "TREFLE API OPENED",
    "text": "🚨 CRITICAL: TREFLE API circuit breaker has OPENED...",
    "fields": [
      { "title": "Severity", "value": "CRITICAL", "short": true },
      { "title": "Circuit State", "value": "OPEN", "short": true },
      { "title": "Health Score", "value": "45/100", "short": true },
      { "title": "Success Rate", "value": "62.5%", "short": true }
    ],
    "footer": "Verscienta Health Monitoring",
    "ts": 1706004000
  }]
}
```

---

## Admin Dashboard

### Route
**URL:** `/admin/botanical-apis`
**Access:** Admin only (requires authentication)

### Components

#### 1. BotanicalImportProgress
**File:** `components/admin/BotanicalImportProgress.tsx`

**Features:**
- Real-time import progress bars
- Health score visualization
- Circuit breaker state indicators
- Statistics overview
- Manual sync triggers
- Auto-refresh every 30 seconds

**Usage:**
```tsx
import { BotanicalImportProgress } from '@/components/admin'

<BotanicalImportProgress />
```

---

#### 2. BotanicalStatsDashboard
**File:** `components/admin/BotanicalStatsDashboard.tsx`

**Features:**
- Tabbed interface (Both APIs / Trefle / Perenual)
- Error breakdown charts
- Success/failure rate visualization
- Configurable auto-refresh (10s, 30s, 1m, 5m)
- Export to JSON/CSV
- Reset statistics
- Detailed metrics display

**Usage:**
```tsx
import { BotanicalStatsDashboard } from '@/components/admin'

<BotanicalStatsDashboard />
```

---

## Configuration

### Environment Variables

```bash
# Trefle API Configuration
TREFLE_API_KEY=your-trefle-api-key-here
TREFLE_API_URL=https://trefle.io/api/v1  # Optional, defaults to this
ENABLE_TREFLE_IMPORT=false  # Enable progressive 1M+ plant import

# Perenual API Configuration
PERENUAL_API_KEY=your-perenual-api-key-here
PERENUAL_API_URL=https://perenual.com/api  # Optional, defaults to this
ENABLE_PERENUAL_IMPORT=false  # Enable progressive 10K+ plant import

# Import Filters
TREFLE_FILTER_MEDICINAL=false  # Only import medicinal plants
PERENUAL_FILTER_MEDICINAL=false  # Only import medicinal plants

# Monitoring Configuration
ADMIN_EMAIL=admin@example.com  # Required for email alerts
ALERT_WEBHOOK_URL=https://hooks.slack.com/...  # Optional Slack/Discord webhook

# Cron Jobs Configuration
ENABLE_CRON_JOBS=true  # Enable/disable all cron jobs
CRON_JOBS=trefle-sync,perenual-import,circuit-breaker-monitoring  # Specific jobs to enable
```

### API Rate Limits

**Trefle (Free Tier):**
- 120 requests/minute
- 5,000 requests/day
- Client automatically throttles: 500ms delay between requests

**Perenual (Free Tier):**
- 60 requests/minute
- Unlimited requests/day
- Client automatically throttles: 1000ms delay between requests

---

## Troubleshooting

### Circuit Breaker is OPEN

**Symptoms:**
- All requests to API are blocked
- HTTP 503 errors returned
- Circuit state shows "OPEN"

**Causes:**
- 5+ consecutive failures
- Network issues
- API downtime
- Rate limiting

**Solutions:**
1. Wait 60 seconds for automatic recovery attempt
2. Check API status page (Trefle/Perenual)
3. Verify API keys are valid
4. Check network connectivity
5. Review error logs for specific failure reasons
6. Manually reset statistics if false positive

---

### Rate Limit Errors

**Symptoms:**
- `rateLimitErrors` increasing
- HTTP 429 responses
- Alerts mentioning rate limiting

**Solutions:**
1. Reduce import frequency:
   ```bash
   ENABLE_TREFLE_IMPORT=false
   ENABLE_PERENUAL_IMPORT=false
   ```
2. Increase rate limit delays in client configuration
3. Upgrade to paid API tier (if available)
4. Spread requests across longer time periods
5. Review and optimize cron job schedules

---

### Health Score Degraded

**Symptoms:**
- Health score 50-79
- Yellow warning badges
- Performance issues

**Check:**
1. Success rate (should be >= 90%)
2. Timeout errors (should be < 10%)
3. Network errors (should be < 5%)
4. Retry rate (should be < 30%)

**Solutions:**
1. Review recommendations in dashboard
2. Check network stability
3. Verify API endpoint availability
4. Increase timeout values if needed
5. Monitor for intermittent issues

---

### Import Not Progressing

**Symptoms:**
- `currentPage` not incrementing
- `herbsCreated` / `herbsUpdated` not changing
- Import appears stalled

**Check:**
1. Verify cron job is enabled:
   ```bash
   ENABLE_PERENUAL_IMPORT=true
   ENABLE_TREFLE_IMPORT=true
   ```
2. Check circuit breaker state (must be CLOSED)
3. Review import logs for errors
4. Verify API keys are configured
5. Check rate limit status

**Solutions:**
1. Manually trigger import via admin dashboard
2. Reset circuit breaker by waiting 60 seconds
3. Check API quotas haven't been exceeded
4. Review error logs for specific issues
5. Verify database connectivity

---

### No Email Alerts Received

**Symptoms:**
- Circuit breaker events occur but no emails
- Critical alerts not received

**Check:**
1. `ADMIN_EMAIL` is configured in environment
2. Email service is properly configured
3. Check spam folder
4. Review alert cooldown period (5 minutes default)

**Solutions:**
1. Test email configuration:
   ```typescript
   import { sendEmail } from '@/lib/email'
   await sendEmail({
     to: 'admin@example.com',
     subject: 'Test',
     html: '<p>Test</p>'
   })
   ```
2. Configure webhook as backup notification channel
3. Check email service logs
4. Verify SMTP settings

---

## Additional Resources

- [Trefle API Documentation](https://docs.trefle.io/)
- [Perenual API Documentation](https://perenual.com/docs/api)
- [TREFLE_RETRY_LOGIC.md](./TREFLE_RETRY_LOGIC.md) - Detailed Trefle client documentation
- [PERENUAL_IMPLEMENTATION_COMPLETE.md](./PERENUAL_IMPLEMENTATION_COMPLETE.md) - Perenual implementation guide
- [ENVIRONMENT_VARIABLES_CHECKLIST.md](./ENVIRONMENT_VARIABLES_CHECKLIST.md) - Complete environment variable reference

---

## Quick Reference

### Start Circuit Breaker Monitoring
```typescript
import { scheduleCircuitBreakerMonitoring } from '@/lib/monitoring'
scheduleCircuitBreakerMonitoring()
```

### Manual Sync/Import
```bash
# Via API
curl -X POST http://localhost:3000/api/admin/trefle-sync \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:3000/api/admin/perenual-sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Health
```bash
# Public health check (no auth required)
curl http://localhost:3000/api/health/trefle
curl http://localhost:3000/api/health/perenual
```

### View Statistics
```bash
# Admin endpoint (auth required)
curl http://localhost:3000/api/admin/botanical-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reset Statistics
```bash
curl -X POST http://localhost:3000/api/admin/botanical-stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api":"both"}'
```

---

**Last Updated:** 2025-01-22
**Version:** 1.0.0
**Status:** ✅ Complete
