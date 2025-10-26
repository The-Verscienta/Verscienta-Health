# API Rate Limiting - Verscienta Health

**Status**: ✅ Production Ready
**Implementation Date**: 2025-10-26
**Security Priority**: High
**HIPAA Compliance**: Yes

## Overview

Verscienta Health implements comprehensive, distributed rate limiting across all API endpoints to prevent abuse, ensure fair resource allocation, and protect against various attack vectors including:

- **Brute force attacks** on authentication endpoints
- **API quota exhaustion** on expensive AI/ML operations
- **Web scraping** of public content
- **Spam and abuse** on user-generated content
- **Denial of Service (DoS)** attacks

## Architecture

### Technology Stack

- **Primary**: Redis/DragonflyDB for distributed rate limiting
- **Fallback**: In-memory storage (development only, not recommended for production)
- **Implementation**: Next.js middleware with sliding window algorithm
- **Distribution**: Shared state across all server instances via Redis

### Key Components

1. **Rate Limiter Utility** (`apps/web/lib/redis-rate-limiter.ts`)
   - Redis-based sliding window implementation
   - Automatic fallback to in-memory storage
   - Graceful error handling

2. **Middleware** (`apps/web/middleware.ts`)
   - Global rate limiting for all requests
   - Granular configuration per endpoint
   - Security headers and CORS handling

3. **Tests** (`apps/web/__tests__/security/rate-limiting.test.ts`)
   - Comprehensive test coverage (14 tests)
   - Edge case handling
   - Distributed rate limiting simulation

## Rate Limit Configuration

### Tiered Rate Limits by Endpoint Category

#### 🔐 Authentication & Security (Strictest)
Protect against brute force and account takeover attempts.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/auth/login` | 5 requests | 15 minutes | Prevent password brute force |
| `/api/auth/register` | 3 requests | 1 hour | Prevent bulk account creation |
| `/api/auth/mfa/setup` | 3 requests | 1 hour | Limit MFA enrollment attempts |
| `/api/settings/password` | 3 requests | 1 hour | Prevent password cycling abuse |
| `/api/settings/delete-account` | 1 request | 24 hours | Critical operation, strict limit |

#### 🤖 AI/ML Endpoints (Expensive Operations)
Prevent API quota exhaustion and control costs.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/grok/symptom-analysis` | 10 requests | 1 hour | Expensive Grok API calls, PHI processing |
| `/api/grok/*` | 15 requests | 1 hour | General Grok API operations |

#### 📚 Public Content API (Moderate)
Allow reasonable access while preventing automated scraping.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/herbs` | 60 requests | 1 minute | Public herb database access |
| `/api/formulas` | 60 requests | 1 minute | Public formula database access |
| `/api/conditions` | 60 requests | 1 minute | Public condition database access |
| `/api/practitioners` | 60 requests | 1 minute | Public practitioner directory |
| `/api/images` | 100 requests | 1 minute | Image optimization API |

#### 📝 User-Generated Content
Prevent spam and abuse.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/contact` | 3 requests | 1 hour | Contact form spam prevention |
| `/api/profile` | 20 requests | 1 minute | Profile update rate limiting |

#### 📱 Mobile API Endpoints
Balance mobile app needs with abuse prevention.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/mobile/register-device` | 5 requests | 1 hour | Device registration |
| `/api/mobile/unregister-device` | 10 requests | 1 hour | Device cleanup |
| `/api/mobile/sync` | 30 requests | 1 minute | Offline sync operations |
| `/api/mobile/config` | 60 requests | 1 minute | App configuration fetches |

#### 🔧 Admin API Endpoints
Even authenticated admins need reasonable limits.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/admin/account-lockout` | 50 requests | 1 minute | Account management operations |
| `/api/admin/security-breach` | 10 requests | 1 minute | Security incident reporting |
| `/api/admin/security-events` | 100 requests | 1 minute | Security event queries |
| `/api/admin/api-logs` | 100 requests | 1 minute | API log analytics |

