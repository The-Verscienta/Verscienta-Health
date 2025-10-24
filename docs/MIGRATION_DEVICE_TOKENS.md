# Database Migration: Device Tokens

This migration adds support for push notifications on mobile apps by creating a `DeviceToken` table.

## What Changed

Added a new `DeviceToken` model to `apps/web/prisma/schema.prisma`:

- Stores push notification tokens for iOS (APNs) and Android (FCM)
- Links tokens to users (optional - can register before login)
- Tracks device platform, version, and unique device ID
- Automatically cascades delete when user is deleted

## Running the Migration

### Development

```bash
cd apps/web
npx prisma generate  # Regenerate Prisma Client
npx prisma db push   # Apply schema changes to development DB
```

### Production

```bash
cd apps/web

# Create migration
npx prisma migrate dev --name add_device_tokens

# Review the generated SQL in:
# prisma/migrations/YYYYMMDDHHMMSS_add_device_tokens/migration.sql

# Apply to production
npx prisma migrate deploy
```

## Expected SQL

The migration will create:

```sql
-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceId" TEXT,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken"("userId");

-- CreateIndex
CREATE INDEX "DeviceToken_platform_idx" ON "DeviceToken"("platform");

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

## Rollback (if needed)

If you need to rollback this migration:

```bash
# Development
npx prisma db push --force-reset

# Production
DROP TABLE "DeviceToken";
```

Then remove the `deviceTokens DeviceToken[]` relation from the User model in `schema.prisma`.

## Verification

After migration, verify the table was created:

```bash
# Using Prisma Studio
npx prisma studio

# Or using psql
psql $DATABASE_URL -c "\d DeviceToken"
```

## Testing

Test the endpoints:

```bash
# Register device
curl -X POST http://localhost:3000/api/mobile/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "deviceToken": "test-token-123",
    "platform": "ios",
    "deviceId": "device-uuid",
    "appVersion": "1.0.0"
  }'

# Unregister device
curl -X POST http://localhost:3000/api/mobile/unregister-device \
  -H "Content-Type: application/json" \
  -d '{"deviceToken": "test-token-123"}'
```

## Files Changed

1. **`apps/web/prisma/schema.prisma`** - Added DeviceToken model
2. **`apps/web/app/api/mobile/register-device/route.ts`** - Implemented DB storage
3. **`apps/web/app/api/mobile/unregister-device/route.ts`** - Implemented DB deletion

## Related Features

This migration enables:
- Push notifications for mobile apps (iOS & Android)
- User-specific notifications
- Platform-specific messaging
- Device tracking for analytics
- Automatic cleanup when users delete accounts
