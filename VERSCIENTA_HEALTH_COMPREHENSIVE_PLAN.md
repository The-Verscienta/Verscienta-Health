# Verscienta Health - Comprehensive Implementation Plan

## Executive Summary

**Verscienta Health** is a world-class holistic health platform that bridges ancient herbal wisdom with modern science through intuitive, beautiful, and accessible design. This comprehensive plan details the migration from Drupal to a modern stack using Next.js 15.5.4 and Payload CMS 3.58.0 with PostgreSQL 17+, while preserving and enhancing all existing functionality.

## Project Vision

**Mission:** Empower individuals and healthcare practitioners worldwide with comprehensive, evidence-based knowledge of holistic health practices, fostering informed decision-making and integrative wellness approaches that honor both traditional wisdom and scientific validation.

**Name Etymology:** Verscienta = _vers-_ (turned/directed) + _scientia_ (knowledge/science) = "Versatile Knowledge" - representing comprehensive, adaptable wisdom encompassing diverse health approaches.

---

## 1. Technology Stack

### Frontend: Next.js 15.5.4

- **Framework:** Next.js 15.5.4 (App Router)
- **Language:** TypeScript 5.7+
- **Styling:** Tailwind CSS 4.1.0
- **UI Components:** Radix UI + shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand + React Query
- **Authentication:** better-auth 1.3.26
- **Search UI:** Algolia InstantSearch React
- **Maps:** Leaflet + OpenStreetMap (openmaps)
- **Video:** YouTube Embed API
- **Icons:** Phosphor Icons
- **Fonts:** Inter, Crimson Pro, Noto Serif SC

### Backend: Payload CMS 3.58.0

- **CMS:** Payload CMS 3.58.0
- **Database:** PostgreSQL 17+
- **ORM:** Drizzle ORM (Payload native)
- **Storage:** Cloudflare Images (for images)
- **File Management:** Payload's built-in media handling
- **API:** Auto-generated REST + GraphQL
- **Admin Panel:** Payload Admin UI (React-based)

### Infrastructure & Services

- **Database:** PostgreSQL 17+
- **Search:** Algolia (full-text search, faceting, autocomplete)
- **Image CDN:** Cloudflare Images (optimization, transformations, global CDN)
- **Video:** YouTube embeds (no hosting needed)
- **AI:** Grok AI (xAI) - symptom analysis, recommendations
- **Maps:** OpenStreetMap via Leaflet
- **Bot Protection:** Cloudflare Turnstile
- **Authentication:** better-auth 1.3.26 (OAuth, sessions, RBAC)
- **Caching:** Redis (optional, for API caching)
- **Email:** Resend or SendGrid
- **Analytics:** Vercel Analytics or Plausible

### Development Tools

- **Package Manager:** pnpm (monorepo support)
- **Code Quality:** ESLint, Prettier, TypeScript strict mode
- **Testing:** Vitest (unit), Playwright (e2e)
- **Git Hooks:** Husky + lint-staged
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (frontend) + Railway/Render (backend)

---

## 2. Architecture Overview

### Monorepo Structure

```
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
│   └── cms/                      # Payload CMS 3.58.0 backend
│       ├── src/
│       │   ├── collections/      # Content collections
│       │   ├── access/           # Access control
│       │   ├── hooks/            # Payload hooks
│       │   ├── fields/           # Custom fields
│       │   ├── endpoints/        # Custom API endpoints
│       │   └── server.ts         # Entry point
│       ├── media/                # Uploaded files (local dev)
│       └── payload.config.ts     # Payload configuration
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
```

### Data Flow

