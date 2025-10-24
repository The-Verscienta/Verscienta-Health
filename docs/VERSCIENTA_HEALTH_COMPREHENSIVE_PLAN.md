Verscienta Health - Comprehensive Implementation Plan
Executive Summary
Verscienta Health is a world-class holistic health platform that bridges ancient herbal wisdom with modern science through intuitive, beautiful, and accessible design. This comprehensive plan details the migration from Drupal to a modern stack using Next.js 15.5.4 and Strapi CMS 5.7.0 with PostgreSQL 17+, while preserving and enhancing all existing functionality. Incorporating 2025 trends like gut microbiome optimization, precision medicine via wearables, and sustainable practices (e.g., forest bathing), Verscienta aims to outpace competitors like NCCIH and IFM in depth, personalization, and global reach.
Project Vision
Mission: Empower individuals and healthcare practitioners worldwide with comprehensive, evidence-based knowledge of holistic health practices, fostering informed decision-making and integrative wellness approaches that honor both traditional wisdom and scientific validation.
Name Etymology: Verscienta = vers- (turned/directed) + scientia (knowledge/science) = "Versatile Knowledge" - representing comprehensive, adaptable wisdom encompassing diverse health approaches.

1. Technology Stack
Frontend: Next.js 15.5.4

Framework: Next.js 15.5.4 (App Router)
Language: TypeScript 5.7+
Styling: Tailwind CSS 4.1.0
UI Components: Radix UI + shadcn/ui
Forms: React Hook Form + Zod validation
State Management: Zustand + React Query
Authentication: better-auth 1.3.26
Search UI: Algolia InstantSearch React
Maps: Leaflet + OpenStreetMap (openmaps)
Video: YouTube Embed API
Icons: Phosphor Icons
Fonts: Inter, Crimson Pro, Noto Serif SC
I18N: next-intl (fully implemented, see I18N_IMPLEMENTATION_STATUS.md)

Backend: Strapi CMS 5.7.0

CMS: Strapi CMS 5.7.0
Database: PostgreSQL 17+
ORM: Drizzle ORM (Strapi native)
Storage: Cloudflare Images (for images)
File Management: Strapi's built-in media handling
API: Auto-generated REST + GraphQL
Admin Panel: Strapi Admin UI (React-based)

Infrastructure & Services

Database: PostgreSQL 17+
Search: Algolia (full-text search, faceting, autocomplete)
Image CDN: Cloudflare Images (optimization, transformations, global CDN)
Video: YouTube embeds (no hosting needed)
AI: Grok AI (xAI) - symptom analysis, recommendations
Maps: OpenStreetMap via Leaflet
Bot Protection: Cloudflare Turnstile
Authentication: better-auth 1.3.26 (OAuth, sessions, RBAC)
Caching: Redis (optional, for API caching)
Email: Resend or SendGrid
Analytics: Vercel Analytics or Plausible
Gut Health API: PubChem or MicrobiomeDB for herb-gut interactions
Wearables: Fitbit/Apple Health APIs for personalized data
Trends Monitoring: Web scraping tools (e.g., Puppeteer) for real-time updates

Development Tools

Package Manager: pnpm (monorepo support)
Code Quality: ESLint, Prettier, TypeScript strict mode
Testing: Vitest (unit), Playwright (e2e)
Git Hooks: Husky + lint-staged
CI/CD: GitHub Actions
Deployment: Vercel (frontend) + Railway/Render (backend)

2. Architecture Overview
Monorepo Structure
verscienta-health/
├── apps/
│   ├── web/                      # Next.js 15.5.4 frontend
│   │   ├── app/                  # App Router
│   │   ├── components/           # React components
│   │   ├── lib/                  # Utilities, API clients
│   │   ├── hooks/                # Custom React hooks
│   │   ├── styles/               # Global styles
│   │   ├── public/               # Static assets
│   │   └── types/                # TypeScript types
│   │
│   └── strapi-cms/               # Strapi CMS 5.7.0 backend
│       ├── src/
│       │   ├── collections/      # Content collections
│       │   ├── access/           # Access control
│       │   ├── hooks/            # Strapi hooks
│       │   ├── fields/           # Custom fields
│       │   ├── endpoints/        # Custom API endpoints
│       │   └── server.ts         # Entry point
│       ├── media/                # Uploaded files (local dev)
│       └── config/               # Strapi configuration
│
├── packages/
│   ├── ui/                       # Shared UI components
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Shared utilities
│   └── config/                   # Shared configs (eslint, ts)
│
├── docs/                         # Documentation
├── scripts/                      # Build/deploy scripts
├── .github/                      # GitHub Actions workflows
├── pnpm-workspace.yaml
├── turbo.json                    # Turborepo config
├── package.json
└── README.md

