# Trefle API Integration

Verscienta Health integrates with the [Trefle API](https://trefle.io/), a free botanical database containing over 1 million plant entries. This integration enriches our herb database with validated scientific data, images, distributions, and cross-references.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
  - [Enrich Existing Herbs](#enrich-existing-herbs)
  - [Progressive Import](#progressive-import)
- [Data Mapping](#data-mapping)
- [API Rate Limits](#api-rate-limits)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

The Trefle integration provides two main functionalities:

1. **Herb Enrichment** - Enhances existing herbs with botanical data from Trefle
2. **Progressive Import** - Imports all 1M+ plants from Trefle into your database

Both operations respect Trefle's rate limits and run automatically via cron jobs.

## Features

### Data Enrichment

For each herb, Trefle provides:

- ✅ **Scientific validation** - Verifies scientific names against botanical database
- 🌍 **Distribution data** - Native and introduced regions
- 🖼️ **Plant images** - High-quality botanical photographs
- 📝 **Synonyms** - Alternative scientific names
- 🏷️ **Taxonomy** - Family, genus, author information
- ⚠️ **Toxicity data** - Safety information (none, low, medium, high)
- 🍃 **Edibility** - Whether plant is edible and which parts
- 📏 **Growth data** - Habit, height, form
- 📚 **Sources** - Citation and reference information

### Scientific Name Validation

- Checks scientific names against Trefle's botanical database
- Provides suggestions for misspellings or outdated names
- Creates validation reports for manual review

### Automated Jobs

1. **Sync Trefle Botanical Data** (Weekly)
   - Enriches existing herbs with Trefle data
   - Runs Wednesday at 3 AM
   - Processes 100 herbs per run
   - Prioritizes herbs never synced or synced >30 days ago

2. **Import Trefle Plant Database** (Every Minute)
   - Progressively imports all plants from Trefle
   - Processes ~100 plants per minute (respects rate limit)
   - Creates herbs as drafts for review
   - Tracks progress via global state

## Setup

### 1. Get Trefle API Key

1. Visit [trefle.io](https://trefle.io/)
2. Create a free account
3. Generate an API key from your dashboard

### 2. Configure Environment

Add to your `.env` file:

```bash
# Trefle API Key (required)
TREFLE_API_KEY=your-trefle-api-key-here

# Enable progressive import (optional, default: false)
# WARNING: This will import 1M+ plants as draft herbs
ENABLE_TREFLE_IMPORT=false
```

### 3. Restart Application

The cron jobs will automatically start based on your configuration:

- If `TREFLE_API_KEY` is set → **Sync job enabled** (weekly enrichment)
- If `TREFLE_API_KEY` + `ENABLE_TREFLE_IMPORT=true` → **Import job enabled** (every minute)

## Usage

### Enrich Existing Herbs

The sync job automatically runs weekly, but you can also:

#### Manually Trigger Sync

```bash
# From CMS admin panel
POST /api/cron/trigger
{
  "jobName": "Sync Trefle Botanical Data"
}
```

#### Sync Single Herb

```typescript
import { syncSingleHerbWithTrefle } from './src/cron/jobs/syncTrefleData'

const result = await syncSingleHerbWithTrefle(payload, herbId)

if (result.success) {
  console.log('Herb enriched:', result.enrichedData)
} else {
  console.error('Sync failed:', result.message)
}
```

### Progressive Import

Enable progressive import to add all Trefle plants to your database:

**⚠️ Warning**: This will create hundreds of thousands of draft herbs!

#### Enable Import

```bash
# In .env
ENABLE_TREFLE_IMPORT=true
```

The import job will:
- Run every minute
- Process ~100 plants per run (5 pages × 20 plants)
- Respect 120 requests/minute rate limit
- Create herbs as **drafts** for review
- Track progress automatically
- Complete after ~7 days of continuous running

#### Monitor Import Progress

```typescript
import { getTrefleImportProgress } from './src/cron/jobs/importTrefleData'

const progress = await getTrefleImportProgress(payload)

console.log(`
  Current page: ${progress.currentPage}
  Completed: ${progress.isComplete}
  Last run: ${progress.lastRunAt}
  Estimated plants remaining: ${progress.estimatedPlantsRemaining}
`)
```

#### Reset Import

```typescript
import { resetTrefleImport } from './src/cron/jobs/importTrefleData'

await resetTrefleImport(payload)
// Import will restart from page 1
```

## Data Mapping

### Trefle → Verscienta Herb Schema

```typescript
// Basic Information
name: plant.common_name || plant.scientific_name
slug: generateSlug(name)
scientificName: plant.scientific_name
family: enrichedData.family
synonyms: enrichedData.synonyms

// Botanical Data
botanicalData: {
  trefleId: enrichedData.trefleId
  trefleSlug: enrichedData.trefleSlug
  lastSyncedAt: new Date()
  trefleData: {
    author: enrichedData.author
    synonyms: enrichedData.synonyms
    distributions: {
      native: [...],
      introduced: [...]
    }
    edible: true/false
    ediblePart: ['leaves', 'roots', ...]
    toxicity: 'none' | 'low' | 'medium' | 'high'
    growthHabit: 'herb' | 'shrub' | ...
    averageHeight: 120 // cm
    sources: [{name, url, citation}]
  }
}

// Images
images: [{
  url: enrichedData.imageUrl
  caption: '${name} - from Trefle botanical database'
  type: 'photograph'
  source: 'Trefle'
}]

// Habitat
habitat: 'Native to: ${nativeRegions.slice(0, 5).join(', ')}'

// Safety Information
safetyInfo: {
  warnings: ['Trefle toxicity: ${toxicity}']
}
```

### Herb Candidate Filtering

Not all plants are imported. The import job filters for:

- ✅ Edible or vegetable plants
- ✅ Plants with common names (suggests human use)
- ✅ Herbs, graminoids, subshrubs, forbs
- ❌ Trees (excluded)
- ✅ All others included as drafts for review

## API Rate Limits

### Trefle Rate Limits

- **120 requests per minute**
- **5000 requests per day** (free tier)

### Our Implementation

**Sync Job** (Weekly):
- Processes 100 herbs per run
- 600ms delay between requests
- ~60 requests per run
- Well under rate limit

**Import Job** (Every Minute):
- Fetches 5 pages per run
- 20 plants per page = 100 plants/minute
- 500ms delay between pages
- ~5 API requests per run (fetch pages)
- ~100 API requests for enrichment (within 120/min limit)

**Built-in Protection**:
- Request interceptor adds 500ms delay
- Response interceptor retries on 429 (rate limit)
- Automatic 60-second wait if rate limited

## Monitoring

### View Import Logs

All Trefle operations are logged in the `import-logs` collection:

```bash
# In CMS admin
Navigate to: System → Import Logs

Filter by:
- Type: "Trefle Sync"
- Type: "Trefle Progressive Import"
- Type: "Trefle Sync Error"
```

### View Validation Reports

Scientific name validation issues are logged in `validation-reports`:

```bash
# In CMS admin
Navigate to: System → Validation Reports

Filter by:
- Type: "Trefle Name Mismatch"
```

### Check Import State

```bash
# In CMS admin
Navigate to: System → Trefle Import State

View:
- Current page being imported
- Total plants/herbs imported
- Last run timestamp
- Completion status
```

### Logs and Debugging

```bash
# Watch cron job logs
tail -f logs/cron.log

# Look for:
🌿 Starting Trefle progressive import...
📄 Resuming from page 123
📖 Fetching page 123...
   Found 20 plants
   ✅ Created: Lavandula angustifolia
✅ Trefle import batch complete
```

## Troubleshooting

### Issue: No herbs being enriched

**Check**:
1. Is `TREFLE_API_KEY` set in `.env`?
2. Is the sync job enabled? Check cron logs: `🕐 Initializing cron jobs...`
3. Are there herbs matching criteria (no trefleId or >30 days old)?

**Solution**:
```bash
# Manually trigger sync
POST /api/cron/trigger
{ "jobName": "Sync Trefle Botanical Data" }
```

### Issue: Import not running

**Check**:
1. Is `TREFLE_API_KEY` set?
2. Is `ENABLE_TREFLE_IMPORT=true`?
3. Check cron logs for: `✓ Scheduled: Import Trefle Plant Database`

**Solution**:
```bash
# Verify environment
echo $TREFLE_API_KEY
echo $ENABLE_TREFLE_IMPORT

# Check global state
# In CMS: System → Trefle Import State
```

### Issue: Rate limit errors

**Symptoms**:
```
❌ Trefle API rate limit reached. Waiting 60 seconds...
```

**Cause**: Too many requests to Trefle API

**Solution**:
- Our implementation auto-retries after 60s
- If persistent, reduce `pagesPerRun` in `importTrefleData.ts` from 5 to 3
- Consider pausing import: `ENABLE_TREFLE_IMPORT=false`

### Issue: Invalid scientific names

**Symptoms**:
```
⚠️ Scientific name not found. Suggestions: Lavandula officinalis, Lavandula vera
```

**Cause**: Herb uses outdated or misspelled scientific name

**Solution**:
1. Check validation reports: System → Validation Reports
2. Review suggestions
3. Update herb's scientific name to match Trefle
4. Re-run sync for that herb

### Issue: Import stuck on same page

**Check**:
```typescript
const progress = await getTrefleImportProgress(payload)
console.log(progress.currentPage)
```

**Solution**:
```typescript
// Reset to restart
await resetTrefleImport(payload)

// Or manually update global
// In CMS: System → Trefle Import State
// Set currentPage to desired page
```

### Issue: Too many draft herbs created

**Cause**: Progressive import creates all plants as drafts

**Solution**:
```bash
# Pause import
ENABLE_TREFLE_IMPORT=false

# Bulk update herbs to published (after review)
# In CMS: Herbs → Select All → Bulk Actions → Publish
```

## Best Practices

### For Herb Enrichment

1. **Run sync weekly** - Default schedule is sufficient
2. **Review validation reports** - Fix scientific name mismatches
3. **Monitor import logs** - Check for errors regularly
4. **Test enrichment** - Manually sync a few herbs first

### For Progressive Import

1. **Test on staging first** - Import creates many draft herbs
2. **Monitor disk space** - 1M herbs will use significant storage
3. **Review imported herbs** - Not all plants are medicinal herbs
4. **Clean up drafts** - Delete irrelevant plants periodically
5. **Consider selective import** - Modify `isHerbCandidate()` filter

### Performance Tips

1. **Use staging for initial import** - Test full import on non-production
2. **Adjust page size** - Modify `pagesPerRun` based on server capacity
3. **Monitor rate limits** - Check Trefle dashboard for usage
4. **Index botanicalData fields** - Add database indexes for performance
5. **Archive old import logs** - Clean up logs older than 30 days

## API Reference

### TrefleClient Methods

```typescript
// Search by scientific name
await trefleClient.searchByScientificName('Lavandula angustifolia')

// Get plant details by ID
await trefleClient.getPlantById(123456)

// Get plant by slug
await trefleClient.getPlantBySlug('lavandula-angustifolia')

// Find best match
await trefleClient.findBestMatch('Lavandula angustifolia', 'Lavender')

// Enrich herb data
await trefleClient.enrichHerbData({
  scientificName: 'Lavandula angustifolia',
  name: 'Lavender'
})

// Validate scientific name
await trefleClient.validateScientificName('Lavandula angustifolia')
```

### Helper Functions

```typescript
// Get singleton client
import { getTrefleClient } from './lib/trefle'
const client = getTrefleClient()

// Quick enrichment
import { enrichHerbWithTrefle } from './lib/trefle'
const data = await enrichHerbWithTrefle(herb)

// Quick validation
import { validateScientificNameWithTrefle } from './lib/trefle'
const validation = await validateScientificNameWithTrefle(scientificName)
```

## Resources

- **Trefle API Docs**: https://docs.trefle.io/
- **Trefle Dashboard**: https://trefle.io/users/sign_in
- **Rate Limits**: https://docs.trefle.io/docs/guides/rate-limiting
- **Data Sources**: https://docs.trefle.io/docs/guides/data-sources

## Support

For issues with the Trefle integration:

1. Check this documentation
2. Review import logs and validation reports
3. Search [GitHub Issues](https://github.com/verscienta/verscienta-health/issues)
4. Create a new issue with:
   - Error messages
   - Import logs
   - Environment configuration (without API key)
   - Steps to reproduce

---

**Built with 🌿 for botanical accuracy**
