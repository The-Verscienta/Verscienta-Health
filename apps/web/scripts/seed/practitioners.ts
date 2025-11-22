/**
 * Practitioner Seed Data Generator
 */

import type { Payload } from 'payload'
import {
  randomInt,
  randomItem,
  randomItems,
  randomBoolean,
  randomEmail,
  randomPhone,
  randomAddress,
  randomCoordinates,
  randomPrice,
  randomRating,
  SPECIALTIES,
  MODALITIES,
  log,
} from './utils'

const PRACTITIONER_NAMES = [
  { first: 'Dr. Sarah', last: 'Chen' },
  { first: 'Dr. Michael', last: 'Rodriguez' },
  { first: 'Dr. Emily', last: 'Thompson' },
  { first: 'Dr. David', last: 'Kim' },
  { first: 'Dr. Lisa', last: 'Patel' },
  { first: 'Dr. James', last: 'Wilson' },
  { first: 'Dr. Maria', last: 'Garcia' },
  { first: 'Dr. Robert', last: 'Lee' },
  { first: 'Dr. Jennifer', last: 'Anderson' },
  { first: 'Dr. Thomas', last: 'Zhang' },
]

export async function seedPractitioners(payload: Payload, count: number = 10): Promise<any[]> {
  log.info(`Generating ${count} practitioner seed records...`)

  const practitioners: any[] = []
  const practitionersToCreate = Math.min(count, PRACTITIONER_NAMES.length)

  for (let i = 0; i < practitionersToCreate; i++) {
    const name = PRACTITIONER_NAMES[i]
    const fullName = `${name.first} ${name.last}`
    const isPublished = i < practitionersToCreate * 0.8 // 80% published
    const address = randomAddress()
    const coords = randomCoordinates()

    const practitioner: any = {
      name: fullName,
      slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: `${name.first.replace('Dr. ', '')} ${name.last}, ${randomItem(['L.Ac', 'DAOM', 'ND', 'MD(H)'])}`,
      shortBio: `Experienced practitioner specializing in ${randomItem(SPECIALTIES).toLowerCase()}`,
      bio: [
        {
          children: [
            {
              text: `With over ${randomInt(5, 20)} years of experience, I provide compassionate care using ${randomItem(SPECIALTIES).toLowerCase()} and ${randomItem(MODALITIES).toLowerCase()}.`,
            },
          ],
        },
      ],
      _status: isPublished ? 'published' : 'draft',

      specialties: randomItems(SPECIALTIES, randomInt(2, 4)),
      modalities: randomItems(MODALITIES, randomInt(2, 5)),

      credentials: {
        licenses: [
          {
            type: randomItem(['L.Ac', 'ND', 'DAOM', 'Herbalist']),
            number: `${randomInt(10000, 99999)}`,
            state: address.state,
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        education: [
          {
            degree: randomItem(['Masters', 'Doctorate']),
            institution: randomItem([
              'Five Branches University',
              'Bastyr University',
              'American College of TCM',
              'Pacific College',
            ]),
            year: randomInt(2000, 2015),
          },
        ],
        yearsExperience: randomInt(5, 20),
      },

      contactInfo: {
        email: randomEmail(`${name.first.toLowerCase()}.${name.last.toLowerCase()}`),
        phone: randomPhone(),
        website: `https://www.${name.last.toLowerCase()}tcm.com`,
      },

      location: {
        clinic: `${name.last} Wellness Center`,
        address: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        coordinates: coords,
      },

      services: randomItems(
        [
          'Initial Consultation',
          'Follow-up Visit',
          'Acupuncture',
          'Herbal Consultation',
          'Nutritional Counseling',
          'Cupping Therapy',
        ],
        randomInt(3, 6)
      ).map(s => ({
        name: s,
        price: randomPrice(75, 150),
        duration: randomItem([30, 45, 60, 90]),
      })),

      availability: {
        acceptingNewPatients: randomBoolean(0.7),
        offersVirtualConsultations: randomBoolean(0.5),
        languagesSpoken: randomItems(['English', 'Spanish', 'Chinese', 'Korean'], randomInt(1, 3)),
      },

      peerReviewStatus: isPublished ? randomItem(['pending', 'reviewed', 'verified']) : 'pending',
      averageRating: isPublished ? randomRating() : 0,
      reviewCount: isPublished ? randomInt(5, 100) : 0,
      verified: isPublished && randomBoolean(0.6),
    }

    try {
      const created = await payload.create({
        collection: 'practitioners',
        data: practitioner,
      })

      practitioners.push(created)
      log.progress(i + 1, practitionersToCreate, fullName)
    } catch (error: any) {
      log.error(`Failed to create practitioner ${fullName}: ${error.message}`)
    }
  }

  log.success(`Created ${practitioners.length}/${practitionersToCreate} practitioners`)
  return practitioners
}
