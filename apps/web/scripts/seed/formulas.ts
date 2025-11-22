/**
 * Formula Seed Data Generator
 */

import type { Payload } from 'payload'
import {
  randomInt,
  randomItem,
  randomItems,
  randomBoolean,
  slugify,
  FORMULA_DESCRIPTIONS,
  log,
} from './utils'

const FORMULA_DATA = [
  {
    name: 'Si Jun Zi Tang',
    english: 'Four Gentlemen Decoction',
    tradition: 'tcm',
    pattern: 'Spleen Qi Deficiency',
  },
  {
    name: 'Liu Wei Di Huang Wan',
    english: 'Six Ingredient Pill with Rehmannia',
    tradition: 'tcm',
    pattern: 'Kidney Yin Deficiency',
  },
  {
    name: 'Xiao Yao San',
    english: 'Free and Easy Wanderer',
    tradition: 'tcm',
    pattern: 'Liver Qi Stagnation',
  },
  {
    name: 'Ba Zhen Tang',
    english: 'Eight Treasure Decoction',
    tradition: 'tcm',
    pattern: 'Qi and Blood Deficiency',
  },
  {
    name: 'Immune Support Formula',
    english: null,
    tradition: 'western',
    pattern: 'Immune Support',
  },
  {
    name: 'Stress Relief Blend',
    english: null,
    tradition: 'western',
    pattern: 'Stress and Anxiety',
  },
  {
    name: 'Digestive Harmony',
    english: null,
    tradition: 'western',
    pattern: 'Digestive Issues',
  },
  {
    name: 'Sleep Support Formula',
    english: null,
    tradition: 'western',
    pattern: 'Insomnia',
  },
]

export async function seedFormulas(payload: Payload, herbs: any[], count: number = 8): Promise<any[]> {
  log.info(`Generating ${count} formula seed records...`)

  if (herbs.length < 3) {
    log.warning('Not enough herbs to create formulas. Skipping...')
    return []
  }

  const formulas: any[] = []
  const formulasToCreate = Math.min(count, FORMULA_DATA.length)

  for (let i = 0; i < formulasToCreate; i++) {
    const formulaData = FORMULA_DATA[i]
    const isPublished = i < formulasToCreate * 0.8 // 80% published

    // Select 3-6 herbs for ingredients
    const ingredientCount = randomInt(3, 6)
    const selectedHerbs = randomItems(herbs, ingredientCount)

    const ingredients = selectedHerbs.map((herb, index) => ({
      herb: herb.id,
      quantity: randomInt(3, 15),
      unit: randomItem(['g', 'ml', 'parts']),
      percentage: index === 0 ? 30 : randomInt(10, 20),
      role: randomItem(['chief', 'deputy', 'assistant', 'envoy']),
    }))

    const formula: any = {
      title: formulaData.name,
      slug: slugify(formulaData.name),
      shortDescription: randomItem(FORMULA_DESCRIPTIONS),
      description: [
        {
          children: [
            {
              text: `${randomItem(FORMULA_DESCRIPTIONS)} This formula is traditionally used for ${formulaData.pattern}.`,
            },
          ],
        },
      ],
      _status: isPublished ? 'published' : 'draft',

      ingredients,
      totalWeight: ingredients.reduce((sum, ing) => sum + ing.quantity, 0),

      tradition: formulaData.tradition,
      tcmPattern: formulaData.tradition === 'tcm' ? formulaData.pattern : null,
      westernIndications: formulaData.tradition === 'western' ? [formulaData.pattern] : [],

      preparation: {
        method: randomItem(['Decoction', 'Powder', 'Tincture', 'Tea']),
        instructions: 'Follow standard preparation guidelines',
        dosage: '1-2 doses daily',
      },

      safetyInfo: {
        warnings: ['Consult healthcare provider before use'],
        contraindications: randomBoolean(0.3) ? ['Pregnancy', 'Nursing'] : [],
      },

      peerReviewStatus: isPublished ? randomItem(['pending', 'reviewed']) : 'pending',
      averageRating: isPublished ? randomInt(4, 5) : 0,
      reviewCount: isPublished ? randomInt(0, 30) : 0,
    }

    try {
      const created = await payload.create({
        collection: 'formulas',
        data: formula,
      })

      formulas.push(created)
      log.progress(i + 1, formulasToCreate, formulaData.name)
    } catch (error: any) {
      log.error(`Failed to create formula ${formulaData.name}: ${error.message}`)
    }
  }

  log.success(`Created ${formulas.length}/${formulasToCreate} formulas`)
  return formulas
}
