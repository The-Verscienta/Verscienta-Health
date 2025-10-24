# Verscienta Health - Quick Start Guide

Get up and running in 10 minutes! ⚡

## TL;DR

```bash
# 1. Clone and install
git clone https://github.com/your-org/verscienta-health.git
cd verscienta-health
pnpm install

# 2. Set up database
createdb verscienta_health
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# 3. Initialize and start
pnpm db:migrate
pnpm dev

# 4. Visit
# Frontend: http://localhost:3000
# Admin: http://localhost:3001/admin
```

## Prerequisites

You need:

- Node.js 20+
- PostgreSQL 17+
- pnpm 9+

Don't have them? Install:

```bash
# Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# pnpm
npm install -g pnpm

# PostgreSQL (macOS)
brew install postgresql@17

# PostgreSQL (Ubuntu)
sudo apt install postgresql-17
```

## 5-Minute Setup

### 1. Clone & Install (1 min)

```bash
git clone https://github.com/your-org/verscienta-health.git
cd verscienta-health
pnpm install
```

### 2. Database Setup (2 min)

```bash
# Create database
createdb verscienta_health

# Or with Docker
docker run --name verscienta-pg \
  -e POSTGRES_DB=verscienta_health \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 -d postgres:17
```

### 3. Environment Variables (1 min)

```bash
cp .env.example .env
```

Edit `.env` - minimum required:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/verscienta_health
STRAPI_SECRET=your-secret-here-make-it-long-and-random
AUTH_SECRET=another-secret-at-least-32-characters-long
```

### 4. Initialize & Run (1 min)

```bash
# Run migrations
pnpm db:migrate

# Start everything
pnpm dev
```

**Done!** 🎉

- Frontend: http://localhost:3000
- Backend Admin: http://localhost:3001/admin

## First Steps After Setup

### 1. Create Admin User

Visit http://localhost:3001/admin and create your first admin account.

### 2. Add Sample Data (Optional)

```bash
pnpm db:seed
```

This creates:

- 50 sample herbs
- 10 sample formulas
- 5 sample practitioners
- 20 sample conditions

### 3. Test the Features

- **Browse Herbs:** http://localhost:3000/herbs
- **Search:** http://localhost:3000/search (requires Algolia - see below)
- **Symptom Checker:** http://localhost:3000/symptom-checker (requires Grok AI)
- **Practitioners:** http://localhost:3000/practitioners

## Optional: Add External Services

### Algolia Search (5 min)

1. Sign up: https://www.algolia.com (free tier available)
2. Create app and get API keys
3. Add to `.env`:
   ```
   NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-key
   ALGOLIA_ADMIN_API_KEY=your-admin-key
   ```
4. Restart: `pnpm dev`

### Grok AI Symptom Checker (3 min)

1. Sign up: https://x.ai/api
2. Get API key
3. Add to `.env`:
   ```
   GROK_API_KEY=your-grok-api-key
   ```
4. Restart: `pnpm dev`

### Cloudflare Images (5 min)

1. Sign up: https://cloudflare.com
2. Create R2 bucket
3. Get credentials
4. Add to `.env`:
   ```
   CLOUDFLARE_ACCOUNT_ID=your-id
   CLOUDFLARE_ACCESS_KEY_ID=your-key
   CLOUDFLARE_SECRET_ACCESS_KEY=your-secret
   CLOUDFLARE_BUCKET_NAME=verscienta-media
   ```
5. Restart: `pnpm dev`

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different ports
PORT=3005 pnpm dev:web
PORT=3006 pnpm dev:cms
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Module Not Found

```bash
# Clean install
rm -rf node_modules
pnpm install
```

## Development Commands

```bash
# Start all
pnpm dev

# Start frontend only
pnpm dev:web

# Start Strapi CMS only
pnpm dev:strapi-cms

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

## Project Structure

```
verscienta-health/
├── apps/
│   ├── web/          # Next.js frontend
│   └── strapi-cms/   # Strapi CMS backend
├── packages/
│   ├── ui/           # Shared components
│   └── types/        # Shared types
├── docs/             # Documentation
└── .env              # Your environment variables
```

## What's Next?

1. **Read the Docs:**
   - [Comprehensive Plan](./VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md)
   - [Setup Guide](./docs/SETUP.md)
   - [API Docs](./docs/API.md)

2. **Explore Admin:**
   - Create herbs, formulas, conditions
   - Upload images
   - Manage users

3. **Customize:**
   - Modify design system in `apps/web/app/globals.css`
   - Add new Strapi collections in `apps/strapi-cms/src/collections/`
   - Create new Next.js pages in `apps/web/app/`

## Getting Help

- 📚 **Full Documentation:** [VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md](./VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md)
- 🐛 **Issues:** https://github.com/your-org/verscienta-health/issues
- 💬 **Discussions:** https://github.com/your-org/verscienta-health/discussions

---

**Happy building!** 🌿✨
