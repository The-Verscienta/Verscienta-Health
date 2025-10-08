-- Database Setup Script for Verscienta Health
-- Run this script to initialize a new PostgreSQL database
-- Usage: psql -U postgres -f scripts/setup-database.sql

-- ============================================
-- 1. Create Database and User
-- ============================================

-- Create database (if not exists)
SELECT 'CREATE DATABASE verscienta_health'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'verscienta_health')\gexec

-- Create user (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'verscienta_user') THEN
    CREATE USER verscienta_user WITH ENCRYPTED PASSWORD 'change_this_password';
    RAISE NOTICE 'User verscienta_user created';
  ELSE
    RAISE NOTICE 'User verscienta_user already exists';
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE verscienta_health TO verscienta_user;

-- Connect to the database
\c verscienta_health

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO verscienta_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO verscienta_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO verscienta_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO verscienta_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO verscienta_user;

-- ============================================
-- 2. Enable Required Extensions
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions for HIPAA compliance';

CREATE EXTENSION IF NOT EXISTS "cube";
COMMENT ON EXTENSION "cube" IS 'Multi-dimensional cube data type (for geospatial)';

CREATE EXTENSION IF NOT EXISTS "earthdistance";
COMMENT ON EXTENSION "earthdistance" IS 'Calculate great-circle distances (for practitioner search)';

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy search';

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
COMMENT ON EXTENSION "pg_stat_statements" IS 'Track query execution statistics';

-- ============================================
-- 3. Configure Settings
-- ============================================

-- Set timezone
ALTER DATABASE verscienta_health SET timezone TO 'UTC';

-- Enable connection pooling optimization
ALTER DATABASE verscienta_health SET idle_in_transaction_session_timeout = '10min';

-- Log slow queries (> 1 second)
ALTER DATABASE verscienta_health SET log_min_duration_statement = 1000;

-- ============================================
-- 4. Verification
-- ============================================

\echo
\echo '=========================================='
\echo 'Database Setup Complete'
\echo '=========================================='
\echo

-- List extensions
\echo 'Installed Extensions:'
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'cube', 'earthdistance', 'pg_trgm', 'pg_stat_statements')
ORDER BY extname;

\echo
\echo 'Database Settings:'
SELECT name, setting FROM pg_settings
WHERE name IN ('timezone', 'idle_in_transaction_session_timeout', 'log_min_duration_statement');

\echo
\echo '=========================================='
\echo 'Next Steps:'
\echo '1. Update DATABASE_URL in .env file'
\echo '2. Run migrations: pnpm db:migrate'
\echo '3. Generate encryption key: openssl rand -base64 32'
\echo '4. Run encryption migration if handling PHI data'
\echo '=========================================='
