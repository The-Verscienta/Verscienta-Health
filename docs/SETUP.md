# Verscienta Health - Setup Guide

Complete guide to setting up the Verscienta Health platform for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0.0 or higher
- **pnpm** 9.0.0 or higher (`npm install -g pnpm`)
- **PostgreSQL** 17.0 or higher
- **Git** 2.40 or higher

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/verscienta-health.git
cd verscienta-health
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install dependencies for all workspaces (root, apps/web, apps/cms, packages/*).

## Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Create a new database:

```sql
createdb verscienta_health
```

2. Create a user (if needed):

```sql
CREATE USER verscienta WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE verscienta_health TO verscienta;
```

### Option B: Docker PostgreSQL

```bash
docker run --name verscienta-postgres \
  -e POSTGRES_USER=verscienta \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=verscienta_health \
  -p 5432:5432 \
  -d postgres:17
```

## Step 4: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```bash
# Required
DATABASE_URL=postgresql://verscienta:your-password@localhost:5432/verscienta_health
PAYLOAD_SECRET=your-super-secret-payload-key-at-least-32-chars
AUTH_SECRET=your-auth-secret-at-least-32-characters-long

# Algolia (required for search)
NEXT_PUBLIC_ALGOLIA_APP_ID=your-algolia-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-only-key
ALGOLIA_ADMIN_API_KEY=your-admin-key

# Grok AI (required for symptom checker)
GROK_API_KEY=your-grok-api-key

# Optional services (can configure later)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
RESEND_API_KEY=
```

## Step 5: Initialize the Database

Run database migrations:

```bash
pnpm db:migrate
```

Seed the database with sample data (optional):

```bash
pnpm db:seed
```

## Step 6: Start Development Servers

### Start all services:

```bash
pnpm dev
```

This starts:
- **Frontend (Next.js):** http://localhost:3000
- **Backend (Payload CMS):** http://localhost:3001/admin

### Or start individually:

```bash
# Frontend only
pnpm dev:web

# Backend only
pnpm dev:cms
```

## Step 7: Create Admin User

On first run, Payload CMS will prompt you to create an admin user:

1. Visit http://localhost:3001/admin
2. Fill in the admin user creation form:
   - Email: admin@verscienta.health
   - Password: (choose a strong password)
   - Name: Admin User
   - Role: Admin

## Step 8: Configure External Services (Optional)

### Algolia Search

1. Sign up at https://www.algolia.com
2. Create a new application
3. Get your App ID and API keys
4. Add to `.env`:
   ```
   NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-key
   ALGOLIA_ADMIN_API_KEY=your-admin-key
   ```
5. Create indices:
   - `verscienta_herbs`
   - `verscienta_formulas`
   - `verscienta_conditions`
   - `verscienta_practitioners`

6. Configure index settings (searchable attributes, facets, etc.)

### Grok AI (xAI)

1. Sign up at https://x.ai/api
2. Get your API key
3. Add to `.env`:
   ```
   GROK_API_KEY=your-grok-api-key
   ```

### Cloudflare Images

1. Sign up at https://cloudflare.com
2. Create an R2 bucket for media storage
3. Get your account credentials
4. Add to `.env`:
   ```
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   CLOUDFLARE_ACCESS_KEY_ID=your-access-key
   CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-key
   CLOUDFLARE_BUCKET_NAME=verscienta-media
   ```

### Cloudflare Turnstile

1. Go to Cloudflare Dashboard > Turnstile
2. Create a new site
3. Add to `.env`:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
   TURNSTILE_SECRET_KEY=your-secret-key
   ```

### Email (Resend)

1. Sign up at https://resend.com
2. Verify your domain
3. Get your API key
4. Add to `.env`:
   ```
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM_EMAIL=noreply@verscienta.health
   ```

## Step 9: Verify Installation

1. **Frontend:** Visit http://localhost:3000
   - Should see the homepage
   - Search should work (if Algolia configured)

2. **Backend:** Visit http://localhost:3001/admin
   - Should see Payload Admin panel
   - Login with your admin credentials
   - Navigate through collections (Herbs, Formulas, etc.)

3. **Database:** Check that tables were created:
   ```bash
   psql -U verscienta -d verscienta_health -c "\dt"
   ```

## Development Workflow

### Creating Content

1. Log in to Payload Admin: http://localhost:3001/admin
2. Navigate to a collection (e.g., Herbs)
3. Click "Create New"
4. Fill in the fields
5. Click "Save"
6. Content automatically syncs to Algolia (if configured)

### Testing Frontend

Visit http://localhost:3000 and test:
- Homepage
- Herb listing: /herbs
- Herb detail: /herbs/[slug]
- Search: /search
- Symptom checker: /symptom-checker (requires Grok AI)
- Practitioner directory: /practitioners

### Running Tests

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# Accessibility tests
pnpm test:a11y
```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

## Troubleshooting

### Database Connection Issues

**Error:** `ECONNREFUSED ::1:5432`

**Solution:**
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check connection string in `.env`
- Verify user permissions

### Payload Admin Not Loading

**Error:** `Invalid session`

**Solution:**
- Clear browser cookies for localhost:3001
- Restart the CMS server: `pnpm dev:cms`
- Check `PAYLOAD_SECRET` in `.env`

### Next.js Build Errors

**Error:** `Module not found: Can't resolve '@/components/...'`

**Solution:**
- Run `pnpm install` again
- Check TypeScript paths in `tsconfig.json`
- Restart the dev server

### Algolia Search Not Working

**Error:** Search returns no results

**Solution:**
- Verify Algolia credentials in `.env`
- Check that indices were created
- Manually trigger reindex: Visit Payload Admin > Herbs > Select All > Bulk Actions > Sync to Algolia

### Grok AI Errors

**Error:** `401 Unauthorized`

**Solution:**
- Verify `GROK_API_KEY` in `.env`
- Check xAI API status: https://status.x.ai
- Ensure you have credits/quota available

## Next Steps

Once your development environment is set up:

1. **Read the Documentation:**
   - [API Documentation](./API.md)
   - [Component Library](./COMPONENTS.md)
   - [Deployment Guide](./DEPLOYMENT.md)

2. **Explore the Codebase:**
   - Frontend: `apps/web/`
   - Backend: `apps/cms/`
   - Shared packages: `packages/`

3. **Start Developing:**
   - Add new features
   - Create custom components
   - Extend Payload collections
   - Integrate additional services

## Getting Help

- **Documentation:** Check `/docs` directory
- **Issues:** https://github.com/your-org/verscienta-health/issues
- **Discussions:** https://github.com/your-org/verscienta-health/discussions

---

**Happy coding!** 🌿
