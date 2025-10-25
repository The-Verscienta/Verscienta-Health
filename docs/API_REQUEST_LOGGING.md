# API Request Logging System

**HIPAA Compliance & Security Monitoring**

Comprehensive logging system for all API requests, providing audit trails, security monitoring, performance analytics, and rate limit tracking.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup](#setup)
4. [Usage](#usage)
5. [Analytics & Monitoring](#analytics--monitoring)
6. [Data Retention](#data-retention)
7. [API Reference](#api-reference)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The API request logging system automatically captures detailed information about every API request, including:

- Request method, path, and query parameters
- Response status code and time
- User authentication status (userId, sessionId)
- Client information (IP address, user agent)
- Rate limiting status and violations
- Error messages and stack traces (sanitized)
- Performance metrics

This data is stored in PostgreSQL and can be queried for analytics, security monitoring, and compliance reporting.

---

## Features

### 1. **Automatic Logging**
- ✅ Zero-configuration logging for all API routes
- ✅ Non-blocking (async) - doesn't slow down requests
- ✅ Automatic error capture and sanitization

### 2. **Security Monitoring**
- ✅ Rate limit violation tracking
- ✅ Suspicious activity detection (high error rates, rapid requests)
- ✅ IP-based monitoring
- ✅ User activity timelines

### 3. **Performance Analytics**
- ✅ Response time tracking
- ✅ Endpoint usage statistics
- ✅ Error rate analysis
- ✅ Top endpoints and users

### 4. **Data Management**
- ✅ Automatic cleanup of old logs (90-day retention)
- ✅ Configurable retention period
- ✅ Efficient database indexing

### 5. **Admin Dashboard**
- ✅ Real-time statistics API
- ✅ Recent errors view
- ✅ User activity tracking
- ✅ Suspicious activity alerts

---

## Setup

### Step 1: Run Database Migration

**Note:** This step requires `prisma` CLI to be installed.

```bash
# Install Prisma CLI (if not already installed)
cd apps/web
pnpm add -D prisma

# Generate Prisma client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name add_api_request_logs

# Or apply migration in production
pnpm prisma migrate deploy
```

### Step 2: Configure Environment Variables

Add to `.env`:

```bash
# API Logs Retention (optional, default: 90 days)
API_LOGS_RETENTION_DAYS=90

# Monitoring webhook for alerts (optional)
MONITORING_WEBHOOK_URL=https://your-monitoring-service.com/webhook
```

### Step 3: Enable Automatic Cleanup

Add to your cron jobs initialization file (e.g., `lib/cron/index.ts`):

```typescript
import { scheduleApiLogsCleanup } from './cleanup-api-logs'

// Schedule cleanup to run daily at 2:00 AM
scheduleApiLogsCleanup()
```

Or add to your application startup:

```typescript
// app/layout.tsx or similar
import { scheduleApiLogsCleanup } from '@/lib/cron/cleanup-api-logs'

if (typeof window === 'undefined') {
  // Server-side only
  scheduleApiLogsCleanup()
}
```

---

## Usage

### Option 1: Wrap API Routes (Recommended)

Use the `withApiLogging` higher-order function to automatically log all requests:

```typescript
// app/api/example/route.ts
import { withApiLogging } from '@/lib/with-api-logging'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withApiLogging(async (request: NextRequest) => {
  // Your API logic here
  const data = await fetchData()

  return NextResponse.json(data)
})

export const POST = withApiLogging(async (request: NextRequest) => {
  const body = await request.json()

  // Your API logic here
  await saveData(body)

  return NextResponse.json({ success: true })
})
```

### Option 2: Manual Logging

For fine-grained control, use the logging utilities directly:

```typescript
import { logApiRequest, extractRequestInfo } from '@/lib/api-request-logger'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Your API logic
    const data = await fetchData()
    const response = NextResponse.json(data)

    // Log the request
    await logApiRequest({
      ...extractRequestInfo(request),
      statusCode: 200,
      responseTime: Date.now() - startTime,
    })

    return response
  } catch (error) {
    // Log the error
    await logApiRequest({
      ...extractRequestInfo(request),
      statusCode: 500,
      responseTime: Date.now() - startTime,
      errorMessage: error.message,
      errorStack: error.stack,
    })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Option 3: Log Rate Limit Violations

From middleware:

```typescript
import { logRateLimitFromMiddleware } from '@/lib/with-api-logging'

if (!rateLimit.allowed) {
  // Log the rate limit violation
  await logRateLimitFromMiddleware(request, rateLimit)

  return new NextResponse('Too many requests', { status: 429 })
}
```

---

## Analytics & Monitoring

### Get API Statistics

```bash
# Get overall statistics
curl "http://localhost:3000/api/admin/api-logs?action=statistics" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get statistics for specific date range
curl "http://localhost:3000/api/admin/api-logs?action=statistics&startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get statistics for specific user
curl "http://localhost:3000/api/admin/api-logs?action=statistics&userId=user_123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 45678,
    "averageResponseTime": 125,
    "errorRate": 2.5,
    "rateLimitViolations": 12,
    "topEndpoints": [
      { "path": "/api/herbs", "count": 5432 },
      { "path": "/api/formulas", "count": 3210 }
    ],
    "topUsers": [
      { "userId": "user_123", "count": 1234 }
    ]
  }
}
```

### View Recent Errors

```bash
curl "http://localhost:3000/api/admin/api-logs?action=errors&limit=50" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Check User Activity

```bash
curl "http://localhost:3000/api/admin/api-logs?action=user-activity&userId=user_123&limit=100" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Detect Suspicious Activity

```bash
# Check suspicious activity for a user
curl "http://localhost:3000/api/admin/api-logs?action=suspicious-activity&userId=user_123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Check suspicious activity for an IP address
curl "http://localhost:3000/api/admin/api-logs?action=suspicious-activity&ipAddress=1.2.3.4" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suspicious": true,
    "reasons": [
      "High error rate: 75.5%",
      "Multiple rate limit violations: 12"
    ],
    "details": {
      "errorRate": 75.5,
      "totalRequests": 234,
      "rateLimitViolations": 12
    }
  }
}
```

---

## Data Retention

### Automatic Cleanup

The system automatically deletes logs older than the configured retention period (default: 90 days).

**Schedule:** Daily at 2:00 AM
**Retention:** 90 days (configurable via `API_LOGS_RETENTION_DAYS`)

### Manual Cleanup

Trigger cleanup manually via API:

```bash
curl -X POST "http://localhost:3000/api/admin/api-logs/cleanup" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"retentionDays": 90}'
```

Or via CLI:

```bash
cd apps/web
pnpm tsx lib/cron/cleanup-api-logs.ts
```

### Custom Retention Periods

Adjust retention based on compliance requirements:

| Compliance | Recommended Retention |
|------------|----------------------|
| **HIPAA** | 6-7 years (PHI access logs) |
| **GDPR** | 90 days (or per consent) |
| **SOC 2** | 1 year (security logs) |
| **General** | 90 days |

**Note:** For PHI-related endpoints, consider longer retention or separate storage.

---

## API Reference

### Database Schema

```prisma
model ApiRequestLog {
  id                 String   @id @default(cuid())
  method             String   // GET, POST, PUT, DELETE, PATCH
  path               String   // /api/herbs/ginseng
  query              String?  // Serialized query params
  statusCode         Int      // HTTP status code
  responseTime       Int      // Response time in ms
  userId             String?  // Authenticated user ID
  sessionId          String?  // Session ID
  ipAddress          String?  // Client IP
  userAgent          String?  // User agent string
  referer            String?  // HTTP referer
  rateLimitHit       Boolean  @default(false)
  rateLimitKey       String?  // Rate limit key
  rateLimitRemaining Int?     // Remaining requests
  errorMessage       String?  // Error message
  errorStack         String?  // Sanitized stack trace
  createdAt          DateTime @default(now())

  @@index([userId])
  @@index([path])
  @@index([statusCode])
  @@index([createdAt])
  @@index([rateLimitHit])
  @@index([ipAddress])
}
```

### Utility Functions

#### `logApiRequest(data: ApiRequestLogData): Promise<void>`
Log an API request to the database.

#### `logRateLimitViolation(data: RateLimitData): Promise<void>`
Log a rate limit violation.

#### `cleanupOldLogs(retentionDays: number): Promise<number>`
Delete logs older than specified days. Returns count of deleted records.

#### `getApiStatistics(options): Promise<Statistics>`
Get aggregated API statistics.

#### `getRecentErrors(limit: number): Promise<ErrorLog[]>`
Get recent API errors.

#### `getUserActivity(userId: string, limit: number): Promise<Activity[]>`
Get user's API request history.

#### `detectSuspiciousActivity(params): Promise<SuspiciousActivityResult>`
Detect suspicious patterns in API usage.

---

## Security Considerations

### 1. **Sensitive Data Sanitization**

The logging system automatically sanitizes:
- ✅ Stack traces (removes file paths, secrets)
- ✅ Long alphanumeric strings (potential API keys)
- ✅ Environment variables

**Do NOT log:**
- ❌ Passwords or authentication tokens
- ❌ Credit card numbers or payment info
- ❌ Social security numbers or PII
- ❌ Raw PHI (Protected Health Information)

### 2. **Access Control**

- Admin API endpoints require `role: 'admin'`
- Logs contain user IDs, not full user records
- IP addresses are stored for security, not tracking

### 3. **Performance Impact**

- Logging is asynchronous (non-blocking)
- Failed logging doesn't fail the request
- Database writes are batched when possible

### 4. **Privacy Compliance**

**GDPR Right to be Forgotten:**
```typescript
// Delete user's API logs on account deletion
await prisma.apiRequestLog.deleteMany({
  where: { userId: 'user_to_delete' }
})
```

**HIPAA Audit Requirements:**
- Retain PHI access logs for 6-7 years
- Ensure logs are encrypted at rest
- Implement access controls on log data

---

## Troubleshooting

### Issue: "Prisma Client Error: Table doesn't exist"

**Cause:** Database migration not run

**Solution:**
```bash
cd apps/web
pnpm prisma migrate deploy
```

### Issue: "Logging is not working"

**Cause:** Check if `withApiLogging` wrapper is applied

**Solution:**
```typescript
// Ensure you're using the wrapper
export const GET = withApiLogging(async (request) => {
  // ...
})
```

### Issue: "Database is growing too large"

**Cause:** Cleanup job not running or retention too long

**Solution:**
1. Check cron job is scheduled
2. Manually run cleanup: `pnpm tsx lib/cron/cleanup-api-logs.ts`
3. Reduce retention: `API_LOGS_RETENTION_DAYS=30`

### Issue: "Admin API returns 403 Forbidden"

**Cause:** User doesn't have admin role

**Solution:**
```sql
-- Grant admin role in database
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## Metrics to Monitor

