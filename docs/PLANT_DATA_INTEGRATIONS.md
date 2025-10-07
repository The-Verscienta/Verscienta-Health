# Plant Data Integrations - Complete Guide

This guide covers the complete plant data integration system for Verscienta Health, including Trefle botanical data and Perenual cultivation data, with intelligent deduplication.

## Overview

Verscienta Health imports and enriches herb data from two complementary sources:

### 🌿 Trefle API (1M+ Plants)

- **Botanical data** - Scientific validation, taxonomy, distributions
- **Images** - High-quality botanical photographs
- **Toxicity** - Safety information
- **Growth characteristics** - Habit, height, form
- **Geographic data** - Native and introduced regions
- **Sources** - Scientific citations and references

### 🌱 Perenual API (10K+ Plants)

- **Cultivation tips** - Watering, sunlight, soil requirements
- **Pest management** - Common pests and treatment solutions
- **Care guides** - Detailed growing instructions
- **Hardiness zones** - USDA climate compatibility
- **Images** - Cultivation and garden photographs
- **Propagation** - Growing methods and schedules

## Smart Deduplication

The system automatically prevents duplicate herbs when importing from multiple sources.

### How It Works

```typescript
// 1. Check for existing herb by:
- Scientific name (primary match)
- Trefle ID (if from Trefle)
- Perenual ID (if from Perenual)
- Common name (secondary match)

// 2. If herb exists → MERGE data
{
  // From Trefle
  scientificName: "Lavandula angustifolia",
  botanicalData: {
    trefleId: 123,
    trefleData: { distributions, toxicity, ... }
  },
  images: [{ source: "Trefle", url: "..." }]
}

// + From Perenual
{
  scientificName: "Lavandula angustifolia",
  cultivation: { watering, sunlight, soil, ... },
  pest_management: "...",
  images: [{ source: "Perenual", url: "..." }]
}

// = Merged Result
{
  scientificName: "Lavandula angustifolia",
  botanicalData: {
    trefleId: 123,
    perenualId: 456,
    trefleData: { ... },
    perenualData: { ... }
  },
  cultivation: { watering, sunlight, soil, ... },
  pest_management: "...",
  images: [
    { source: "Trefle", url: "..." },
    { source: "Perenual", url: "..." } // Both images preserved!
  ]
}

// 3. If herb doesn't exist → CREATE as draft
```

### Image Collection

**Images from BOTH sources are automatically collected and merged:**

```typescript
// Trefle Import
images: [
  {
    url: 'https://trefle.io/images/lavender.jpg',
    caption: 'Lavender - from Trefle botanical database',
    type: 'photograph',
    source: 'Trefle',
  },
]

// Perenual Import (merges with existing)
images: [
  { url: 'https://trefle.io/images/lavender.jpg', source: 'Trefle' },
  { url: 'https://perenual.com/images/lavender-garden.jpg', source: 'Perenual' }, // Added!
]

// Result: Herb has images from both sources
```

The merge function:

1. Checks existing image URLs
2. Filters out duplicates (same URL)
3. Adds new unique images
4. Preserves source attribution

## Setup Guide

### 1. Get API Keys

**Trefle:**