Data Flow
┌─────────────────────────────────────────────────────────────┐
│                     User Browser (Next.js)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  React UI  │  │ Algolia    │  │ YouTube    │            │
│  │            │  │ Search     │  │ Embeds     │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
└────────┼───────────────┼────────────────┼───────────────────┘
         │               │                │
         ▼               ▼                ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   Strapi CMS   │  │    Algolia     │  │  YouTube API   │
│   REST/GraphQL │  │    Search      │  │                │
│      API       │  │    Engine      │  │                │
└───────┬────────┘  └────────────────┘  └────────────────┘
        │
        ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  PostgreSQL    │  │   Cloudflare   │  │    Grok AI     │
│     17+        │  │    Images      │  │     (xAI)      │
└────────────────┘  └────────────────┘  └────────────────┘

3. Content Collections (Strapi CMS)
Collection: Herbs
The most comprehensive collection with 100+ fields organized into logical groups:
1. Basic Information

title (text, required) - Common primary name
slug (text, unique, auto-generated)
description (richText) - Overview and general description
status (select: draft, in_review, peer_reviewed, expert_verified, published)

2. Botanical Information

scientificName (text, required, indexed)
commonNames (array of objects)
name (text)
language (select: English, Chinese Pinyin, Chinese Characters, Spanish, Native American, Other)
region (text, optional)

family (text) - e.g., "Araliaceae"
genus (text)
species (text)
synonyms (array of text) - Alternative scientific names
plantType (select: Herb, Shrub, Tree, Vine, Grass, Fern, Moss, Fungus, Lichen)
nativeRegion (array of text)
habitat (textarea) - Preferred growing conditions
partsUsed (multiSelect: Root, Leaf, Stem, Flower, Seed, Bark, Fruit, Whole Plant, Rhizome, Bulb, Resin)
botanicalDescription (richText) - Detailed physical characteristics

3. Cultivation Details (nested group)

soilType (text)
climateZone (text)
sunlightNeeds (select: Full Sun, Partial Shade, Full Shade)
waterNeeds (select: Low, Moderate, High)
hardinessZone (text)
propagationMethod (textarea)
growingSeason (text)

4. Conservation

conservationStatus (select: Least Concern, Near Threatened, Vulnerable, Endangered, Critically Endangered, Extinct in Wild, Not Evaluated, Data Deficient)
conservationNotes (richText) - IUCN details, overharvesting concerns
citesStatus (checkbox)
citesAppendix (select: Appendix I, II, III, N/A)

5. Traditional Chinese Medicine Properties (nested group)

tcmTaste (multiSelect: Sweet, Bitter, Sour, Pungent, Salty, Bland)
tcmTemperature (select: Hot, Warm, Neutral, Cool, Cold)
tcmMeridians (multiSelect: Lung, Large Intestine, Stomach, Spleen, Heart, Small Intestine, Bladder, Kidney, Pericardium, Triple Burner, Gallbladder, Liver)
tcmFunctions (richText)
tcmCategory (text) - e.g., "Tonifying Herbs - Qi Tonics"
tcmTraditionalUses (richText)

6. Western Herbalism Properties

westernProperties (multiSelect: Adaptogen, Alterative, Analgesic, Anti-inflammatory, Antimicrobial, Antioxidant, Antispasmodic, Astringent, Bitter, Carminative, Demulcent, Diaphoretic, Diuretic, Expectorant, Hepatic, Nervine, Sedative, Stimulant, Tonic, Vulnerary)
therapeuticUses (richText) - Primary medicinal applications
traditionalAmericanUses (richText)
nativeAmericanUses (richText)

7. Active Constituents (array of objects)

compoundName (text)
compoundClass (text) - e.g., "Ginsenosides", "Alkaloids"
percentage (number, optional)
effects (textarea)

8. Pharmacological Effects

pharmacologicalEffects (richText)
gutMicrobiomeImpact (nested group)
microbiotaEffects (richText) - e.g., prebiotic/probiotic potential
studies (array of objects)
title (text)
year (number)
summary (richText)
url (text, URL)
doi (text)

clinicalStudies (array of objects)
title (text)
year (number)
summary (richText)
url (text, URL)
doi (text)
conclusion (textarea)

9. Dosage & Preparation

dosageForms (multiSelect: Tincture, Tea/Infusion, Decoction, Capsule, Tablet, Powder, Extract, Essential Oil, Poultice, Salve, Syrup, Compress)
recommendedDosage (array of objects)
form (select, from dosageForms)
amount (text)
frequency (text)
duration (text)
population (text) - e.g., "Adults", "Children 6-12"
notes (textarea)

