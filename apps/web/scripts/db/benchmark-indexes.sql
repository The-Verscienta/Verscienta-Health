-- ============================================================================
-- Database Index Performance Benchmark Script
-- ============================================================================
-- Purpose: Benchmark query performance with/without indexes
-- Usage: psql $DATABASE_URL -f scripts/db/benchmark-indexes.sql
-- Note: Run this BEFORE and AFTER index deployment to measure improvement
-- ============================================================================

\timing on

\echo ''
\echo '========================================='
\echo 'Database Index Performance Benchmark'
\echo '========================================='
\echo ''

\echo 'Starting benchmark tests...'
\echo 'Note: Times shown are in milliseconds'
\echo ''

-- Warm up the database cache
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Session";
SELECT COUNT(*) FROM "ApiRequestLog";

\echo ''
\echo '========================================='
\echo 'Benchmark 1: User Lookups'
\echo '========================================='
\echo ''

\echo 'Test 1.1: User by email (User_email_key index)'
EXPLAIN ANALYZE
SELECT * FROM "User" WHERE email = 'test@example.com' LIMIT 1;

\echo ''
\echo 'Test 1.2: Users by role (User_role_idx index)'
EXPLAIN ANALYZE
SELECT * FROM "User" WHERE role = 'USER' LIMIT 100;

\echo ''
\echo 'Test 1.3: Users by emailVerified status (User_emailVerified_idx)'
EXPLAIN ANALYZE
SELECT * FROM "User" WHERE "emailVerified" IS NULL LIMIT 100;

\echo ''
\echo 'Test 1.4: Recent users (User_createdAt_idx)'
EXPLAIN ANALYZE
SELECT * FROM "User" WHERE "createdAt" > NOW() - INTERVAL '30 days' LIMIT 100;

\echo ''
\echo '========================================='
\echo 'Benchmark 2: Session Queries'
\echo '========================================='
\echo ''

\echo 'Test 2.1: Session by token (Session_token_key index)'
EXPLAIN ANALYZE
SELECT * FROM "Session" WHERE token = 'non-existent-token' LIMIT 1;

\echo ''
\echo 'Test 2.2: Sessions by userId (Session_userId_idx)'
EXPLAIN ANALYZE
SELECT * FROM "Session" WHERE "userId" = '00000000-0000-0000-0000-000000000000' LIMIT 10;

\echo ''
\echo 'Test 2.3: Active sessions (Session_expiresAt_idx)'
EXPLAIN ANALYZE
SELECT * FROM "Session" WHERE "expiresAt" > NOW() LIMIT 100;

\echo ''
\echo 'Test 2.4: User sessions composite (Session_userId_expiresAt_idx)'
EXPLAIN ANALYZE
SELECT * FROM "Session"
WHERE "userId" = '00000000-0000-0000-0000-000000000000'
  AND "expiresAt" > NOW()
LIMIT 10;

\echo ''
\echo '========================================='
\echo 'Benchmark 3: API Request Log Analysis'
\echo '========================================='
\echo ''

\echo 'Test 3.1: Requests by path (ApiRequestLog_path_idx)'
EXPLAIN ANALYZE
SELECT COUNT(*) FROM "ApiRequestLog"
WHERE path = '/api/auth/session';

\echo ''
\echo 'Test 3.2: Failed requests (ApiRequestLog_statusCode_idx)'
EXPLAIN ANALYZE
SELECT * FROM "ApiRequestLog"
WHERE "statusCode" >= 400
LIMIT 100;

\echo ''
\echo 'Test 3.3: Recent requests (ApiRequestLog_createdAt_idx)'
EXPLAIN ANALYZE
SELECT * FROM "ApiRequestLog"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
LIMIT 100;

\echo ''
\echo 'Test 3.4: User request history (ApiRequestLog_userId_createdAt_idx)'
EXPLAIN ANALYZE
SELECT * FROM "ApiRequestLog"
WHERE "userId" = '00000000-0000-0000-0000-000000000000'
  AND "createdAt" > NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC
