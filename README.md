# Verscienta Health

> **Versatile Knowledge** - A world-class holistic health platform bridging ancient herbal wisdom with modern science.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![Payload CMS](https://img.shields.io/badge/Payload-3.58.0-blue)
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
│   └── cms/          # Payload CMS 3.58.0 backend
├── packages/
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
- Payload CMS 3.58.0
- PostgreSQL 17+
- Drizzle ORM
- Node.js 20+

**Services:**
- Cloudflare Images (CDN + optimization)
- Algolia (search)
- Grok AI (symptom analysis)
- Cloudflare Turnstile (bot protection)
- Resend (email)

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

The frontend will be available at `http://localhost:3000` and the CMS admin at `http://localhost:3001/admin`.

### Development Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev:web          # Start Next.js frontend only
pnpm dev:cms          # Start Payload CMS only

# Building
pnpm build            # Build all apps
pnpm build:web        # Build Next.js frontend
pnpm build:cms        # Build Payload CMS

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests

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

- [**Comprehensive Implementation Plan**](./VERSCIENTA_HEALTH_COMPREHENSIVE_PLAN.md) - Complete technical specification
- [**Setup Guide**](./docs/SETUP.md) - Detailed installation and configuration
- [**API Documentation**](./docs/API.md) - REST and GraphQL API reference
- [**Component Library**](./docs/COMPONENTS.md) - UI component documentation
- [**Design System**](./docs/DESIGN_SYSTEM.md) - Colors, typography, spacing
- [**Deployment Guide**](./docs/DEPLOYMENT.md) - Production deployment instructions
- [**Migration Guide**](./docs/MIGRATION.md) - Migrating from Drupal

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
- **Authorization**: Role-based access control (User, Herbalist, Practitioner, Editor, Admin)
- **Input Validation**: Zod schemas on all forms and API routes
- **Rate Limiting**: Protection on sensitive endpoints
- **CAPTCHA**: Cloudflare Turnstile on public forms
- **HTTPS**: Enforced in production
- **PII Protection**: Data anonymization before AI processing
- **CSRF/XSS Protection**: Built-in with Next.js and Payload

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
2. Deploy backend (Payload CMS) using `apps/cms/Dockerfile`
3. Deploy frontend (Next.js) using `apps/web/Dockerfile`
4. Configure domains and SSL
5. Run database migrations
6. Create admin user

See [Deployment Quick Start](./DEPLOYMENT_QUICKSTART.md) for step-by-step instructions.

## 🤝 Contributing

This is a proprietary project. For contribution guidelines, please contact the development team.

## 📝 License

Copyright © 2025 Verscienta Health. All rights reserved.

## 🙏 Acknowledgments

- Traditional Chinese Medicine practitioners worldwide
- Western herbalists and ethnobotanists
- Open source community (Next.js, Payload CMS, React, and many more)
- Indigenous knowledge keepers

## 📧 Contact

For questions, support, or partnership inquiries:
- Website: [https://verscienta.com](https://verscienta.com)
- Email: hello@verscienta.com

---

**Built with ❤️ for holistic health practitioners and seekers worldwide.**

*Verscienta: Versatile Knowledge - Bridging ancient wisdom with modern science.*