preparationMethods (array of objects)
methodType (select: Decoction, Infusion, Tincture, Powder, Poultice, Extract, Oil Infusion)
parts (multiSelect, from partsUsed)
instructions (richText)
time (text)
yield (text)
storage (textarea)

10. Safety Information

contraindications (richText)
drugInteractions (array of objects)
drugName (text)
interactionType (select: Major, Moderate, Minor)
description (textarea)
mechanism (textarea)

sideEffects (richText)
toxicityInfo (nested group)
toxicityLevel (select: None Known, Low, Moderate, High, Severe)
toxicCompounds (text)
toxicDose (text)
toxicSymptoms (richText)
toxicTreatment (richText)

allergenicPotential (select: None Known, Low, Moderate, High)
allergenicNotes (textarea)
safetyWarnings (array of objects)
warningType (select: Toxicity, Allergenic, Overdose, Interaction, Contamination)
severity (select: Low, Moderate, High, Critical)
description (richText)
affectedPopulation (text)

11. Quality & Sourcing

qualityStandards (array of objects)
organization (text) - e.g., "USP", "Chinese Pharmacopoeia"
code (text)
specifications (richText)
testingMethods (textarea)

contaminantTesting (richText) - Heavy metals, pesticides, microbial
adulterationRisks (array of objects)
adulterantName (text)
reason (textarea)
identificationMethod (textarea)
risks (textarea)

sourcingInfo (nested group)
sourcingType (select: Wildcrafted, Cultivated, Both)
organicAvailable (checkbox)
fairTradeAvailable (checkbox)
sustainableHarvest (textarea)
recommendedSuppliers (textarea)
harvestSeason (text)

commercialAvailability (multiSelect: Dried Herb, Powder, Tincture, Extract, Capsules, Tablets, Essential Oil, Fresh, Seeds, Live Plant)
storageRequirements (nested group)
conditions (textarea)
temperature (text)
light (select: Dark, Low Light, Ambient)
humidity (select: Dry, Moderate, Humid)
shelfLife (text)
degradationSigns (textarea)

12. Regulatory Status (array of objects)

country (text)
status (select: Approved, Restricted, Banned, GRAS, Dietary Supplement, Prescription Only)
classification (text)
notes (textarea)

13. Cultural & Historical

culturalSignificance (richText)
historicalTexts (array of objects)
textName (text) - e.g., "Shennong Bencao Jing"
author (text)
year (number)
tradition (select: TCM, Western, Ayurvedic, Native American, Other)
reference (richText)
url (text, URL)

14. Wellness Practices (New Collection)

title (text, required) - e.g., "Forest Bathing", "Vagus Nerve Stimulation"
description (richText) - Overview of practice
trends (multiSelect: Gut Health, Mental Health Tech, Sustainable Wellness, Precision Medicine)
instructions (richText) - Step-by-step guide
evidence (array of objects)
title (text)
year (number)
summary (richText)
url (text, URL)
doi (text)

status (select: draft, in_review, peer_reviewed, expert_verified, published)

17. Security Checklist

 Authentication: better-auth with OAuth + email/password
 Authorization: Role-based access control (RBAC)
 Input Validation: Zod schemas on all forms and API routes
 Rate Limiting: Protect API routes (Grok AI, auth, search)
 CAPTCHA: Cloudflare Turnstile on registration, contact forms
 CSRF Protection: Built into better-auth
 SQL Injection: Protected by Drizzle ORM parameterized queries
 XSS Prevention: React auto-escapes, sanitize rich text with DOMPurify
 HTTPS Only: Enforce in production
 Secure Headers: Set via middleware (CSP, HSTS, X-Frame-Options)
 PII Protection: Anonymize data before sending to Grok AI
 Secrets Management: Environment variables, never commit to Git
 Regular Updates: Dependabot for dependency updates

18. Accessibility (WCAG 2.1 AA)

 Semantic HTML: Proper heading hierarchy, landmarks
 Keyboard Navigation: All interactive elements focusable
 Focus Indicators: Visible focus rings (earth-600)
 Color Contrast: Minimum 4.5:1 for text, 3:1 for large text
 Alt Text: All images have descriptive alt text
 ARIA Labels: Where semantic HTML isn't sufficient
 Form Labels: All inputs have associated labels
 Error Messages: Clear, descriptive validation errors
 Skip Links: Skip to main content
 Screen Reader Testing: Test with NVDA, JAWS, VoiceOver
 Reduced Motion: Respect prefers-reduced-motion

