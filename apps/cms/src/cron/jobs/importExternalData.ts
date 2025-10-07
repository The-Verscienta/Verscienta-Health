import axios from 'axios'
import csvParser from 'csv-parser'
import type { Payload } from 'payload'
import { Readable } from 'stream'

interface ExternalDataSource {
  name: string
  url: string
  type: 'json' | 'csv' | 'api'
  mapper: (data: any) => any
  enabled: boolean
}

// Configure external data sources
const dataSources: ExternalDataSource[] = [
  {
    name: 'PubChem - Chemical Compounds',
    url: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound',
    type: 'api',
    mapper: mapPubChemData,
    enabled: process.env.ENABLE_PUBCHEM_IMPORT === 'true',
  },
  // Add more data sources as needed
  // {
  //   name: 'TCM Database',
  //   url: 'https://example.com/tcm-data.csv',
  //   type: 'csv',
  //   mapper: mapTCMData,
  //   enabled: true,
  // },
]

export async function importExternalDataJob(payload: Payload): Promise<void> {
  console.log('📥 Starting external data import...')

  const results = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    for (const source of dataSources) {
      if (!source.enabled) {
        console.log(`⏭️  Skipping disabled source: ${source.name}`)
        continue
      }

      console.log(`📡 Fetching data from: ${source.name}`)

      try {
        const data = await fetchExternalData(source)
        const importResult = await importData(payload, data, source)

        results.imported += importResult.imported
        results.updated += importResult.updated
        results.skipped += importResult.skipped
        results.errors += importResult.errors

        console.log(`✓ Imported from ${source.name}:`, importResult)
      } catch (error) {
        console.error(`❌ Failed to import from ${source.name}:`, error)
        results.errors++
      }
    }

    console.log('📊 Import summary:', results)

    // Log import to audit trail
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'external-data-import',
        results,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ External data import failed:', error)
    throw error
  }
}

async function fetchExternalData(source: ExternalDataSource): Promise<any[]> {
  switch (source.type) {
    case 'json': {
      const jsonResponse = await axios.get(source.url)
      return jsonResponse.data
    }

    case 'csv': {
      const csvResponse = await axios.get(source.url, {
        responseType: 'stream',
      })
      return await parseCSV(csvResponse.data)
    }

    case 'api':
      // Custom API handling
      return await fetchFromAPI(source.url)

    default:
      throw new Error(`Unsupported source type: ${source.type}`)
  }
}

async function parseCSV(stream: Readable): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []

    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

async function fetchFromAPI(baseUrl: string): Promise<any[]> {
  // Implement specific API fetching logic
  // This is a placeholder
  return []
}

async function importData(
  payload: Payload,
  data: any[],
  source: ExternalDataSource
): Promise<{
  imported: number
  updated: number
  skipped: number
  errors: number
}> {
  const results = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  for (const item of data) {
    try {
      const mappedData = source.mapper(item)

      if (!mappedData) {
        results.skipped++
        continue
      }

      // Check if herb already exists (by scientific name)
      const existing = await payload.find({
        collection: 'herbs',
        where: {
          scientificName: {
            equals: mappedData.scientificName,
          },
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        // Update existing herb
        await payload.update({
          collection: 'herbs',
          id: existing.docs[0].id,
          data: {
            ...mappedData,
            lastImportedAt: new Date(),
          },
        })
        results.updated++
      } else {
        // Create new herb
        await payload.create({
          collection: 'herbs',
          data: {
            ...mappedData,
            status: 'draft', // Require manual review before publishing
            lastImportedAt: new Date(),
          },
        })
        results.imported++
      }
    } catch (error) {
      console.error('Error importing item:', error)
      results.errors++
    }
  }

  return results
}

// Data mappers for different sources
function mapPubChemData(data: any): any {
  // Map PubChem data to herb schema
  if (!data.Compound) return null

  const compound = data.Compound

  return {
    name: compound.RecordTitle,
    scientificName: compound.MolecularFormula,
    description: compound.Description,
    activeConstituents: [
      {
        name: compound.RecordTitle,
        chemicalFormula: compound.MolecularFormula,
        molecularWeight: compound.MolecularWeight,
        cas: compound.CASNumber,
      },
    ],
    source: 'PubChem',
  }
}

// Add more mappers as needed
// function mapTCMData(data: any): any { ... }
