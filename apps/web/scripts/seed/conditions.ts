/**
 * Condition Seed Data Generator
 */

import type { Payload } from 'payload'
import { randomInt, randomItem, randomItems, slugify, TCM_CONDITIONS, WESTERN_CONDITIONS, log } from './utils'

export async function seedConditions(payload: Payload, herbs: any[], count: number = 14): Promise<any[]> {
  log.info(`Generating ${count} condition seed records...`)

  const conditions: any[] = []
  const allConditions = [...TCM_CONDITIONS, ...WESTERN_CONDITIONS]
  const conditionsToCreate = Math.min(count, allConditions.length)

  for (let i = 0; i < conditionsToCreate; i++) {
    const conditionName = allConditions[i]
    const isTCM = TCM_CONDITIONS.includes(conditionName)
    const isPublished = i < conditionsToCreate * 0.9 // 90% published

    // Select related herbs
    const relatedHerbs = herbs.length > 0 ? randomItems(herbs, randomInt(2, 5)).map(h => h.id) : []

    const condition: any = {
      title: conditionName,
      slug: slugify(conditionName),
      shortDescription: `Information and herbal support for ${conditionName}`,
      description: [
        {
          children: [
            {
              text: `${conditionName} is ${isTCM ? 'a Traditional Chinese Medicine pattern' : 'a common health condition'} that may benefit from herbal support.`,
            },
          ],
        },
      ],
      _status: isPublished ? 'published' : 'draft',

      category: isTCM ? 'tcm-pattern' : 'western-condition',
      icd10Code: !isTCM ? `R${randomInt(10, 99)}.${randomInt(0, 9)}` : null,

      symptoms: randomItems(
        [
          'Fatigue',
          'Digestive issues',
          'Sleep problems',
          'Headaches',
          'Muscle tension',
          'Poor appetite',
          'Irregular cycles',
          'Cold extremities',
        ],
        randomInt(2, 4)
      ).map(s => ({ symptom: s })),

      relatedHerbs,
      relatedConditions: [],

      peerReviewStatus: isPublished ? randomItem(['pending', 'reviewed', 'verified']) : 'pending',
      averageRating: isPublished ? randomInt(4, 5) : 0,
      reviewCount: isPublished ? randomInt(0, 20) : 0,
    }

    try {
      const created = await payload.create({
        collection: 'conditions',
        data: condition,
      })

      conditions.push(created)
      log.progress(i + 1, conditionsToCreate, conditionName)
    } catch (error: any) {
      log.error(`Failed to create condition ${conditionName}: ${error.message}`)
    }
  }

  log.success(`Created ${conditions.length}/${conditionsToCreate} conditions`)
  return conditions
}
