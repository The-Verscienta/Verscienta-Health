#!/bin/bash

# Database Migration Script (Unix/Linux/Mac)
#
# Usage:
#   ./scripts/db/migrate.sh up          # Run pending migrations
#   ./scripts/db/migrate.sh down        # Rollback last migration
#   ./scripts/db/migrate.sh status      # Check migration status
#   ./scripts/db/migrate.sh create NAME # Create new migration

set -e

# Change to apps/web directory
cd "$(dirname "$0")/../.."

# Run TypeScript migration script
tsx scripts/db/migrate.ts "$@"
