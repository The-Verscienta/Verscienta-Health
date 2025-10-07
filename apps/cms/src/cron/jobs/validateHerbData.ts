import type { Payload } from 'payload'

interface ValidationRule {
  field: string
  validator: (value: any) => boolean
  message: string
}

const herbValidationRules: ValidationRule[] = [
  {
    field: 'scientificName',
    validator: (value: string) => {
      // Scientific names should be in format "Genus species"
      return /^[A-Z][a-z]+ [a-z]+( [a-z]+)?$/.test(value)
    },
    message: 'Invalid scientific name format',
  },
  {
    field: 'tcm_properties.temperature',
    validator: (value: string) => {
      const validTemps = ['Hot', 'Warm', 'Neutral', 'Cool', 'Cold']
      return validTemps.includes(value)
    },
    message: 'Invalid TCM temperature property',
  },
  {
    field: 'tcm_properties.taste',
    validator: (value: string[]) => {
      const validTastes = ['Sweet', 'Bitter', 'Sour', 'Pungent', 'Salty', 'Bland']
      return Array.isArray(value) && value.every((t) => validTastes.includes(t))
    },
    message: 'Invalid TCM taste property',
  },
  {
    field: 'safety_info.contraindications',
    validator: (value: any) => {
      // Should be an array
      return Array.isArray(value)
    },
    message: 'Contraindications should be an array',
  },
]

interface ValidationIssue {
  herbId: string
  herbName: string
  field: string
  issue: string
  severity: 'warning' | 'error'
}

export async function validateHerbDataJob(payload: Payload): Promise<void> {
  console.log('🔍 Starting herb data validation...')

  const issues: ValidationIssue[] = []

  try {
    // Fetch all published herbs
    const herbs = await payload.find({
      collection: 'herbs',
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 10000,
    })

    console.log(`Validating ${herbs.docs.length} herbs...`)

    for (const herb of herbs.docs) {
      // Check for missing required fields
      if (!herb.scientificName) {
        issues.push({
          herbId: String(herb.id),
          herbName: herb.name,
          field: 'scientificName',
          issue: 'Missing scientific name',
          severity: 'error',
        })
      }

      if (!herb.description) {
        issues.push({
          herbId: String(herb.id),
          herbName: herb.name,
          field: 'description',
          issue: 'Missing description',
          severity: 'warning',
        })
      }

      // Run validation rules
      for (const rule of herbValidationRules) {
        const fieldValue = getNestedField(herb, rule.field)
        if (fieldValue !== undefined && !rule.validator(fieldValue)) {
          issues.push({
            herbId: String(herb.id),
            herbName: herb.name,
            field: rule.field,
            issue: rule.message,
            severity: 'warning',
          })
        }
      }

      // Check for orphaned references
      if (herb.relatedFormulas?.length > 0) {
        for (const formulaId of herb.relatedFormulas) {
          const formula = await payload.findByID({
            collection: 'formulas',
            id: formulaId,
          }).catch(() => null)

          if (!formula) {
            issues.push({
              herbId: String(herb.id),
              herbName: herb.name,
              field: 'relatedFormulas',
              issue: `Orphaned formula reference: ${formulaId}`,
              severity: 'warning',
            })
          }
        }
      }
    }

    // Log validation summary
    const errors = issues.filter((i) => i.severity === 'error')
    const warnings = issues.filter((i) => i.severity === 'warning')

    console.log(`✅ Validation complete:`)
    console.log(`   - ${errors.length} errors`)
    console.log(`   - ${warnings.length} warnings`)

    // Store validation results
    if (issues.length > 0) {
      await payload.create({
        collection: 'validation-reports',
        data: {
          type: 'herb-validation',
          issues: issues,
          errorCount: errors.length,
          warningCount: warnings.length,
          totalChecked: herbs.docs.length,
          timestamp: new Date(),
        },
      })
    }

    // Send notification if there are critical errors
    if (errors.length > 0) {
      console.warn(`⚠️  Found ${errors.length} critical validation errors!`)
      // TODO: Send email notification to admins
    }
  } catch (error) {
    console.error('❌ Validation job failed:', error)
    throw error
  }
}

// Helper to get nested field values
function getNestedField(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}
