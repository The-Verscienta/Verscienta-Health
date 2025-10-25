import type { Meta, StoryObj } from '@storybook/react'
import {
  HerbRecommendations,
  HerbRecommendationsSkeleton,
  type HerbRecommendationsProps,
  type TCMPattern,
  type HerbRecommendation,
} from './HerbRecommendations'

/**
 * HerbRecommendations Component Stories
 *
 * This component displays TCM pattern analysis and herb recommendations
 * based on user symptoms. It includes:
 * - Medical disclaimer banner
 * - TCM pattern cards with confidence scores
 * - Herb recommendation cards with safety ratings
 * - Lifestyle recommendations
 * - Loading skeleton states
 */
const meta: Meta<typeof HerbRecommendations> = {
  title: 'Components/Recommendations/HerbRecommendations',
  component: HerbRecommendations,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Displays AI-generated herb recommendations based on TCM pattern analysis. Includes safety information, contraindications, and medical disclaimers.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof HerbRecommendations>

// Sample TCM Patterns
const samplePatterns: TCMPattern[] = [
  {
    name: 'Qi Deficiency',
    description: 'A lack of vital energy affecting multiple organ systems',
    confidence: 85,
    symptoms: ['fatigue', 'shortness of breath', 'weak voice', 'pale complexion', 'poor appetite'],
    rootCause: 'Chronic stress, overwork, and inadequate rest depleting the body\'s Qi reserves',
  },
  {
    name: 'Blood Stasis',
    description: 'Poor circulation of blood leading to blockages and pain',
    confidence: 72,
    symptoms: ['sharp pain', 'dark complexion', 'cold extremities', 'purple tongue'],
    rootCause: 'Sedentary lifestyle and emotional stress causing blood to move sluggishly',
  },
]

// Sample Herb Recommendations
const sampleHerbs: HerbRecommendation[] = [
  {
    id: '1',
    name: 'Ginseng (Ren Shen)',
    scientificName: 'Panax ginseng',
    slug: 'ginseng',
    tcmAction: 'Tonifies Qi, strengthens Spleen and Lung',
    explanation:
      'Ginseng is a powerful Qi tonic that addresses the root cause of your fatigue and weakness. It strengthens the digestive system to improve nutrient absorption and boosts overall vitality.',
    dosage: '3-9g daily in decoction, or 1-2g as powder',
    contraindications: ['Pregnancy', 'High blood pressure', 'Acute infections'],
    safetyRating: 'caution',
  },
  {
    id: '2',
    name: 'Astragalus (Huang Qi)',
    scientificName: 'Astragalus membranaceus',
    slug: 'astragalus',
    tcmAction: 'Tonifies Qi and strengthens Wei Qi (defensive energy)',
    explanation:
      'Astragalus complements Ginseng by focusing on immune function and stamina. It helps prevent illness and increases energy levels gradually without overstimulation.',
    dosage: '9-30g daily in decoction',
    safetyRating: 'safe',
  },
  {
    id: '3',
    name: 'Salvia (Dan Shen)',
    scientificName: 'Salvia miltiorrhiza',
    slug: 'salvia',
    tcmAction: 'Invigorates blood, dispels stasis, clears heat',
    explanation:
      'Salvia addresses blood stagnation by improving circulation and reducing pain. It also has cardiovascular benefits and helps clear toxins from the blood.',
    dosage: '9-15g daily in decoction',
    contraindications: ['Blood thinning medications', 'Pregnancy', 'Upcoming surgery'],
    safetyRating: 'consult',
  },
  {
    id: '4',
    name: 'Licorice Root (Gan Cao)',
    scientificName: 'Glycyrrhiza uralensis',
    slug: 'licorice-root',
    tcmAction: 'Harmonizes formulas, tonifies Qi, clears heat',
    explanation:
      'Licorice acts as a harmonizing herb that enhances the effects of other herbs while reducing potential side effects. It also soothes the digestive system and provides gentle energy support.',
    dosage: '2-6g daily in decoction',
    contraindications: ['High blood pressure', 'Edema', 'Low potassium'],
    safetyRating: 'caution',
  },
  {
    id: '5',
    name: 'Cordyceps (Dong Chong Xia Cao)',
    scientificName: 'Cordyceps sinensis',
    slug: 'cordyceps',
    tcmAction: 'Tonifies Kidney Yang and Lung Yin',
    explanation:
      'Cordyceps is excellent for chronic fatigue and respiratory weakness. It strengthens both Kidney and Lung energy, improving stamina, immune function, and respiratory health.',
    dosage: '5-10g daily in decoction or as extract',
    safetyRating: 'safe',
  },
]

// Sample Lifestyle Recommendations
const sampleLifestyle = [
  'Get 7-9 hours of quality sleep each night to restore Qi and Blood',
  'Practice gentle exercise like Tai Chi or Qigong to move Qi without depleting it',
  'Eat warm, cooked foods and avoid cold/raw foods to support Spleen function',
  'Reduce stress through meditation or deep breathing exercises',
  'Avoid overwork and schedule regular rest periods throughout the day',
  'Consider acupuncture treatments to address underlying energy imbalances',
]

/**
 * Default Story: Complete recommendations with all sections
 */
export const Complete: Story = {
  args: {
    patterns: samplePatterns,
    herbs: sampleHerbs,
    lifestyleRecommendations: sampleLifestyle,
    isLoading: false,
  },
}

/**
 * Loading State: Shows skeleton loading UI
 */
export const Loading: Story = {
  args: {
    patterns: [],
    herbs: [],
    isLoading: true,
  },
  render: () => <HerbRecommendationsSkeleton />,
}

/**
 * Empty State: No recommendations available
 */
export const Empty: Story = {
  args: {
    patterns: [],
    herbs: [],
    lifestyleRecommendations: [],
    isLoading: false,
    onRefresh: () => alert('Generating new recommendations...'),
  },
}

/**
 * Patterns Only: TCM patterns without herb recommendations
 */
export const PatternsOnly: Story = {
  args: {
    patterns: samplePatterns,
    herbs: [],
    lifestyleRecommendations: [],
    isLoading: false,
  },
}

/**
 * Herbs Only: Herb recommendations without TCM patterns
 */
export const HerbsOnly: Story = {
  args: {
    patterns: [],
    herbs: sampleHerbs.slice(0, 3),
    lifestyleRecommendations: sampleLifestyle.slice(0, 3),
    isLoading: false,
  },
}

/**
 * Single Pattern: One TCM pattern with focused herbs
 */
export const SinglePattern: Story = {
  args: {
    patterns: [samplePatterns[0]],
    herbs: sampleHerbs.slice(0, 3),
    lifestyleRecommendations: sampleLifestyle.slice(0, 4),
    isLoading: false,
  },
}

/**
 * High Confidence Patterns: All patterns with >80% confidence
 */
export const HighConfidence: Story = {
  args: {
    patterns: [
      {
        name: 'Spleen Qi Deficiency',
        description: 'Weakened digestive energy leading to poor absorption',
        confidence: 92,
        symptoms: ['bloating', 'loose stools', 'fatigue after eating', 'poor appetite'],
        rootCause: 'Irregular eating habits and chronic worry weakening digestive function',
      },
      {
        name: 'Kidney Yang Deficiency',
        description: 'Insufficient warming energy affecting metabolism',
        confidence: 88,
        symptoms: ['cold sensitivity', 'low back pain', 'frequent urination', 'low libido'],
        rootCause: 'Aging and chronic stress depleting the body\'s foundational energy',
      },
    ],
    herbs: sampleHerbs,
    lifestyleRecommendations: sampleLifestyle,
    isLoading: false,
  },
}

/**
 * Safety Warnings: Herbs with various safety ratings
 */
export const SafetyVariations: Story = {
  args: {
    patterns: samplePatterns.slice(0, 1),
    herbs: [
      {
        id: '1',
        name: 'Chamomile',
        scientificName: 'Matricaria chamomilla',
        slug: 'chamomile',
        tcmAction: 'Calms Shen (spirit), soothes Liver',
        explanation: 'Gentle herb for relaxation and digestive comfort',
        dosage: '2-4g as tea, 3x daily',
        safetyRating: 'safe',
      },
      {
        id: '2',
        name: 'Ephedra',
        scientificName: 'Ephedra sinica',
        slug: 'ephedra',
        tcmAction: 'Opens lungs, promotes sweating',
        explanation: 'Powerful herb for respiratory conditions - professional guidance required',
        dosage: 'Must be prescribed by practitioner',
        contraindications: [
          'Heart disease',
          'High blood pressure',
          'Anxiety disorders',
          'Pregnancy',
          'Many medications',
        ],
        safetyRating: 'consult',
      },
      {
        id: '3',
        name: 'Cinnamon Bark',
        scientificName: 'Cinnamomum cassia',
        slug: 'cinnamon',
        tcmAction: 'Warms Yang, tonifies Kidney',
        explanation: 'Warming spice that boosts circulation and metabolism',
        dosage: '1-4g daily',
        contraindications: ['Pregnancy', 'Bleeding disorders'],
        safetyRating: 'caution',
      },
    ],
    lifestyleRecommendations: sampleLifestyle.slice(0, 3),
    isLoading: false,
  },
}

/**
 * Mobile View: Optimized for small screens
 */
export const Mobile: Story = {
  args: {
    patterns: samplePatterns.slice(0, 1),
    herbs: sampleHerbs.slice(0, 2),
    lifestyleRecommendations: sampleLifestyle.slice(0, 3),
    isLoading: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

/**
 * With Refresh Action: Interactive refresh button
 */
export const WithRefresh: Story = {
  args: {
    patterns: samplePatterns,
    herbs: sampleHerbs.slice(0, 3),
    lifestyleRecommendations: sampleLifestyle,
    isLoading: false,
    onRefresh: () => {
      alert('Generating new recommendations based on updated analysis...')
    },
  },
}
