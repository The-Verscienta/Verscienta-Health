import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isPublished } from '../access/isAdmin'
import { algoliaSync } from '../hooks/algoliaSync'
import { generateSlug } from '../hooks/generateSlug'

export const Herbs: CollectionConfig = {
  slug: 'herbs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'scientificName', 'status', 'peerReviewStatus', 'updatedAt'],
    group: 'Content',
    description: 'Comprehensive herb database with TCM and Western herbalism properties',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'editor') return true
      return isPublished({ req })
    },
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    afterChange: [algoliaSync('herbs')],
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
  fields: [
    // =========================================================================
    // BASIC INFORMATION
    // =========================================================================
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Common Name',
      admin: {
        description: 'Primary common name of the herb',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeChange: [generateSlug('title')],
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-generated URL slug',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Overview Description',
      admin: {
        description: 'General overview and description of the herb',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
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
      admin: {
        description: 'Main image displayed in listings',
      },
    },
    {
      name: 'photoGallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true, // Bulk upload support - select multiple files at once
      label: 'Quick Photo Gallery',
      admin: {
        description:
          'Upload multiple herb photos at once (for detailed categorization, use "Additional Images" section below)',
      },
    },

    // =========================================================================
    // BOTANICAL INFORMATION
    // =========================================================================
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
          admin: {
            description: 'Binomial nomenclature (e.g., Panax ginseng)',
          },
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
          admin: {
            description: 'Taxonomic family (e.g., Araliaceae)',
          },
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
          admin: {
            description: 'Historical or alternative scientific names',
          },
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
          options: [
            { label: 'Herb', value: 'herb' },
            { label: 'Shrub', value: 'shrub' },
            { label: 'Tree', value: 'tree' },
            { label: 'Vine', value: 'vine' },
            { label: 'Grass', value: 'grass' },
            { label: 'Fern', value: 'fern' },
            { label: 'Moss', value: 'moss' },
            { label: 'Fungus', value: 'fungus' },
            { label: 'Lichen', value: 'lichen' },
          ],
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
            { label: 'Root', value: 'root' },
            { label: 'Leaf', value: 'leaf' },
            { label: 'Stem', value: 'stem' },
            { label: 'Flower', value: 'flower' },
            { label: 'Seed', value: 'seed' },
            { label: 'Bark', value: 'bark' },
            { label: 'Fruit', value: 'fruit' },
            { label: 'Whole Plant', value: 'whole_plant' },
            { label: 'Rhizome', value: 'rhizome' },
            { label: 'Bulb', value: 'bulb' },
            { label: 'Resin', value: 'resin' },
          ],
        },
        {
          name: 'botanicalDescription',
          type: 'richText',
          label: 'Detailed Botanical Description',
        },
      ],
    },

    // =========================================================================
    // CULTIVATION DETAILS
    // =========================================================================
    {
      name: 'cultivation',
      type: 'group',
      label: 'Cultivation Details',
      fields: [
        {
          name: 'soilType',
          type: 'text',
        },
        {
          name: 'climateZone',
          type: 'text',
        },
        {
          name: 'sunlightNeeds',
          type: 'select',
          options: [
            { label: 'Full Sun', value: 'full_sun' },
            { label: 'Partial Shade', value: 'partial_shade' },
            { label: 'Full Shade', value: 'full_shade' },
          ],
        },
        {
          name: 'waterNeeds',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'High', value: 'high' },
          ],
        },
        {
          name: 'hardinessZone',
          type: 'text',
        },
        {
          name: 'propagationMethod',
          type: 'textarea',
        },
        {
          name: 'growingSeason',
          type: 'text',
        },
      ],
    },

    // =========================================================================
    // CONSERVATION
    // =========================================================================
    {
      name: 'conservationStatus',
      type: 'select',
      options: [
        { label: 'Least Concern', value: 'least_concern' },
        { label: 'Near Threatened', value: 'near_threatened' },
        { label: 'Vulnerable', value: 'vulnerable' },
        { label: 'Endangered', value: 'endangered' },
        { label: 'Critically Endangered', value: 'critically_endangered' },
        { label: 'Extinct in Wild', value: 'extinct_wild' },
        { label: 'Not Evaluated', value: 'not_evaluated' },
        { label: 'Data Deficient', value: 'data_deficient' },
      ],
      admin: {
        position: 'sidebar',
        description: 'IUCN conservation status',
      },
    },
    {
      name: 'conservationNotes',
      type: 'richText',
      label: 'Conservation Notes',
      admin: {
        condition: (data) =>
          ['vulnerable', 'endangered', 'critically_endangered', 'extinct_wild'].includes(
            data.conservationStatus
          ),
      },
    },

    // =========================================================================
    // TRADITIONAL CHINESE MEDICINE PROPERTIES
    // =========================================================================
    {
      name: 'tcmProperties',
      type: 'group',
      label: 'Traditional Chinese Medicine',
      fields: [
        {
          name: 'tcmTaste',
          type: 'select',
          hasMany: true,
          label: 'TCM Taste',
          options: [
            { label: 'Sweet', value: 'sweet' },
            { label: 'Bitter', value: 'bitter' },
            { label: 'Sour', value: 'sour' },
            { label: 'Pungent', value: 'pungent' },
            { label: 'Salty', value: 'salty' },
            { label: 'Bland', value: 'bland' },
          ],
        },
        {
          name: 'tcmTemperature',
          type: 'select',
          label: 'TCM Temperature',
          options: [
            { label: 'Hot', value: 'hot' },
            { label: 'Warm', value: 'warm' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Cool', value: 'cool' },
            { label: 'Cold', value: 'cold' },
          ],
        },
        {
          name: 'tcmMeridians',
          type: 'select',
          hasMany: true,
          label: 'TCM Meridians',
          options: [
            { label: 'Lung', value: 'lung' },
            { label: 'Large Intestine', value: 'large_intestine' },
            { label: 'Stomach', value: 'stomach' },
            { label: 'Spleen', value: 'spleen' },
            { label: 'Heart', value: 'heart' },
            { label: 'Small Intestine', value: 'small_intestine' },
            { label: 'Bladder', value: 'bladder' },
            { label: 'Kidney', value: 'kidney' },
            { label: 'Pericardium', value: 'pericardium' },
            { label: 'Triple Burner', value: 'triple_burner' },
            { label: 'Gallbladder', value: 'gallbladder' },
            { label: 'Liver', value: 'liver' },
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
          admin: {
            description: 'e.g., "Tonifying Herbs - Qi Tonics"',
          },
        },
        {
          name: 'tcmTraditionalUses',
          type: 'richText',
          label: 'TCM Traditional Uses',
        },
      ],
    },

    // =========================================================================
    // WESTERN HERBALISM
    // =========================================================================
    {
      name: 'westernProperties',
      type: 'select',
      hasMany: true,
      label: 'Western Herbal Properties',
      options: [
        { label: 'Adaptogen', value: 'adaptogen' },
        { label: 'Alterative', value: 'alterative' },
        { label: 'Analgesic', value: 'analgesic' },
        { label: 'Anti-inflammatory', value: 'anti_inflammatory' },
        { label: 'Antimicrobial', value: 'antimicrobial' },
        { label: 'Antioxidant', value: 'antioxidant' },
        { label: 'Antispasmodic', value: 'antispasmodic' },
        { label: 'Astringent', value: 'astringent' },
        { label: 'Bitter', value: 'bitter' },
        { label: 'Carminative', value: 'carminative' },
        { label: 'Demulcent', value: 'demulcent' },
        { label: 'Diaphoretic', value: 'diaphoretic' },
        { label: 'Diuretic', value: 'diuretic' },
        { label: 'Expectorant', value: 'expectorant' },
        { label: 'Hepatic', value: 'hepatic' },
        { label: 'Nervine', value: 'nervine' },
        { label: 'Sedative', value: 'sedative' },
        { label: 'Stimulant', value: 'stimulant' },
        { label: 'Tonic', value: 'tonic' },
        { label: 'Vulnerary', value: 'vulnerary' },
      ],
    },
    {
      name: 'therapeuticUses',
      type: 'richText',
      label: 'Therapeutic Uses',
    },
    {
      name: 'traditionalAmericanUses',
      type: 'richText',
      label: 'Traditional American Uses',
    },
    {
      name: 'nativeAmericanUses',
      type: 'richText',
      label: 'Native American Uses',
    },

    // =========================================================================
    // ACTIVE CONSTITUENTS
    // =========================================================================
    {
      name: 'activeConstituents',
      type: 'array',
      label: 'Active Constituents',
      fields: [
        {
          name: 'compoundName',
          type: 'text',
          required: true,
          label: 'Compound Name',
        },
        {
          name: 'compoundClass',
          type: 'text',
          label: 'Compound Class',
          admin: {
            description: 'e.g., "Ginsenosides", "Alkaloids", "Flavonoids"',
          },
        },
        {
          name: 'percentage',
          type: 'number',
          label: 'Percentage (%)',
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'effects',
          type: 'textarea',
          label: 'Biological Effects',
        },
      ],
    },

    // =========================================================================
    // PHARMACOLOGY
    // =========================================================================
    {
      name: 'pharmacologicalEffects',
      type: 'richText',
      label: 'Pharmacological Effects',
    },
    {
      name: 'clinicalStudies',
      type: 'array',
      label: 'Clinical Studies',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'year',
          type: 'number',
        },
        {
          name: 'summary',
          type: 'richText',
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Link to full study',
          },
        },
        {
          name: 'doi',
          type: 'text',
          label: 'DOI',
        },
        {
          name: 'conclusion',
          type: 'textarea',
        },
      ],
    },

    // =========================================================================
    // DOSAGE & PREPARATION
    // =========================================================================
    {
      name: 'dosageForms',
      type: 'select',
      hasMany: true,
      label: 'Available Dosage Forms',
      options: [
        { label: 'Tincture', value: 'tincture' },
        { label: 'Tea/Infusion', value: 'tea' },
        { label: 'Decoction', value: 'decoction' },
        { label: 'Capsule', value: 'capsule' },
        { label: 'Tablet', value: 'tablet' },
        { label: 'Powder', value: 'powder' },
        { label: 'Extract', value: 'extract' },
        { label: 'Essential Oil', value: 'essential_oil' },
        { label: 'Poultice', value: 'poultice' },
        { label: 'Salve', value: 'salve' },
        { label: 'Syrup', value: 'syrup' },
        { label: 'Compress', value: 'compress' },
      ],
    },
    {
      name: 'recommendedDosage',
      type: 'array',
      label: 'Recommended Dosage',
      fields: [
        {
          name: 'form',
          type: 'select',
          required: true,
          options: [
            { label: 'Tincture', value: 'tincture' },
            { label: 'Tea/Infusion', value: 'tea' },
            { label: 'Decoction', value: 'decoction' },
            { label: 'Capsule', value: 'capsule' },
            { label: 'Tablet', value: 'tablet' },
            { label: 'Powder', value: 'powder' },
            { label: 'Extract', value: 'extract' },
          ],
        },
        {
          name: 'amount',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g., "1-2 mL", "500mg", "1 cup"',
          },
        },
        {
          name: 'frequency',
          type: 'text',
          admin: {
            description: 'e.g., "2-3 times daily"',
          },
        },
        {
          name: 'duration',
          type: 'text',
          admin: {
            description: 'e.g., "Up to 3 months"',
          },
        },
        {
          name: 'population',
          type: 'text',
          admin: {
            description: 'e.g., "Adults", "Children 6-12"',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'preparationMethods',
      type: 'array',
      label: 'Preparation Methods',
      fields: [
        {
          name: 'methodType',
          type: 'select',
          required: true,
          options: [
            { label: 'Decoction', value: 'decoction' },
            { label: 'Infusion', value: 'infusion' },
            { label: 'Tincture', value: 'tincture' },
            { label: 'Powder', value: 'powder' },
            { label: 'Poultice', value: 'poultice' },
            { label: 'Extract', value: 'extract' },
            { label: 'Oil Infusion', value: 'oil_infusion' },
          ],
        },
        {
          name: 'instructions',
          type: 'richText',
          required: true,
        },
        {
          name: 'time',
          type: 'text',
          admin: {
            description: 'Preparation time',
          },
        },
        {
          name: 'yield',
          type: 'text',
        },
        {
          name: 'storage',
          type: 'textarea',
        },
      ],
    },

    // =========================================================================
    // SAFETY INFORMATION
    // =========================================================================
    {
      name: 'safetyInfo',
      type: 'group',
      label: 'Safety Information',
      fields: [
        {
          name: 'contraindications',
          type: 'richText',
          label: 'Contraindications',
        },
        {
          name: 'drugInteractions',
          type: 'array',
          label: 'Drug Interactions',
          dbName: 'drug_int',
          fields: [
            {
              name: 'drugName',
              type: 'text',
              required: true,
            },
            {
              name: 'interactionType',
              type: 'select',
              required: true,
              dbName: 'type',
              options: [
                { label: 'Major', value: 'major' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'Minor', value: 'minor' },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
            {
              name: 'mechanism',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'sideEffects',
          type: 'richText',
          label: 'Side Effects',
        },
        {
          name: 'toxicityLevel',
          type: 'select',
          label: 'Toxicity Level',
          options: [
            { label: 'None Known', value: 'none' },
            { label: 'Low', value: 'low' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'High', value: 'high' },
            { label: 'Severe', value: 'severe' },
          ],
        },
        {
          name: 'toxicityNotes',
          type: 'richText',
          admin: {
            condition: (data) =>
              data.safetyInfo?.toxicityLevel &&
              ['moderate', 'high', 'severe'].includes(data.safetyInfo.toxicityLevel),
          },
        },
        {
          name: 'allergenicPotential',
          type: 'select',
          label: 'Allergenic Potential',
          options: [
            { label: 'None Known', value: 'none' },
            { label: 'Low', value: 'low' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'High', value: 'high' },
          ],
        },
      ],
    },

    // =========================================================================
    // MEDIA
    // =========================================================================
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
            { label: 'Whole Plant', value: 'whole_plant' },
            { label: 'Flower', value: 'flower' },
            { label: 'Leaf', value: 'leaf' },
            { label: 'Root', value: 'root' },
            { label: 'Bark', value: 'bark' },
            { label: 'Seed', value: 'seed' },
            { label: 'Dried Form', value: 'dried' },
            { label: 'Habitat', value: 'habitat' },
            { label: 'Preparation', value: 'preparation' },
          ],
        },
      ],
    },
    {
      name: 'videos',
      type: 'array',
      label: 'YouTube Videos',
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
          admin: {
            description: 'Just the ID, not the full URL (e.g., "dQw4w9WgXcQ")',
          },
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================
    {
      name: 'relatedHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
      label: 'Related Species',
    },
    {
      name: 'substituteHerbs',
      type: 'relationship',
      relationTo: 'herbs',
      hasMany: true,
      label: 'Substitute Herbs',
    },
    {
      name: 'conditionsTreated',
      type: 'relationship',
      relationTo: 'conditions',
      hasMany: true,
      label: 'Conditions Treated',
    },

    // =========================================================================
    // REVIEWS & RATINGS
    // =========================================================================
    {
      name: 'averageRating',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-calculated from reviews',
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

    // =========================================================================
    // METADATA
    // =========================================================================
    {
      name: 'herbId',
      type: 'text',
      unique: true,
      label: 'Herb ID',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Auto-generated unique identifier (H-0001)',
      },
      hooks: {
        beforeValidate: [
          async ({ value, operation, req }) => {
            if (operation === 'create' && !value) {
              // Get the last herb ID and increment
              const lastHerb = await req.payload.find({
                collection: 'herbs',
                limit: 1,
                sort: '-herbId',
              })

              if (lastHerb.docs.length > 0) {
                const lastId = lastHerb.docs[0].herbId
                const numMatch = lastId?.match(/H-(\d+)/)
                if (numMatch) {
                  const nextNum = parseInt(numMatch[1]) + 1
                  return `H-${nextNum.toString().padStart(4, '0')}`
                }
              }
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
      name: 'searchTags',
      type: 'array',
      label: 'Search Tags',
      admin: {
        description: 'Additional keywords for search optimization',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
}
