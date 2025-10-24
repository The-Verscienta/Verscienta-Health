# Verscienta Health - Setup Guide

Complete guide to setting up the Verscienta Health application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or later
- **pnpm** 9.15.0 or later
- **PostgreSQL** 17 or later
- **Git**

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd verscienta-health
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install dependencies for all packages in the monorepo.

## Step 3: Set Up PostgreSQL Database

1. Create a new PostgreSQL database:

```sql
CREATE DATABASE verscienta_health;
CREATE USER verscienta_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE verscienta_health TO verscienta_user;
```

2. Note your database connection string:

```
postgresql://verscienta_user:your_password@localhost:5432/verscienta_health
```

## Step 4: Configure Environment Variables

### Frontend (Next.js) - `apps/web/.env.local`

Copy the example file and fill in your values:

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CMS_URL=http://localhost:3001
DATABASE_URL=postgresql://verscienta_user:your_password@localhost:5432/verscienta_health

# Generate a secure random string for BETTER_AUTH_SECRET
BETTER_AUTH_SECRET=<generate-with: openssl rand -base64 32>

# Algolia (sign up at https://www.algolia.com/)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
ALGOLIA_ADMIN_KEY=your_admin_key

# Grok AI (sign up at https://x.ai/)
GROK_API_KEY=your_grok_api_key

# Optional: OAuth providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Backend (Strapi CMS) - `apps/strapi-cms/.env`

Copy the example file and fill in your values:

```bash
cd apps/strapi-cms
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required
PORT=3001
DATABASE_URL=postgresql://verscienta_user:your_password@localhost:5432/verscienta_health

# Generate a secure random string for STRAPI_SECRET
STRAPI_SECRET=<generate-with: openssl rand -base64 32>

# Algolia (same credentials as frontend)
ALGOLIA_APP_ID=your_app_id
ALGOLIA_ADMIN_KEY=your_admin_key

FRONTEND_URL=http://localhost:3000
```

## Step 5: Initialize the Database

Run Strapi CMS migrations to set up the database schema:

```bash
cd apps/strapi-cms
pnpm db:push
```

## Step 6: Create Algolia Indexes

1. Sign up for Algolia at https://www.algolia.com/
2. Create the following indexes in your Algolia dashboard:
   - `verscienta_herbs`
   - `verscienta_formulas`
   - `verscienta_conditions`
   - `verscienta_practitioners`
   - `verscienta_modalities`

3. Configure searchable attributes for each index:

For **verscienta_herbs**:

```json
{
  "searchableAttributes": ["title", "scientificName", "description", "commonNames"],
  "attributesForFaceting": [
    "tcmProperties.taste",
    "tcmProperties.temperature",
    "tcmProperties.meridians",
    "tcmProperties.category",
    "westernProperties"
  ]
}
```

Repeat similar configuration for other indexes.

## Step 7: Set Up Grok AI

1. Sign up for Grok AI at https://x.ai/
2. Generate an API key
3. Add the key to your environment variables

## Step 8: Start Development Servers

From the root directory, run:

```bash
pnpm dev
```

This will start both the Next.js frontend (port 3000) and Strapi CMS backend (port 3001).

Alternatively, start them individually:

```bash
# Terminal 1 - Strapi CMS
cd apps/strapi-cms
pnpm dev

# Terminal 2 - Next.js
cd apps/web
pnpm dev
```

## Step 9: Create Admin User

1. Navigate to http://localhost:3001/admin
2. Create your first admin user account
3. This account will have full access to the CMS

## Step 10: Seed Data (Optional)

To seed the database with sample data:

```bash
cd apps/strapi-cms
pnpm seed
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Strapi CMS Admin**: http://localhost:3001/admin
- **Strapi CMS API**: http://localhost:3001/api

## Common Issues and Solutions

### Database Connection Errors

If you see database connection errors:

1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL is correct
3. Ensure the database exists and user has permissions

### Algolia Sync Issues

If content isn't syncing to Algolia:

1. Verify your Algolia credentials
2. Check that indexes exist in Algolia dashboard
3. Ensure ALGOLIA_ADMIN_KEY has write permissions
4. Check Payload CMS logs for sync errors

### Grok AI Errors

If the symptom checker isn't working:

1. Verify your GROK_API_KEY is valid
2. Check you have sufficient API credits
3. Review browser console for error messages

### Port Conflicts

If ports 3000 or 3001 are already in use:

1. Change PORT in `apps/strapi-cms/.env`
2. Update NEXT_PUBLIC_CMS_URL accordingly
3. Restart both servers

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong random secrets for all secret keys
3. Enable SSL/TLS for all connections
4. Use environment-specific database
5. Configure proper CORS settings
6. Enable Cloudflare Turnstile for bot protection
7. Set up proper backup and monitoring

See `DEPLOYMENT.md` for detailed production deployment guide.

## Development Workflow

1. Make changes to code
2. Code is hot-reloaded automatically
3. Test locally on http://localhost:3000
4. Commit changes with descriptive messages
5. Push to your repository

## Useful Commands

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

## Getting Help

- Check the documentation in `/docs`
- Review error logs in the terminal
- Search existing issues on GitHub
- Contact support at support@verscientahealth.com

## Next Steps

1. Explore the Strapi CMS admin panel
2. Create some test herb entries
3. Test the search functionality
4. Try the AI symptom checker
5. Customize the design system
6. Add your own content

Happy developing! 🌿
