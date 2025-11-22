@echo off
REM ============================================================================
REM Database Index Verification Script Runner (Windows)
REM ============================================================================
REM Purpose: Run SQL verification script to check index deployment
REM Usage: scripts\db\verify-indexes.bat
REM ============================================================================

echo.
echo =========================================
echo Database Index Verification
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

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Running verification queries with psql...
  echo.
  psql "%DATABASE_URL%" -f scripts\db\verify-indexes.sql
) else (
  echo ⚠️  psql not found. Using Prisma db execute instead...
  echo.
  pnpm prisma db execute --file scripts\db\verify-indexes.sql --stdin
)

echo.
echo =========================================
echo Verification Complete
echo =========================================
echo.