```
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
│   Payload CMS  │  │    Algolia     │  │  YouTube API   │
│   REST/GraphQL │  │    Search      │  │                │
│      API       │  │    Engine      │  │                │
└───────┬────────┘  └────────────────┘  └────────────────┘
        │
        ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  PostgreSQL    │  │   Cloudflare   │  │    Grok AI     │
│     17+        │  │    Images      │  │     (xAI)      │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## 3. Content Collections (Payload CMS)

### Collection: Herbs

The most comprehensive collection with 100+ fields organized into logical groups:

#### 1. Basic Information

- `title` (text, required) - Common primary name
- `slug` (text, unique, auto-generated)
- `description` (richText) - Overview and general description
- `status` (select: draft, in_review, peer_reviewed, expert_verified, published)

#### 2. Botanical Information

- `scientificName` (text, required, indexed)
- `commonNames` (array of objects)
  - `name` (text)
  - `language` (select: English, Chinese Pinyin, Chinese Characters, Spanish, Native American, Other)
  - `region` (text, optional)
- `family` (text) - e.g., "Araliaceae"
- `genus` (text)
- `species` (text)
- `synonyms` (array of text) - Alternative scientific names
- `plantType` (select: Herb, Shrub, Tree, Vine, Grass, Fern, Moss, Fungus, Lichen)
- `nativeRegion` (array of text)
- `habitat` (textarea) - Preferred growing conditions
- `partsUsed` (multiSelect: Root, Leaf, Stem, Flower, Seed, Bark, Fruit, Whole Plant, Rhizome, Bulb, Resin)
- `botanicalDescription` (richText) - Detailed physical characteristics

#### 3. Cultivation Details (nested group)

- `soilType` (text)
- `climateZone` (text)
- `sunlightNeeds` (select: Full Sun, Partial Shade, Full Shade)
- `waterNeeds` (select: Low, Moderate, High)
- `hardinessZone` (text)
- `propagationMethod` (textarea)
- `growingSeason` (text)

#### 4. Conservation

- `conservationStatus` (select: Least Concern, Near Threatened, Vulnerable, Endangered, Critically Endangered, Extinct in Wild, Not Evaluated, Data Deficient)
- `conservationNotes` (richText) - IUCN details, overharvesting concerns
- `citesStatus` (checkbox)
- `citesAppendix` (select: Appendix I, II, III, N/A)

#### 5. Traditional Chinese Medicine Properties (nested group)

- `tcmTaste` (multiSelect: Sweet, Bitter, Sour, Pungent, Salty, Bland)
- `tcmTemperature` (select: Hot, Warm, Neutral, Cool, Cold)
- `tcmMeridians` (multiSelect: Lung, Large Intestine, Stomach, Spleen, Heart, Small Intestine, Bladder, Kidney, Pericardium, Triple Burner, Gallbladder, Liver)
- `tcmFunctions` (richText)
- `tcmCategory` (text) - e.g., "Tonifying Herbs - Qi Tonics"
- `tcmTraditionalUses` (richText)

#### 6. Western Herbalism Properties

- `westernProperties` (multiSelect: Adaptogen, Alterative, Analgesic, Anti-inflammatory, Antimicrobial, Antioxidant, Antispasmodic, Astringent, Bitter, Carminative, Demulcent, Diaphoretic, Diuretic, Expectorant, Hepatic, Nervine, Sedative, Stimulant, Tonic, Vulnerary)
- `therapeuticUses` (richText) - Primary medicinal applications
- `traditionalAmericanUses` (richText)
- `nativeAmericanUses` (richText)

#### 7. Active Constituents (array of objects)

- `compoundName` (text)
- `compoundClass` (text) - e.g., "Ginsenosides", "Alkaloids"
- `percentage` (number, optional)
- `effects` (textarea)

#### 8. Pharmacological Effects

- `pharmacologicalEffects` (richText)
- `clinicalStudies` (array of objects)
  - `title` (text)
  - `year` (number)
  - `summary` (richText)
  - `url` (text, URL)
  - `doi` (text)
  - `conclusion` (textarea)

#### 9. Dosage & Preparation

- `dosageForms` (multiSelect: Tincture, Tea/Infusion, Decoction, Capsule, Tablet, Powder, Extract, Essential Oil, Poultice, Salve, Syrup, Compress)
- `recommendedDosage` (array of objects)
  - `form` (select, from dosageForms)
  - `amount` (text)
  - `frequency` (text)
  - `duration` (text)
  - `population` (text) - e.g., "Adults", "Children 6-12"
  - `notes` (textarea)
- `preparationMethods` (array of objects)
  - `methodType` (select: Decoction, Infusion, Tincture, Powder, Poultice, Extract, Oil Infusion)
  - `parts` (multiSelect, from partsUsed)
  - `instructions` (richText)
  - `time` (text)
  - `yield` (text)
  - `storage` (textarea)

#### 10. Safety Information

- `contraindications` (richText)
- `drugInteractions` (array of objects)
  - `drugName` (text)
  - `interactionType` (select: Major, Moderate, Minor)
  - `description` (textarea)
  - `mechanism` (textarea)
- `sideEffects` (richText)
- `toxicityInfo` (nested group)
  - `toxicityLevel` (select: None Known, Low, Moderate, High, Severe)
  - `toxicCompounds` (text)
  - `toxicDose` (text)
  - `toxicSymptoms` (richText)
  - `toxicTreatment` (richText)
- `allergenicPotential` (select: None Known, Low, Moderate, High)
- `allergenicNotes` (textarea)
- `safetyWarnings` (array of objects)
  - `warningType` (select: Toxicity, Allergenic, Overdose, Interaction, Contamination)
  - `severity` (select: Low, Moderate, High, Critical)
  - `description` (richText)
  - `affectedPopulation` (text)

#### 11. Quality & Sourcing

- `qualityStandards` (array of objects)
  - `organization` (text) - e.g., "USP", "Chinese Pharmacopoeia"
  - `code` (text)
  - `specifications` (richText)
  - `testingMethods` (textarea)
- `contaminantTesting` (richText) - Heavy metals, pesticides, microbial
- `adulterationRisks` (array of objects)
  - `adulterantName` (text)
  - `reason` (textarea)
  - `identificationMethod` (textarea)
  - `risks` (textarea)
- `sourcingInfo` (nested group)
  - `sourcingType` (select: Wildcrafted, Cultivated, Both)
  - `organicAvailable` (checkbox)
  - `fairTradeAvailable` (checkbox)
  - `sustainableHarvest` (textarea)
  - `recommendedSuppliers` (textarea)
  - `harvestSeason` (text)
- `commercialAvailability` (multiSelect: Dried Herb, Powder, Tincture, Extract, Capsules, Tablets, Essential Oil, Fresh, Seeds, Live Plant)
- `storageRequirements` (nested group)
  - `conditions` (textarea)
  - `temperature` (text)
  - `light` (select: Dark, Low Light, Ambient)
  - `humidity` (select: Dry, Moderate, Humid)
  - `shelfLife` (text)
  - `degradationSigns` (textarea)

#### 12. Regulatory Status (array of objects)

- `country` (text)
- `status` (select: Approved, Restricted, Banned, GRAS, Dietary Supplement, Prescription Only)
- `classification` (text)
- `notes` (textarea)

#### 13. Cultural & Historical

- `culturalSignificance` (richText)
- `historicalTexts` (array of objects)
  - `textName` (text) - e.g., "Shennong Bencao Jing"
  - `author` (text)
  - `year` (number)
  - `tradition` (select: TCM, Western, Ayurvedic, Native American, Other)
  - `reference` (richText)
  - `url` (text, optional)
- `ethnobotanicalNotes` (richText)
- `folkloreMyth` (richText)

#### 14. Media & Visual

- `featuredImage` (upload, relationship to Media collection)
- `images` (array, relationship to Media collection)
  - Auto-uploaded to Cloudflare Images
  - Types: Whole Plant, Flower, Leaf, Root, Bark, Seed, Dried Form, Habitat, Preparation
- `botanicalIllustrations` (array, relationship to Media collection)
- `distributionMaps` (array, relationship to Media collection)
- `videos` (array of objects)
  - `title` (text)
  - `youtubeId` (text) - Just the video ID, not full URL
  - `description` (textarea, optional)
- `geographicCoordinates` (array of objects)
  - `latitude` (number)
  - `longitude` (number)
  - `location` (text) - Description of this point

#### 15. Cross-References (Relationships)

- `relatedSpecies` (relationship: Herb, hasMany)
- `substituteHerbs` (relationship: Herb, hasMany)
- `similarTcmHerbs` (relationship: Herb, hasMany)
- `similarWesternHerbs` (relationship: Herb, hasMany)
- `conditionsTreated` (relationship: Condition, hasMany)
- `formulas` (relationship: Formula, hasMany) - Reverse relationship

#### 16. User & Practitioner Data

- `practitionerNotes` (array of objects)
  - `practitionerName` (text)
  - `credentials` (text)
  - `tradition` (select: TCM, Western Herbalism, Naturopathy, Ayurveda, Other)
  - `noteText` (richText)
  - `date` (date)
- `caseStudies` (array of objects)
  - `caseTitle` (text)
  - `condition` (relationship: Condition)
  - `protocol` (richText)
  - `duration` (text)
  - `outcome` (richText)
  - `practitioner` (text)
  - `date` (date)
- `averageRating` (number, calculated from reviews)
- `reviewCount` (number, calculated)

#### 17. Search & Taxonomy

- `searchTags` (array of text) - For Algolia
- `tcmCategoryTags` (array of text)
- `keywords` (array of text)

#### 18. Metadata

- `herbId` (text, unique, auto-generated) - Format: H-0001
- `alternativeIds` (array of objects)
  - `system` (select: USDA PLANTS, Chinese Pharmacopoeia, ITIS, GRIN, COL, Other)
  - `value` (text)
  - `url` (text, optional)
- `dataSource` (textarea)
- `contributors` (array of objects)
  - `name` (text)
  - `role` (select: Author, Researcher, Herbalist, Translator, Reviewer, Editor)
  - `credentials` (text)
  - `affiliation` (text)
  - `contributionDate` (date)
- `references` (array of objects)
  - `type` (select: Book, Journal Article, Website, Traditional Text, Database, Expert Consultation)
  - `title` (text)
  - `author` (text)
  - `year` (number)
  - `publisher` (text, optional)
  - `isbn` (text, optional)
  - `doi` (text, optional)
  - `url` (text, optional)
  - `pages` (text, optional)
  - `notes` (textarea, optional)
- `version` (text) - Semantic versioning (e.g., 1.0.0)
- `peerReviewStatus` (select: Draft, In Review, Peer Reviewed, Expert Verified, Published, Needs Update)
- `peerReviewers` (array, relationship to Users)
- `reviewDate` (date)
- `nextReviewDue` (date)
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)
- `createdBy` (relationship: User)
- `updatedBy` (relationship: User)

**Access Control:**

- Anonymous: View published herbs only
- Authenticated: View published, save favorites
- Herbalist: Create, edit own entries
- Peer Reviewer: Review submissions
- Editor: Edit all, publish
- Admin: Full access

---

### Collection: Formulas

Traditional herbal formulas with precise ingredient quantities.

#### Fields:

- `title` (text, required) - Formula name (e.g., "Four Gentlemen Decoction")
- `slug` (text, unique, auto-generated)
- `description` (richText) - Detailed description, history, context
- `shortDescription` (textarea) - Brief summary (1-2 sentences)
- `featuredImage` (upload, relationship to Media)
- `ingredients` (array of objects) **CRITICAL**
  - `herb` (relationship: Herb, required)
  - `quantity` (number, decimal, required)
  - `unit` (select: g, mg, oz, ml, tsp, tbsp, drops, parts, required)
  - `percentage` (number, decimal, optional) - Auto-calculated if possible
  - `role` (select: Chief Herb, Deputy Herb, Assistant Herb, Envoy Herb) - Traditional TCM role
- `totalWeight` (number, decimal, optional)
- `totalWeightUnit` (select: g, mg, oz, ml, tsp, tbsp)
- `preparationInstructions` (richText) - How to prepare
- `dosage` (richText) - Recommended dosage and frequency
- `useCases` (array of text) - Conditions/situations this addresses
- `relatedConditions` (relationship: Condition, hasMany)
- `tradition` (select: TCM, Ayurveda, Western Herbalism, Native American, Other)
- `category` (text) - e.g., "Qi Tonifying", "Blood Nourishing"
- `historicalText` (text) - Source text if classical formula
- `modernAdaptations` (richText) - Modern uses or modifications
- `contraindications` (richText)
- `sideEffects` (richText)
- `status` (select: Draft, Published)
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)
- `createdBy` (relationship: User)

**Payload Hooks:**

- `beforeChange`: Auto-calculate percentages if totalWeight is set
- `beforeChange`: Validate that ingredient quantities sum to totalWeight (warning if mismatch)
- `afterChange`: Sync to Algolia search index

---

### Collection: Conditions

Health conditions that herbs/formulas can address.

#### Fields:

- `title` (text, required) - Condition name
- `slug` (text, unique, auto-generated)
- `description` (richText) - Overview of the condition
- `featuredImage` (upload)
- `symptoms` (array of text) - Common symptoms
- `severity` (select: Mild, Moderate, Severe, Life-threatening)
- `category` (select: Digestive, Respiratory, Cardiovascular, Musculoskeletal, Nervous System, Immune, Endocrine, Skin, Mental/Emotional, Other)
- `tcmPattern` (text) - TCM diagnostic pattern (e.g., "Spleen Qi Deficiency")
- `westernDiagnosis` (text) - Western medical name/ICD code
- `prevalence` (textarea) - How common it is
- `conventionalTreatments` (richText) - Standard medical approaches
- `complementaryApproaches` (richText) - Holistic/integrative options
- `relatedHerbs` (relationship: Herb, hasMany)
- `relatedFormulas` (relationship: Formula, hasMany)
- `relatedSymptoms` (relationship: Symptom, hasMany)
- `preventionTips` (richText)
- `lifestyleRecommendations` (richText)
- `dietaryAdvice` (richText)
- `whenToSeekHelp` (richText) - Red flags requiring medical attention
- `status` (select: Draft, Published)
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)

---

### Collection: Symptoms

Individual symptoms for the symptom checker.

#### Fields:

- `title` (text, required) - Symptom name
- `slug` (text, unique, auto-generated)
- `description` (richText) - What this symptom is
- `category` (select: Physical, Mental/Emotional, Digestive, Respiratory, Pain, Skin, Sleep, Energy, Other)
- `severity` (multiSelect: Mild, Moderate, Severe)
- `duration` (multiSelect: Acute (<1 week), Subacute (1-4 weeks), Chronic (>4 weeks))
- `relatedConditions` (relationship: Condition, hasMany)
- `relatedHerbs` (relationship: Herb, hasMany)
- `tcmInterpretation` (richText) - TCM perspective on this symptom
- `westernInterpretation` (richText) - Western medical perspective
- `redFlags` (richText) - When this symptom indicates emergency
- `commonCauses` (array of text)
- `status` (select: Draft, Published)
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)

---

### Collection: Modalities

Different healing modalities (TCM, Ayurveda, etc.).

#### Fields:

- `title` (text, required) - Modality name
- `slug` (text, unique, auto-generated)
- `description` (richText) - What this modality is
- `featuredImage` (upload)
- `shortDescription` (textarea)
- `history` (richText) - Historical background
- `principles` (richText) - Core principles and philosophy
- `diagnosticMethods` (richText) - How practitioners assess patients
- `treatmentModalities` (array of text) - E.g., "Acupuncture", "Herbal Medicine"
- `excelsAt` (array of text) - Conditions this modality excels at treating
- `benefits` (array of objects)
  - `benefit` (text)
  - `description` (textarea, optional)
- `relatedConditions` (relationship: Condition, hasMany)
- `relatedHerbs` (relationship: Herb, hasMany)
- `trainingRequirements` (richText) - How to become a practitioner
- `certificationBodies` (array of text)
- `researchEvidence` (richText) - Scientific studies and evidence
- `safetyConsiderations` (richText)
- `typicalSession` (richText) - What to expect in a session
- `costRange` (text) - Typical cost information
- `status` (select: Draft, Published)
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)

---

### Collection: Practitioners

Verified practitioners users can find and contact.

#### Fields:

- `name` (text, required)
- `slug` (text, unique, auto-generated)
- `email` (email, required)
- `phone` (text)
- `website` (text, URL)
- `profileImage` (upload)
- `bio` (richText) - Professional biography
- `credentials` (array of text) - Certifications, degrees
- `yearsExperience` (number)
- `practiceType` (select: Solo, Group Practice, Clinic, Hospital, Online Only)
- `modalities` (relationship: Modality, hasMany)
- `specialties` (array of text) - Specific areas of expertise
- `languagesSpoken` (array of text)
- `address` (nested group)
  - `street` (text)
  - `city` (text)
  - `state` (text)
  - `zipCode` (text)
  - `country` (text)
  - `latitude` (number, auto-geocoded)
  - `longitude` (number, auto-geocoded)
- `serviceArea` (text) - E.g., "50 mile radius", "California only"
- `acceptsInsurance` (checkbox)
- `insuranceProviders` (array of text, conditional on acceptsInsurance)
- `offersVirtualConsults` (checkbox)
- `bookingUrl` (text, URL, optional)
- `pricing` (nested group)
  - `initialConsult` (number, optional)
  - `followUp` (number, optional)
  - `currency` (select: USD, EUR, GBP, CAD, AUD)
  - `notes` (textarea) - Additional pricing info
- `availability` (richText) - General availability info
- `treatmentApproach` (richText) - Philosophy and methods
- `verificationStatus` (select: Pending, Verified, Suspended)
- `verifiedDate` (date)
- `featured` (checkbox) - Featured practitioner
- `averageRating` (number, calculated)
- `reviewCount` (number, calculated)
- `status` (select: Active, Inactive)
- `user` (relationship: User, optional) - If they have a user account
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)

**Payload Hooks:**

- `beforeChange`: Geocode address to lat/lng using OpenStreetMap Nominatim API
- `afterChange`: Sync to Algolia with geolocation data

---

### Collection: Reviews

User reviews for herbs, formulas, practitioners, etc.

#### Fields:

- `rating` (number, 1-5, required)
- `title` (text, optional)
- `comment` (richText, required)
- `reviewedEntityType` (select: Herb, Formula, Practitioner, Modality, required)
- `reviewedEntityId` (text, required) - ID of the entity being reviewed
- `helpful` (number, default: 0) - Helpful vote count
- `verified` (checkbox) - Verified purchase/visit
- `author` (relationship: User, required)
- `authorName` (text) - Display name
- `moderationStatus` (select: Pending, Approved, Rejected, Flagged)
- `moderatorNotes` (textarea)
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)

**Access Control:**

- Anonymous: View approved reviews only
- Authenticated: Submit reviews, vote helpful
- Moderator: Approve/reject reviews
- Admin: Full access

---

### Collection: Grok Insights

AI-generated insights from Grok AI (symptom analysis, recommendations).

#### Fields:

- `title` (text, auto-generated summary)
- `slug` (text, unique, auto-generated)
- `input` (json) - Original user input (symptoms, questions)
- `analysis` (richText) - AI-generated analysis
- `recommendations` (array of objects)
  - `type` (select: Herb, Formula, Modality, Practitioner, Lifestyle)
  - `entityId` (text, optional) - Link to specific entity
  - `reasoning` (textarea)
  - `confidence` (number, 0-100)
- `followUpQuestions` (array of text)
- `disclaimers` (richText) - Auto-added medical disclaimers
- `relatedHerbs` (relationship: Herb, hasMany)
- `relatedConditions` (relationship: Condition, hasMany)
- `sessionId` (text) - To group multi-turn conversations
- `user` (relationship: User, optional) - If logged in
- `grokModel` (text) - Which Grok model was used
- `tokensUsed` (number) - Cost tracking
- `createdAt` (datetime, auto)

**Privacy:**

- Personal health information is anonymized before sending to Grok
- Users can delete their insights
- Admins can view aggregated analytics only

---

### Collection: Media

Centralized media management (uploaded to Cloudflare Images).

#### Fields:

- `alt` (text, required) - Alt text for accessibility
- `filename` (text, auto)
- `mimeType` (text, auto)
- `filesize` (number, auto)
- `width` (number, auto)
- `height` (number, auto)
- `cloudflareId` (text) - Cloudflare Images ID
- `cloudflareUrl` (text) - CDN URL
- `caption` (textarea, optional)
- `credit` (text, optional) - Photo credit
- `license` (select: Public Domain, CC0, CC BY, CC BY-SA, CC BY-NC, All Rights Reserved, Other)
- `tags` (array of text) - For organization
- `createdAt` (datetime, auto)
- `uploadedBy` (relationship: User)

**Payload Plugin:**

- Use `@payloadcms/plugin-cloud-storage` configured for Cloudflare Images
- Auto-generate responsive variants (thumbnail, medium, large, full)

---

### Collection: Users

User accounts with role-based access control.

#### Fields (managed by better-auth + Payload):

- `email` (email, required, unique)
- `name` (text)
- `profileImage` (upload, optional)
- `role` (select: User, Herbalist, Practitioner, Peer Reviewer, Editor, Admin)
- `emailVerified` (checkbox)
- `provider` (select: Email, Google, GitHub) - OAuth provider
- `providerId` (text) - External ID
- `preferences` (nested group)
  - `language` (select: en, es, zh-CN, zh-TW)
  - `theme` (select: light, dark, system)
  - `newsletter` (checkbox)
- `savedHerbs` (relationship: Herb, hasMany)
- `savedFormulas` (relationship: Formula, hasMany)
- `savedPractitioners` (relationship: Practitioner, hasMany)
- `lastLogin` (datetime)
- `createdAt` (datetime, auto)
- `updatedAt` (datetime, auto)

**Roles & Permissions:**

- **User**: View content, save favorites, submit reviews
- **Herbalist**: Create herb/formula entries, add notes
- **Practitioner**: Manage practitioner profile, respond to reviews
- **Peer Reviewer**: Review/approve herb entries
- **Editor**: Edit all content, manage media
- **Admin**: Full system access, user management

---

## 4. Design System Implementation

Based on `DESIGN-SYSTEM.md`, implement the following design tokens in Tailwind CSS:

### Tailwind Config (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Earth tones (Primary brand)
        earth: {
          50: '#f5f8f5',
          100: '#e6ede6',
          200: '#cdd9cd',
          300: '#adbfad',
          400: '#8da58d',
          500: '#6d8a6d',
          600: '#5d7a5d', // Primary green
          700: '#4d6a4d',
          800: '#3d5a3d',
          900: '#2d4a2d',
          950: '#1a2e1a',
        },
        // Sage (Secondary)
        sage: {
          50: '#f3f9f4',
          100: '#e7f3e9',
          200: '#c8dbcd',
          300: '#a9c2b1',
          400: '#8aaa95',
          500: '#6b9279',
          600: '#527a5f', // Primary sage
          700: '#426650',
          800: '#365340',
          900: '#2a4030',
          950: '#1e2d20',
        },
        // TCM Red (accent)
        tcm: {
          100: '#ffe5e6',
          500: '#d63031',
          600: '#c1272d',
        },
        // Gold (premium/verified)
        gold: {
          100: '#faf4ed',
          500: '#e0b589',
          600: '#d4a574',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Crimson Pro', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        chinese: ['Noto Serif SC', 'serif'],
      },
      boxShadow: {
        earth: '0 10px 15px -3px rgba(93, 122, 93, 0.15)',
        sage: '0 10px 15px -3px rgba(82, 122, 95, 0.15)',
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}

export default config
```