### Key Performance Indicators (KPIs)

1. **Request Volume:** Total API requests per day/hour
2. **Error Rate:** Percentage of 4xx/5xx responses
3. **Average Response Time:** Should be <200ms for most endpoints
4. **Rate Limit Violations:** Should be <1% of total requests
5. **Top Endpoints:** Identify most-used APIs for optimization

### Security Metrics

1. **Suspicious Activity Alerts:** Review daily
2. **Failed Authentication Attempts:** Monitor for brute force
3. **Unusual Traffic Patterns:** Spikes, geographic anomalies
4. **Rate Limit Violations by IP:** Potential DoS attempts

---

## Example Dashboard Queries

### Daily Request Volume
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as requests
FROM "ApiRequestLog"
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Error Rate by Endpoint
```sql
SELECT
  path,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors,
  ROUND(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as error_rate
FROM "ApiRequestLog"
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY path
HAVING COUNT(*) > 100
ORDER BY error_rate DESC
LIMIT 20;
```

### Slowest Endpoints
```sql
SELECT
  path,
  method,
  AVG(response_time) as avg_response_time,
  MAX(response_time) as max_response_time,
  COUNT(*) as request_count
FROM "ApiRequestLog"
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY path, method
HAVING COUNT(*) > 10
ORDER BY avg_response_time DESC
LIMIT 20;
```

---

## Additional Resources

- [HIPAA Audit Logging Requirements](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Last Updated:** 2025-10-24
**Maintainer:** DevOps Team
**Review Schedule:** Quarterly