1. Visit [trefle.io](https://trefle.io/)
2. Create free account
3. Generate API key

**Perenual:**

1. Visit [perenual.com/docs/api](https://perenual.com/docs/api)
2. Create free account
3. Generate API key

### 2. Configure Environment

```bash
# Trefle API
TREFLE_API_KEY=your-trefle-api-key-here
ENABLE_TREFLE_IMPORT=false  # Set to true to enable import

# Perenual API
PERENUAL_API_KEY=your-perenual-api-key-here
ENABLE_PERENUAL_IMPORT=false  # Set to true to enable import
```

### 3. Import Strategy

**Recommended Approach:**

```bash
# Step 1: Import Trefle first (botanical foundation)
TREFLE_API_KEY=xxx
ENABLE_TREFLE_IMPORT=true
ENABLE_PERENUAL_IMPORT=false

# Wait for Trefle import to complete (~7 days)

# Step 2: Import Perenual (cultivation data)
TREFLE_API_KEY=xxx
PERENUAL_API_KEY=xxx
ENABLE_TREFLE_IMPORT=false  # Disable to avoid overlap
ENABLE_PERENUAL_IMPORT=true

# Step 3: Keep both for weekly sync
ENABLE_TREFLE_IMPORT=false
ENABLE_PERENUAL_IMPORT=false
# Weekly sync jobs run automatically
```

**Parallel Import (Advanced):**

```bash
# Import both simultaneously (deduplication handles merging)
TREFLE_API_KEY=xxx
PERENUAL_API_KEY=xxx
ENABLE_TREFLE_IMPORT=true
ENABLE_PERENUAL_IMPORT=true

# Both run every minute, deduplication merges data automatically
```

## Data Flow

### Import Process

```
1. Trefle Import (Every Minute)
   ├── Fetch plants from Trefle API
   ├── Check for existing herb (deduplication)
   ├── If exists → Merge with existing data
   ├── If new → Create as draft
   └── Track progress in TrefleImportState

2. Perenual Import (Every Minute)
   ├── Fetch plants from Perenual API
   ├── Check for existing herb (deduplication)
   ├── If exists → Merge cultivation data + images
   ├── If new → Create as draft
   └── Track progress in PerenualImportState

3. Weekly Sync Jobs
   ├── Trefle Sync (Wednesday 3 AM)
   │   └── Enriches existing herbs with Trefle data
   └── (Future: Perenual sync job)
```

### What Gets Merged

**✅ Always Merged:**

- Images (both sources combined)
- Synonyms (combined without duplicates)
- Safety warnings (combined)
- Habitat information (appended)

**✅ Conditionally Merged:**

- Family (only if missing)
- Cultivation data (Perenual adds to existing)
- Pest management (Perenual adds to existing)

**✅ Never Overwritten:**

- Existing non-null values preferred
- Manual edits preserved
- Published status maintained

**✅ Source-Specific Fields:**

- `botanicalData.trefleId` - Only from Trefle
- `botanicalData.perenualId` - Only from Perenual
- `botanicalData.trefleData` - Only from Trefle
- `botanicalData.perenualData` - Only from Perenual

## Monitoring

### Check Import Progress

```typescript
// Trefle
import { getTrefleImportProgress } from '@/cron/jobs/importTrefleData'
const progress = await getTrefleImportProgress(payload)

// Perenual
import { getPerenualImportProgress } from '@/cron/jobs/importPerenualData'
const progress = await getPerenualImportProgress(payload)

console.log(`
  Current page: ${progress.currentPage}
  Completed: ${progress.isComplete}
  Estimated remaining: ${progress.estimatedPlantsRemaining}
`)
```

### View Merged Herbs

```bash
# In CMS Admin
1. Navigate to: Collections → Herbs
2. Filter by:
   - Has Trefle ID (trefleId exists)
   - Has Perenual ID (perenualId exists)
3. Herbs with both = Successfully merged data

# Check specific herb
1. Open herb detail
2. View "Botanical Data" section
3. Check for:
   - trefleId and trefleData (from Trefle)
   - perenualId and perenualData (from Perenual)
4. View "Images" section
5. Check sources: Some from "Trefle", some from "Perenual"
```

### Import Logs

```bash
# View all imports
CMS Admin → System → Import Logs

# Trefle imports
Filter by: "Trefle Progressive Import"

# Perenual imports
Filter by: "Perenual Progressive Import"

# Check log results for:
{
  herbsCreated: 50,    // New herbs
  herbsUpdated: 30,    // Merged with existing
  herbsSkipped: 20     // Duplicates or filtered
}
```

## Troubleshooting

### Duplicate Herbs Created

**Symptoms:** Same herb appears multiple times

**Causes:**

1. Scientific name variations (e.g., "Mill." vs "L.")
2. Deduplication failed
3. Different genus/species names

**Solution:**

```typescript
// Run bulk deduplication
import { bulkDeduplicate } from '@/lib/herbDeduplication'

const stats = await bulkDeduplicate(payload)
console.log(`
  Processed: ${stats.processed}
  Merged: ${stats.merged}
  Deleted duplicate: ${stats.deleted}
  Errors: ${stats.errors}
`)
```

### Images Not Merging

**Symptoms:** Only Trefle OR Perenual images, not both

**Check:**

1. View herb in admin
2. Check image sources
3. Review import logs for merge messages

**Debug:**

```typescript
// Check merge logic
const herb = await payload.findByID({ collection: 'herbs', id: 'xxx' })

console.log(
  'Images:',
  herb.images?.map((img) => ({
    source: img.source,
    url: img.url,
  }))
)

// Should show:
// [
//   { source: 'Trefle', url: '...' },
//   { source: 'Perenual', url: '...' }
// ]
```

### Data Overwriting Issues

**Symptoms:** New import overwrites existing data

**Cause:** Merge logic preferring new over existing

**Solution:**
Review `mergeHerbData()` in `herbDeduplication.ts`:

```typescript
// Should use preferFilled helper
merged.name = preferFilled(existing.name, newData.name)
// NOT: merged.name = newData.name
```

### Import Jobs Not Running

**Check:**

```bash
# Verify API keys
echo $TREFLE_API_KEY
echo $PERENUAL_API_KEY

# Verify import flags
echo $ENABLE_TREFLE_IMPORT
echo $ENABLE_PERENUAL_IMPORT

# Check cron logs
tail -f logs/cron.log | grep -E "(Trefle|Perenual)"
```

## Best Practices

### Import Strategy

1. **Start with Trefle** - Establishes botanical foundation
2. **Add Perenual** - Enhances with cultivation data
3. **Monitor merges** - Review merged herbs regularly
4. **Clean up drafts** - Delete non-medicinal plants
5. **Run deduplication** - Monthly maintenance

### Data Quality

1. **Standardize names** - Use accepted scientific nomenclature
2. **Review validation reports** - Fix name mismatches
3. **Check image quality** - Remove low-quality images
4. **Verify toxicity** - Cross-reference safety data
5. **Test cultivation tips** - Validate growing advice

### Performance

1. **Enable sequentially** - One import at a time initially
2. **Monitor database** - Watch storage usage
3. **Index fields** - Add indexes for botanicalData
4. **Archive logs** - Clean up old import logs
5. **Batch operations** - Use bulk deduplication offline

## API Rate Limits

### Trefle

- **120 requests/minute**
- **5000 requests/day** (free tier)
- Our implementation: ~60 req/min (well under limit)

### Perenual

- **Limited requests/day** (free tier)
- Our implementation: 1s delay between requests

### Combined Import

- Both run every minute
- Total: ~65 requests/minute
- Well within limits for both APIs

## Data Schema

### Complete Herb with Both Sources

```typescript
{
  // Basic Info
  name: "Lavender",
  slug: "lavender",
  scientificName: "Lavandula angustifolia",
  family: "Lamiaceae",
  synonyms: ["Lavandula officinalis", "Lavandula vera"],

  // Botanical Data (merged from both sources)
  botanicalData: {
    // From Trefle
    trefleId: 123456,
    trefleSlug: "lavandula-angustifolia",
    lastSyncedAt: "2025-01-15T10:00:00Z",
    trefleData: {
      author: "Mill.",
      distributions: {
        native: ["Mediterranean", "Europe"],
        introduced: ["North America"]
      },
      toxicity: "none",
      edible: false,
      sources: [{name: "USDA", url: "..."}]
    },

    // From Perenual
    perenualId: 789,
    lastPerenualSyncAt: "2025-01-15T11:00:00Z",
    perenualData: {
      origin: ["Mediterranean"],
      medicinal: true,
      toxicity: { toHumans: 0, toPets: 0 },
      attracts: ["Bees", "Butterflies"]
    }
  },

  // Cultivation (from Perenual)
  cultivation: {
    cycle: "Perennial",
    watering: "Average",
    sunlight: ["Full sun", "Part shade"],
    soil: ["Well-drained", "Loam"],
    hardiness: { min: "5", max: "9" },
    careLevel: "Easy",
    indoor: true,
    propagation: ["Seeds", "Cuttings"],
    pruning: {
      months: ["March", "April"],
      frequency: { amount: 2, interval: "year" }
    }
  },

  // Images (merged from both)
  images: [
    {
      url: "https://trefle.io/images/lavender-botanical.jpg",
      source: "Trefle",
      caption: "Lavender - from Trefle botanical database",
      type: "photograph"
    },
    {
      url: "https://perenual.com/images/lavender-garden.jpg",
      source: "Perenual",
      caption: "Lavender - from Perenual plant database",
      type: "photograph"
    }
  ],

  // Care & Pest Info (from Perenual)
  cultivation_notes: "Detailed care guide...",
  pest_management: "Common pests and solutions...",

  // Safety (merged from both)
  safetyInfo: {
    warnings: [
      "Trefle toxicity: none",
      "Toxicity to humans: No",
      "Toxicity to pets: No"
    ]
  }
}
```

## Resources

### Documentation

- [Trefle Integration](./TREFLE_INTEGRATION.md)
- [Perenual Integration](./PERENUAL_INTEGRATION.md)
- [Advanced Features](./ADVANCED_FEATURES.md)

### API Documentation

- [Trefle API Docs](https://docs.trefle.io/)
- [Perenual API Docs](https://perenual.com/docs/api)

### Code References

- Trefle Client: `apps/cms/src/lib/trefle.ts`
- Perenual Client: `apps/cms/src/lib/perenual.ts`
- Deduplication: `apps/cms/src/lib/herbDeduplication.ts`
- Trefle Import: `apps/cms/src/cron/jobs/importTrefleData.ts`
- Perenual Import: `apps/cms/src/cron/jobs/importPerenualData.ts`

---

**Built with 🌿 for comprehensive botanical knowledge**
