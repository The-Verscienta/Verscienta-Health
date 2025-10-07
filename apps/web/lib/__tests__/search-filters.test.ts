import { describe, expect, it } from 'vitest'
import {
  applyFilters,
  applySorting,
  conditionFilterGroups,
  formulaFilterGroups,
  getFilterGroups,
  getSortOptions,
  herbFilterGroups,
  practitionerFilterGroups,
} from '../search-filters'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestItem = any

describe('search-filters', () => {
  describe('getFilterGroups', () => {
    it('should return herb filter groups', () => {
      const groups = getFilterGroups('herbs')
      expect(groups).toBe(herbFilterGroups)
      expect(groups).toHaveLength(5)
      expect(groups[0].id).toBe('tcm_taste')
    })

    it('should return formula filter groups', () => {
      const groups = getFilterGroups('formulas')
      expect(groups).toBe(formulaFilterGroups)
      expect(groups).toHaveLength(4)
      expect(groups[0].id).toBe('tradition')
    })

    it('should return condition filter groups', () => {
      const groups = getFilterGroups('conditions')
      expect(groups).toBe(conditionFilterGroups)
      expect(groups).toHaveLength(3)
      expect(groups[0].id).toBe('severity')
    })

    it('should return practitioner filter groups', () => {
      const groups = getFilterGroups('practitioners')
      expect(groups).toBe(practitionerFilterGroups)
      expect(groups).toHaveLength(4)
      expect(groups[0].id).toBe('modality')
    })
  })

  describe('getSortOptions', () => {
    it('should return sort options for each content type', () => {
      const herbOptions = getSortOptions('herbs')
      expect(herbOptions).toHaveLength(5)
      expect(herbOptions[0].value).toBe('relevance')

      const formulaOptions = getSortOptions('formulas')
      expect(formulaOptions).toHaveLength(5)

      const conditionOptions = getSortOptions('conditions')
      expect(conditionOptions).toHaveLength(5)

      const practitionerOptions = getSortOptions('practitioners')
      expect(practitionerOptions).toHaveLength(6)
      expect(practitionerOptions[5].value).toBe('distance_asc')
    })
  })

  describe('applyFilters', () => {
    const mockHerbs = [
      {
        id: '1',
        title: 'Ginseng',
        tcmProperties: {
          taste: ['sweet', 'bitter'],
          temperature: 'warm',
          category: ['tonifying'],
        },
        westernProperties: ['adaptogen', 'anti-inflammatory'],
        safetyLevel: 'safe',
      },
      {
        id: '2',
        title: 'Licorice',
        tcmProperties: {
          taste: ['sweet'],
          temperature: 'neutral',
          category: ['tonifying', 'harmonizing'],
        },
        westernProperties: ['anti-inflammatory', 'digestive'],
        safetyLevel: 'caution',
      },
      {
        id: '3',
        title: 'Ginger',
        tcmProperties: {
          taste: ['pungent'],
          temperature: 'hot',
          category: ['warming', 'dispersing'],
        },
        westernProperties: ['digestive', 'anti-inflammatory'],
        safetyLevel: 'safe',
      },
    ]

    it('should return all items when no filters are active', () => {
      const result = applyFilters(mockHerbs, {})
      expect(result).toHaveLength(3)
    })

    it('should filter by TCM taste', () => {
      const result = applyFilters(mockHerbs, {
        tcm_taste: ['sweet'],
      }) as TestItem[]
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })

    it('should filter by TCM temperature', () => {
      const result = applyFilters(mockHerbs, {
        tcm_temperature: ['warm'],
      }) as TestItem[]
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by western properties', () => {
      const result = applyFilters(mockHerbs, {
        western_properties: ['adaptogen'],
      }) as TestItem[]
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by safety level', () => {
      const result = applyFilters(mockHerbs, {
        safety_level: ['safe'],
      }) as TestItem[]
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('3')
    })

    it('should apply multiple filters (AND logic)', () => {
      const result = applyFilters(mockHerbs, {
        tcm_taste: ['sweet'],
        safety_level: ['safe'],
      }) as TestItem[]
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should apply multiple values in same filter (OR logic)', () => {
      const result = applyFilters(mockHerbs, {
        tcm_temperature: ['warm', 'hot'],
      }) as TestItem[]
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('3')
    })
  })

  describe('applySorting', () => {
    const mockItems = [
      { title: 'Zinc', name: 'Zinc', averageRating: 4.2, reviewCount: 15 },
      { title: 'Apple', name: 'Apple', averageRating: 4.8, reviewCount: 42 },
      { title: 'Banana', name: 'Banana', averageRating: 4.5, reviewCount: 28 },
    ]

    it('should sort by name ascending', () => {
      const result = applySorting(mockItems, 'name_asc') as TestItem[]
      expect(result[0].title).toBe('Apple')
      expect(result[1].title).toBe('Banana')
      expect(result[2].title).toBe('Zinc')
    })

    it('should sort by name descending', () => {
      const result = applySorting(mockItems, 'name_desc') as TestItem[]
      expect(result[0].title).toBe('Zinc')
      expect(result[1].title).toBe('Banana')
      expect(result[2].title).toBe('Apple')
    })

    it('should sort by rating descending', () => {
      const result = applySorting(mockItems, 'rating_desc') as TestItem[]
      expect(result[0].averageRating).toBe(4.8)
      expect(result[1].averageRating).toBe(4.5)
      expect(result[2].averageRating).toBe(4.2)
    })

    it('should sort by review count descending', () => {
      const result = applySorting(mockItems, 'reviews_desc') as TestItem[]
      expect(result[0].reviewCount).toBe(42)
      expect(result[1].reviewCount).toBe(28)
      expect(result[2].reviewCount).toBe(15)
    })

    it('should handle severity sorting', () => {
      const conditions = [
        { name: 'Condition A', severity: 'mild' },
        { name: 'Condition B', severity: 'severe' },
        { name: 'Condition C', severity: 'moderate' },
      ]

      const result = applySorting(conditions, 'severity_desc') as TestItem[]
      expect(result[0].severity).toBe('severe')
      expect(result[1].severity).toBe('moderate')
      expect(result[2].severity).toBe('mild')
    })

    it('should keep original order for relevance', () => {
      const result = applySorting(mockItems, 'relevance') as TestItem[]
      expect(result[0].title).toBe('Zinc')
      expect(result[1].title).toBe('Apple')
      expect(result[2].title).toBe('Banana')
    })
  })

  describe('filter group configurations', () => {
    it('should have correct herb filter structure', () => {
      expect(herbFilterGroups).toHaveLength(5)

      const tasteFilter = herbFilterGroups.find((g) => g.id === 'tcm_taste')
      expect(tasteFilter).toBeDefined()
      expect(tasteFilter?.multiSelect).toBe(true)
      expect(tasteFilter?.options).toContainEqual({ label: 'Sweet', value: 'sweet' })
    })

    it('should have correct formula filter structure', () => {
      expect(formulaFilterGroups).toHaveLength(4)

      const traditionFilter = formulaFilterGroups.find((g) => g.id === 'tradition')
      expect(traditionFilter).toBeDefined()
      expect(traditionFilter?.multiSelect).toBe(true)
      expect(traditionFilter?.options.length).toBeGreaterThan(0)
    })

    it('should have correct condition filter structure', () => {
      expect(conditionFilterGroups).toHaveLength(3)

      const severityFilter = conditionFilterGroups.find((g) => g.id === 'severity')
      expect(severityFilter).toBeDefined()
      expect(severityFilter?.options).toContainEqual({ label: 'Mild', value: 'mild' })
    })

    it('should have correct practitioner filter structure', () => {
      expect(practitionerFilterGroups).toHaveLength(4)

      const modalityFilter = practitionerFilterGroups.find((g) => g.id === 'modality')
      expect(modalityFilter).toBeDefined()
      expect(modalityFilter?.multiSelect).toBe(true)

      const verificationFilter = practitionerFilterGroups.find((g) => g.id === 'verification')
      expect(verificationFilter).toBeDefined()
      expect(verificationFilter?.multiSelect).toBe(false)
    })
  })
})
