@echo off
REM ============================================================================
REM Database Migration Status Check Script (Windows)
REM ============================================================================
REM Purpose: Check if all Prisma migrations (including indexes) are deployed
REM Usage: scripts\db\check-migration-status.bat
REM ============================================================================

echo.
echo =========================================
echo Database Migration Status Check
echo =========================================
echo.

REM Load environment variables from .env.local if it exists
if exist .env.local (
  for /f "tokens=*" %%a in ('type .env.local ^| findstr /v "^#"') do set %%a
)

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
  echo ❌ ERROR: DATABASE_URL is not set
  echo    Please set it in .env.local or environment
  exit /b 1
)

echo ✓ DATABASE_URL is configured
echo.

REM Run Prisma migrate status
echo Checking migration status...
echo.

pnpm prisma migrate status

echo.
echo =========================================
echo.
echo Next steps:
echo.
echo If migrations are pending:
echo   pnpm prisma migrate deploy    # Apply pending migrations
echo.
echo If migrations are applied:
echo   .\scripts\db\verify-indexes.bat   # Verify index deployment
echo.