### Global CSS (app/globals.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Crimson+Pro:wght@400;600;700&family=Noto+Serif+SC:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }

  * {
    @apply border-gray-200;
  }

  body {
    @apply bg-white font-sans text-gray-900 antialiased;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply text-earth-900 font-serif;
  }
}

@layer components {
  /* Button variants */
  .btn-primary {
    @apply bg-earth-600 hover:bg-earth-700 rounded-lg px-6 py-3 font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md;
  }

  .btn-secondary {
    @apply bg-sage-100 hover:bg-sage-200 text-sage-900 border-sage-300 rounded-lg border-2 px-6 py-3 font-semibold transition-all duration-150;
  }

  .btn-outline {
    @apply hover:bg-earth-50 text-earth-600 border-earth-600 rounded-lg border-2 bg-transparent px-6 py-3 font-semibold transition-all duration-150;
  }

  /* Card variants */
  .card-standard {
    @apply rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg;
  }

  .card-feature {
    @apply from-earth-50 to-sage-50 border-earth-200 rounded-xl border-2 bg-gradient-to-br p-8 shadow-lg;
  }

  .card-elevated {
    @apply rounded-2xl bg-white p-8 shadow-xl;
  }

  /* Input styles */
  .input-standard {
    @apply focus:ring-earth-600 rounded-md border border-gray-300 bg-white px-4 py-2.5 focus:border-transparent focus:ring-2;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### Component Examples

#### HerbCard Component

```tsx
// components/cards/HerbCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { Herb } from '@/types/payload'

interface HerbCardProps {
  herb: Herb
  variant?: 'standard' | 'feature' | 'elevated'
}

export function HerbCard({ herb, variant = 'standard' }: HerbCardProps) {
  const cardClass =
    variant === 'standard'
      ? 'card-standard'
      : variant === 'feature'
        ? 'card-feature'
        : 'card-elevated'

  return (
    <Link href={`/herbs/${herb.slug}`}>
      <div className={cardClass}>
        {herb.featuredImage && (
          <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={herb.featuredImage.cloudflareUrl}
              alt={herb.featuredImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <h3 className="text-earth-900 mb-2 text-xl font-bold">{herb.title}</h3>

        <p className="mb-3 text-sm italic text-gray-600">{herb.scientificName}</p>

        <p className="mb-4 line-clamp-3 text-sm text-gray-700">{herb.description}</p>

        {/* TCM Properties */}
        {herb.tcmProperties && (
          <div className="mb-4 flex flex-wrap gap-2">
            {herb.tcmProperties.tcmTemperature && (
              <span className="bg-tcm-100 text-tcm-600 rounded-full px-3 py-1 text-xs font-semibold">
                {herb.tcmProperties.tcmTemperature}
              </span>
            )}
            {herb.tcmProperties.tcmTaste?.slice(0, 2).map((taste) => (
              <span
                key={taste}
                className="bg-earth-100 text-earth-700 rounded-full px-3 py-1 text-xs font-semibold"
              >
                {taste}
              </span>
            ))}
          </div>
        )}

        {/* Western Properties */}
        {herb.westernProperties && herb.westernProperties.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {herb.westernProperties.slice(0, 3).map((prop) => (
              <span key={prop} className="bg-sage-100 text-sage-800 rounded-full px-2 py-1 text-xs">
                {prop}
              </span>
            ))}
          </div>
        )}

        {/* Conservation warning */}
        {herb.conservationStatus &&
          ['Endangered', 'Critically Endangered'].includes(herb.conservationStatus) && (
            <div className="mt-4 rounded border-l-4 border-amber-500 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-900">⚠️ {herb.conservationStatus}</p>
            </div>
          )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-earth-600 hover:text-earth-700 text-sm font-medium">
            View Details →
          </span>

          {herb.averageRating && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gold-600">★</span>
              <span className="font-semibold">{herb.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({herb.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
```

---

## 5. Frontend Structure (Next.js 15.5.4)

### App Router Pages

```
app/
├── layout.tsx                      # Root layout with providers
├── page.tsx                        # Homepage
├── (marketing)/
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   └── faq/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── verify-email/page.tsx
│   └── profile/page.tsx
├── herbs/
│   ├── page.tsx                    # Herb listing (grid + filters)
│   └── [slug]/
│       ├── page.tsx                # Individual herb detail
│       └── loading.tsx
├── formulas/
│   ├── page.tsx                    # Formula listing
│   └── [slug]/page.tsx             # Formula detail
├── conditions/
│   ├── page.tsx                    # Condition listing
│   └── [slug]/page.tsx             # Condition detail
├── modalities/
│   ├── page.tsx                    # Modality listing
│   └── [slug]/page.tsx             # Modality detail
├── practitioners/
│   ├── page.tsx                    # Practitioner directory with map
│   └── [slug]/page.tsx             # Practitioner profile
├── symptom-checker/
│   ├── page.tsx                    # AI symptom checker flow
│   └── results/page.tsx            # Grok AI results
├── search/
│   └── page.tsx                    # Algolia search page
├── api/
│   ├── auth/
│   │   └── [...auth]/route.ts      # better-auth API routes
│   ├── grok/
│   │   ├── symptom-analysis/route.ts   # Grok AI analysis
│   │   └── follow-ups/route.ts          # Follow-up questions
│   ├── algolia/
│   │   ├── sync/route.ts           # Sync Payload → Algolia
│   │   └── search/route.ts         # Search proxy (optional)
│   ├── geocode/route.ts            # OpenStreetMap geocoding
│   └── media/
│       └── upload/route.ts         # Upload to Cloudflare Images
└── admin/
    └── [[...rest]]/page.tsx        # Proxy to Payload Admin UI
```

### Component Structure

```
components/
├── layout/
│   ├── Header.tsx                  # Top navigation
│   ├── Footer.tsx                  # Footer with links
│   ├── Navigation.tsx              # Main nav menu
│   ├── MobileMenu.tsx              # Mobile hamburger menu
│   └── Breadcrumbs.tsx             # Breadcrumb navigation
├── auth/
│   ├── LoginForm.tsx               # Login form
│   ├── RegisterForm.tsx            # Registration form
│   ├── UserMenu.tsx                # User dropdown menu
│   └── ProtectedRoute.tsx          # Auth guard HOC
├── cards/
│   ├── HerbCard.tsx                # Herb preview card
│   ├── FormulaCard.tsx             # Formula card
│   ├── ConditionCard.tsx           # Condition card
│   ├── ModalityCard.tsx            # Modality card
│   ├── PractitionerCard.tsx        # Practitioner card
│   └── ReviewCard.tsx              # Review display
├── search/
│   ├── SearchBar.tsx               # Algolia search input
│   ├── SearchResults.tsx           # Search results display
│   ├── SearchFilters.tsx           # Faceted filters
│   ├── InstantSearch.tsx           # Algolia InstantSearch wrapper
│   └── Pagination.tsx              # Pagination controls
├── symptom-checker/
│   ├── SymptomSelector.tsx         # Multi-step symptom form
│   ├── FollowUpQuestions.tsx       # Dynamic follow-up Q&A
│   ├── GrokResults.tsx             # AI analysis display
│   └── RecommendationCard.tsx      # Individual recommendation
├── forms/
│   ├── ContactForm.tsx             # Contact us form
│   ├── ReviewForm.tsx              # Submit review
│   └── TurnstileWidget.tsx         # Cloudflare Turnstile CAPTCHA
├── maps/
│   ├── PractitionerMap.tsx         # Leaflet map with markers
│   ├── MapMarker.tsx               # Custom map marker
│   └── MapFilters.tsx              # Distance/modality filters
├── media/
│   ├── ResponsiveImage.tsx         # Cloudflare Images with srcset
│   ├── ImageGallery.tsx            # Lightbox gallery
│   └── YouTubeEmbed.tsx            # YouTube video embed
├── ui/                             # shadcn/ui components
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── toast.tsx
│   ├── tabs.tsx
│   ├── accordion.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── skeleton.tsx
│   └── ...
└── providers/
    ├── AuthProvider.tsx            # better-auth context
    ├── QueryProvider.tsx           # React Query provider
    ├── ThemeProvider.tsx           # Dark mode provider
    └── ToastProvider.tsx           # Toast notifications
```

### Lib & Utilities

```
lib/
├── payload.ts                      # Payload CMS client
├── algolia.ts                      # Algolia search client
├── better-auth.ts                  # better-auth configuration
├── grok.ts                         # Grok AI client
├── cloudflare-images.ts            # Cloudflare Images helper
├── geocoding.ts                    # OpenStreetMap Nominatim client
├── validation.ts                   # Zod schemas
├── rate-limit.ts                   # Rate limiting utility
├── cache.ts                        # Redis cache wrapper (optional)
├── utils.ts                        # General utilities
└── constants.ts                    # App constants
```

### Types

```typescript
// types/payload.ts (auto-generated from Payload)
export interface Herb {
  id: string
  title: string
  slug: string
  scientificName: string
  commonNames: Array<{
    name: string
    language: string
    region?: string
  }>
  featuredImage?: Media
  tcmProperties?: {
    tcmTaste?: string[]
    tcmTemperature?: string
    tcmMeridians?: string[]
    // ...
  }
  // ... all other fields
}

export interface Formula {
  id: string
  title: string
  slug: string
  ingredients: Array<{
    herb: Herb | string
    quantity: number
    unit: string
    percentage?: number
    role?: string
  }>
  // ...
}

export interface Practitioner {
  id: string
  name: string
  slug: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    latitude?: number
    longitude?: number
  }
  modalities: Modality[]
  // ...
}

// types/grok.ts
export interface GrokSymptomAnalysisRequest {
  symptoms: string[]
  duration?: string
  severity?: string
  additionalInfo?: string
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface GrokSymptomAnalysisResponse {
  analysis: string
  possibleConditions: Array<{
    name: string
    confidence: number
    reasoning: string
  }>
  recommendedHerbs: Array<{
    herbId: string
    herbName: string
    reasoning: string
    confidence: number
  }>
  recommendedModalities: string[]
  followUpQuestions: string[]
  disclaimers: string
  redFlags: string[]
}
```

---

## 6. Backend Structure (Payload CMS 3.58.0)

### Directory Structure

```
apps/cms/
├── src/
│   ├── collections/
│   │   ├── Herbs.ts                # Herb collection config
│   │   ├── Formulas.ts             # Formula collection
│   │   ├── Conditions.ts           # Conditions
│   │   ├── Symptoms.ts             # Symptoms
│   │   ├── Modalities.ts           # Modalities
│   │   ├── Practitioners.ts        # Practitioners
│   │   ├── Reviews.ts              # Reviews
│   │   ├── GrokInsights.ts         # AI insights
│   │   ├── Media.ts                # Media files
│   │   └── Users.ts                # Users
│   ├── access/
│   │   ├── isAdmin.ts              # Admin-only access
│   │   ├── isAdminOrEditor.ts
│   │   ├── isAdminOrSelf.ts
│   │   └── isPublished.ts          # Published content only
│   ├── hooks/
│   │   ├── algoliaSync.ts          # Sync to Algolia after save
│   │   ├── geocodeAddress.ts       # Auto-geocode practitioner addresses
│   │   ├── calculatePercentages.ts # Auto-calc formula percentages
│   │   ├── generateSlug.ts         # Auto-generate slugs
│   │   └── uploadToCloudflare.ts   # Upload images to Cloudflare
│   ├── fields/
│   │   ├── slug.ts                 # Reusable slug field
│   │   ├── richText.ts             # Configured rich text field
│   │   └── status.ts               # Status field with workflow
│   ├── endpoints/
│   │   ├── algoliaReindex.ts       # POST /api/algolia/reindex
│   │   ├── exportData.ts           # GET /api/export/herbs (CSV)
│   │   └── importData.ts           # POST /api/import/herbs (CSV)
│   ├── plugins/
│   │   └── cloudStorage.ts         # Cloudflare Images plugin config
│   ├── payload.config.ts           # Main Payload config
│   └── server.ts                   # Express server entry
├── .env.example
├── package.json
├── tsconfig.json
└── drizzle.config.ts               # Drizzle ORM config
```

### Payload Configuration (payload.config.ts)

```typescript
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { cloudflareR2Adapter } from '@payloadcms/plugin-cloud-storage/cloudflare-r2'
import path from 'path'

// Import collections
import { Herbs } from './collections/Herbs'
import { Formulas } from './collections/Formulas'
import { Conditions } from './collections/Conditions'
import { Symptoms } from './collections/Symptoms'
import { Modalities } from './collections/Modalities'
import { Practitioners } from './collections/Practitioners'
import { Reviews } from './collections/Reviews'
import { GrokInsights } from './collections/GrokInsights'
import { Media } from './collections/Media'
import { Users } from './collections/Users'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Verscienta Health',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  collections: [
    Herbs,
    Formulas,
    Conditions,
    Symptoms,
    Modalities,
    Practitioners,
    Reviews,
    GrokInsights,
    Media,
    Users,
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  typescript: {
    outputFile: path.resolve(__dirname, '../web/types/payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    cloudStorage({
      collections: {
        media: {
          adapter: cloudflareR2Adapter({
            accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
            accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
            secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
            bucket: process.env.CLOUDFLARE_BUCKET_NAME,
          }),
        },
      },
    }),
  ],
  rateLimit: {
    trustProxy: true,
    max: 2000,
  },
  cors: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
})
```

### Example Collection: Herbs (src/collections/Herbs.ts)

```typescript
import { CollectionConfig } from 'payload/types'
import { isAdmin, isAdminOrEditor } from '../access'
import { algoliaSync } from '../hooks/algoliaSync'
import { generateSlug } from '../hooks/generateSlug'

export const Herbs: CollectionConfig = {
  slug: 'herbs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'scientificName', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'editor') return true
      return { status: { equals: 'published' } }
    },
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [generateSlug('title')],
    afterChange: [algoliaSync('herbs')],
  },
  fields: [
    // 1. Basic Information
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Common Name',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Overview Description',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'in_review' },
        { label: 'Peer Reviewed', value: 'peer_reviewed' },
        { label: 'Expert Verified', value: 'expert_verified' },
        { label: 'Published', value: 'published' },
        { label: 'Needs Update', value: 'needs_update' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },

    // 2. Botanical Information
    {
      name: 'botanicalInfo',
      type: 'group',
      label: 'Botanical Information',
      fields: [
        {
          name: 'scientificName',
          type: 'text',
          required: true,
          index: true,
          label: 'Scientific Name',
        },
        {
          name: 'commonNames',
          type: 'array',
          label: 'Common Names',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'language',
              type: 'select',
              required: true,
              options: [
                { label: 'English', value: 'en' },
                { label: 'Chinese (Pinyin)', value: 'zh-pinyin' },
                { label: 'Chinese (Characters)', value: 'zh' },
                { label: 'Spanish', value: 'es' },
                { label: 'Native American', value: 'native' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'region',
              type: 'text',
              label: 'Region/Culture',
            },
          ],
        },
        {
          name: 'family',
          type: 'text',
          label: 'Botanical Family',
        },
        {
          name: 'genus',
          type: 'text',
        },
        {
          name: 'species',
          type: 'text',
        },
        {
          name: 'synonyms',
          type: 'array',
          label: 'Scientific Synonyms',
          fields: [
            {
              name: 'synonym',
              type: 'text',
            },
          ],
        },
        {
          name: 'plantType',
          type: 'select',
          options: ['Herb', 'Shrub', 'Tree', 'Vine', 'Grass', 'Fern', 'Moss', 'Fungus', 'Lichen'],
        },
        {
          name: 'nativeRegion',
          type: 'array',
          fields: [
            {
              name: 'region',
              type: 'text',
            },
          ],
        },
        {
          name: 'habitat',
          type: 'textarea',
          label: 'Preferred Habitat',
        },
        {
          name: 'partsUsed',
          type: 'select',
          hasMany: true,
          options: [
            'Root',
            'Leaf',
            'Stem',
            'Flower',
            'Seed',
            'Bark',
            'Fruit',
            'Whole Plant',
            'Rhizome',
            'Bulb',
            'Resin',
          ],
        },
        {
          name: 'botanicalDescription',
          type: 'richText',
          label: 'Detailed Botanical Description',
        },
      ],
    },

    // 3. TCM Properties
    {
      name: 'tcmProperties',
      type: 'group',
      label: 'Traditional Chinese Medicine',
      fields: [
        {
          name: 'tcmTaste',
          type: 'select',
          hasMany: true,
          options: ['Sweet', 'Bitter', 'Sour', 'Pungent', 'Salty', 'Bland'],
        },
        {
          name: 'tcmTemperature',
          type: 'select',
          options: ['Hot', 'Warm', 'Neutral', 'Cool', 'Cold'],
        },
        {
          name: 'tcmMeridians',
          type: 'select',
          hasMany: true,
          options: [
            'Lung',
            'Large Intestine',
            'Stomach',
            'Spleen',
            'Heart',
            'Small Intestine',
            'Bladder',
            'Kidney',
            'Pericardium',
            'Triple Burner',
            'Gallbladder',
            'Liver',
          ],
        },
        {
          name: 'tcmFunctions',
          type: 'richText',
          label: 'TCM Functions',
        },
        {
          name: 'tcmCategory',
          type: 'text',
          label: 'TCM Category',
        },
        {
          name: 'tcmTraditionalUses',
          type: 'richText',
        },
      ],
    },

    // 4. Western Herbalism
    {
      name: 'westernProperties',
      type: 'select',
      hasMany: true,
      label: 'Western Herbal Properties',
      options: [
        'Adaptogen',
        'Alterative',
        'Analgesic',
        'Anti-inflammatory',
        'Antimicrobial',
        'Antioxidant',
        'Antispasmodic',
        'Astringent',
        'Bitter',
        'Carminative',
        'Demulcent',
        'Diaphoretic',
        'Diuretic',
        'Expectorant',
        'Hepatic',
        'Nervine',
        'Sedative',
        'Stimulant',
        'Tonic',
        'Vulnerary',
      ],
    },
    {
      name: 'therapeuticUses',
      type: 'richText',
      label: 'Therapeutic Uses',
    },

    // 5. Safety
    {
      name: 'safetyInfo',
      type: 'group',
      label: 'Safety Information',
      fields: [
        {
          name: 'contraindications',
          type: 'richText',
        },
        {
          name: 'drugInteractions',
          type: 'array',
          fields: [
            {
              name: 'drugName',
              type: 'text',
              required: true,
            },
            {
              name: 'interactionType',
              type: 'select',
              options: ['Major', 'Moderate', 'Minor'],
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'sideEffects',
          type: 'richText',
        },
        {
          name: 'toxicityLevel',
          type: 'select',
          options: ['None Known', 'Low', 'Moderate', 'High', 'Severe'],
        },
      ],
    },

    // 6. Conservation
    {
      name: 'conservationStatus',
      type: 'select',
      options: [
        'Least Concern',
        'Near Threatened',
        'Vulnerable',
        'Endangered',
        'Critically Endangered',
        'Extinct in Wild',
        'Not Evaluated',
        'Data Deficient',
      ],
      admin: {
        position: 'sidebar',
      },
    },

    // 7. Media
    {
      name: 'images',
      type: 'array',
      label: 'Additional Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'imageType',
          type: 'select',
          options: [
            'Whole Plant',
            'Flower',
            'Leaf',
            'Root',
            'Bark',
            'Seed',
            'Dried Form',
            'Habitat',
            'Preparation',
          ],
        },
      ],
    },
    {
      name: 'videos',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'youtubeId',
          type: 'text',
          required: true,
          label: 'YouTube Video ID',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },

    // 8. Relationships
    {
      name: 'relatedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
      label: 'Related Species',
    },
    {
      name: 'conditionsTreated',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
    },

    // 9. Reviews & Ratings
    {
      name: 'averageRating',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    // 10. Metadata
    {
      name: 'herbId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === 'create' && !value) {
              // Generate H-0001, H-0002, etc.
              // Implementation would query last herb and increment
              return 'H-0001'
            }
            return value
          },
        ],
      },
    },
    {
      name: 'peerReviewStatus',
      type: 'select',
      options: [
        'Draft',
        'In Review',
        'Peer Reviewed',
        'Expert Verified',
        'Published',
        'Needs Update',
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
```

### Payload Hooks

#### Algolia Sync Hook (src/hooks/algoliaSync.ts)

```typescript
import { CollectionAfterChangeHook } from 'payload/types'
import algoliasearch from 'algoliasearch'

const client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!)

export const algoliaSync = (indexName: string): CollectionAfterChangeHook => {
  return async ({ doc, operation }) => {
    const index = client.initIndex(`verscienta_${indexName}`)

    if (operation === 'create' || operation === 'update') {
      // Only index published content
      if (doc.status === 'published') {
        const searchableDoc = {
          objectID: doc.id,
          title: doc.title,
          slug: doc.slug,
          description: doc.description,
          // Add all searchable fields
          // Flatten nested objects for search
          scientificName: doc.botanicalInfo?.scientificName,
          commonNames: doc.botanicalInfo?.commonNames?.map((cn: any) => cn.name) || [],
          westernProperties: doc.westernProperties || [],
          tcmTaste: doc.tcmProperties?.tcmTaste || [],
          tcmTemperature: doc.tcmProperties?.tcmTemperature,
          conservationStatus: doc.conservationStatus,
          // Add image URLs
          imageUrl: doc.featuredImage?.cloudflareUrl,
          // Timestamps
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }

        await index.saveObject(searchableDoc)
      } else {
        // Remove from index if not published
        await index.deleteObject(doc.id).catch(() => {
          // Object might not exist, ignore error
        })
      }
    } else if (operation === 'delete') {
      await index.deleteObject(doc.id).catch(() => {})
    }
  }
}
```

#### Geocoding Hook (src/hooks/geocodeAddress.ts)

```typescript
import { CollectionBeforeChangeHook } from 'payload/types'
import axios from 'axios'

export const geocodeAddress: CollectionBeforeChangeHook = async ({ data, operation }) => {
  if (operation === 'create' || operation === 'update') {
    if (data.address && (!data.address.latitude || !data.address.longitude)) {
      const { street, city, state, zipCode, country } = data.address
      const query = `${street}, ${city}, ${state} ${zipCode}, ${country}`

      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query,
            format: 'json',
            limit: 1,
          },
          headers: {
            'User-Agent': 'Verscienta Health App',
          },
        })

        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0]
          data.address.latitude = parseFloat(lat)
          data.address.longitude = parseFloat(lon)
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        // Continue without geocoding rather than fail
      }
    }
  }

  return data
}
```

---

## 7. Integration: Algolia Search

### Configuration

```typescript
// lib/algolia.ts
import algoliasearch from 'algoliasearch'

export const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
)

export const ALGOLIA_INDICES = {
  HERBS: 'verscienta_herbs',
  FORMULAS: 'verscienta_formulas',
  CONDITIONS: 'verscienta_conditions',
  MODALITIES: 'verscienta_modalities',
  PRACTITIONERS: 'verscienta_practitioners',
} as const
```

### Index Configuration (in Algolia dashboard or via API)

```javascript
// Herbs Index Settings
{
  searchableAttributes: [
    'title',
    'scientificName',
    'commonNames',
    'description',
    'therapeuticUses',
    'westernProperties',
    'tcmFunctions',
  ],
  attributesForFaceting: [
    'searchable(westernProperties)',
    'searchable(tcmTaste)',
    'searchable(tcmTemperature)',
    'searchable(tcmMeridians)',
    'searchable(partsUsed)',
    'searchable(plantType)',
    'searchable(conservationStatus)',
  ],
  customRanking: [
    'desc(averageRating)',
    'desc(reviewCount)',
    'desc(updatedAt)',
  ],
  attributesToHighlight: [
    'title',
    'scientificName',
    'description',
  ],
  hitsPerPage: 24,
  typoTolerance: true,
  ranking: [
    'typo',
    'geo',
    'words',
    'filters',
    'proximity',
    'attribute',
    'exact',
    'custom',
  ],
}

// Practitioners Index (with geo-search)
{
  searchableAttributes: [
    'name',
    'bio',
    'specialties',
    'credentials',
  ],
  attributesForFaceting: [
    'searchable(modalities)',
    'searchable(practiceType)',
    'searchable(languagesSpoken)',
    'searchable(verificationStatus)',
  ],
  customRanking: [
    'desc(averageRating)',
    'desc(verificationStatus)',
    'desc(featured)',
  ],
  // Enable geo-search
  attributesToRetrieve: [
    '*',
    '_geoloc',
  ],
}
```

### Search Component (app/search/page.tsx)

```tsx
'use client'

import { InstantSearch, SearchBox, Hits, RefinementList, Configure } from 'react-instantsearch'
import { algoliaClient, ALGOLIA_INDICES } from '@/lib/algolia'
import { HerbCard } from '@/components/cards/HerbCard'

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-earth-900 mb-8 font-serif text-4xl font-bold">
        Search Holistic Health Database
      </h1>

      <InstantSearch searchClient={algoliaClient} indexName={ALGOLIA_INDICES.HERBS}>
        <Configure hitsPerPage={24} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-standard sticky top-24">
              <h3 className="mb-4 text-lg font-semibold">Refine Results</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-medium">Western Properties</h4>
                  <RefinementList attribute="westernProperties" limit={10} />
                </div>

                <div>
                  <h4 className="mb-2 font-medium">TCM Temperature</h4>
                  <RefinementList attribute="tcmTemperature" />
                </div>

                <div>
                  <h4 className="mb-2 font-medium">TCM Taste</h4>
                  <RefinementList attribute="tcmTaste" />
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Parts Used</h4>
                  <RefinementList attribute="partsUsed" limit={8} />
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Conservation Status</h4>
                  <RefinementList attribute="conservationStatus" />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <SearchBox
              placeholder="Search herbs by name, uses, properties..."
              classNames={{
                root: 'mb-8',
                form: 'relative',
                input: 'input-standard w-full text-lg py-4 pl-12',
                submit: 'absolute left-4 top-1/2 -translate-y-1/2',
                reset: 'absolute right-4 top-1/2 -translate-y-1/2',
              }}
            />

            <Hits
              hitComponent={({ hit }) => <HerbCard herb={hit as any} />}
              classNames={{
                root: '',
                list: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
                item: '',
              }}
            />
          </div>
        </div>
      </InstantSearch>
    </div>
  )
}
```

---

## 8. Integration: Grok AI (xAI)

### Grok Client (lib/grok.ts)

```typescript
import axios from 'axios'
import { GrokSymptomAnalysisRequest, GrokSymptomAnalysisResponse } from '@/types/grok'

const GROK_API_URL = 'https://api.x.ai/v1'
const GROK_API_KEY = process.env.GROK_API_KEY!

export class GrokClient {
  private async chat(messages: Array<{ role: string; content: string }>) {
    const response = await axios.post(
      `${GROK_API_URL}/chat/completions`,
      {
        model: 'grok-beta',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.choices[0].message.content
  }

  async analyzeSymptoms(request: GrokSymptomAnalysisRequest): Promise<GrokSymptomAnalysisResponse> {
    const systemPrompt = `You are a knowledgeable holistic health assistant with expertise in Traditional Chinese Medicine, Western herbalism, and integrative medicine.

Your role is to:
1. Analyze symptoms described by users
2. Suggest possible conditions (with confidence levels)
3. Recommend relevant herbs and natural remedies
4. Suggest appropriate healing modalities
5. Ask relevant follow-up questions
6. Always include important disclaimers about seeking professional medical advice

IMPORTANT: Always remind users that this is informational only and not a substitute for professional medical diagnosis and treatment.

Respond in JSON format with the following structure:
{
  "analysis": "string - detailed analysis",
  "possibleConditions": [
    {
      "name": "string",
      "confidence": number (0-100),
      "reasoning": "string"
    }
  ],
  "recommendedHerbs": [
    {
      "herbName": "string",
      "reasoning": "string",
      "confidence": number (0-100)
    }
  ],
  "recommendedModalities": ["string"],
  "followUpQuestions": ["string"],
  "redFlags": ["string - any serious symptoms requiring immediate medical attention"]
}
`

    const userMessage = `
Symptoms: ${request.symptoms.join(', ')}
${request.duration ? `Duration: ${request.duration}` : ''}
${request.severity ? `Severity: ${request.severity}` : ''}
${request.additionalInfo ? `Additional Info: ${request.additionalInfo}` : ''}

Please analyze these symptoms and provide recommendations.
`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(request.conversationHistory || []),
      { role: 'user', content: userMessage },
    ]

    const responseText = await this.chat(messages)

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])

      // Add standard disclaimer
      const disclaimer = `
**IMPORTANT DISCLAIMER:**
This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read here.

If you are experiencing a medical emergency, call your doctor or 911 immediately.
`

      return {
        ...parsed,
        disclaimers: disclaimer,
      }
    }

    throw new Error('Failed to parse Grok response')
  }
}

export const grokClient = new GrokClient()
```

### API Route (app/api/grok/symptom-analysis/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { grokClient } from '@/lib/grok'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const requestSchema = z.object({
  symptoms: z.array(z.string()).min(1),
  duration: z.string().optional(),
  severity: z.string().optional(),
  additionalInfo: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
})

