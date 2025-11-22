#!/bin/bash

# ============================================================================
# Database Index Verification Script Runner (Unix/Linux/Mac)
# ============================================================================
# Purpose: Run SQL verification script to check index deployment
# Usage: ./scripts/db/verify-indexes.sh [database_url]
# ============================================================================

set -e

echo ""
echo "========================================="
echo "Database Index Verification"
echo "========================================="
echo ""

# Use provided DATABASE_URL or load from .env.local
if [ -n "$1" ]; then
  DATABASE_URL="$1"
elif [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  echo ""
  echo "Usage:"
  echo "  ./scripts/db/verify-indexes.sh                    # Use .env.local"
  echo "  ./scripts/db/verify-indexes.sh 'postgresql://...' # Provide URL"
  exit 1
fi

echo "✓ DATABASE_URL is configured"
echo ""

# Extract connection details for psql
# This handles both standard postgres:// and pooled connections
if command -v psql &> /dev/null; then
  echo "Running verification queries with psql..."
  echo ""
  psql "$DATABASE_URL" -f scripts/db/verify-indexes.sql
else
  echo "⚠️  psql not found. Using Prisma db execute instead..."
  echo ""
  pnpm prisma db execute --file scripts/db/verify-indexes.sql --stdin
fi

echo ""
echo "========================================="
echo "Verification Complete"
echo "========================================="
echo ""
