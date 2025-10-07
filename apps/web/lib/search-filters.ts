/**
 * Search filter configurations for different content types
 */

import { FilterGroup } from '@/components/search/SearchFilters'

/**
 * Herb search filters
 */
export const herbFilterGroups: FilterGroup[] = [
  {
    id: 'tcm_taste',
    label: 'TCM Taste',
    multiSelect: true,
    options: [
      { label: 'Sweet', value: 'sweet' },
      { label: 'Bitter', value: 'bitter' },
      { label: 'Pungent', value: 'pungent' },
      { label: 'Sour', value: 'sour' },
      { label: 'Salty', value: 'salty' },
      { label: 'Bland', value: 'bland' },
      { label: 'Astringent', value: 'astringent' },
    ],
  },
  {
    id: 'tcm_temperature',
    label: 'TCM Temperature',
    multiSelect: true,
    options: [
      { label: 'Hot', value: 'hot' },
      { label: 'Warm', value: 'warm' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Cool', value: 'cool' },
      { label: 'Cold', value: 'cold' },
    ],
  },
  {
    id: 'tcm_category',
    label: 'TCM Category',
    multiSelect: true,
    options: [
      { label: 'Tonifying', value: 'tonifying' },
      { label: 'Dispersing', value: 'dispersing' },
      { label: 'Draining', value: 'draining' },
      { label: 'Harmonizing', value: 'harmonizing' },
      { label: 'Warming', value: 'warming' },
      { label: 'Cooling', value: 'cooling' },
      { label: 'Calming', value: 'calming' },
      { label: 'Invigorating', value: 'invigorating' },
    ],
  },
  {
    id: 'western_properties',
    label: 'Western Properties',
    multiSelect: true,
    options: [
      { label: 'Adaptogen', value: 'adaptogen' },
      { label: 'Anti-inflammatory', value: 'anti-inflammatory' },
      { label: 'Antioxidant', value: 'antioxidant' },
      { label: 'Antimicrobial', value: 'antimicrobial' },
      { label: 'Digestive', value: 'digestive' },
      { label: 'Nervine', value: 'nervine' },
      { label: 'Immune Support', value: 'immune-support' },
      { label: 'Hepatoprotective', value: 'hepatoprotective' },
      { label: 'Cardioprotective', value: 'cardioprotective' },
      { label: 'Neuroprotective', value: 'neuroprotective' },
    ],
  },
  {
    id: 'safety_level',
    label: 'Safety Level',
    multiSelect: true,
    options: [
      { label: 'Generally Safe', value: 'safe' },
      { label: 'Use with Caution', value: 'caution' },
      { label: 'Requires Supervision', value: 'supervision' },
    ],
  },
]

/**
 * Formula search filters
 */
export const formulaFilterGroups: FilterGroup[] = [
  {
    id: 'tradition',
    label: 'Tradition',
    multiSelect: true,
    options: [
      { label: 'Traditional Chinese Medicine', value: 'tcm' },
      { label: 'Western Herbalism', value: 'western' },
      { label: 'Ayurvedic', value: 'ayurvedic' },
      { label: 'Modern Blend', value: 'modern' },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    multiSelect: true,
    options: [
      { label: 'Tonifying', value: 'tonifying' },
      { label: 'Dispersing', value: 'dispersing' },
      { label: 'Harmonizing', value: 'harmonizing' },
      { label: 'Clearing Heat', value: 'clearing-heat' },
      { label: 'Warming Interior', value: 'warming-interior' },
      { label: 'Nourishing', value: 'nourishing' },
      { label: 'Draining', value: 'draining' },
      { label: 'Calming', value: 'calming' },
    ],
  },
  {
    id: 'form',
    label: 'Form',
    multiSelect: true,
    options: [
      { label: 'Decoction', value: 'decoction' },
      { label: 'Powder', value: 'powder' },
      { label: 'Pill', value: 'pill' },
      { label: 'Tincture', value: 'tincture' },
      { label: 'Capsule', value: 'capsule' },
      { label: 'Tea', value: 'tea' },
    ],
  },
  {
    id: 'complexity',
    label: 'Complexity',
    multiSelect: false,
    options: [
      { label: 'Simple (1-3 herbs)', value: 'simple' },
      { label: 'Moderate (4-8 herbs)', value: 'moderate' },
      { label: 'Complex (9+ herbs)', value: 'complex' },
    ],
  },
]

/**
 * Condition search filters
 */
export const conditionFilterGroups: FilterGroup[] = [
  {
    id: 'severity',
    label: 'Severity',
    multiSelect: true,
    options: [
      { label: 'Mild', value: 'mild' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Severe', value: 'severe' },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    multiSelect: true,
    options: [
      { label: 'Digestive', value: 'digestive' },
      { label: 'Respiratory', value: 'respiratory' },
      { label: 'Cardiovascular', value: 'cardiovascular' },
      { label: 'Musculoskeletal', value: 'musculoskeletal' },
      { label: 'Neurological', value: 'neurological' },
      { label: 'Immune', value: 'immune' },
      { label: 'Endocrine', value: 'endocrine' },
      { label: 'Mental Health', value: 'mental-health' },
      { label: 'Skin', value: 'skin' },
      { label: "Women's Health", value: 'womens-health' },
      { label: "Men's Health", value: 'mens-health' },
    ],
  },
  {
    id: 'tcm_pattern',
    label: 'TCM Pattern',
    multiSelect: true,
    options: [
      { label: 'Qi Deficiency', value: 'qi-deficiency' },
      { label: 'Blood Deficiency', value: 'blood-deficiency' },
      { label: 'Yin Deficiency', value: 'yin-deficiency' },
      { label: 'Yang Deficiency', value: 'yang-deficiency' },
      { label: 'Qi Stagnation', value: 'qi-stagnation' },
      { label: 'Blood Stasis', value: 'blood-stasis' },
      { label: 'Dampness', value: 'dampness' },
      { label: 'Phlegm', value: 'phlegm' },
      { label: 'Heat', value: 'heat' },
      { label: 'Cold', value: 'cold' },
    ],
  },
]

/**
 * Practitioner search filters
 */
export const practitionerFilterGroups: FilterGroup[] = [
  {
    id: 'modality',
    label: 'Modality',
    multiSelect: true,
    options: [
      { label: 'Traditional Chinese Medicine', value: 'tcm' },
      { label: 'Acupuncture', value: 'acupuncture' },
      { label: 'Western Herbalism', value: 'western-herbalism' },
      { label: 'Naturopathy', value: 'naturopathy' },
      { label: 'Ayurveda', value: 'ayurveda' },
      { label: 'Functional Medicine', value: 'functional-medicine' },
      { label: 'Homeopathy', value: 'homeopathy' },
      { label: 'Nutrition', value: 'nutrition' },
      { label: 'Massage Therapy', value: 'massage' },
      { label: 'Energy Healing', value: 'energy-healing' },
    ],
  },
  {
    id: 'specialization',
    label: 'Specialization',
    multiSelect: true,
    options: [
      { label: 'Pain Management', value: 'pain-management' },
      { label: 'Digestive Health', value: 'digestive' },
      { label: 'Mental Health', value: 'mental-health' },
      { label: "Women's Health", value: 'womens-health' },
      { label: 'Fertility', value: 'fertility' },
      { label: 'Autoimmune Conditions', value: 'autoimmune' },
      { label: 'Sports Medicine', value: 'sports' },
      { label: 'Pediatrics', value: 'pediatrics' },
      { label: 'Geriatrics', value: 'geriatrics' },
      { label: 'Oncology Support', value: 'oncology' },
    ],
  },
  {
    id: 'availability',
    label: 'Availability',
    multiSelect: true,
    options: [
      { label: 'Accepting New Patients', value: 'accepting' },
      { label: 'Virtual Consultations', value: 'virtual' },
      { label: 'In-Person Only', value: 'in-person' },
      { label: 'Same-Day Appointments', value: 'same-day' },
    ],
  },
  {
    id: 'verification',
    label: 'Verification Status',
    multiSelect: false,
    options: [
      { label: 'Verified Only', value: 'verified' },
      { label: 'All Practitioners', value: 'all' },
    ],
  },
]

/**
 * Sort options for each content type
 */
export const sortOptions = {
  herbs: [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Highest Rated', value: 'rating_desc' },
    { label: 'Most Reviewed', value: 'reviews_desc' },
  ],
  formulas: [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Highest Rated', value: 'rating_desc' },
    { label: 'Ingredient Count', value: 'ingredients_desc' },
  ],
  conditions: [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Severity (High-Low)', value: 'severity_desc' },
    { label: 'Severity (Low-High)', value: 'severity_asc' },
  ],
  practitioners: [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Highest Rated', value: 'rating_desc' },
    { label: 'Most Reviewed', value: 'reviews_desc' },
    { label: 'Nearest', value: 'distance_asc' },
  ],
}

/**
 * Get filter groups for a specific content type
 */
export function getFilterGroups(contentType: 'herbs' | 'formulas' | 'conditions' | 'practitioners') {
  switch (contentType) {
    case 'herbs':
      return herbFilterGroups
    case 'formulas':
      return formulaFilterGroups
    case 'conditions':
      return conditionFilterGroups
    case 'practitioners':
      return practitionerFilterGroups
    default:
      return []
  }
}

/**
 * Get sort options for a specific content type
 */
export function getSortOptions(contentType: 'herbs' | 'formulas' | 'conditions' | 'practitioners') {
  return sortOptions[contentType] || sortOptions.herbs
}

/**
 * Apply filters to search results
 * This is a client-side filter for when server-side filtering is not available
 */
export function applyFilters(items: unknown[], activeFilters: Record<string, string[]>) {
  return items.filter((item) => {
    return Object.entries(activeFilters).every(([filterId, values]) => {
      if (values.length === 0) return true

      // Map filter IDs to item properties
      switch (filterId) {
        case 'tcm_taste':
          return values.some((v) => item.tcmProperties?.taste?.includes(v))
        case 'tcm_temperature':
          return values.includes(item.tcmProperties?.temperature)
        case 'tcm_category':
          return values.some((v) => item.tcmProperties?.category?.includes(v))
        case 'western_properties':
          return values.some((v) => item.westernProperties?.includes(v))
        case 'safety_level':
          return values.includes(item.safetyLevel)
        case 'tradition':
          return values.includes(item.tradition)
        case 'category':
          return values.includes(item.category)
        case 'form':
          return values.includes(item.form)
        case 'complexity':
          return values.includes(item.complexity)
        case 'severity':
          return values.includes(item.severity)
        case 'tcm_pattern':
          return values.some((v) => item.tcmPattern?.includes(v))
        case 'modality':
          return values.some((v) => item.modalities?.map((m: {slug: string}) => m.slug).includes(v))
        case 'specialization':
          return values.some((v) => item.specializations?.includes(v))
        case 'availability':
          if (values.includes('accepting')) return item.acceptingNewPatients
          if (values.includes('virtual')) return item.offersVirtualConsultations
          if (values.includes('in-person')) return !item.offersVirtualConsultations
          return true
        case 'verification':
          if (values.includes('verified')) return item.verificationStatus === 'verified'
          return true
        default:
          return true
      }
    })
  })
}

/**
 * Apply sorting to search results
 */
export function applySorting(items: unknown[], sortValue: string) {
  const sorted = [...items]

  switch (sortValue) {
    case 'name_asc':
      return sorted.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name))
    case 'name_desc':
      return sorted.sort((a, b) => (b.title || b.name).localeCompare(a.title || a.name))
    case 'rating_desc':
      return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    case 'reviews_desc':
      return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    case 'ingredients_desc':
      return sorted.sort((a, b) => (b.ingredients?.length || 0) - (a.ingredients?.length || 0))
    case 'severity_desc': {
      const severityOrder = { severe: 3, moderate: 2, mild: 1 }
      return sorted.sort((a, b) => (severityOrder[b.severity as keyof typeof severityOrder] || 0) - (severityOrder[a.severity as keyof typeof severityOrder] || 0))
    }
    case 'severity_asc': {
      const severityOrderAsc = { mild: 1, moderate: 2, severe: 3 }
      return sorted.sort((a, b) => (severityOrderAsc[a.severity as keyof typeof severityOrderAsc] || 0) - (severityOrderAsc[b.severity as keyof typeof severityOrderAsc] || 0))
    }
    case 'distance_asc':
      // Would require geolocation - placeholder for now
      return sorted
    default:
      // Relevance - keep original order from Algolia
      return sorted
  }
}
