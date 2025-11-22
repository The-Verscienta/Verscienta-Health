# Seed Data Scripts

Generate realistic seed data for local development and testing.

## Overview

The seed scripts create realistic test data for all Payload CMS collections, including:

- **Users** (15 users across all roles: admin, editor, practitioner, herbalist, user)
- **Herbs** (20 herbs with botanical info, TCM properties, Western properties)
- **Formulas** (8 TCM and Western formulas with herb ingredients)
- **Conditions** (14 TCM patterns and Western conditions)
- **Practitioners** (10 practitioners with locations, services, credentials)
- **Reviews** (50 reviews for herbs, formulas, and practitioners)

## Quick Start

```bash
# Seed all collections with default counts
pnpm seed

# Seed specific collections
pnpm seed --herbs --formulas

# Seed with custom counts
pnpm seed --herbs 50 --formulas 20

# Clear existing data and reseed
pnpm seed --clear --all

# Show help
pnpm seed --help
```

## Usage

### Basic Commands

```bash
# Seed all collections (default)
pnpm seed
pnpm seed --all

# Seed specific collections
pnpm seed --users
pnpm seed --herbs
pnpm seed --formulas
pnpm seed --conditions
pnpm seed --practitioners
pnpm seed --reviews

# Combine multiple collections
pnpm seed --users --herbs --formulas
```

### Custom Counts

```bash
# Set count for specific collection
pnpm seed --herbs 100

# Set count for all collections
pnpm seed --all --count 50

# Mix and match
pnpm seed --herbs 100 --formulas 20 --conditions 30
```

### Clear Data

```bash
# Clear existing data before seeding
pnpm seed --clear --all

# Clear and seed specific collections
pnpm seed --clear --herbs --formulas
```

## Default Counts

| Collection    | Default Count |
| ------------- | ------------- |
| Users         | 15            |
| Herbs         | 20            |
| Formulas      | 8             |
| Conditions    | 14            |
| Practitioners | 10            |
| Reviews       | 50            |

## Generated Data

### Users

Creates 15 users across all roles:

- **2 Admins** (admin@verscienta.com, sarah.admin@verscienta.com)
- **2 Editors** (michael.editor@verscienta.com, lisa.content@verscienta.com)
- **3 Practitioners** (matching practitioner collection data)
- **2 Herbalists** (jennifer.herbalist@example.com, david.botanist@example.com)
- **6 Regular Users** (john.doe@example.com, jane.smith@example.com, etc.)

**Default Password:** `Password123!` for all users

### Herbs

20 realistic herbs with:

- Scientific names (e.g., Panax ginseng)
- Botanical info (family, genus, species, parts used)
- Common names in English and Chinese
- TCM properties (energy, taste, meridians, actions)
- Western properties (actions, constituents)
- Safety info and dosage
- 70% published, 30% draft for testing

Example herbs:

- Ginseng (Panax ginseng) - 人参
- Lavender (Lavandula angustifolia)
- Chamomile (Matricaria chamomilla) - 蜜蝶香
- Echinacea (Echinacea purpurea)
- Ginger (Zingiber officinale) - 生姜
- Turmeric (Curcuma longa) - 姜黄
- And 14 more...

### Formulas

8 traditional formulas (TCM and Western):

- **Si Jun Zi Tang** (Four Gentlemen Decoction) - Spleen Qi Deficiency
- **Liu Wei Di Huang Wan** (Six Ingredient Pill) - Kidney Yin Deficiency
- **Xiao Yao San** (Free and Easy Wanderer) - Liver Qi Stagnation
- **Ba Zhen Tang** (Eight Treasure Decoction) - Qi and Blood Deficiency
- **Immune Support Formula** - Western immune support
- **Stress Relief Blend** - Western stress and anxiety
- **Digestive Harmony** - Western digestive issues
- **Sleep Support Formula** - Western insomnia

Each formula includes:

- 3-6 herb ingredients with quantities and roles (chief, deputy, assistant, envoy)
- Tradition (TCM or Western)
- TCM patterns or Western indications
- Preparation method and dosage
- Safety information
- 80% published, 20% draft

### Conditions

14 conditions split between TCM patterns and Western conditions:

**TCM Patterns:**

- Qi Deficiency
- Blood Deficiency
- Yin Deficiency
- Yang Deficiency
- Qi Stagnation
- Blood Stasis
- And more...

**Western Conditions:**

- Anxiety
- Insomnia
- Digestive Issues
- Inflammation
- Common Cold
- And more...

Each condition includes:

- Symptoms
- Related herbs
- ICD-10 codes (Western conditions only)
- Category (tcm-pattern or western-condition)
- 90% published, 10% draft

### Practitioners

10 practitioners with realistic profiles:

- Full names and titles (L.Ac, DAOM, ND, MD(H))
- Specialties (TCM, Acupuncture, Herbal Medicine, Ayurveda, etc.)
- Modalities (Acupuncture, Cupping, Moxibustion, etc.)
- Credentials (licenses, education, years of experience)
- Contact info (email, phone, website)
- Location (clinic name, address, coordinates)
- Services offered with pricing and duration
- Availability (accepting new patients, virtual consultations, languages)
- 80% published, 20% draft

### Reviews

50 reviews distributed across herbs, formulas, and practitioners:

- **Rating Distribution:** Weighted towards higher ratings (40% 5-star, 30% 4-star, 15% 3-star, 10% 2-star, 5% 1-star)
- **Moderation Status:** 90% approved, 5% pending, 5% flagged
- **Review Content:** Realistic review text based on rating
- **Helpful Counts:** Random helpful/not helpful counts for approved reviews

Example reviews:

