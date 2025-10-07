# Perenual API Integration

Verscienta Health integrates with the [Perenual API](https://perenual.com/docs/api), a plant database containing over 10,000 plant species with cultivation tips, pest information, and care guides. This integration enriches our herb database with practical growing and gardening information.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Data Mapping](#data-mapping)
- [Deduplication](#deduplication)
- [API Rate Limits](#api-rate-limits)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

The Perenual integration provides:

1. **Herb Cultivation Data** - Watering, sunlight, soil, hardiness information
2. **Pest Management** - Common pests, descriptions, and solutions
3. **Care Guides** - Detailed growing instructions
4. **Progressive Import** - Imports all 10,000+ plants from Perenual
5. **Smart Deduplication** - Automatically merges with Trefle data

Both Trefle and Perenual imports use intelligent deduplication to prevent duplicate herbs and merge data from multiple sources.

## Features

### Cultivation Information

For each herb, Perenual provides:

- 💧 **Watering requirements** - Frequency and amount
- ☀️ **Sunlight needs** - Full sun, partial shade, etc.
- 🌱 **Soil preferences** - Soil types and pH
- ❄️ **Hardiness zones** - USDA hardiness min/max
- 📅 **Lifecycle** - Annual, perennial, biennial
- 🌿 **Growth rate** - Fast, moderate, slow
- 🏠 **Indoor suitability** - Can be grown indoors
- 🌊 **Drought tolerance** - Water conservation
- 🧂 **Salt tolerance** - Coastal planting

### Pest & Disease Management

- 🐛 **Common pests** - Identification and descriptions
- 💊 **Treatment solutions** - Organic and chemical options
- 🔬 **Scientific names** - Proper pest identification
- 📸 **Pest images** - Visual identification (when available)

### Propagation & Maintenance

- ✂️ **Pruning schedule** - Best months and frequency
- 🌱 **Propagation methods** - Seeds, cuttings, division
- 🔧 **Maintenance level** - Low, medium, high
- 📏 **Size information** - Expected dimensions

### Additional Data

- 🦋 **Wildlife attraction** - Pollinators, birds attracted
- ⚠️ **Toxicity warnings** - Humans and pets
- 🍽️ **Edibility** - Edible parts and uses
- 🏥 **Medicinal flag** - Identified as medicinal plant

## Setup

### 1. Get Perenual API Key

1. Visit [perenual.com/docs/api](https://perenual.com/docs/api)
2. Sign up for a free account
3. Generate an API key from your dashboard

### 2. Configure Environment

Add to your `.env` file:

```bash
# Perenual API Key (required)
PERENUAL_API_KEY=your-perenual-api-key-here

# Enable progressive import (optional, default: false)
# WARNING: This will import 10,000+ plants as draft herbs
ENABLE_PERENUAL_IMPORT=false
```

### 3. Restart Application

The import job will automatically start if configured:

- If `PERENUAL_API_KEY` is set → **API ready**
- If `PERENUAL_API_KEY` + `ENABLE_PERENUAL_IMPORT=true` → **Import job enabled**

## Usage

### Progressive Import

Enable progressive import to add all Perenual plants:

```bash
# In .env
PERENUAL_API_KEY=your-key-here
ENABLE_PERENUAL_IMPORT=true
```

The import job will:

- Run every minute
- Process ~40 plants per run (2 pages × 20 plants)
- Respect rate limits (1 second delay between requests)
- Check for duplicates with Trefle imports
- Create herbs as **drafts** for review
- Merge data with existing herbs when possible
- Complete in ~5 hours of continuous running

### Monitor Import Progress

```typescript
import { getPerenualImportProgress } from './src/cron/jobs/importPerenualData'

const progress = await getPerenualImportProgress(payload)

console.log(`
  Current page: ${progress.currentPage}
  Completed: ${progress.isComplete}
  Last run: ${progress.lastRunAt}
  Estimated plants remaining: ${progress.estimatedPlantsRemaining}
`)
```

### Reset Import

```typescript
import { resetPerenualImport } from './src/cron/jobs/importPerenualData'

await resetPerenualImport(payload)
// Import will restart from page 1
```

## Data Mapping

### Perenual → Verscienta Herb Schema

```typescript
// Basic Information
name: plant.common_name
scientificName: plant.scientific_name[0]
family: enrichedData.family
synonyms: plant.scientific_name.slice(1) // Additional names as synonyms

// Botanical Data
botanicalData: {
  perenualId: enrichedData.perenualId
  lastPerenualSyncAt: new Date()
  perenualData: {
    origin: ['Mediterranean', 'Europe']
    medicinal: true
    toxicity: { toHumans: 0, toPets: 0 }
    attracts: ['Bees', 'Butterflies']
  }
}

// Cultivation
cultivation: {
  cycle: 'Perennial'
  watering: 'Average'
  wateringPeriod: 'Spring-Fall'
  sunlight: ['Full sun', 'Part shade']
  soil: ['Loam', 'Well-drained']
  hardiness: { min: '5', max: '9' }
  maintenance: 'Low'
  careLevel: 'Easy'
  growthRate: 'Moderate'
  indoor: true
  droughtTolerant: false
  saltTolerant: false
  propagation: ['Seeds', 'Cuttings']
  pruning: {
    months: ['March', 'April']
    frequency: { amount: 2, interval: 'year' }
  }
}

// Care Guide
cultivation_notes: `
  Watering: Water regularly during growing season
  Sunlight: Prefers full sun but tolerates part shade
  Soil: Well-drained loam, slightly acidic to neutral pH
  ...
`

// Pest Management
pest_management: `
  **Aphids** (Aphidoidea):
  Small, soft-bodied insects that cluster on new growth

  *Solution:* Spray with water or use neem oil spray

  ---

  **Spider Mites** (Tetranychidae):
  Tiny arachnids that cause stippling on leaves

  *Solution:* Increase humidity, use insecticidal soap
`

// Safety Information
safetyInfo: {
  warnings: [
    'Toxicity to humans: No',
    'Toxicity to pets: No'
  ]
}

// Images
images: [{
  url: enrichedData.imageUrl
  caption: '${name} - from Perenual plant database'
  type: 'photograph'
  source: 'Perenual'
}]
```

## Deduplication

### How It Works

Both Trefle and Perenual imports use smart deduplication:

1. **Check existing herbs** by:
   - Scientific name (primary)
   - Trefle ID
   - Perenual ID
   - Common name (secondary)

2. **If herb exists**:
   - Merge new data without overwriting
   - Add to synonyms (no duplicates)
   - Combine images from both sources
   - Merge cultivation data
   - Update source-specific fields

3. **If herb doesn't exist**:
   - Create as draft for review
   - Add source identifier

### Deduplication Logic

```typescript
// Normalize scientific names for comparison
"Lavandula angustifolia Mill." → "lavandula angustifolia"

// Match criteria (OR):
- Exact scientific name match
- Matching Trefle ID
- Matching Perenual ID
- Genus + species match (ignore author)

// Merge strategy:
- Keep existing non-null values
- Combine arrays (no duplicates)
- Append text fields with separator
- Track both trefleData and perenualData
```

### Example Merge

**Existing Herb (from Trefle):**

```typescript
{
  name: "Lavender",
  scientificName: "Lavandula angustifolia",
  family: "Lamiaceae",
  images: [{ source: "Trefle", url: "..." }],
  botanicalData: {
    trefleId: 123,
    trefleData: { toxicity: "none", distributions: {...} }
  }
}
```

**New Data (from Perenual):**

```typescript
{
  name: "English Lavender",
  scientificName: "Lavandula angustifolia",
  cultivation: { watering: "Average", sunlight: ["Full sun"] },
  pest_management: "...",
  images: [{ source: "Perenual", url: "..." }]
}
```

**Merged Result:**

```typescript
{
  name: "Lavender", // Existing preferred
  scientificName: "Lavandula angustifolia",
  family: "Lamiaceae",
  images: [
    { source: "Trefle", url: "..." },
    { source: "Perenual", url: "..." } // Combined
  ],
  cultivation: { // Added from Perenual
    watering: "Average",
    sunlight: ["Full sun"]
  },
  pest_management: "...", // Added from Perenual
  botanicalData: {
    trefleId: 123,
    perenualId: 456, // Added
    trefleData: {...},
    perenualData: {...} // Added
  }
}
```

### Manual Deduplication

Cleanup duplicate herbs:

```typescript
import { bulkDeduplicate } from './src/lib/herbDeduplication'

const stats = await bulkDeduplicate(payload)

console.log(`
  Processed: ${stats.processed}
  Merged: ${stats.merged}
  Deleted: ${stats.deleted}
  Errors: ${stats.errors}
`)
```

## API Rate Limits

### Perenual Rate Limits

- **Free tier**: Limited requests per day
- **Standard delay**: 1 second between requests

### Our Implementation

**Import Job** (Every Minute):

- Fetches 2 pages per run
- 20 plants per page = 40 plants/minute
- 1 second delay between requests
- ~5 hours to import all 10,000 plants

**Built-in Protection**:

- Request interceptor adds 1s delay
- Response interceptor retries on 429
- Automatic 60-second wait if rate limited
- Progressive state tracking for resume

## Monitoring

### View Import Logs

```bash
# In CMS admin
Navigate to: System → Import Logs

Filter by:
- Type: "Perenual Progressive Import"
- Type: "Perenual Sync Error"
```

### Check Import State

```bash
# In CMS admin
Navigate to: System → Perenual Import State

View:
- Current page being imported
- Total plants/herbs imported
- Last run timestamp
- Completion status
```

### Check for Duplicates

```typescript
import { checkForDuplicates } from './src/lib/herbDeduplication'

const result = await checkForDuplicates(payload, 'Lavandula angustifolia')

if (result.hasDuplicate) {
  console.log('Duplicates found:', result.duplicates)
  // [{ id, name, scientificName, sources: ['Trefle', 'Perenual'] }]
}
```

### Logs and Debugging

```bash
# Watch import logs
tail -f logs/cron.log

# Look for:
🌱 Starting Perenual progressive import...
📄 Resuming from page 50
📖 Fetching page 50...
   Found 20 plants
   ✅ Created: Lavandula angustifolia
   ✓ Updated: Rosmarinus officinalis (merged with Trefle)
✅ Perenual import batch complete
```

## Troubleshooting

### Issue: Import not running

**Check**:

1. Is `PERENUAL_API_KEY` set?
2. Is `ENABLE_PERENUAL_IMPORT=true`?
3. Check cron logs for: `✓ Scheduled: Import Perenual Plant Database`

**Solution**:

```bash
# Verify environment
echo $PERENUAL_API_KEY
echo $ENABLE_PERENUAL_IMPORT

# Check global state
# In CMS: System → Perenual Import State
```

### Issue: Duplicate herbs created

**Symptoms**: Same herb appears multiple times

**Cause**: Deduplication failed or scientific names don't match

**Solution**:

```typescript
// Manual deduplication
import { bulkDeduplicate } from './src/lib/herbDeduplication'
const stats = await bulkDeduplicate(payload)

// Or check specific herb
import { checkForDuplicates } from './src/lib/herbDeduplication'
const result = await checkForDuplicates(payload, 'Scientific Name')
```

### Issue: Data not merging correctly

**Symptoms**: Perenual data overwrites Trefle data

**Cause**: Merge logic preferring new over existing

**Solution**:

- Review `mergeHerbData()` in `herbDeduplication.ts`
- Existing non-null values should be preserved
- Arrays should combine without duplicates

### Issue: Rate limit errors

**Symptoms**:

```
❌ Perenual API rate limit reached. Waiting 60 seconds...
```

**Cause**: Too many requests

**Solution**:

- Implementation auto-retries after 60s
- Reduce `pagesPerRun` in import job from 2 to 1
- Check Perenual dashboard for daily usage

### Issue: Import stuck on same page

**Check**:

```typescript
const progress = await getPerenualImportProgress(payload)
console.log(progress.currentPage)
```

**Solution**:

```typescript
// Reset to restart
await resetPerenualImport(payload)

// Or manually update global
// In CMS: System → Perenual Import State
// Set currentPage to desired page
```

## Best Practices

### For Cultivation Data

1. **Enable import selectively** - Test on staging first
2. **Monitor merge quality** - Review merged herbs
3. **Clean up drafts** - Delete non-medicinal plants
4. **Use both sources** - Trefle + Perenual = complete data

### For Deduplication

1. **Trust the system** - Deduplication is automatic
2. **Review merge results** - Check import logs
3. **Run cleanup periodically** - `bulkDeduplicate()` monthly
4. **Standardize scientific names** - Use accepted nomenclature

### Performance Tips

1. **Run imports sequentially** - Enable one at a time initially
2. **Monitor database size** - 10K+ herbs use significant storage
3. **Index botanicalData** - Add database indexes for performance
4. **Archive old import logs** - Clean up logs >30 days

## Resources

- **Perenual API Docs**: https://perenual.com/docs/api
- **Perenual Dashboard**: https://perenual.com/user/api
- **Sign Up**: https://perenual.com/docs/api
- **Trefle Integration**: [./TREFLE_INTEGRATION.md](./TREFLE_INTEGRATION.md)
- **Deduplication Code**: `apps/cms/src/lib/herbDeduplication.ts`

## Support

For issues with the Perenual integration:

1. Check this documentation
2. Review import logs and state
3. Test deduplication with sample herbs
4. Search [GitHub Issues](https://github.com/verscienta/verscienta-health/issues)
5. Create a new issue with:
   - Error messages
   - Import logs
   - Duplicate herb IDs
   - Steps to reproduce

---

**Built with 🌱 for practical gardening knowledge**
