@echo off
REM Database Migration Script (Windows)
REM
REM Usage:
REM   .\scripts\db\migrate.bat up          Run pending migrations
REM   .\scripts\db\migrate.bat down        Rollback last migration
REM   .\scripts\db\migrate.bat status      Check migration status
REM   .\scripts\db\migrate.bat create NAME Create new migration

REM Change to apps/web directory
cd /d %~dp0..\..

REM Run TypeScript migration script
tsx scripts\db\migrate.ts %*
