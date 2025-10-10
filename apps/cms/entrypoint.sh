#!/bin/sh
set -e

echo "🔍 Environment Check:"
echo "  NODE_ENV: ${NODE_ENV}"
echo "  PORT: ${PORT}"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..." # Only show first 30 chars for security

# Check critical environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  echo "Available environment variables:"
  env | grep -E "(DATABASE|PAYLOAD|PORT)" || echo "No database/payload vars found"
  exit 1
fi

if [ -z "$PAYLOAD_SECRET" ]; then
  echo "⚠️  WARNING: PAYLOAD_SECRET is not set, using default (INSECURE)"
fi

echo "✅ Environment variables loaded successfully"
echo ""
echo "🚀 Starting Payload CMS..."

# Start the application
exec npx tsx src/server.ts