export async function POST(req: NextRequest) {
  // Rate limiting
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous'
  const rateLimitResult = await rateLimit(identifier, 10, 60) // 10 requests per minute

  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const validatedData = requestSchema.parse(body)

    // Anonymize any personal info before sending to Grok
    // (In production, implement PII detection/removal)

    const analysis = await grokClient.analyzeSymptoms(validatedData)

    // Optionally save to database for logged-in users
    // if (userId) {
    //   await saveGrokInsight(userId, validatedData, analysis)
    // }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Grok analysis error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to analyze symptoms' }, { status: 500 })
  }
}
```

---

## 9. Integration: Cloudflare Images

### Cloudflare Images Plugin (apps/cms/src/plugins/cloudStorage.ts)

```typescript
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { r2Adapter } from '@payloadcms/plugin-cloud-storage/r2'

export const cloudStoragePlugin = cloudStorage({
  collections: {
    media: {
      adapter: r2Adapter({
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
        bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
      }),
      generateFileURL: ({ filename }) => {
        // Return Cloudflare Images CDN URL with transformations
        return `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_HASH}/${filename}`
      },
    },
  },
})
```

### Responsive Image Component (components/media/ResponsiveImage.tsx)

```tsx
import Image from 'next/image'
import { Media } from '@/types/payload'

