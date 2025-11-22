/**
 * Review Seed Data Generator
 */

import type { Payload } from 'payload'
import { randomInt, randomItem, randomRating, REVIEW_TEXTS, log } from './utils'

/**
 * Generate review titles based on rating
 */
function generateReviewTitle(rating: number, entityType: string): string {
  const titles: Record<number, string[]> = {
    5: [
      'Excellent Results!',
      'Highly Recommend',
      'Outstanding Experience',
      'Life Changing',
      'Amazing Quality',
    ],
    4: [
      'Very Good',
      'Great Experience',
      'Would Recommend',
      'Very Satisfied',
      'Good Quality',
    ],
    3: ['Good Overall', 'Decent Experience', 'Average Results', 'Pretty Good', 'Okay Service'],
    2: [
      'Could Be Better',
      'Disappointing',
      'Not What I Expected',
      'Mediocre Results',
      'Below Average',
    ],
    1: [
      'Very Disappointing',
      'Poor Quality',
      'Not Recommended',
      'Waste of Time',
      'Terrible Experience',
    ],
  }

  return randomItem(titles[rating] || titles[3])
}

/**
 * Generate review content based on rating
 */
function generateReviewContent(rating: number, entityType: string): string {
  if (rating >= 4) {
    return randomItem(REVIEW_TEXTS.positive)
  } else if (rating === 3) {
    return randomItem(REVIEW_TEXTS.neutral)
  } else {
    return randomItem(REVIEW_TEXTS.negative)
  }
}

/**
 * Determine moderation status based on rating and random chance
 */
function getModerationStatus(rating: number): string {
  // 90% approved, 5% pending, 5% flagged
  const rand = Math.random()

  if (rand < 0.9) return 'approved'
  if (rand < 0.95) return 'pending'
  return 'flagged'
}

/**
 * Generate review seed data
 */
export async function seedReviews(
  payload: Payload,
  {
    users,
    herbs,
    formulas,
    practitioners,
  }: {
    users: any[]
    herbs: any[]
    formulas: any[]
    practitioners: any[]
  },
  count: number = 50
): Promise<any[]> {
  log.info(`Generating ${count} review seed records...`)

  if (users.length === 0) {
    log.warning('No users available. Skipping review generation...')
    return []
  }

  // Combine all entities that can be reviewed
  const reviewableEntities: Array<{ id: string; type: string; collection: string }> = [
    ...herbs.map((h) => ({ id: h.id, type: 'herb', collection: 'herbs' })),
    ...formulas.map((f) => ({ id: f.id, type: 'formula', collection: 'formulas' })),
    ...practitioners.map((p) => ({
      id: p.id,
      type: 'practitioner',
      collection: 'practitioners',
    })),
  ]

  if (reviewableEntities.length === 0) {
    log.warning('No entities to review. Skipping review generation...')
    return []
  }

  const reviews: any[] = []

  for (let i = 0; i < count; i++) {
    const entity = randomItem(reviewableEntities)
    const author = randomItem(users)
    const rating = randomRating()
    const moderationStatus = getModerationStatus(rating)

    const review: any = {
      title: generateReviewTitle(rating, entity.type),
      content: generateReviewContent(rating, entity.type),
      rating,
      reviewedEntity: {
        relationTo: entity.collection,
        value: entity.id,
      },
      reviewedEntityType: entity.type,
      author: author.id,
      moderationStatus,
      helpfulCount: moderationStatus === 'approved' ? randomInt(0, 50) : 0,
      notHelpfulCount: moderationStatus === 'approved' ? randomInt(0, 10) : 0,
    }

    // Add moderation notes for flagged/rejected reviews
    if (moderationStatus === 'flagged') {
      review.moderationNotes = 'Flagged for review - contains potentially questionable content'
    } else if (moderationStatus === 'rejected') {
      review.moderationNotes = 'Rejected - does not meet community guidelines'
    }

    try {
      const created = await payload.create({
        collection: 'reviews',
        data: review,
      })

      reviews.push(created)
      log.progress(i + 1, count, `${review.title} (${entity.type}, ${rating}⭐, ${moderationStatus})`)
    } catch (error: any) {
      log.error(`Failed to create review ${i + 1}: ${error.message}`)
    }
  }

  log.success(`Created ${reviews.length}/${count} reviews`)

  // Log statistics
  const approved = reviews.filter((r) => r.moderationStatus === 'approved').length
  const pending = reviews.filter((r) => r.moderationStatus === 'pending').length
  const flagged = reviews.filter((r) => r.moderationStatus === 'flagged').length

  log.info(`Review statistics:`)
  log.info(`  - Approved: ${approved}`)
  log.info(`  - Pending: ${pending}`)
  log.info(`  - Flagged: ${flagged}`)

  return reviews
}