LIMIT 50;

\echo ''
\echo 'Test 3.5: Rate limit hits (ApiRequestLog_rateLimitHit_idx)'
EXPLAIN ANALYZE
SELECT COUNT(*) FROM "ApiRequestLog"
WHERE "rateLimitHit" = true;

\echo ''
\echo '========================================='
\echo 'Benchmark 4: Audit Log Queries'
\echo '========================================='
\echo ''

\echo 'Test 4.1: User audit history (AuditLog_userId_idx)'
EXPLAIN ANALYZE
SELECT * FROM "AuditLog"
WHERE "userId" = '00000000-0000-0000-0000-000000000000'
ORDER BY "createdAt" DESC
LIMIT 50;

\echo ''
\echo 'Test 4.2: Actions by type (AuditLog_action_idx)'
EXPLAIN ANALYZE
SELECT * FROM "AuditLog"
WHERE action = 'USER_LOGIN'
ORDER BY "createdAt" DESC
LIMIT 100;

\echo ''
\echo 'Test 4.3: High severity events (AuditLog_severity_idx)'
EXPLAIN ANALYZE
SELECT * FROM "AuditLog"
WHERE severity = 'HIGH'
ORDER BY "createdAt" DESC
LIMIT 100;

\echo ''
\echo 'Test 4.4: User actions in timeframe (AuditLog_userId_createdAt_idx)'
EXPLAIN ANALYZE
SELECT * FROM "AuditLog"
WHERE "userId" = '00000000-0000-0000-0000-000000000000'
  AND "createdAt" > NOW() - INTERVAL '30 days'
ORDER BY "createdAt" DESC;

\echo ''
\echo '========================================='
\echo 'Benchmark 5: Account Lookups'
\echo '========================================='
\echo ''

\echo 'Test 5.1: Account by provider (Account_providerId_idx)'
EXPLAIN ANALYZE
SELECT * FROM "Account"
WHERE "providerId" = 'google'
LIMIT 100;

\echo ''
\echo 'Test 5.2: User accounts (Account_userId_idx)'
EXPLAIN ANALYZE
SELECT * FROM "Account"
WHERE "userId" = '00000000-0000-0000-0000-000000000000';

\echo ''
\echo '========================================='
\echo 'Benchmark 6: Verification Tokens'
\echo '========================================='
\echo ''

\echo 'Test 6.1: Expired verifications (Verification_expiresAt_idx)'
EXPLAIN ANALYZE
SELECT * FROM "Verification"
WHERE "expiresAt" < NOW()
LIMIT 100;

\echo ''
\echo 'Test 6.2: Verifications by identifier (Verification_identifier_idx)'
EXPLAIN ANALYZE
SELECT * FROM "Verification"
WHERE identifier = 'test@example.com'
LIMIT 10;

\echo ''
\echo '========================================='
\echo 'Benchmark Summary'
\echo '========================================='
\echo ''

\timing off

-- Show index usage statistics for benchmarked queries
\echo 'Index Usage Statistics (after benchmark):'
\echo ''

SELECT
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
  AND idx_scan > 0
ORDER BY idx_scan DESC
LIMIT 20;

\echo ''
\echo 'Benchmark complete!'
\echo ''
\echo 'Performance Analysis Tips:'
\echo '  - Look for "Index Scan" vs "Seq Scan" in EXPLAIN ANALYZE output'
\echo '  - "Index Scan" = ✓ Good (index being used)'
\echo '  - "Seq Scan" = ⚠️  Warning (no index, or table too small)'
\echo '  - Execution time < 1ms = Excellent'
\echo '  - Execution time < 10ms = Good'
\echo '  - Execution time < 100ms = Acceptable'
\echo '  - Execution time > 100ms = Needs optimization'
\echo ''
\echo 'Run this benchmark periodically to track performance trends'
\echo ''
