# Verscienta Health

> **Versatile Knowledge** - A world-class holistic health platform bridging ancient herbal wisdom with modern science.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![Strapi CMS](https://img.shields.io/badge/Strapi-5.7.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

## 🌿 Overview

Verscienta Health is a comprehensive holistic health platform featuring:

- **15,000+ Herbs** with Traditional Chinese Medicine (TCM) and Western herbalism properties
- **AI-Powered Symptom Checker** using Grok AI (xAI)
- **Advanced Search** with Algolia for instant, faceted results
- **Practitioner Directory** with geo-search and OpenStreetMap integration
- **Herbal Formulas** with precise ingredient quantities and traditional wisdom
- **Multi-language Support** (English, Spanish, Simplified/Traditional Chinese)
- **Comprehensive Safety Data** including contraindications, drug interactions, and toxicity information

## 🏗️ Architecture

### Monorepo Structure

```
verscienta-health/
├── apps/
│   ├── web/          # Next.js 15.5.4 frontend
│   └── strapi-cms/   # Strapi CMS 5.7.0 backend
├── packages/
│   ├── api-types/    # Shared TypeScript type definitions for API
│   ├── api-client/   # Platform-agnostic API client (web/mobile)
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utilities
└── docs/             # Documentation
```

### Technology Stack

**Frontend:**

- Next.js 15.5.4 (App Router)
- TypeScript 5.7+
- Tailwind CSS 4.1.0
- Radix UI + shadcn/ui
- better-auth 1.3.26
- Algolia InstantSearch
- Leaflet + OpenStreetMap

**Backend:**

- Strapi CMS 5.7.0
- PostgreSQL 17+
- Node.js 20+

**Services:**

- Cloudflare Images (CDN + optimization)
- Algolia (search)
- Grok AI (symptom analysis)
- Cloudflare Turnstile (bot protection)
- Resend (email)
- DragonflyDB (high-performance Redis-compatible caching)
- Trefle API (botanical database with 1M+ plants)
- Perenual API (cultivation database with 10,000+ plants)

**Advanced Features:**

- Multi-factor Authentication (TOTP)
- DragonflyDB Caching (self-hosted, 25x faster than Redis)
- Audit Logging System
- Database Optimization (full-text search, geospatial indexes)
- Automated Jobs (cron-based data validation, backups, sitemap generation)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- PostgreSQL 17+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/verscienta-health.git
cd verscienta-health

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up the database
pnpm db:setup

# Start development servers
pnpm dev
```

The frontend will be available at `http://localhost:3000` and the Strapi admin at `http://localhost:3001/admin`.

### Development Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev:web          # Start Next.js frontend only
pnpm dev:cms          # Start Strapi CMS only

# Building
pnpm build            # Build all apps
pnpm build:web        # Build Next.js frontend
pnpm build:cms        # Build Strapi CMS

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests

# Storybook
pnpm storybook        # Run component documentation
pnpm build-storybook  # Build static Storybook

# Code Quality
pnpm lint             # Lint all code
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier

# Database
pnpm db:setup         # Initialize database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed with sample data
pnpm db:studio        # Open Drizzle Studio
```

## 📚 Documentation

### Getting Started

- [**Setup Guide**](./docs/SETUP.md) - Detailed installation and configuration
- [**Comprehensive Implementation Plan**](./VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md) - Complete technical specification
- [**Contributor Onboarding**](./docs/CONTRIBUTOR_ONBOARDING.md) - New contributor guide

### API & Integration

- [**API Reference**](./docs/API_REFERENCE.md) - Complete API documentation
- [**API Integration Examples**](./docs/API_INTEGRATION_EXAMPLES.md) - Code examples in multiple languages
- [**Interactive API Docs**](https://verscienta.com/api-docs) - Swagger UI (live)
- [**Mobile App Development Guide**](./MOBILE_APP_GUIDE.md) - Build iOS, Android & Windows apps

### Development

- [**Contributing Guide**](./CONTRIBUTING.md) - How to contribute
- [**Code of Conduct**](./CODE_OF_CONDUCT.md) - Community guidelines
- [**Storybook**](./docs/STORYBOOK.md) - Interactive component documentation (`pnpm storybook`)
- [**Design System**](./docs/DESIGN_SYSTEM.md) - Colors, typography, spacing

### Features & Configuration

- [**Advanced Features**](./docs/ADVANCED_FEATURES.md) - Caching, MFA, audit logging, automation
- [**DragonflyDB Setup**](./docs/DRAGONFLYDB_SETUP.md) - High-performance caching setup
- [**Plant Data Integrations**](./docs/PLANT_DATA_INTEGRATIONS.md) - Complete guide to Trefle + Perenual with deduplication
  - [Trefle Integration](./docs/TREFLE_INTEGRATION.md) - Botanical database enrichment with 1M+ plants
  - [Perenual Integration](./docs/PERENUAL_INTEGRATION.md) - Cultivation database with 10K+ plants
- [**Enhancements**](./docs/ENHANCEMENTS.md) - Platform enhancements and optimizations
- [**Accessibility**](./docs/ACCESSIBILITY.md) - WCAG 2.1 AA+ compliance guide

### Deployment

- [**Deployment Guide**](./docs/DEPLOYMENT.md) - Production deployment instructions
- [**Deployment Quickstart**](./DEPLOYMENT_QUICKSTART.md) - 30-minute deployment guide
- [**Coolify Deployment**](./COOLIFY_DEPLOYMENT.md) - Self-hosted deployment with Coolify

## 🎨 Design System

Verscienta Health uses a nature-inspired design system with:

- **Earth tones** (primary: sage greens #5d7a5d)
- **TCM accents** (traditional Chinese red #c1272d)
- **Gold highlights** (for verified/premium content #d4a574)
- **Typography**: Inter (sans), Crimson Pro (serif), Noto Serif SC (Chinese)
- **Accessibility**: WCAG 2.1 AA compliant

## 🔑 Key Features

### 1. Comprehensive Herb Database

Each herb entry includes:

- Botanical information (scientific name, family, habitat, cultivation)
- Traditional Chinese Medicine properties (taste, temperature, meridians)
- Western herbalism properties (adaptogen, anti-inflammatory, etc.)
- Active constituents and pharmacology
- Safety information (contraindications, drug interactions, toxicity)
- Dosage and preparation methods
- Cultural and historical significance
- Quality standards and sourcing
- Images, botanical illustrations, and videos

### 2. AI Symptom Checker

Powered by Grok AI:

- Multi-symptom analysis
- Condition suggestions with confidence scores
- Personalized herb recommendations
- Appropriate modality suggestions
- Follow-up questions for better diagnosis
- Medical disclaimers and red flag warnings

### 3. Advanced Search

Algolia-powered search with:

- Instant results as you type
- Faceted filtering (TCM properties, Western properties, parts used, etc.)
- Typo tolerance
- Synonym support
- Geo-search for practitioners
- Search analytics

### 4. Practitioner Directory

Find verified holistic health practitioners:

- Interactive map (OpenStreetMap + Leaflet)
- Filter by modality, distance, specialty
- Practitioner profiles with credentials, bio, pricing
- Reviews and ratings
- Book appointments (optional integration)

### 5. Herbal Formulas

Traditional and modern formulas:

- Precise ingredient quantities and percentages
- Preparation instructions
- Historical context (classical TCM formulas)
- Modern adaptations
- Safety information

## 🔐 Security

- **Authentication**: better-auth with OAuth (Google, GitHub) + email/password
- **Multi-Factor Authentication**: TOTP-based MFA for admin and practitioner accounts
- **Authorization**: Role-based access control (User, Herbalist, Practitioner, Editor, Admin)
- **Audit Logging**: Comprehensive audit trail for all sensitive operations
- **Input Validation**: Zod schemas on all forms and API routes
- **Rate Limiting**: Protection on sensitive endpoints (Redis-based)
- **CAPTCHA**: Cloudflare Turnstile on public forms
- **HTTPS**: Enforced in production
- **PII Protection**: Data anonymization before AI processing
- **CSRF/XSS Protection**: Built-in with Next.js and Payload
- **Database Backups**: Automated daily backups with retention policy

## ♿ Accessibility

- **WCAG 2.1 AA+** compliant
- **Full keyboard navigation**
- **Screen reader optimized** (NVDA, JAWS, VoiceOver, TalkBack)
- **ARIA labels** on all dynamic components
- **Touch-friendly targets** (minimum 44x44px)
- **Automated testing** with Lighthouse CI and axe-core
- See [Accessibility Guide](./docs/ACCESSIBILITY.md) for details

## 📱 Progressive Web App (PWA)

- **Installable** on iOS, Android, and desktop
- **Offline support** with service worker caching
- **App shortcuts** for quick access to key features
- **Push notifications** ready (opt-in)
- **Standalone mode** for app-like experience
- **Optimized caching** for fonts, images, and API responses

## 📲 Mobile App Development

Verscienta Health is ready for native mobile app development with **full type-safe API client** and **shared types** for iOS, Android, and Windows.

**Features:**
- 🔧 **Type-safe API client** (`@verscienta/api-client`) - works with React Native, Expo, Flutter
- 📝 **Shared TypeScript types** (`@verscienta/api-types`) - 100+ type definitions
- 🌐 **CORS configured** for mobile origins (Capacitor, React Native Metro, Expo)
- 🖼️ **Image optimization API** for mobile bandwidth efficiency
- 📡 **Offline sync support** with incremental data updates
- 🔔 **Push notifications** ready (iOS APNs, Android FCM)
- 📱 **App configuration API** for remote feature flags

**Getting Started:**

See the comprehensive [Mobile App Development Guide](./MOBILE_APP_GUIDE.md) for:
- React Native/Expo setup and integration
- Flutter setup with Dart wrapper examples
- Authentication flows (email/password, OAuth, MFA)
- Offline-first architecture patterns
- Push notifications setup
- Complete code examples

**Quick Example (React Native):**

```typescript
import { VerslientaClient } from '@verscienta/api-client'

const api = new VerslientaClient({ baseURL: 'https://verscienta.com' })
const herbs = await api.herbs.list({ page: 1, temperature: 'Warm' })
```

## 🌍 Internationalization

Supported languages:

- English (en)
- Spanish (es)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)

All content is translatable, with special support for Chinese characters and pinyin in herb names.

## 🧪 Testing

### Unit Tests (Vitest)

```bash
pnpm test:unit
```

Tests for utilities, API clients, business logic.

### E2E Tests (Playwright)

```bash
pnpm test:e2e
```

End-to-end tests for critical user flows:

- Herb search and filtering
- Symptom checker flow
- Practitioner directory
- User authentication
- Review submission

### Accessibility Tests

```bash
pnpm test:a11y
```

Automated accessibility testing with axe-core.

### Performance Testing

```bash
# Lighthouse CI (runs in CI/CD)
lhci autorun

# Local Lighthouse audit
pnpm build && pnpm start
# Then run Lighthouse in Chrome DevTools
```

**Performance Targets:**

- Lighthouse Performance: ≥ 90
- Lighthouse Accessibility: ≥ 95
- LCP: < 2.5s
- CLS: < 0.1

## 📊 Analytics

- **Vercel Analytics**: Performance monitoring, Web Vitals
- **Plausible**: Privacy-first user analytics
- **Algolia Analytics**: Search insights
- **Sentry**: Error tracking

## 🚢 Deployment

### Coolify (Self-Hosted)

Verscienta Health is designed to deploy on Coolify, a self-hosted platform:

```bash
# Quick deployment (30 minutes)
See DEPLOYMENT_QUICKSTART.md

# Full deployment guide
See COOLIFY_DEPLOYMENT.md

# Local Docker testing
docker-compose up -d
```

**What you need:**

- Server with Coolify installed
- PostgreSQL 17+ database
- Two domains (verscienta.com, backend.verscienta.com)
- Environment variables configured

**Quick Steps:**

1. Create PostgreSQL database in Coolify
2. Deploy backend (Strapi CMS) using `apps/strapi-cms/Dockerfile`
3. Deploy frontend (Next.js) using `apps/web/Dockerfile`
4. Configure domains and SSL
5. Run database migrations
6. Create admin user

See [Deployment Quick Start](./DEPLOYMENT_QUICKSTART.md) for step-by-step instructions.

## 🌐 Public API

Verscienta Health provides a public API for developers to integrate herbal medicine data into their applications.

**Features:**

- 📖 **15,000+ Herbs** with TCM and Western properties
- 🧪 **Formulas Database** with precise ingredient information
- 🏥 **Health Conditions** with recommended treatments
- 👨‍⚕️ **Practitioner Directory** with location search
- 🤖 **AI Symptom Analysis** (requires API key)
- 🔍 **Full-Text Search** across all content

**Getting Started:**

1. View [Interactive API Documentation](https://verscienta.com/api-docs) (Swagger UI)
2. Read the [API Reference](./docs/API_REFERENCE.md)
3. Check [Integration Examples](./docs/API_INTEGRATION_EXAMPLES.md) (JavaScript, Python, PHP, Ruby)
4. Request an API key at [verscienta.com/developers](https://verscienta.com/developers)

**Rate Limits:**

- Public endpoints: 100 requests per 10 minutes
- Authenticated: 1000 requests per hour
- AI endpoints: 20 requests per 10 minutes

**Quick Example:**

```bash
# Get all herbs with Warm temperature
curl "https://verscienta.com/api/herbs?temperature=Warm&page=1&limit=10"

# Get specific herb details
curl "https://verscienta.com/api/herbs/ginseng"
```

## 🤝 Contributing

We welcome contributions from the community! While Verscienta Health is a proprietary project, we appreciate help in several areas:

**How to Contribute:**

- 📝 **Documentation**: Fix typos, improve clarity, add examples, translate content
- 🐛 **Bug Reports**: Report issues with detailed reproduction steps
- 💡 **Feature Suggestions**: Share ideas for improvements
- 🌿 **Content**: Submit herb information, formulas, or practitioner profiles (with citations)
- 🆘 **Community Support**: Help answer questions and support other users

**Get Started:**

1. Read our [Contributing Guide](./CONTRIBUTING.md)
2. Review the [Code of Conduct](./CODE_OF_CONDUCT.md)
3. Check [Contributor Onboarding](./docs/CONTRIBUTOR_ONBOARDING.md)
4. Find a [good first issue](https://github.com/verscienta/verscienta-health/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
5. Join our [Discord Community](https://discord.gg/verscienta)

**Recognition:**

- Contributors are recognized in our README and release notes
- Significant contributions earn special mentions
- Active contributors may be invited to join the core team

**Questions?**

- GitHub Discussions: https://github.com/verscienta/verscienta-health/discussions
- Email: developers@verscienta.com
- Discord: https://discord.gg/verscienta

## 📝 License

Copyright © 2025 Verscienta Health. All rights reserved.

## 🙏 Acknowledgments

- Traditional Chinese Medicine practitioners worldwide
- Western herbalists and ethnobotanists
- Open source community (Next.js, Strapi CMS, React, and many more)
- Indigenous knowledge keepers

## 📧 Contact

For questions, support, or partnership inquiries:

- Website: [https://verscienta.com](https://verscienta.com)
- Email: hello@verscienta.com

---

**Built with ❤️ for holistic health practitioners and seekers worldwide.**

_Verscienta: Versatile Knowledge - Bridging ancient wisdom with modern science._
