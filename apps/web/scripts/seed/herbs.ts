/**
 * Herb Seed Data Generator
 *
 * Creates realistic herb data for testing
 */

import type { Payload } from 'payload'
import {
  randomInt,
  randomItem,
  randomItems,
  randomBoolean,
  randomPastDate,
  slugify,
  randomRating,
  HERB_DESCRIPTIONS,
  log,
} from './utils'

/**
 * Sample herb data with scientific names and properties
 */
const HERB_DATA = [
  {
    name: 'Ginseng',
    scientific: 'Panax ginseng',
    family: 'Araliaceae',
    chineseName: 'Ren Shen (人参)',
    properties: { energy: 'Warm', taste: ['Sweet', 'Slightly Bitter'], meridians: ['Lung', 'Spleen', 'Heart'] },
  },
  {
    name: 'Lavender',
    scientific: 'Lavandula angustifolia',
    family: 'Lamiaceae',
    chineseName: null,
    properties: { energy: 'Cool', taste: ['Bitter'], meridians: ['Heart', 'Liver'] },
  },
  {
    name: 'Chamomile',
    scientific: 'Matricaria chamomilla',
    family: 'Asteraceae',
    chineseName: 'Mi Die Xiang (蜜蝶香)',
    properties: { energy: 'Neutral', taste: ['Sweet', 'Bitter'], meridians: ['Liver', 'Spleen'] },
  },
  {
    name: 'Echinacea',
    scientific: 'Echinacea purpurea',
    family: 'Asteraceae',
    chineseName: null,
    properties: { energy: 'Cool', taste: ['Pungent'], meridians: ['Lung', 'Liver'] },
  },
  {
    name: 'Ginger',
    scientific: 'Zingiber officinale',
    family: 'Zingiberaceae',
    chineseName: 'Sheng Jiang (生姜)',
    properties: { energy: 'Warm', taste: ['Pungent'], meridians: ['Lung', 'Spleen', 'Stomach'] },
  },
  {
    name: 'Turmeric',
    scientific: 'Curcuma longa',
    family: 'Zingiberaceae',
    chineseName: 'Jiang Huang (姜黄)',
    properties: { energy: 'Warm', taste: ['Pungent', 'Bitter'], meridians: ['Spleen', 'Liver'] },
  },
  {
    name: 'Peppermint',
    scientific: 'Mentha × piperita',
    family: 'Lamiaceae',
    chineseName: 'Bo He (薄荷)',
    properties: { energy: 'Cool', taste: ['Pungent'], meridians: ['Lung', 'Liver'] },
  },
  {
    name: 'St. John\'s Wort',
    scientific: 'Hypericum perforatum',
    family: 'Hypericaceae',
    chineseName: null,
    properties: { energy: 'Neutral', taste: ['Bitter'], meridians: ['Liver', 'Heart'] },
  },
  {
    name: 'Valerian',
    scientific: 'Valeriana officinalis',
    family: 'Caprifoliaceae',
    chineseName: null,
    properties: { energy: 'Neutral', taste: ['Sweet', 'Pungent'], meridians: ['Heart', 'Liver'] },
  },
  {
    name: 'Milk Thistle',
    scientific: 'Silybum marianum',
    family: 'Asteraceae',
    chineseName: 'Shui Fei Ji (水飞蓟)',
    properties: { energy: 'Cool', taste: ['Bitter'], meridians: ['Liver'] },
  },
  {
    name: 'Ashwagandha',
    scientific: 'Withania somnifera',
    family: 'Solanaceae',
    chineseName: 'Nan Fei Zui Qie (南非醉茄)',
    properties: { energy: 'Warm', taste: ['Bitter', 'Sweet'], meridians: ['Kidney', 'Lung'] },
  },
  {
    name: 'Holy Basil',
    scientific: 'Ocimum sanctum',
    family: 'Lamiaceae',
    chineseName: 'Sheng Luo Le (圣罗勒)',
    properties: { energy: 'Warm', taste: ['Pungent'], meridians: ['Lung', 'Spleen'] },
  },
  {
    name: 'Rhodiola',
    scientific: 'Rhodiola rosea',
    family: 'Crassulaceae',
    chineseName: 'Hong Jing Tian (红景天)',
    properties: { energy: 'Neutral', taste: ['Sweet', 'Bitter'], meridians: ['Lung', 'Heart'] },
  },
  {
    name: 'Astragalus',
    scientific: 'Astragalus membranaceus',
    family: 'Fabaceae',
    chineseName: 'Huang Qi (黄芪)',
    properties: { energy: 'Slightly Warm', taste: ['Sweet'], meridians: ['Spleen', 'Lung'] },
  },
  {
    name: 'Licorice Root',
    scientific: 'Glycyrrhiza glabra',
    family: 'Fabaceae',
    chineseName: 'Gan Cao (甘草)',
    properties: { energy: 'Neutral', taste: ['Sweet'], meridians: ['All 12 meridians'] },
  },
  {
    name: 'Dandelion',
    scientific: 'Taraxacum officinale',
    family: 'Asteraceae',
    chineseName: 'Pu Gong Ying (蒲公英)',
    properties: { energy: 'Cold', taste: ['Bitter', 'Sweet'], meridians: ['Liver', 'Stomach'] },
  },
  {
    name: 'Nettle',
    scientific: 'Urtica dioica',
    family: 'Urticaceae',
    chineseName: 'Xun Ma (荨麻)',
    properties: { energy: 'Cool', taste: ['Bitter'], meridians: ['Liver', 'Kidney'] },
  },
  {
    name: 'Calendula',
    scientific: 'Calendula officinalis',
    family: 'Asteraceae',
    chineseName: 'Jin Zhan Ju (金盏菊)',
    properties: { energy: 'Neutral', taste: ['Bitter'], meridians: ['Liver', 'Heart'] },
  },
  {
    name: 'Elderberry',
    scientific: 'Sambucus nigra',
    family: 'Adoxaceae',
    chineseName: 'Jie Gu Mu (接骨木)',
    properties: { energy: 'Neutral', taste: ['Sweet', 'Bitter'], meridians: ['Lung', 'Spleen'] },
  },
  {
    name: 'Hawthorn',
    scientific: 'Crataegus monogyna',
    family: 'Rosaceae',
    chineseName: 'Shan Zha (山楂)',
    properties: { energy: 'Slightly Warm', taste: ['Sweet', 'Sour'], meridians: ['Spleen', 'Stomach', 'Liver'] },
  },
]

