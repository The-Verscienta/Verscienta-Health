-- ============================================================================
-- Database Index Verification Script
-- ============================================================================
-- Purpose: Verify that all 39 performance indexes have been deployed
-- Usage: psql $DATABASE_URL -f scripts/db/verify-indexes.sql
-- Last Updated: 2025-01-20
-- ============================================================================

\echo ''
\echo '========================================='
\echo 'Database Index Verification'
\echo '========================================='
\echo ''

-- Check Prisma migrations table
\echo 'Checking migration status...'
\echo ''

SELECT
  migration_name,
  finished_at,
  applied_steps_count
FROM "_prisma_migrations"
ORDER BY finished_at DESC
LIMIT 5;

\echo ''
\echo '========================================='
\echo 'Index Count by Table'
\echo '========================================='
\echo ''

-- Count indexes per table
SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
GROUP BY tablename
ORDER BY tablename;

\echo ''
\echo 'Expected counts:'
\echo '  User:            5 indexes'
\echo '  Account:         3 indexes'
\echo '  Session:         6 indexes'
\echo '  Verification:    3 indexes'
\echo '  DeviceToken:     2 indexes'
\echo '  ApiRequestLog:  10 indexes'
\echo '  PasswordHistory: 3 indexes'
\echo '  AuditLog:        7 indexes'
\echo '  TOTAL:          39 indexes (plus unique/primary key indexes)'
\echo ''

\echo '========================================='
\echo 'All Indexes by Table'
\echo '========================================='
\echo ''

-- List all indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY tablename, indexname;

\echo ''
\echo '========================================='
\echo 'Index Sizes'
\echo '========================================='
\echo ''

-- Check index sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY pg_relation_size(indexrelid::regclass) DESC;

\echo ''
\echo '========================================='
\echo 'Index Usage Statistics'
\echo '========================================='
\echo ''

-- Show index usage (only if database has been running for a while)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY idx_scan DESC;

\echo ''
\echo 'Note: idx_scan should be > 0 for active indexes'
\echo '      (May be 0 immediately after creation - check again after 24h)'
\echo ''

\echo '========================================='
\echo 'Missing Indexes Check'
\echo '========================================='
\echo ''

-- Check for missing indexes (comprehensive list)
WITH expected_indexes AS (
  SELECT unnest(ARRAY[
    'User_email_key', 'User_role_idx', 'User_emailVerified_idx', 'User_createdAt_idx',
    'User_deletedAt_idx', 'User_scheduledForDeletion_idx',
    'Account_providerId_accountId_key', 'Account_userId_idx', 'Account_providerId_idx',
    'Account_createdAt_idx',
    'Session_token_key', 'Session_userId_idx', 'Session_expiresAt_idx',
    'Session_ipAddress_idx', 'Session_createdAt_idx', 'Session_userId_expiresAt_idx',
    'Session_userId_createdAt_idx',
    'Verification_identifier_value_key', 'Verification_expiresAt_idx',
    'Verification_identifier_idx', 'Verification_createdAt_idx',
    'DeviceToken_token_key', 'DeviceToken_userId_idx', 'DeviceToken_platform_idx',
    'ApiRequestLog_userId_idx', 'ApiRequestLog_path_idx', 'ApiRequestLog_method_idx',
    'ApiRequestLog_statusCode_idx', 'ApiRequestLog_createdAt_idx',
    'ApiRequestLog_rateLimitHit_idx', 'ApiRequestLog_ipAddress_idx',
    'ApiRequestLog_userId_createdAt_idx', 'ApiRequestLog_path_method_idx',
    'ApiRequestLog_statusCode_createdAt_idx',
    'PasswordHistory_userId_idx', 'PasswordHistory_createdAt_idx',
    'PasswordHistory_userId_createdAt_idx',
    'AuditLog_userId_idx', 'AuditLog_action_idx', 'AuditLog_createdAt_idx',
    'AuditLog_severity_idx', 'AuditLog_userId_createdAt_idx',
    'AuditLog_action_createdAt_idx', 'AuditLog_ipAddress_idx'
  ]) AS index_name
),
existing_indexes AS (
  SELECT indexname
  FROM pg_indexes
  WHERE schemaname = 'public'
)
SELECT
  e.index_name AS missing_index
FROM expected_indexes e
LEFT JOIN existing_indexes ei ON e.index_name = ei.indexname
WHERE ei.indexname IS NULL;

\echo ''
\echo 'If no rows returned above, all indexes are present! ✓'
\echo ''

\echo '========================================='
\echo 'Table Statistics'
\echo '========================================='
\echo ''

-- Show table statistics
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_catalog.pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo ''
\echo '========================================='
\echo 'Verification Complete'
\echo '========================================='
\echo ''