interface ResponsiveImageProps {
  media: Media
  sizes?: string
  className?: string
  priority?: boolean
}

export function ResponsiveImage({
  media,
  sizes = '100vw',
  className,
  priority = false,
}: ResponsiveImageProps) {
  if (!media.cloudflareUrl) return null

  // Cloudflare Images supports URL-based transformations
  const getVariant = (width: number) => {
    return `${media.cloudflareUrl}/w=${width},fit=scale-down,quality=85`
  }

  return (
    <Image
      src={media.cloudflareUrl}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      className={className}
      priority={priority}
      quality={85}
      // Next.js will automatically generate srcset
      loader={({ src, width }) => {
        return getVariant(width)
      }}
    />
  )
}
```

---

## 10. Integration: better-auth 1.3.26

### Configuration (lib/better-auth.ts)

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'user',
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
```

### Auth API Routes (app/api/auth/[...auth]/route.ts)

```typescript
import { auth } from '@/lib/better-auth'

export const { GET, POST } = auth.handler
```

### Auth Client (lib/auth-client.ts)

```typescript
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
})
```

### Auth Provider (components/providers/AuthProvider.tsx)

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import type { Session } from '@/lib/better-auth'

interface AuthContextType {
  session: Session | null
  loading: boolean
  signIn: typeof authClient.signIn
  signOut: typeof authClient.signOut
  signUp: typeof authClient.signUp
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((session) => {
      setSession(session)
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signIn: authClient.signIn,
        signOut: authClient.signOut,
        signUp: authClient.signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## 11. Integration: OpenStreetMap & Leaflet

### Map Component (components/maps/PractitionerMap.tsx)

```tsx
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Practitioner } from '@/types/payload'

interface PractitionerMapProps {
  practitioners: Practitioner[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (practitioner: Practitioner) => void
}

export function PractitionerMap({
  practitioners,
  center = [39.8283, -98.5795], // Center of USA
  zoom = 4,
  onMarkerClick,
}: PractitionerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView(center, zoom)

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance.current)

    // Add markers
    practitioners.forEach((practitioner) => {
      if (practitioner.address.latitude && practitioner.address.longitude) {
        const marker = L.marker([practitioner.address.latitude, practitioner.address.longitude])

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-lg">${practitioner.name}</h3>
            <p class="text-sm text-gray-600">${practitioner.modalities?.map((m) => m.title).join(', ')}</p>
            <a href="/practitioners/${practitioner.slug}" class="text-earth-600 hover:underline text-sm">
              View Profile →
            </a>
          </div>
        `)

        marker.on('click', () => {
          onMarkerClick?.(practitioner)
        })

        marker.addTo(mapInstance.current!)
      }
    })

    return () => {
      mapInstance.current?.remove()
    }
  }, [practitioners, center, zoom, onMarkerClick])

  return <div ref={mapRef} className="h-[600px] w-full rounded-lg shadow-lg" />
}
```

---

## 12. Development Workflow

### Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Payload CMS
PAYLOAD_SECRET=your-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/verscienta

# better-auth
AUTH_SECRET=your-auth-secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=
ALGOLIA_ADMIN_API_KEY=

# Cloudflare Images (R2)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET_NAME=verscienta-media
CLOUDFLARE_ACCOUNT_HASH=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Grok AI (xAI)
GROK_API_KEY=

# Email (Resend)
RESEND_API_KEY=

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Package Scripts

```json
// Root package.json
{
  "name": "verscienta-health",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "@turbo/gen": "^2.3.0",
    "turbo": "^2.3.0",
    "prettier": "^3.4.2",
    "typescript": "^5.7.2"
  },
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

