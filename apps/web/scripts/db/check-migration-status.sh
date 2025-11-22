#!/bin/bash

# ============================================================================
# Database Migration Status Check Script
# ============================================================================
# Purpose: Check if all Prisma migrations (including indexes) are deployed
# Usage: ./scripts/db/check-migration-status.sh
# ============================================================================

set -e

echo ""
echo "========================================="
echo "Database Migration Status Check"
echo "========================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  echo "   Please set it in .env.local or environment"
  exit 1
fi

echo "✓ DATABASE_URL is configured"
echo ""

# Run Prisma migrate status
echo "Checking migration status..."
echo ""

pnpm prisma migrate status

echo ""
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "If migrations are pending:"
echo "  pnpm prisma migrate deploy    # Apply pending migrations"
echo ""
echo "If migrations are applied:"
echo "  ./scripts/db/verify-indexes.sh   # Verify index deployment"
echo ""