19. Internationalization (i18n)
Next.js i18n Configuration
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  i18n: {
    locales: ['en', 'es', 'zh-CN', 'zh-TW'],
    defaultLocale: 'en',
    localeDetection: true,
  },
}

export default nextConfig

Translation Files
public/locales/
├── en/
│   ├── common.json
│   ├── herbs.json
│   ├── symptom-checker.json
│   └── footer.json
├── es/
│   └── ...
├── zh-CN/
│   └── ...
└── zh-TW/
    └── ...

Status

Fully implemented for en, es, zh-CN, zh-TW (see I18N_IMPLEMENTATION_STATUS.md)
Planned expansion to Hindi, Arabic, French for broader traditions (Ayurveda, Unani)

20. Analytics & Monitoring
Analytics Setup

Vercel Analytics (frontend performance, Web Vitals)
Plausible or Google Analytics 4 (user behavior, privacy-first)
Algolia Analytics (search insights)
Custom Events: Track herb views, formula saves, symptom checker usage, trend engagement (e.g., vagus nerve content)

Error Tracking

Sentry for error monitoring
LogRocket for session replay (optional)

Performance Monitoring

Lighthouse CI in GitHub Actions
Core Web Vitals: LCP, FID, CLS tracking
API Response Times: Monitor Strapi API latency

21. Content Management Workflow
Editorial Workflow

Draft: Herbalist creates new herb entry
In Review: Submit for peer review
Peer Reviewed: Technical expert approves
Expert Verified: Senior herbalist/TCM practitioner verifies
Published: Content goes live
Needs Update: Flagged for revision (new research, corrections)

Content Moderation

Reviews: Moderator approves before publishing
User-Generated Content: Pre-moderation for first 3 posts, then auto-approve
Flagging System: Users can report inappropriate content

22. Backup & Disaster Recovery
Database Backups

Automated Daily Backups: Via managed PostgreSQL provider
Weekly Full Backups: Stored in S3/R2
Point-in-Time Recovery: Available for last 7 days

Media Backups

Cloudflare R2: Durable storage with replication
Versioning: Enable object versioning for accidental deletion recovery

Application Backups

Git: Source code in GitHub
Deployment Snapshots: Vercel/Railway keep deployment history
Database Snapshots: Export full database weekly

23. Future Enhancements (Post-MVP)
Phase 2 (3-6 months post-launch)

 Mobile Apps: React Native iOS/Android apps
 PWA: Full Progressive Web App with offline support
 Advanced AI: Personalized herb recommendations based on user profile
 Telemedicine Integration: Connect with practitioners via video
 E-commerce: Sell vetted herbal products (affiliate or direct)
 Community Forums: User discussions, Q&A
 Herb Garden Planner: Interactive garden planning tool
 Personalized Health Dashboard: Track symptoms, remedies, progress
 Functional Foods: Gummy supplements, pistachio-based nutrition (per Glimpse trends)

Phase 3 (6-12 months)

 API Marketplace: Public API for developers
 White-Label Solution: License platform to institutions
 Research Portal: Partner with universities for clinical trials
 Certification Courses: Online courses for aspiring herbalists
 Multi-language Expansion: Add 10+ languages
 AR Plant Identification: Use phone camera to identify herbs
 Evidence Partnerships: Syndicate NCCIH content; auto-cite PubMed

Phase 6: 2025+ Comprehensiveness (Ongoing)

 Annual Trend Audits: Integrate McKinsey/NIQ trends via cron jobs
 Community-Driven Content: Forums, user-submitted remedies with moderation
 AI Evolution: Predictive wellness plans using wearables/gut data

24. Success Metrics & KPIs
User Engagement

Daily Active Users (DAU)
Session Duration (target: >5 minutes)
Pages per Session (target: >3)
Return Rate (target: >40% within 7 days)

Content Quality