```json
// apps/web/package.json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.5.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "better-auth": "^1.3.26",
    "algoliasearch": "^5.18.0",
    "react-instantsearch": "^7.14.2",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-select": "^2.1.4",
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "axios": "^1.7.9",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/leaflet": "^1.9.15",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.1.0",
    "typescript": "^5"
  }
}
```

```json
// apps/cms/package.json
{
  "name": "cms",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "cross-env NODE_OPTIONS=\"${NODE_OPTIONS} --no-deprecation\" payload dev",
    "build": "cross-env NODE_OPTIONS=\"${NODE_OPTIONS} --no-deprecation\" payload build",
    "start": "cross-env NODE_OPTIONS=\"${NODE_OPTIONS} --no-deprecation\" payload start",
    "generate:types": "payload generate:types"
  },
  "dependencies": {
    "payload": "^3.58.0",
    "@payloadcms/db-postgres": "^3.58.0",
    "@payloadcms/richtext-lexical": "^3.58.0",
    "@payloadcms/plugin-cloud-storage": "^3.58.0",
    "@payloadcms/plugin-cloud-storage/cloudflare-r2": "^3.58.0",
    "express": "^4.21.2",
    "drizzle-orm": "^0.38.3",
    "postgres": "^3.4.5",
    "algoliasearch": "^5.18.0",
    "axios": "^1.7.9",
    "cross-env": "^7.0.3"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.5",
    "typescript": "^5.7.2"
  }
}
```

