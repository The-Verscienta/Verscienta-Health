# PubMed Evidence-Based Citations System

**Last Updated:** 2025-01-20
**Version:** 1.0.0

Comprehensive evidence-based research citation system integrated with PubMed's NCBI E-utilities API to automatically fetch, score, and maintain scientific citations for herbs and formulas.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Cron Jobs](#cron-jobs)
8. [Citation Scoring](#citation-scoring)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The PubMed Citations System provides automated, evidence-based research citations for herbal medicine content on the Verscienta Health platform. It integrates with the NCBI E-utilities API to search, fetch, score, and store high-quality scientific publications.

### Why This Matters

- **Credibility**: Evidence-based citations enhance platform credibility
- **Trust**: Users can verify information with peer-reviewed research
- **Quality**: Automatic quality scoring prioritizes high-impact publications
- **Currency**: Weekly updates keep citations current
- **Discovery**: Helps users find clinical trials and systematic reviews

---

## Features

### ✅ Automatic Citation Fetching
- Searches PubMed for herb/formula-specific research
- Filters by publication date, type, and quality
- Automatic deduplication by PMID
- Smart search query construction

### ✅ Quality Scoring (0-100)
- Publication type (Meta-Analysis > RCT > Review)
- Journal quality (high-impact journals)
- Recency (within last 5-15 years)
- Completeness (abstract, DOI, etc.)

### ✅ Automated Updates
- Weekly cron job (Sunday 2:00 AM)
- Only updates stale citations (>24 hours)
- Respects PubMed rate limits
- Bulk and individual updates

### ✅ Admin Controls
- Manual sync via API endpoint
- Citation statistics dashboard
- Individual item updates
- Bulk processing with limits

### ✅ Full Metadata
- Title, authors, journal, publication date
- Abstract, DOI, PMID, PMCID
- Publication types, keywords, MeSH terms
- Relevance scores

---

## Architecture

### Components

```
lib/
├── pubmed.ts           # PubMed API client (650+ lines)
├── citations.ts        # Citation utilities (500+ lines)
└── cron/
    └── sync-citations.ts  # Weekly sync job (300+ lines)

payload/collections/
├── Herbs.ts           # Citations array field
└── Formulas.ts        # Citations array field

app/api/admin/
└── citations-sync/
    └── route.ts       # Admin API endpoint (400+ lines)
```

### Data Flow

```
Weekly Cron Job
    ↓
Get herbs/formulas needing updates (>24h old)
    ↓
For each item:
    - Construct search query (scientific name + common names + context)
    - Search PubMed API (ESearch)
    - Fetch article details (EFetch)
    - Parse XML response
    - Score citations (0-100)
    - Filter by quality threshold (default: 60)
    - Merge with existing citations (dedupe by PMID)
    - Update Payload collection
    ↓
Citation Statistics
```

---

## Configuration

### Environment Variables

```bash
# apps/web/.env.local

# PubMed API (Optional - higher rate limits with key)
NCBI_API_KEY=your_api_key_here  # 10 req/s (vs 3 req/s without)

# Citation Sync Cron Job
CITATION_SYNC_ENABLED=true              # Enable/disable (default: true)
CITATION_SYNC_SCHEDULE="0 2 * * 0"      # Cron schedule (default: Sunday 2 AM)
CITATION_MAX_PER_RUN=50                 # Max items per run (default: 50)
```

### Getting an NCBI API Key (Optional but Recommended)

1. Create NCBI account: https://www.ncbi.nlm.nih.gov/account/
2. Generate API key: https://www.ncbi.nlm.nih.gov/account/settings/
3. Add to `.env.local`: `NCBI_API_KEY=your_key_here`

**Benefits:**
- 10 requests/second (vs 3 without key)
- Faster bulk updates
- Better reliability

### Enable Citation Sync Cron Job

```bash
# Add "citations" to CRON_JOBS environment variable
CRON_JOBS=algolia,sessions,verification-tokens,backup,citations
```

---

## Usage

### 1. Automatic Weekly Sync

Citations are automatically updated weekly (Sunday 2 AM) by the cron job.

**What it does:**
- Finds herbs/formulas with stale citations (>24 hours)
- Fetches new citations from PubMed
- Updates up to 50 items per run (configurable)
- Respects API rate limits
- Logs progress and errors

**No action required** - just ensure `CITATION_SYNC_ENABLED=true`.

### 2. Manual Sync via Admin API

Trigger manual citation updates through the admin API endpoint.

#### Sync All Collections

```bash
curl -X POST http://localhost:3000/api/admin/citations-sync \
  -H "Content-Type: application/json" \
  -d '{"collection": "all", "maxItems": 10}'
```

#### Sync Specific Collection

```bash
# Herbs only
curl -X POST http://localhost:3000/api/admin/citations-sync \
  -H "Content-Type: application/json" \
  -d '{"collection": "herbs", "maxItems": 20}'

# Formulas only
curl -X POST http://localhost:3000/api/admin/citations-sync \
  -H "Content-Type: application/json" \
  -d '{"collection": "formulas", "maxItems": 20}'
```

#### Sync Specific Item

```bash
# Update specific herb
curl -X POST http://localhost:3000/api/admin/citations-sync \
  -H "Content-Type: application/json" \
  -d '{"collection": "herbs", "id": "herb-id-here"}'

# Update specific formula
curl -X POST http://localhost:3000/api/admin/citations-sync \
  -H "Content-Type: application/json" \
  -d '{"collection": "formulas", "id": "formula-id-here"}'
```

#### Get Citation Statistics

```bash
curl http://localhost:3000/api/admin/citations-sync/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "herbs": {
      "total": 100,
      "withCitations": 75,
      "totalCitations": 450,
      "avgCitationsPerDoc": 4.5
    },
    "formulas": {
      "total": 50,
      "withCitations": 30,
      "totalCitations": 150,
      "avgCitationsPerDoc": 3.0
    },
    "total": {
      "documents": 150,
      "withCitations": 105,
      "totalCitations": 600
    }
  }
}
```

### 3. Programmatic Usage

```typescript
import {
  fetchHerbCitations,
  updateHerbCitations,
  getCitationStats,
} from '@/lib/citations'

// Fetch citations for a herb
const citations = await fetchHerbCitations('herb-id', {
  maxResults: 10,
  minYear: 2010,
  qualityThreshold: 60,
})

// Update herb with citations
await updateHerbCitations('herb-id', citations)

// Get statistics
const stats = await getCitationStats('herbs')
console.log(`${stats.withCitations}/${stats.total} herbs have citations`)
```

---

## API Reference

### PubMedClient

Main client for interacting with PubMed API.

```typescript
import PubMedClient from '@/lib/pubmed'

const client = new PubMedClient(apiKey?) // Optional API key
```

#### Methods

**searchByHerb(herbName, commonNames, filters)**
```typescript
const result = await client.searchByHerb('Panax ginseng', ['Ginseng'], {
  maxResults: 10,
  minYear: 2010,
  publicationTypes: ['Clinical Trial'],
  sort: 'date',
})
```

**searchByFormula(formulaName, tradition, filters)**
```typescript
const result = await client.searchByFormula('Si Jun Zi Tang', 'tcm', {
  maxResults: 10,
  minYear: 2015,
})
```

**searchByCondition(condition, filters)**
```typescript
const result = await client.searchByCondition('diabetes', {
  maxResults: 10,
})
```

**scoreCitations(articles)**
```typescript
const scored = client.scoreCitations(articles)
// Returns: CitationScore[] with relevanceScore 0-100
```

**getTopCitations(articles, minScore)**
```typescript
const topCitations = client.getTopCitations(articles, 70)
// Returns only articles scoring >= 70
```

### Citation Utilities

**fetchHerbCitations(herbId, options)**
```typescript
const citations = await fetchHerbCitations('herb-id', {
  maxResults: 10,
  minYear: 2010,
  includeAbstract: true,
  qualityThreshold: 60,
  publicationTypes: ['Clinical Trial', 'Meta-Analysis'],
})
```

**updateHerbCitations(herbId, citations)**
```typescript
const result = await updateHerbCitations('herb-id', citations)
// Returns: { citationsAdded, citationsUpdated, totalCitations, errors }
```

**fetchFormulaCitations(formulaId, options)**
```typescript
const citations = await fetchFormulaCitations('formula-id', {
  maxResults: 10,
})
```

**updateFormulaCitations(formulaId, citations)**
```typescript
await updateFormulaCitations('formula-id', citations)
```

**getCitationStats(collection)**
```typescript
const stats = await getCitationStats('herbs')
// Returns: { total, withCitations, totalCitations, avgCitationsPerDoc }
```

**needsCitationRefresh(lastUpdated)**
```typescript
const needsUpdate = needsCitationRefresh(herb.citationsLastUpdated)
// Returns true if >24 hours old or never updated
```

---

## Cron Jobs

### Weekly Citation Sync

**File:** `apps/web/lib/cron/sync-citations.ts`

**Schedule:** Sunday at 2:00 AM (configurable)

**What it does:**
1. Get citation statistics (before)
2. Find herbs needing updates (>24 hours or no citations)
3. Process up to `CITATION_MAX_PER_RUN` herbs (default: 50)
4. Fetch citations from PubMed for each
5. Update herb records with citations
6. Find formulas needing updates
7. Process formulas
8. Get citation statistics (after)
9. Log summary and errors

**Configuration:**
```bash
CITATION_SYNC_ENABLED=true          # Enable/disable
CITATION_SYNC_SCHEDULE="0 2 * * 0"  # Cron schedule
CITATION_MAX_PER_RUN=50             # Max items per run
```

**Manual Execution:**
```bash
pnpm tsx apps/web/lib/cron/sync-citations.ts
```

**Logs:**
```
[Citation Sync] ========================================
[Citation Sync] Starting weekly citation sync job
[Citation Sync] ========================================

[Citation Sync] Current statistics:
[Citation Sync]   Herbs: 75/100 have citations (450 total, avg 4.5 per herb)
[Citation Sync]   Formulas: 30/50 have citations (150 total, avg 3.0 per formula)

[Citation Sync] Found 100 published herbs
[Citation Sync] 25 herbs need citation updates (max: 50)
[Citation Sync] Fetching citations for: Panax ginseng
[Citation Sync] ✓ Updated Panax ginseng with 8 citations
...

[Citation Sync] Herb sync complete: 25 processed, 20 updated, 0 failed
[Citation Sync] Formula sync complete: 10 processed, 8 updated, 0 failed

[Citation Sync] Final statistics:
[Citation Sync]   Herbs: 95/100 have citations (580 total, avg 5.8 per herb)
[Citation Sync]   Formulas: 38/50 have citations (210 total, avg 4.2 per formula)

[Citation Sync] ========================================
[Citation Sync] Citation sync complete!
[Citation Sync]   Total processed: 35
[Citation Sync]   Total updated: 28
[Citation Sync]   Total failed: 0
[Citation Sync]   Duration: 125.3s
[Citation Sync] ========================================
```

---

## Citation Scoring

Citations are scored 0-100 based on multiple quality factors.

### Scoring Factors

| Factor | Points | Description |
|--------|--------|-------------|
| **Base Score** | 50 | All citations start here |
| **Has Abstract** | +10 | Full abstract available |
| **Has DOI** | +5 | Digital Object Identifier present |
| **Recent (≤5 years)** | +15 | Published within last 5 years |
| **High-Quality Journal** | +20 | Complementary medicine journal |
| **Publication Type** | Variable | See table below |

### Publication Type Scores

| Type | Score | Override |
|------|-------|----------|
| Meta-Analysis | 100 | Replaces base score |
| Systematic Review | 90 | Replaces base score |
| Randomized Controlled Trial | 85 | Replaces base score |
| Clinical Trial | 75 | Replaces base score |
| Review | 60 | Replaces base score |
| Observational Study | 50 | No change |
| Case Reports | 30 | Lowers score |

### High-Quality Journals

- Journal of Ethnopharmacology
- Phytomedicine
- Phytotherapy Research
- Planta Medica
- BMC Complementary and Alternative Medicine
- Evidence-Based Complementary and Alternative Medicine
- Journal of Alternative and Complementary Medicine
- Integrative Medicine Research
- Chinese Medicine
- Frontiers in Pharmacology

### Example Scores

**Meta-Analysis, Recent, High-Quality Journal, Has DOI & Abstract:**
- Base: 100 (Meta-Analysis)
- +15 (Recent)
- +20 (High-quality journal)
- +5 (DOI)
- +10 (Abstract)
- **Total: Capped at 100**

**Clinical Trial, 3 years old, Medium Journal, Has Abstract:**
- Base: 75 (Clinical Trial)
- +15 (Recent)
- +10 (Abstract)
- **Total: 100 (capped)**

**Review, 10 years old, No Abstract:**
- Base: 60 (Review)
- **Total: 60**

### Quality Threshold

Default threshold: **60** (configurable)

Only citations scoring ≥60 are stored. This filters out:
- Case reports (score 30)
- Old publications without recent relevance
- Low-quality journals
- Incomplete citations

---

## Troubleshooting

### Issue 1: No Citations Found

**Symptoms:**
- `fetchHerbCitations()` returns empty array
- API logs show "Found 0 articles"

**Diagnosis:**
```typescript
// Check if herb data exists
const herb = await payload.findByID({ collection: 'herbs', id: 'herb-id' })
console.log('Scientific name:', herb.botanicalInfo?.scientificName)
console.log('Common names:', herb.commonNames)
```

**Solutions:**

1. **Verify Scientific Name:**
```typescript
// Ensure scientificName is set in botanicalInfo
// Example: "Panax ginseng" not "ginseng"
```

2. **Add Common Names:**
```typescript
// Add English common names to herb.commonNames array
// Example: [{ name: 'Asian Ginseng', language: 'en' }]
```

3. **Broaden Search:**
```typescript
// Lower quality threshold or expand date range
const citations = await fetchHerbCitations(id, {
  minYear: 2000,  // Instead of 2010
  qualityThreshold: 40,  // Instead of 60
})
```

4. **Check PubMed Directly:**
```
Visit: https://pubmed.ncbi.nlm.nih.gov
Search: "Panax ginseng"[Title/Abstract] AND "herbal medicine"[Title/Abstract]
```

---

### Issue 2: Rate Limit Errors

**Symptoms:**
- Error: "Too many requests"
- PubMed returns 429 status
- Sync job stops midway

**Diagnosis:**
```bash
# Check if API key is configured
echo $NCBI_API_KEY

# Check rate limit in logs
# Without key: ~3 requests/second
# With key: ~10 requests/second
```

**Solutions:**

1. **Add API Key:**
```bash
# Get key from https://www.ncbi.nlm.nih.gov/account/settings/
NCBI_API_KEY=your_key_here
```

2. **Increase Delays:**
```typescript
// In sync-citations.ts
const DELAY_BETWEEN_ITEMS_MS = 1000  // Instead of 500
```

3. **Reduce Batch Size:**
```bash
# Process fewer items per run
CITATION_MAX_PER_RUN=25  # Instead of 50
```

---

### Issue 3: XML Parsing Errors

**Symptoms:**
- Error: "Failed to parse PubMed XML response"
- Citations fetch but don't save
- Missing fields (title, authors, etc.)

**Diagnosis:**
```bash
# Check fast-xml-parser installation
pnpm list fast-xml-parser

# Enable debug logging
DEBUG=pubmed:* pnpm tsx lib/cron/sync-citations.ts
```

**Solutions:**

1. **Reinstall Parser:**
```bash
pnpm remove fast-xml-parser
pnpm add fast-xml-parser
```

2. **Check Response Format:**
```typescript
// In pubmed.ts, add logging
console.log('Raw XML:', xml.substring(0, 500))
```

3. **Update Parser Options:**
```typescript
// Try different parser settings
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
})
```

---

### Issue 4: Citations Not Updating in Payload

**Symptoms:**
- Citations fetch successfully
- API returns success
- But citations don't appear in Payload admin

**Diagnosis:**
```bash
# Check Payload schema
pnpm payload generate:types

# Verify citations field exists
# In Herbs.ts or Formulas.ts
```

**Solutions:**

1. **Regenerate Payload Types:**
```bash
pnpm payload generate:types
```

2. **Restart Dev Server:**
```bash
# Clear .next cache
rd /s /q .next  # Windows
rm -rf .next    # Unix

pnpm dev
```

3. **Check Field Definition:**
```typescript
// In Herbs.ts, verify:
{
  name: 'citations',
  type: 'array',
  fields: [
    // ... citation fields
  ],
}
```

4. **Manual Update Test:**
```typescript
// Test direct update
const payload = await getPayload({ config })
await payload.update({
  collection: 'herbs',
  id: 'test-id',
  data: {
    citations: [{
      pmid: '12345678',
      title: 'Test Citation',
      authors: 'Test Author',
      journal: 'Test Journal',
      publicationDate: '2020-01-01',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
    }],
  },
})
```

---

### Issue 5: Cron Job Not Running

**Symptoms:**
- No citation updates happening
- No cron logs
- Weekly sync never triggers

**Diagnosis:**
```bash
# Check cron job configuration
echo $CRON_JOBS
echo $CITATION_SYNC_ENABLED

# Check cron registration
grep -r "citations" lib/cron/index.ts
```

**Solutions:**

1. **Enable in CRON_JOBS:**
```bash
# Add "citations" to enabled jobs
CRON_JOBS=algolia,backup,citations
```

2. **Check Schedule Format:**
```bash
# Verify cron syntax (minute hour day month weekday)
CITATION_SYNC_SCHEDULE="0 2 * * 0"  # ✓ Sunday 2 AM
CITATION_SYNC_SCHEDULE="0 2 * * SUN"  # ✓ Also valid
CITATION_SYNC_SCHEDULE="invalid"  # ✗ Won't work
```

3. **Test Manual Execution:**
```bash
# Run directly to test
pnpm tsx apps/web/lib/cron/sync-citations.ts
```

4. **Check Cron System:**
```typescript
// In lib/cron/index.ts
const CRON_JOBS = {
  // ...
  citations: {
    name: 'Citation Sync',
    schedule: scheduleCitationSync,  // ← Verify this exists
    description: '...',
  },
}
```

---

## Best Practices

### 1. Use NCBI API Key

✅ **Do:**
- Register for free NCBI API key
- Add to environment variables
- Get 10 req/s instead of 3

❌ **Don't:**
- Run bulk updates without API key
- Share API key in public repos

### 2. Monitor Citation Quality

✅ **Do:**
- Review citation scores periodically
- Adjust quality threshold based on needs
- Focus on clinical trials and reviews

❌ **Don't:**
- Accept all citations blindly
- Lower quality threshold below 40

### 3. Respect Rate Limits

✅ **Do:**
- Use delays between requests (500ms)
- Limit batch sizes (50 items max)
- Run during off-peak hours (2 AM)

❌ **Don't:**
- Hammer PubMed API with rapid requests
- Process hundreds of items without delays

### 4. Keep Citations Current

✅ **Do:**
- Enable weekly cron job
- Monitor sync logs
- Update stale citations (>24 hours)

❌ **Don't:**
- Disable automatic updates
- Let citations go months without refresh

### 5. Validate Search Queries

✅ **Do:**
- Use scientific names
- Add 2-3 common names
- Include herb/formula context terms

❌ **Don't:**
- Use only common names
- Omit context (herbal medicine, phytotherapy)
- Search without filters

---

## Support & Resources

### Internal
- PubMed Client: `apps/web/lib/pubmed.ts`
- Citation Utilities: `apps/web/lib/citations.ts`
- Cron Job: `apps/web/lib/cron/sync-citations.ts`
- API Route: `apps/web/app/api/admin/citations-sync/route.ts`

### External
- NCBI E-utilities: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- PubMed Search: https://pubmed.ncbi.nlm.nih.gov
- API Key: https://www.ncbi.nlm.nih.gov/account/settings/
- MeSH Terms: https://www.ncbi.nlm.nih.gov/mesh/

---

**Document Version:** 1.0.0
**Last Review:** 2025-01-20
**Maintainer:** Verscienta Health Development Team