- "Excellent Results! - Very knowledgeable and professional. Helped me tremendously." (5 stars)
- "Great Experience - Amazing results with the herbs. Feeling much better!" (4 stars)
- "Good Overall - Good service, but takes time to see results." (3 stars)
- "Disappointing - Did not work well for me. Still looking for alternatives." (2 stars)

## Script Architecture

### File Structure

```
scripts/seed/
├── index.ts           # Main CLI script
├── utils.ts           # Helper functions and constants
├── users.ts           # User seed generator
├── herbs.ts           # Herb seed generator
├── formulas.ts        # Formula seed generator
├── conditions.ts      # Condition seed generator
├── practitioners.ts   # Practitioner seed generator
├── reviews.ts         # Review seed generator
└── README.md          # This file
```

### Dependencies

Each seeder function handles dependencies:

1. **Users** - Independent (no dependencies)
2. **Herbs** - Independent (no dependencies)
3. **Formulas** - Depends on herbs (selects random herbs for ingredients)
4. **Conditions** - Depends on herbs (selects related herbs)
5. **Practitioners** - Independent (no dependencies)
6. **Reviews** - Depends on users + entities (herbs, formulas, practitioners)

The main script runs seeders in the correct order to satisfy dependencies.

### Utility Functions

`utils.ts` provides helper functions:

```typescript
// Random generators
randomInt(min, max) // Random integer
randomItem(array) // Pick random item
randomItems(array, count) // Pick N random items
randomBoolean(probability) // Random boolean with probability
randomRating() // Weighted 1-5 star rating

// Data generators
randomEmail(name) // Generate email
randomPhone() // Generate US phone number
randomAddress() // Generate US address
randomCoordinates() // Generate US coordinates
randomPastDate(days) // Random date within past N days

// Utilities
slugify(text) // Convert text to slug

// Constants
COMMON_HERBS // Array of herb names
TCM_CONDITIONS // Array of TCM patterns
WESTERN_CONDITIONS // Array of Western conditions
SPECIALTIES // Array of practitioner specialties
MODALITIES // Array of treatment modalities
REVIEW_TEXTS // Realistic review text samples
```

## Integration with PayloadCMS

### Collections Schema

Seed data matches PayloadCMS collection schemas:

- Uses relationship fields correctly (e.g., formula ingredients → herbs)
- Respects required fields and validation rules
- Generates data in both `published` and `draft` status for testing
- Creates realistic rich text content (bio, description fields)

### Authentication

User seeding uses PayloadCMS auth:

- Password: `Password123!` (hashed by Payload)
- Email authentication enabled
- Role-based access control (admin, editor, practitioner, herbalist, user)

### Relationships

Maintains referential integrity:

- Formulas reference actual herb IDs
- Conditions reference actual herb IDs
- Reviews reference actual user, herb, formula, and practitioner IDs

## Development Workflow

### Initial Setup

```bash
# 1. Seed database for first time
pnpm seed

# 2. Start dev server
pnpm dev

# 3. Login to admin panel
# URL: http://localhost:3000/admin
# Email: admin@verscienta.com
# Password: Password123!
```

### Reset Database

```bash
# Clear and reseed all data
pnpm seed --clear --all

# Clear and reseed specific collections
pnpm seed --clear --herbs --formulas
```

### Test Different Scenarios

```bash
# Large dataset for performance testing
pnpm seed --clear --all --count 500

# Minimal dataset for quick testing
pnpm seed --clear --users 5 --herbs 10 --formulas 3

# Focus on specific features
pnpm seed --clear --practitioners 20 --reviews 100
```

## Troubleshooting

### PayloadCMS Not Initialized

**Error:** `Cannot get payload instance`

**Solution:** Ensure environment variables are set correctly:

```bash
# .env.local
DATABASE_URL="postgresql://..."
PAYLOAD_SECRET="your-secret-key"
```

### Relationship Errors

**Error:** `Invalid relationship ID`

**Solution:** Ensure dependent collections are seeded first:

```bash
# Wrong (formulas need herbs first)
pnpm seed --formulas

# Correct (seed herbs first)
pnpm seed --herbs --formulas

# Or use --all (handles dependencies automatically)
pnpm seed --all
```

### Duplicate Email Errors

**Error:** `Email already exists`

**Solution:** Clear users before reseeding:

```bash
pnpm seed --clear --users
```

### Performance Issues

**Issue:** Slow seeding with large datasets

**Solution:**

- Use smaller counts for development (`--count 20`)
- Seed only needed collections (`--users --herbs`)
- Production seeding should use database imports instead

## Best Practices

### Local Development

- Use default counts (fast, realistic data)
- Reseed when schema changes (`--clear --all`)
- Keep admin user for consistent testing

### E2E Testing

- Seed before test runs
- Use deterministic data where possible
- Clear data between test suites

### Production

- **Never run seed scripts in production**
- Use database migrations for schema changes
- Import real data instead of seed data

## Next Steps

After seeding:

1. **Explore Admin Panel** - http://localhost:3000/admin
2. **Test Frontend** - http://localhost:3000
3. **Test API Endpoints** - http://localhost:3000/api/*
4. **Add More Seeders** - Create new generators in this directory
5. **Customize Data** - Edit seed files to match your needs

## Contributing

To add new seed data:

1. Create new seeder file (e.g., `scripts/seed/modalities.ts`)
2. Export async function: `seedModalities(payload, count)`
3. Import in `index.ts`
4. Add to CLI options and execution order
5. Update this README

## Support

For issues or questions:

- Check PayloadCMS docs: https://payloadcms.com/docs
- Review collection schemas in `payload/collections/`
- Check TODO_MASTER.md for project context