### Turbo Config

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    },
    "test": {
      "outputs": []
    }
  }
}
```

---

## 13. Deployment Strategy

### Production Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Cloudflare                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   DNS &     │  │  Cloudflare  │  │  Turnstile  │ │
│  │    CDN      │  │    Images    │  │  (CAPTCHA)  │ │
│  └─────────────┘  └──────────────┘  └─────────────┘ │
└──────────────────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│  Vercel (Edge)   │              │ Railway/Render   │
│                  │              │                  │
│  Next.js 15.5.4  │◄────────────►│ Payload CMS 3.58 │
│   Frontend       │   REST/GQL   │    Backend       │
│                  │              │                  │
└────────┬─────────┘              └────────┬─────────┘
         │                                 │
         │                                 ▼
         │                        ┌──────────────────┐
         │                        │  PostgreSQL 17+  │
         │                        │  (Managed DB)    │
         │                        └──────────────────┘
         │
         ▼
┌──────────────────┐
│     Algolia      │
│  Search Index    │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│    Grok AI       │
│     (xAI)        │
└──────────────────┘
```

### Frontend Deployment (Vercel)

**vercel.json:**

```json
{
  "buildCommand": "cd ../.. && turbo run build --filter=web",
  "devCommand": "next dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_APP_URL": "@verscienta-app-url",
    "NEXT_PUBLIC_ALGOLIA_APP_ID": "@algolia-app-id",
    "NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY": "@algolia-search-key"
  }
}
```

### Backend Deployment (Railway / Render)

**Dockerfile (apps/cms):**

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm turbo

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json ./apps/cms/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cms/node_modules ./apps/cms/node_modules
COPY . .

# Build Payload
RUN pnpm --filter cms build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy built assets
COPY --from=builder /app/apps/cms/dist ./apps/cms/dist
COPY --from=builder /app/apps/cms/package.json ./apps/cms/
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "apps/cms/dist/server.js"]
```

**railway.toml:**

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "./Dockerfile"

[deploy]
startCommand = "node apps/cms/dist/server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[healthchecks]]
path = "/api/health"
timeout = 100
interval = 60
```

### Database (Managed PostgreSQL)

Options:

- **Railway PostgreSQL** (easiest for small-medium)
- **Supabase** (includes free tier, backups, pooling)
- **Neon** (serverless PostgreSQL)
- **AWS RDS** (enterprise)

### Environment Variables (Production)

**Frontend (Vercel):**

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `PAYLOAD_PUBLIC_SERVER_URL`
- `AUTH_SECRET`
- `GROK_API_KEY`

**Backend (Railway/Render):**

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `ALGOLIA_ADMIN_API_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ACCESS_KEY_ID`
- `CLOUDFLARE_SECRET_ACCESS_KEY`
- `RESEND_API_KEY`

---

## 14. Migration from Drupal

### Data Migration Script

```typescript
// scripts/migrate-from-drupal.ts
import { payloadClient } from '../lib/payload'
import axios from 'axios'

const DRUPAL_API = process.env.DRUPAL_API_URL

async function migrateHerbs() {
  console.log('Fetching herbs from Drupal...')

  const response = await axios.get(`${DRUPAL_API}/jsonapi/node/herb`)
  const drupalHerbs = response.data.data

  console.log(`Found ${drupalHerbs.length} herbs`)

  for (const drupalHerb of drupalHerbs) {
    const payloadHerb = {
      title: drupalHerb.attributes.title,
      description: drupalHerb.attributes.body?.value,
      status: drupalHerb.attributes.status ? 'published' : 'draft',

      botanicalInfo: {
        scientificName: drupalHerb.attributes.field_scientific_name,
        family: drupalHerb.attributes.field_family,
        // ... map all fields
      },

      tcmProperties: {
        tcmTaste: drupalHerb.attributes.field_tcm_taste,
        tcmTemperature: drupalHerb.attributes.field_tcm_temperature,
        // ... map TCM fields
      },

      // ... map all other field groups
    }

    try {
      await payloadClient.create({
        collection: 'herbs',
        data: payloadHerb,
      })

      console.log(`✓ Migrated: ${payloadHerb.title}`)
    } catch (error) {
      console.error(`✗ Failed to migrate: ${payloadHerb.title}`, error)
    }
  }

  console.log('Migration complete!')
}

migrateHerbs()
```

Run with:

```bash
pnpm tsx scripts/migrate-from-drupal.ts
```

---

## 15. Testing Strategy

### Unit Tests (Vitest)

```typescript
// __tests__/lib/grok.test.ts
import { describe, it, expect, vi } from 'vitest'
import { grokClient } from '@/lib/grok'

describe('GrokClient', () => {
  it('should analyze symptoms and return structured response', async () => {
    const result = await grokClient.analyzeSymptoms({
      symptoms: ['fatigue', 'headache'],
      duration: '1 week',
      severity: 'moderate',
    })

    expect(result).toHaveProperty('analysis')
    expect(result).toHaveProperty('possibleConditions')
    expect(result).toHaveProperty('recommendedHerbs')
    expect(result.disclaimers).toBeTruthy()
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/herb-search.spec.ts
import { test, expect } from '@playwright/test'

test('search for herbs by property', async ({ page }) => {
  await page.goto('/search')

  // Type in search box
  await page.fill('input[type="search"]', 'ginseng')

  // Wait for results
  await page.waitForSelector('[data-testid="herb-card"]')

  // Should show results
  const results = await page.locator('[data-testid="herb-card"]')
  await expect(results).toHaveCountGreaterThan(0)

  // Click first result
  await results.first().click()

  // Should navigate to detail page
  await expect(page).toHaveURL(/\/herbs\//)
})

test('symptom checker flow', async ({ page }) => {
  await page.goto('/symptom-checker')

  // Select symptoms
  await page.check('text=Fatigue')
  await page.check('text=Headache')

  // Submit
  await page.click('button:has-text("Analyze Symptoms")')

  // Wait for AI analysis
  await page.waitForSelector('[data-testid="grok-results"]')

  // Should show recommendations
  await expect(page.locator('text=Recommended Herbs')).toBeVisible()
})
```

---

## 16. Performance Optimization

### Caching Strategy

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

export async function cacheGet<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key)
  return cached as T | null
}

export async function cacheSet(key: string, value: any, ttl: number = 3600): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value))
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key)
}
```

### Image Optimization

- Use Cloudflare Images auto-optimization
- Implement responsive images with `sizes` attribute
- Lazy load images below the fold
- Use WebP format with fallbacks
- Implement skeleton loaders

### Code Splitting

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const PractitionerMap = dynamic(() => import('@/components/maps/PractitionerMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] animate-pulse rounded-lg bg-gray-100" />,
})

const GrokResults = dynamic(() => import('@/components/symptom-checker/GrokResults'), {
  loading: () => <LoadingSpinner />,
})
```

---

## 17. Security Checklist

