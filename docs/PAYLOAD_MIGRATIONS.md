# Payload + Prisma Migrations Runbook

This project runs **two** schema managers against the **same** Postgres database:

| Manager | Owns | Tracking table | Command |
| --- | --- | --- | --- |
| Prisma | Better Auth tables | `_prisma_migrations` | `prisma migrate deploy` |
| Payload CMS | All CMS/PII collections | `payload_migrations` | `payload migrate` |

Both are applied by `apps/web/scripts/db/migrate.ts` (`pnpm --filter web db:migrate:up`),
which runs Prisma first, then Payload, and **exits non-zero on any failure**.

> Context: see `docs/AUDIT_REPORT_2026-06.md` finding **C4**. Previously the Payload
> Postgres adapter ran with `push: true` and **no env guard**, so on every boot it
> diffed the config and auto-applied DDL to the live PII database with no review,
> versioning, or rollback. That is now fixed (`push` is only on in local development)
> and schema changes go through versioned migrations.

## Schema-management invariants

1. **`push` is OFF everywhere except local development.**
   `apps/web/payload.config.ts` sets `push: process.env.NODE_ENV === 'development'`.
   Production, staging, test, and an *unset* `NODE_ENV` all get `push: false`.
   The active config is `apps/web/payload.config.ts` (resolved via the tsconfig
   `@payload-config` alias by both Next.js and the Payload CLI). The old duplicate
   `apps/web/payload/payload.config.ts` (which had an unguarded `push: true`) was
   deleted.
2. **Migrations run before the app serves traffic, and a failure halts startup.**
   - nixpacks: `[start]` runs `pnpm --filter web db:migrate:up && <server>`.
   - Docker: deploy the `migrator` stage (`docker build --target migrator`) as a
     release/init job that must succeed before the runner starts.
   A half-applied migration aborts the rollout instead of booting; `push` is off, so
   the DB is never silently "fixed" by auto-DDL.

## Creating a new migration

Generate locally after changing collections/config, then commit the generated
`*.ts` + `*.json` (snapshot) + updated `index.ts` under `apps/web/payload/migrations/`.

The canonical command is:

```bash
pnpm --filter web payload migrate:create <name>
```

### Toolchain caveat (local generation)

On **Node 22.12+** (e.g. Node 22.22 on Windows) the Payload CLI can fail to load the
TypeScript config via its bundled `tsx` loader. Three distinct failure modes were
observed and are all loader/interop issues — *not* problems with the config itself:

- extensionless relative imports not resolved by the scoped `tsImport` loader,
- `@next/env@13.5.11` (no default export) breaking under a global `tsx` transform,
- Node 22's strict `require(esm)`-in-cycle error.

**Reliable, runtime-independent generation** (used to create the initial baseline) —
pre-compile the config to native ESM and run the CLI with plain Node (no `tsx`):

```bash
cd apps/web
# 1. Bundle the config to native ESM (collections inlined, node_modules external).
#    Use the esbuild that ships with the toolchain (path may vary by version):
node ../../node_modules/.pnpm/esbuild@*/node_modules/esbuild/bin/esbuild \
  payload.config.ts --bundle --platform=node --format=esm \
  --packages=external --outfile=payload.config.generated.mjs

# 2. Run the Payload CLI against the compiled config with plain Node.
PAYLOAD_CONFIG_PATH=payload.config.generated.mjs PAYLOAD_SECRET=<any> \
  node ../../node_modules/.pnpm/payload@*/node_modules/payload/bin.js \
  migrate:create <name> --disable-transpile --force-accept-warning

# 3. Clean up the generated config.
rm payload.config.generated.mjs
```

`migrate:create` never touches the database (the CLI runs it with
`disableDBConnect`), so this is safe to run anywhere.

> The deploy applies migrations with the **standard** `payload migrate` (via
> `migrate.ts`). Validate that command on the **Node 20** deploy image (the deploy
> target — `nixpacks.toml` pins `nodejs_20`, where the Node 22 `require(esm)` issue
> does not exist). If config loading still fails there, switch the Payload step in
> `migrate.ts` to the compiled-config + `--disable-transpile` invocation above.

## First rollout to an EXISTING database (one-time baseline) — READ BEFORE DEPLOYING

The initial migration `20260607_021411_initial` is a **full baseline**: its `up()`
contains `CREATE TYPE` / `CREATE TABLE` / `CREATE INDEX` / `ALTER TABLE ... ADD
CONSTRAINT` for the entire CMS schema (no destructive statements). Its `down()` drops
everything.

Because production's schema **already exists** (it was created by the old `push: true`
behaviour), running this baseline's `up()` as-is would fail with `relation already
exists` and abort the deploy. Before the first wired deploy, baseline each existing
environment so Payload records the migration as applied **without re-running it**:

1. **Back up the database.**
2. **Confirm no drift** — the live schema should already match the baseline (both come
   from the same config). Spot-check a few tables, or restore the backup into a scratch
   DB and run `payload migrate` there first.
3. **Mark the baseline as applied** by inserting a row into Payload's tracking table so
   `payload migrate` treats it as done:
   ```sql
   -- create the tracking table if it does not yet exist
   CREATE TABLE IF NOT EXISTS payload_migrations (
     id serial PRIMARY KEY,
     name varchar,
     batch numeric,
     updated_at timestamptz(3) NOT NULL DEFAULT now(),
     created_at timestamptz(3) NOT NULL DEFAULT now()
   );
   INSERT INTO payload_migrations (name, batch) VALUES ('20260607_021411_initial', 1);
   ```
4. Now `pnpm --filter web db:migrate:up` is a no-op for the baseline and will only apply
   *future* migrations.

A **fresh / empty** database needs none of this — `payload migrate` applies the baseline
normally.

## Rollback

- Payload: `pnpm --filter web db:migrate:down` (runs the migration's `down()` — drops
  tables; destructive, restore from backup if unsure).
- Prisma: no auto-rollback; restore from backup or hand-apply reverse SQL.
</content>