Number of Expert-Verified Herbs (target: 500+)
Average Herb Completeness Score (target: >80%)
User Rating of Content Accuracy (target: >4.5/5)
Trend Coverage Score (target: 90% of McKinsey's top trends)

AI Symptom Checker

Completion Rate (target: >60%)
User Satisfaction (target: >4/5)
Follow-up Actions (herb views, practitioner searches)

Search Performance

Search Success Rate (target: >85% result in click)
Average Search Response Time (target: <200ms)
Top 10 Search Queries

Practitioner Directory

Number of Verified Practitioners (target: 1000+)
Practitioner Profile Completeness (target: >75%)
User-to-Practitioner Connection Rate

Business Metrics

Monthly Recurring Revenue (if applicable)
Conversion Rate (free → paid, if freemium model)
Customer Acquisition Cost (CAC)
Lifetime Value (LTV)
Global Reach (target: users from 100+ countries via i18n)

25. Implementation Timeline
Phase 1: Foundation (Weeks 1-4)

Week 1: Project setup, monorepo structure, design system
Week 2: Strapi CMS collections, authentication with better-auth
Week 3: Frontend pages (homepage, herb listing, herb detail)
Week 4: Algolia search integration, basic testing

Phase 2: Core Features (Weeks 5-8)

Week 5: Formula system, condition pages, modality pages
Week 6: Grok AI integration (symptom checker)
Week 7: Practitioner directory with map
Week 8: Reviews, ratings, user profiles

Phase 3: Polish & Launch Prep (Weeks 9-12)

Week 9: Media optimization (Cloudflare Images), video embeds
Week 10: Security hardening, Turnstile, rate limiting
Week 11: i18n setup, translation infrastructure
Week 12: Testing (E2E, accessibility), bug fixes, documentation

Phase 4: Content Population (Weeks 13-16)

Week 13-14: Migrate Drupal content, data cleanup
Week 15: Create sample formulas, conditions, modalities
Week 16: Recruit practitioners, seed practitioner directory

Phase 5: Launch (Week 17)

Beta testing with select users
Performance optimization
Marketing materials preparation
Soft launch → Full launch

Phase 6: 2025+ Comprehensiveness (Ongoing)

Annual trend audits (gut health, mental health tech)
Community-driven content (forums, user insights)
AI-driven predictive plans with wearables

Total Estimated Time: 17 weeks (~4 months) for MVP; ongoing for trends

26. Team & Resources
Recommended Team (MVP)

Full-Stack Developer(s): 1-2 (Next.js + Strapi CMS)
UI/UX Designer: 1 (part-time or contract)
Content Manager: 1 (herbalist with technical knowledge)
QA Tester: 1 (part-time)
DevOps/Infrastructure: 1 (part-time or outsourced)

Budget Estimates (Monthly)
Development:

Personnel: $15,000 - $30,000 (varies by location, seniority)

Infrastructure:

Vercel Pro: $20/month
Railway/Render: $20-50/month
PostgreSQL (managed): $25-100/month
Algolia: $1-200/month (based on usage)
Cloudflare Images: $5-50/month
Grok AI (xAI): Pay-per-use (~$0.01 per 1K tokens)
Domain & SSL: $15/year
Email (Resend): $20/month

Total Infrastructure (MVP): ~$150-500/month

27. Risk Mitigation
Technical Risks

Risk
Mitigation

Grok AI API changes
Implement adapter pattern, easy to swap providers

Algolia cost scaling
Set up monitoring, implement caching, consider Meilisearch alternative

Database performance
Index optimization, read replicas, query optimization

Cloudflare Images limits
Set up fallback to local storage if needed

Outdated Content
Monthly trend cron jobs; user flagging system

Business Risks

Risk
Mitigation

Content accuracy concerns
Rigorous peer review process, expert verification

Legal/liability issues
Clear disclaimers, consult legal counsel, terms of service

User adoption
SEO optimization, content marketing, practitioner partnerships

Competitor differentiation
Focus on AI integration, comprehensive TCM+Western blend

Operational Risks

Risk
Mitigation

Team turnover
Documentation, code comments, knowledge sharing

Data loss
Automated backups, disaster recovery plan

Security breach
Regular audits, penetration testing, security best practices

Scalability issues
Horizontal scaling plan, load testing, performance monitoring

28. Conclusion
This comprehensive plan outlines a world-class holistic health platform that:
✅ Preserves all Drupal functionality while modernizing the stack✅ Implements cutting-edge AI with Grok for symptom analysis✅ Provides exceptional search via Algolia✅ Delivers beautiful, accessible UX with the established design system✅ Scales efficiently with Next.js 15.5.4 + Strapi CMS 5.7.0✅ Integrates seamlessly with Cloudflare Images, YouTube, OpenMaps✅ Ensures security with better-auth, Turnstile, proper validation✅ Supports growth with internationalization, PWA, mobile-ready design✅ Leads in 2025 trends with gut health, precision medicine, and sustainable wellness
Verscienta Health will become the most trusted and comprehensive platform for holistic health knowledge, bridging ancient wisdom with modern science through elegant, accessible design and powerful technology.

Ready to begin implementation? Start with Phase 1: Foundation, setting up the monorepo, design system, and core Strapi CMS collections.
Last Updated: 2025-10-18Version: 1.1.0
