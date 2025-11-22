/**
 * Seed Data Utilities
 *
 * Helper functions for generating realistic seed data
 */

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Pick random item from array
 */
export function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Pick N random items from array (without duplicates)
 */
export function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, array.length))
}

/**
 * Generate random boolean with given probability
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability
}

/**
 * Generate random date within range
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Generate random date within past N days
 */
export function randomPastDate(days: number): Date {
  const now = new Date()
  const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return randomDate(past, now)
}

/**
 * Generate slug from title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Generate random rating (1-5 stars)
 */
export function randomRating(): number {
  // Weighted towards higher ratings (more realistic)
  const weights = [0.05, 0.10, 0.15, 0.30, 0.40] // 1-5 stars
  const rand = Math.random()
  let cumulative = 0

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (rand <= cumulative) {
      return i + 1
    }
  }

  return 5 // Fallback
}

/**
 * Generate random email
 */
export function randomEmail(name: string): string {
  const domains = ['example.com', 'test.com', 'demo.com']
  const domain = randomItem(domains)
  const cleanName = name.toLowerCase().replace(/\s+/g, '.')
  return `${cleanName}@${domain}`
}

/**
 * Generate random phone number
 */
export function randomPhone(): string {
  const areaCode = randomInt(200, 999)
  const prefix = randomInt(200, 999)
  const line = randomInt(1000, 9999)
  return `(${areaCode}) ${prefix}-${line}`
}

/**
 * Generate random US address
 */
export function randomAddress(): {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
} {
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Pine Rd']
  const cities = ['Portland', 'Austin', 'Boulder', 'Asheville', 'Santa Fe', 'Burlington']
  const states = ['OR', 'TX', 'CO', 'NC', 'NM', 'VT']

  const index = randomInt(0, cities.length - 1)

  return {
    street: `${randomInt(100, 9999)} ${randomItem(streets)}`,
    city: cities[index],
    state: states[index],
    zipCode: `${randomInt(10000, 99999)}`,
    country: 'USA',
  }
}

/**
 * Generate random coordinates (US)
 */
export function randomCoordinates(): { lat: number; lng: number } {
  return {
    lat: randomInt(25000000, 49000000) / 1000000, // 25-49 latitude (continental US)
    lng: -(randomInt(66000000, 125000000) / 1000000), // -66 to -125 longitude
  }
}

/**
 * Generate random price
 */
export function randomPrice(min: number = 10, max: number = 200): number {
  return randomInt(min, max)
}

/**
 * Generate random percentage
 */
export function randomPercentage(min: number = 0, max: number = 100): number {
  return randomInt(min, max)
}

/**
 * Common herb names for testing
 */
export const COMMON_HERBS = [
  'Ginseng',
  'Lavender',
  'Chamomile',
  'Echinacea',
  'Ginger',
  'Turmeric',
  'Peppermint',
  'St. John\'s Wort',
  'Valerian',
  'Milk Thistle',
  'Ashwagandha',
  'Holy Basil',
  'Rhodiola',
  'Astragalus',
  'Licorice Root',
  'Dandelion',
  'Nettle',
  'Calendula',
  'Elderberry',
  'Hawthorn',
]

/**
 * TCM conditions
 */
export const TCM_CONDITIONS = [
  'Qi Deficiency',
  'Blood Deficiency',
  'Yin Deficiency',
  'Yang Deficiency',
  'Qi Stagnation',
  'Blood Stasis',
  'Phlegm Accumulation',
  'Damp Heat',
  'Wind Cold',
  'Wind Heat',
  'Liver Qi Stagnation',
  'Spleen Qi Deficiency',
  'Kidney Yang Deficiency',
  'Heart Blood Deficiency',
]

/**
 * Western conditions
 */
export const WESTERN_CONDITIONS = [
  'Anxiety',
  'Insomnia',
  'Digestive Issues',
  'Inflammation',
  'Common Cold',
  'Allergies',
  'Headaches',
  'Fatigue',
  'Stress',
  'Depression',
  'High Blood Pressure',
  'High Cholesterol',
  'Joint Pain',
  'Skin Conditions',
]

/**
 * Practitioner specialties
 */
export const SPECIALTIES = [
  'Traditional Chinese Medicine',
  'Acupuncture',
  'Herbal Medicine',
  'Ayurveda',
  'Naturopathy',
  'Homeopathy',
  'Functional Medicine',
  'Integrative Medicine',
]

/**
 * Modalities
 */
export const MODALITIES = [
  'Acupuncture',
  'Herbal Therapy',
  'Cupping',
  'Moxibustion',
  'Gua Sha',
  'Tui Na Massage',
  'Qi Gong',
  'Dietary Therapy',
]

/**
 * Sample review texts
 */
export const REVIEW_TEXTS = {
  positive: [
    'Excellent results! Highly recommended.',
    'Very knowledgeable and professional. Helped me tremendously.',
    'Great experience. Symptoms improved significantly after treatment.',
    'Wonderful practitioner. Very attentive and caring.',
    'Amazing results with the herbs. Feeling much better!',
  ],
  neutral: [
    'Good service, but takes time to see results.',
    'Decent experience overall. Still working through the treatment plan.',
    'Professional service. Waiting to see full effects.',
  ],
  negative: [
    'Did not work well for me. Still looking for alternatives.',
    'Service was okay but expected better results.',
  ],
}

/**
 * Sample herb descriptions
 */
export const HERB_DESCRIPTIONS = [
  'A powerful adaptogen known for its ability to help the body cope with stress.',
  'Traditionally used to support digestive health and reduce inflammation.',
  'Known for its calming properties and ability to promote relaxation.',
  'Rich in antioxidants and traditionally used to support immune function.',
  'A warming herb that supports circulation and digestive health.',
  'Used in traditional medicine for its anti-inflammatory properties.',
  'Known for its ability to support respiratory health.',
  'Traditionally used to support liver function and detoxification.',
]

/**
 * Sample formula descriptions
 */
export const FORMULA_DESCRIPTIONS = [
  'A classical formula designed to tonify Qi and strengthen the Spleen.',
  'Traditional blend for supporting immune function during cold season.',
  'Balancing formula to promote emotional well-being and stress relief.',
  'Time-tested combination for supporting digestive health.',
  'Nourishing blend to support vitality and stamina.',
]

/**
 * Console logging utilities
 */
export const log = {
  info: (message: string) => console.log(`ℹ️  ${message}`),
  success: (message: string) => console.log(`✅ ${message}`),
  warning: (message: string) => console.log(`⚠️  ${message}`),
  error: (message: string) => console.error(`❌ ${message}`),
  progress: (current: number, total: number, label: string) => {
    console.log(`   [${current}/${total}] ${label}`)
  },
}