/**
 * Generate herb seed data
 */
export async function seedHerbs(payload: Payload, count: number = 20): Promise<any[]> {
  log.info(`Generating ${count} herb seed records...`)

  const herbs: any[] = []
  const herbsToCreate = Math.min(count, HERB_DATA.length)

  for (let i = 0; i < herbsToCreate; i++) {
    const herbData = HERB_DATA[i]
    const isPublished = i < herbsToCreate * 0.7 // 70% published, 30% draft

    // Determine source (Trefle, Perenual, or Manual)
    const source = randomItem(['manual', 'trefle', 'perenual'])

    const herb: any = {
      title: herbData.name,
      slug: slugify(herbData.name),
      herbId: `herb-${i + 1}`,
      description: [
        {
          children: [
            {
              text: randomItem(HERB_DESCRIPTIONS),
            },
          ],
        },
      ],
      _status: isPublished ? 'published' : 'draft',

      botanicalInfo: {
        scientificName: herbData.scientific,
        family: herbData.family,
        genus: herbData.scientific.split(' ')[0],
        species: herbData.scientific.split(' ')[1],
        plantType: randomItem(['herb', 'shrub', 'vine']),
        habitat: 'Native to temperate regions',
        partsUsed: randomItems(['root', 'leaf', 'flower', 'seed', 'bark'], randomInt(1, 3)),
      },

      commonNames: [
        {
          name: herbData.name,
          language: 'en',
        },
      ],

      // TCM Properties
      tcmProperties: {
        energy: herbData.properties.energy,
        taste: herbData.properties.taste,
        meridians: herbData.properties.meridians,
        actions: randomItems(
          [
            'Tonifies Qi',
            'Nourishes Blood',
            'Clears Heat',
            'Dispels Wind',
            'Resolves Phlegm',
            'Calms the Spirit',
          ],
          randomInt(1, 3)
        ),
      },

      // Western Properties
      westernProperties: {
        actions: randomItems(
          [
            'Anti-inflammatory',
            'Antioxidant',
            'Adaptogenic',
            'Immune Support',
            'Digestive Aid',
            'Nervine',
          ],
          randomInt(1, 3)
        ),
        constituents: randomItems(
          [
            'Flavonoids',
            'Alkaloids',
            'Essential Oils',
            'Tannins',
            'Saponins',
            'Polysaccharides',
          ],
          randomInt(1, 3)
        ),
      },

      // Add source-specific data
      ...(source === 'trefle' && {
        botanicalInfo: {
          ...herb.botanicalInfo,
          trefleId: randomInt(10000, 99999),
          trefleSlug: slugify(herbData.scientific),
          lastSyncedAt: randomPastDate(30),
        },
      }),

      ...(source === 'perenual' && {
        botanicalInfo: {
          ...herb.botanicalInfo,
          perenualId: randomInt(1000, 9999),
          lastPerenualSyncAt: randomPastDate(30),
        },
        cultivation: {
          cycle: randomItem(['Perennial', 'Annual', 'Biennial']),
          watering: randomItem(['Average', 'Frequent', 'Minimum']),
          sunlight: randomItems(['Full sun', 'Part shade', 'Full shade'], randomInt(1, 2)),
          soil: randomItems(['Well-drained', 'Loam', 'Sandy', 'Clay'], randomInt(1, 2)),
          hardiness: {
            min: String(randomInt(3, 5)),
            max: String(randomInt(8, 10)),
          },
          careLevel: randomItem(['Easy', 'Medium', 'Difficult']),
          indoor: randomBoolean(0.3),
        },
      }),

      // Safety & Dosage
      safetyInfo: {
        warnings: ['Consult healthcare provider before use', 'Not for use during pregnancy'],
        contraindications: randomBoolean(0.3)
          ? ['May interact with blood thinners', 'Avoid with kidney disease']
          : [],
      },

      dosage: {
        standard: `${randomInt(1, 3)}-${randomInt(3, 9)} grams daily`,
        preparation: randomItem(['Tea', 'Decoction', 'Tincture', 'Capsule']),
      },

      // Peer Review
      peerReviewStatus: isPublished ? randomItem(['pending', 'reviewed', 'verified']) : 'pending',
      averageRating: isPublished ? randomRating() : 0,
      reviewCount: isPublished ? randomInt(0, 50) : 0,
    }

    // Add Chinese name if available
    if (herbData.chineseName) {
      herb.commonNames.push({
        name: herbData.chineseName,
        language: 'zh',
      })
    }

    try {
      const created = await payload.create({
        collection: 'herbs',
        data: herb,
      })

      herbs.push(created)
      log.progress(i + 1, herbsToCreate, `${herbData.name} (${isPublished ? 'published' : 'draft'})`)
    } catch (error: any) {
      log.error(`Failed to create herb ${herbData.name}: ${error.message}`)
    }
  }

  log.success(`Created ${herbs.length}/${herbsToCreate} herbs`)
  return herbs
}