#### 🏥 Health & Monitoring
Allow frequent health checks.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/health` | 120 requests | 1 minute | Uptime monitoring services |
| `/api/health/cert` | 60 requests | 1 minute | Certificate expiration checks |

#### 🌐 General & Default
Catch-all limits for unlisted endpoints.

| Endpoint | Limit | Window | Justification |
|----------|-------|--------|---------------|
| `/api/*` | 100 requests | 1 minute | General API catch-all |
| Default (all other requests) | 300 requests | 1 minute | Page requests, static assets |

## Implementation Details

### Sliding Window Algorithm

The rate limiter uses a **sliding window** implementation with Redis sorted sets for accurate request counting:

```typescript
// Pseudocode
1. Remove old requests outside the time window
2. Add current request with timestamp
3. Count total requests in window
4. Set expiration on key for automatic cleanup
5. Return allowed/denied with remaining count
```

**Benefits over fixed window**:
- More accurate rate limiting
- Prevents burst at window boundaries
- Smoother distribution of requests

### Client Identification

Rate limits are tracked per client using:

1. `X-Forwarded-For` header (behind proxy/CDN)
2. `X-Real-IP` header (nginx/reverse proxy)
3. Fallback to 'unknown' (not recommended for production)

**Security Note**: Always deploy behind a trusted proxy (Cloudflare, nginx) that sets these headers correctly.

### Response Headers

All responses include rate limit information:

```http
X-RateLimit-Limit: 100         # Max requests allowed
X-RateLimit-Remaining: 75      # Requests remaining in window
X-RateLimit-Reset: 1698765432  # Unix timestamp when limit resets
```

When rate limited (429 response):

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600              # Seconds until retry allowed
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698765432

{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

## Production Deployment

### Environment Variables

```bash
# Redis/DragonflyDB Configuration
REDIS_URL=redis://:password@host:6379
# or
REDIS_URL=rediss://host:6380  # TLS enabled

# Redis Connection Options (optional)
REDIS_MAX_RETRIES=3
REDIS_CONNECT_TIMEOUT=10000
```

### Redis/DragonflyDB Setup

**Recommended**: Use DragonflyDB for better performance (25x faster than Redis)

```bash
# Docker deployment
docker run -d \
  --name dragonflydb \
  -p 6379:6379 \
  -v /data/dragonflydb:/data \
  docker.dragonflydb.io/dragonflydb/dragonfly:latest \
  --tls --tls_key_file=/etc/ssl/private/key.pem \
  --tls_cert_file=/etc/ssl/certs/cert.pem \
  --requirepass your-strong-password
```

**Security Best Practices**:
- ✅ Always use TLS in production (`rediss://`)
- ✅ Enforce TLS 1.2+ minimum (`REDIS_TLS_MIN_VERSION=TLSv1.2`)
- ✅ Use strong authentication password
- ✅ Enable firewall rules (allow only application servers)
- ✅ Consider mTLS for additional security

### Monitoring

#### Health Check

Monitor Redis connection status:

```bash
curl https://verscienta.com/api/health
```

```json
{
  "status": "healthy",
  "redis": "connected",
  "version": "1.0.0"
}
```

#### Rate Limit Metrics

Track via API request logs:

```bash
GET /api/admin/api-logs?status=429
```

#### Security Alerts

High rate limit violations trigger security alerts:

- **Threshold**: >1000 requests in single window
- **Action**: POST to `/api/internal/security-alert`
- **Log**: Console warning + security incident log

## Testing

### Unit Tests

Run comprehensive rate limiting tests:

```bash
cd apps/web
pnpm test __tests__/security/rate-limiting.test.ts
```

**Test Coverage**:
- ✅ Upload rate limiting (4 tests)
- ✅ API request rate limiting (3 tests)
- ✅ Distributed rate limiting with Redis simulation (2 tests)
- ✅ Admin bypass and premium tiers (2 tests)
- ✅ Rate limit monitoring (1 test)
- ✅ Edge cases: concurrent requests, missing user ID (2 tests)

### Manual Testing

Test rate limits with curl:

```bash
# Test login rate limit (5 requests / 15 min)
for i in {1..6}; do
  curl -X POST https://verscienta.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -i
  echo "Request $i"
done

# Expected: First 5 succeed (401/200), 6th returns 429
```

### Load Testing

Simulate high traffic with k6:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100,        // 100 virtual users
  duration: '1m',   // 1 minute test
};

export default function() {
  let res = http.get('https://verscienta.com/api/herbs');

  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'rate limit headers present': (r) => r.headers['X-Ratelimit-Limit'] !== undefined,
  });
}
```

## Future Enhancements

### Planned Improvements

- [ ] **User-tier based limits** - Different limits for Free, Premium, Enterprise users
- [ ] **Dynamic rate limiting** - Adjust limits based on server load
- [ ] **IP reputation** - Stricter limits for known bad actors
- [ ] **Whitelist/Blacklist** - Allow-list for trusted partners, block-list for attackers
- [ ] **GraphQL query complexity** - Rate limit based on query cost, not just count
- [ ] **WebSocket rate limiting** - Extend to real-time connections
- [ ] **Per-user analytics** - Track individual user rate limit consumption
- [ ] **Auto-scaling triggers** - Scale infrastructure based on rate limit patterns

### Advanced Security

- [ ] **Behavioral analysis** - Detect anomalous patterns (e.g., sudden spike after dormancy)
- [ ] **CAPTCHA integration** - Challenge suspicious requests with Cloudflare Turnstile
- [ ] **Token bucket algorithm** - Allow bursts with sustained rate limiting
- [ ] **Distributed quota management** - Share quotas across multiple API gateways

## Troubleshooting

### Common Issues

#### 1. Redis Connection Failed

**Symptom**: Warning logs: "Redis not configured - using in-memory fallback"

**Solution**:
```bash
# Check environment variable
echo $REDIS_URL

# Test Redis connectivity
redis-cli -u $REDIS_URL ping
# Expected: PONG

# Restart application
pm2 restart verscienta-web
```

#### 2. Excessive 429 Errors

**Symptom**: Legitimate users getting rate limited

**Diagnosis**:
```bash
# Check rate limit info
curl https://verscienta.com/api/herbs -I

# Look for headers:
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0    # ← All consumed
X-RateLimit-Reset: 1698765432
```

**Solutions**:
- Increase limit in `middleware.ts` for specific endpoint
- Implement user-tier based limits (Premium users get higher limits)
- Check for bot traffic (enable CAPTCHA)
- Review application logs for unusual patterns

#### 3. Rate Limits Not Working

**Symptom**: No rate limiting headers in response, unlimited requests allowed

**Diagnosis**:
```bash
# Check middleware is running
curl https://verscienta.com/api/test -I | grep RateLimit

# Check Redis keys
redis-cli -u $REDIS_URL
> SCAN 0 MATCH ratelimit:*
```

**Solutions**:
- Verify middleware is configured in `next.config.ts`
- Check middleware matcher patterns
- Ensure Redis is accessible from application
- Review application logs for middleware errors

## Compliance

### HIPAA Compliance

Rate limiting is critical for HIPAA compliance:

- ✅ **Audit logging**: All rate limit violations are logged with client IP, timestamp, endpoint
- ✅ **PHI protection**: Strict limits on symptom checker (`/api/grok/symptom-analysis`) prevent data mining
- ✅ **Access control**: Combined with authentication, prevents unauthorized bulk data access
- ✅ **Denial of Service prevention**: Ensures availability of PHI for authorized users

### PCI DSS Compliance

Rate limiting supports PCI DSS requirements:

- ✅ **Requirement 6.5.10**: Protection against common attacks (brute force, DoS)
- ✅ **Requirement 8.2.1**: Strong authentication enforcement via login rate limits
- ✅ **Requirement 10.2**: Audit trail of rate limit violations

### GDPR Compliance

Rate limiting aids GDPR compliance:

- ✅ **Data minimization**: Prevents bulk data exports
- ✅ **Security of processing**: Technical measure against unauthorized access
- ✅ **Availability**: Ensures service remains available for data subject requests

## References

- [OWASP API Security Top 10 - API4:2023 Unrestricted Resource Consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
- [Redis Rate Limiting Pattern](https://redis.io/docs/manual/patterns/rate-limiter/)
- [DragonflyDB Performance Benchmarks](https://www.dragonflydb.io/docs/benchmarks)
- [NIST SP 800-53 - SC-5: Denial of Service Protection](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)

## Changelog

### 2025-10-26 - Comprehensive Rate Limiting Implementation

- ✅ Enhanced middleware with 25+ granular rate limit configurations
- ✅ Organized endpoints into 7 security tiers (Authentication, AI/ML, Public API, etc.)
- ✅ Documented all rate limits with justifications
- ✅ Created comprehensive documentation (this file)
- ✅ Verified test coverage (14 tests, all passing)
- ✅ Production-ready Redis/DragonflyDB integration

### Future Updates

- Track future changes here
- Include version numbers and dates
- Reference related GitHub issues/PRs

---

**Last Updated**: 2025-10-26
**Maintained By**: Verscienta Health Security Team
**Review Schedule**: Quarterly (or after security incidents)
