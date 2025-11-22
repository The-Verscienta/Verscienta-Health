-- ============================================================================
-- Database Index Usage Monitoring Script
-- ============================================================================
-- Purpose: Monitor index usage and identify unused or inefficient indexes
-- Usage: psql $DATABASE_URL -f scripts/db/monitor-index-usage.sql
-- Schedule: Run weekly to track index effectiveness
-- ============================================================================

\echo ''
\echo '========================================='
\echo 'Database Index Usage Monitoring'
\echo '========================================='
\echo ''

-- Show database uptime (context for usage stats)
\echo 'Database Statistics Tracking Since:'
\echo ''

SELECT
  pg_postmaster_start_time() AS database_started_at,
  now() - pg_postmaster_start_time() AS uptime,
  EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))/3600 AS uptime_hours
;

\echo ''
\echo '========================================='
\echo 'Index Usage Statistics'
\echo '========================================='
\echo ''

-- Show index usage with scan counts
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS total_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size,
  CASE
    WHEN idx_scan = 0 THEN '⚠️  UNUSED'
    WHEN idx_scan < 100 THEN '⚠️  LOW USAGE'
    WHEN idx_scan < 1000 THEN '✓ MODERATE'
    ELSE '✓ ACTIVE'
  END AS usage_status
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY idx_scan DESC, pg_relation_size(indexrelid::regclass) DESC;

\echo ''
\echo '========================================='
\echo 'Unused Indexes (0 scans)'
\echo '========================================='
\echo ''

-- List indexes that have never been used
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size,
  ROUND(100.0 * pg_relation_size(indexrelid::regclass) /
    NULLIF(pg_total_relation_size(schemaname||'.'||tablename), 0), 2) AS pct_of_table
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
  AND indexname NOT LIKE '%_pkey'  -- Exclude primary keys
ORDER BY pg_relation_size(indexrelid::regclass) DESC;

\echo ''
\echo 'Note: New indexes may show 0 scans initially - check again after 24-48h'
\echo ''

\echo '========================================='
\echo 'Low Usage Indexes (< 100 scans)'
\echo '========================================='
\echo ''

-- List indexes with low usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS total_scans,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size,
  ROUND(CAST(idx_scan AS numeric) / GREATEST(
    EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time()))/86400, 1
  ), 2) AS scans_per_day
FROM pg_stat_user_indexes
WHERE idx_scan > 0
  AND idx_scan < 100
  AND tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY idx_scan ASC;

\echo ''
\echo '========================================='
\echo 'Table Scan Statistics'
\echo '========================================='
\echo ''

-- Show table-level scan statistics
SELECT
  schemaname,
  tablename,
  seq_scan AS sequential_scans,
  seq_tup_read AS seq_tuples_read,
  idx_scan AS index_scans,
  idx_tup_fetch AS idx_tuples_fetched,
  n_tup_ins AS inserts,
  n_tup_upd AS updates,
  n_tup_del AS deletes,
  CASE
    WHEN seq_scan + idx_scan = 0 THEN NULL
    ELSE ROUND(100.0 * idx_scan / (seq_scan + idx_scan), 2)
  END AS pct_index_scans
FROM pg_stat_user_tables
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY tablename;

\echo ''
\echo 'Optimal: pct_index_scans should be > 95% for large tables'
\echo ''

\echo '========================================='
\echo 'Index Size vs Effectiveness'
\echo '========================================='
\echo ''

-- Show index efficiency (scans per MB)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS total_scans,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size,
  pg_relation_size(indexrelid::regclass)/1024/1024 AS size_mb,
  CASE
    WHEN pg_relation_size(indexrelid::regclass) = 0 THEN NULL
    ELSE ROUND(CAST(idx_scan AS numeric) / (pg_relation_size(indexrelid::regclass)/1024/1024.0), 2)
  END AS scans_per_mb,
  CASE
    WHEN idx_scan = 0 THEN '⚠️  Consider removing'
    WHEN idx_scan < 100 AND pg_relation_size(indexrelid::regclass) > 1024*1024 THEN '⚠️  Low ROI'
    ELSE '✓ Good'
  END AS efficiency_status
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
  AND pg_relation_size(indexrelid::regclass) > 0
ORDER BY
  CASE
    WHEN pg_relation_size(indexrelid::regclass) = 0 THEN 0
    ELSE CAST(idx_scan AS numeric) / (pg_relation_size(indexrelid::regclass)/1024/1024.0)
  END ASC NULLS FIRST;

\echo ''
\echo '========================================='
\echo 'Composite Index Usage (Multi-column)'
\echo '========================================='
\echo ''

-- Show composite indexes specifically
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS total_scans,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size,
  indexdef
FROM pg_stat_user_indexes psi
JOIN pg_indexes pi ON psi.indexrelid = pi.indexname::regclass
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
  AND indexdef LIKE '%(%,%)'  -- Has multiple columns
ORDER BY idx_scan DESC;

\echo ''
\echo '========================================='
\echo 'Index Bloat Check'
\echo '========================================='
\echo ''

-- Estimate index bloat
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS current_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) -
                 pg_relation_size(schemaname||'.'||tablename)) AS total_indexes_size,
  CASE
    WHEN pg_total_relation_size(schemaname||'.'||tablename) = pg_relation_size(schemaname||'.'||tablename)
    THEN 0
    ELSE ROUND(100.0 * pg_relation_size(indexrelid::regclass) /
      (pg_total_relation_size(schemaname||'.'||tablename) -
       pg_relation_size(schemaname||'.'||tablename)), 2)
  END AS pct_of_total_indexes
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY pg_relation_size(indexrelid::regclass) DESC
LIMIT 10;

\echo ''
\echo '========================================='
\echo 'Recommendations'
\echo '========================================='
\echo ''

-- Generate recommendations based on usage patterns
WITH index_stats AS (
  SELECT
    indexname,
    idx_scan,
    pg_relation_size(indexrelid::regclass) AS size_bytes,
    EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) / 86400 AS days_running
  FROM pg_stat_user_indexes
  WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                      'ApiRequestLog', 'PasswordHistory', 'AuditLog')
)
SELECT
  indexname,
  idx_scan AS total_scans,
  pg_size_pretty(size_bytes) AS size,
  CASE
    WHEN idx_scan = 0 AND days_running > 7 THEN
      '⚠️  Consider dropping - unused for ' || ROUND(days_running::numeric, 1) || ' days'
    WHEN idx_scan < 10 AND size_bytes > 1024*1024 AND days_running > 7 THEN
      '⚠️  Low usage for size - verify if needed'
    WHEN idx_scan > 1000 AND size_bytes < 1024*1024 THEN
      '✓ High efficiency - frequently used, small size'
    WHEN idx_scan > 100 THEN
      '✓ Active index - good ROI'
    ELSE
      '→ Monitor - may need more time for evaluation'
  END AS recommendation
FROM index_stats
WHERE indexname NOT LIKE '%_pkey'
ORDER BY
  CASE
    WHEN idx_scan = 0 THEN 1
    WHEN idx_scan < 10 AND size_bytes > 1024*1024 THEN 2
    WHEN idx_scan < 100 THEN 3
    ELSE 4
  END,
  size_bytes DESC;

\echo ''
\echo '========================================='
\echo 'Monitoring Complete'
\echo '========================================='
\echo ''
\echo 'Best Practices:'
\echo '  - Run this report weekly to track trends'
\echo '  - Wait at least 7 days before dropping unused indexes'
\echo '  - Index usage varies by application workload'
\echo '  - Sequential scans are OK for small tables (< 1000 rows)'
\echo '  - Consider REINDEX if bloat is detected'
\echo ''