- [x] **Authentication:** better-auth with OAuth + email/password
- [x] **Authorization:** Role-based access control (RBAC)
- [x] **Input Validation:** Zod schemas on all forms and API routes
- [x] **Rate Limiting:** Protect API routes (Grok AI, auth, search)
- [x] **CAPTCHA:** Cloudflare Turnstile on registration, contact forms
- [x] **CSRF Protection:** Built into better-auth
- [x] **SQL Injection:** Protected by Drizzle ORM parameterized queries
- [x] **XSS Prevention:** React auto-escapes, sanitize rich text with DOMPurify
- [x] **HTTPS Only:** Enforce in production
- [x] **Secure Headers:** Set via middleware (CSP, HSTS, X-Frame-Options)
- [x] **PII Protection:** Anonymize data before sending to Grok AI
- [x] **Secrets Management:** Environment variables, never commit to Git
- [x] **Regular Updates:** Dependabot for dependency updates

---

## 18. Accessibility (WCAG 2.1 AA)

- [x] **Semantic HTML:** Proper heading hierarchy, landmarks
- [x] **Keyboard Navigation:** All interactive elements focusable
- [x] **Focus Indicators:** Visible focus rings (earth-600)
- [x] **Color Contrast:** Minimum 4.5:1 for text, 3:1 for large text
- [x] **Alt Text:** All images have descriptive alt text
- [x] **ARIA Labels:** Where semantic HTML isn't sufficient
- [x] **Form Labels:** All inputs have associated labels
- [x] **Error Messages:** Clear, descriptive validation errors
- [x] **Skip Links:** Skip to main content
- [x] **Screen Reader Testing:** Test with NVDA, JAWS, VoiceOver
- [x] **Reduced Motion:** Respect `prefers-reduced-motion`

---

## 19. Internationalization (i18n)

### Next.js i18n Configuration

```typescript
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
```

### Translation Files

```
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
```

---

## 20. Analytics & Monitoring

### Analytics Setup

- **Vercel Analytics** (frontend performance, Web Vitals)
- **Plausible** or **Google Analytics 4** (user behavior, privacy-first)
- **Algolia Analytics** (search insights)
- **Custom Events:** Track herb views, formula saves, symptom checker usage

### Error Tracking

- **Sentry** for error monitoring
- **LogRocket** for session replay (optional)

### Performance Monitoring

- **Lighthouse CI** in GitHub Actions
- **Core Web Vitals:** LCP, FID, CLS tracking
- **API Response Times:** Monitor Payload API latency

---

## 21. Content Management Workflow

### Editorial Workflow

1. **Draft:** Herbalist creates new herb entry
2. **In Review:** Submit for peer review
3. **Peer Reviewed:** Technical expert approves
4. **Expert Verified:** Senior herbalist/TCM practitioner verifies
5. **Published:** Content goes live
6. **Needs Update:** Flagged for revision (new research, corrections)

### Content Moderation

- **Reviews:** Moderator approves before publishing
- **User-Generated Content:** Pre-moderation for first 3 posts, then auto-approve
- **Flagging System:** Users can report inappropriate content

---

## 22. Backup & Disaster Recovery

### Database Backups

- **Automated Daily Backups:** Via managed PostgreSQL provider
- **Weekly Full Backups:** Stored in S3/R2
- **Point-in-Time Recovery:** Available for last 7 days

### Media Backups

- **Cloudflare R2:** Durable storage with replication
- **Versioning:** Enable object versioning for accidental deletion recovery

### Application Backups

- **Git:** Source code in GitHub
- **Deployment Snapshots:** Vercel/Railway keep deployment history
- **Database Snapshots:** Export full database weekly

---

## 23. Future Enhancements (Post-MVP)

### Phase 2 (3-6 months post-launch)

- [ ] **Mobile Apps:** React Native iOS/Android apps
- [ ] **PWA:** Full Progressive Web App with offline support
- [ ] **Advanced AI:** Personalized herb recommendations based on user profile
- [ ] **Telemedicine Integration:** Connect with practitioners via video
- [ ] **E-commerce:** Sell vetted herbal products (affiliate or direct)
- [ ] **Community Forums:** User discussions, Q&A
- [ ] **Herb Garden Planner:** Interactive garden planning tool
- [ ] **Personalized Health Dashboard:** Track symptoms, remedies, progress

### Phase 3 (6-12 months)

- [ ] **API Marketplace:** Public API for developers
- [ ] **White-Label Solution:** License platform to institutions
- [ ] **Research Portal:** Partner with universities for clinical trials
- [ ] **Certification Courses:** Online courses for aspiring herbalists
- [ ] **Multi-language Expansion:** Add 10+ languages
- [ ] **AR Plant Identification:** Use phone camera to identify herbs

---

## 24. Success Metrics & KPIs

### User Engagement

- Daily Active Users (DAU)
- Session Duration (target: >5 minutes)
- Pages per Session (target: >3)
- Return Rate (target: >40% within 7 days)

### Content Quality

- Number of Expert-Verified Herbs (target: 500+)
- Average Herb Completeness Score (target: >80%)
- User Rating of Content Accuracy (target: >4.5/5)

### AI Symptom Checker

- Completion Rate (target: >60%)
- User Satisfaction (target: >4/5)
- Follow-up Actions (herb views, practitioner searches)

### Search Performance

- Search Success Rate (target: >85% result in click)
- Average Search Response Time (target: <200ms)
- Top 10 Search Queries

### Practitioner Directory

- Number of Verified Practitioners (target: 1000+)
- Practitioner Profile Completeness (target: >75%)
- User-to-Practitioner Connection Rate

### Business Metrics

- Monthly Recurring Revenue (if applicable)
- Conversion Rate (free → paid, if freemium model)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

---

## 25. Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)

- **Week 1:** Project setup, monorepo structure, design system
- **Week 2:** Payload CMS collections, authentication with better-auth
- **Week 3:** Frontend pages (homepage, herb listing, herb detail)
- **Week 4:** Algolia search integration, basic testing

### Phase 2: Core Features (Weeks 5-8)

- **Week 5:** Formula system, condition pages, modality pages
- **Week 6:** Grok AI integration (symptom checker)
- **Week 7:** Practitioner directory with map
- **Week 8:** Reviews, ratings, user profiles

### Phase 3: Polish & Launch Prep (Weeks 9-12)

- **Week 9:** Media optimization (Cloudflare Images), video embeds
- **Week 10:** Security hardening, Turnstile, rate limiting
- **Week 11:** i18n setup, translation infrastructure
- **Week 12:** Testing (E2E, accessibility), bug fixes, documentation

### Phase 4: Content Population (Weeks 13-16)

- **Week 13-14:** Migrate Drupal content, data cleanup
- **Week 15:** Create sample formulas, conditions, modalities
- **Week 16:** Recruit practitioners, seed practitioner directory

### Phase 5: Launch (Week 17)

- Beta testing with select users
- Performance optimization
- Marketing materials preparation
- Soft launch → Full launch

**Total Estimated Time:** 17 weeks (~4 months) for MVP

---

## 26. Team & Resources

### Recommended Team (MVP)

- **Full-Stack Developer(s):** 1-2 (Next.js + Payload CMS)
- **UI/UX Designer:** 1 (part-time or contract)
- **Content Manager:** 1 (herbalist with technical knowledge)
- **QA Tester:** 1 (part-time)
- **DevOps/Infrastructure:** 1 (part-time or outsourced)

### Budget Estimates (Monthly)

**Development:**

- Personnel: $15,000 - $30,000 (varies by location, seniority)

**Infrastructure:**

- Vercel Pro: $20/month
- Railway/Render: $20-50/month
- PostgreSQL (managed): $25-100/month
- Algolia: $1-200/month (based on usage)
- Cloudflare Images: $5-50/month
- Grok AI (xAI): Pay-per-use (~$0.01 per 1K tokens)
- Domain & SSL: $15/year
- Email (Resend): $20/month

**Total Infrastructure (MVP):** ~$150-500/month

---

## 27. Risk Mitigation

### Technical Risks

| Risk                     | Mitigation                                                             |
| ------------------------ | ---------------------------------------------------------------------- |
| Grok AI API changes      | Implement adapter pattern, easy to swap providers                      |
| Algolia cost scaling     | Set up monitoring, implement caching, consider Meilisearch alternative |
| Database performance     | Index optimization, read replicas, query optimization                  |
| Cloudflare Images limits | Set up fallback to local storage if needed                             |

### Business Risks

| Risk                       | Mitigation                                                     |
| -------------------------- | -------------------------------------------------------------- |
| Content accuracy concerns  | Rigorous peer review process, expert verification              |
| Legal/liability issues     | Clear disclaimers, consult legal counsel, terms of service     |
| User adoption              | SEO optimization, content marketing, practitioner partnerships |
| Competitor differentiation | Focus on AI integration, comprehensive TCM+Western blend       |

### Operational Risks

| Risk               | Mitigation                                                    |
| ------------------ | ------------------------------------------------------------- |
| Team turnover      | Documentation, code comments, knowledge sharing               |
| Data loss          | Automated backups, disaster recovery plan                     |
| Security breach    | Regular audits, penetration testing, security best practices  |
| Scalability issues | Horizontal scaling plan, load testing, performance monitoring |

---

## 28. Conclusion

This comprehensive plan outlines a world-class holistic health platform that:

✅ **Preserves all Drupal functionality** while modernizing the stack
✅ **Implements cutting-edge AI** with Grok for symptom analysis
✅ **Provides exceptional search** via Algolia
✅ **Delivers beautiful, accessible UX** with the established design system
✅ **Scales efficiently** with Next.js 15.5.4 + Payload CMS 3.58.0
✅ **Integrates seamlessly** with Cloudflare Images, YouTube, OpenMaps
✅ **Ensures security** with better-auth, Turnstile, proper validation
✅ **Supports growth** with internationalization, PWA, mobile-ready design

**Verscienta Health** will become the most trusted and comprehensive platform for holistic health knowledge, bridging ancient wisdom with modern science through elegant, accessible design and powerful technology.

---

**Ready to begin implementation?** Start with Phase 1: Foundation, setting up the monorepo, design system, and core Payload CMS collections.

_Last Updated: 2025-10-04_
_Version: 1.0.0_
