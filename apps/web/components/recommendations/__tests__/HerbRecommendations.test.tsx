import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  type HerbRecommendation,
  HerbRecommendations,
  HerbRecommendationsSkeleton,
  type TCMPattern,
} from '../HerbRecommendations'

// Sample test data
const mockPatterns: TCMPattern[] = [
  {
    name: 'Qi Deficiency',
    description: 'A lack of vital energy',
    confidence: 85,
    symptoms: ['fatigue', 'weakness', 'shortness of breath'],
    rootCause: 'Chronic stress and overwork',
  },
  {
    name: 'Blood Stasis',
    description: 'Poor circulation of blood',
    confidence: 70,
    symptoms: ['sharp pain', 'purple tongue'],
    rootCause: 'Sedentary lifestyle',
  },
]

const mockHerbs: HerbRecommendation[] = [
  {
    id: '1',
    name: 'Ginseng',
    scientificName: 'Panax ginseng',
    slug: 'ginseng',
    tcmAction: 'Tonifies Qi',
    explanation: 'Powerful energy tonic',
    dosage: '3-9g daily',
    contraindications: ['Pregnancy', 'High blood pressure'],
    safetyRating: 'caution',
  },
  {
    id: '2',
    name: 'Astragalus',
    scientificName: 'Astragalus membranaceus',
    slug: 'astragalus',
    tcmAction: 'Strengthens Wei Qi',
    explanation: 'Boosts immune function',
    dosage: '9-30g daily',
    safetyRating: 'safe',
  },
  {
    id: '3',
    name: 'Ephedra',
    scientificName: 'Ephedra sinica',
    slug: 'ephedra',
    tcmAction: 'Opens lungs',
    explanation: 'Professional guidance required',
    contraindications: ['Heart disease', 'Pregnancy'],
    safetyRating: 'consult',
  },
]

const mockLifestyle = ['Get 7-9 hours of sleep', 'Practice Tai Chi', 'Eat warm foods']

describe('HerbRecommendations', () => {
  describe('Rendering', () => {
    it('renders medical disclaimer banner', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} />)

      expect(screen.getByText('Medical Disclaimer')).toBeInTheDocument()
      expect(screen.getByText(/educational purposes only/i)).toBeInTheDocument()
    })

    it('renders TCM patterns section with all patterns', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} />)

      expect(screen.getByText('TCM Pattern Analysis')).toBeInTheDocument()
      expect(screen.getByText('Qi Deficiency')).toBeInTheDocument()
      expect(screen.getByText('Blood Stasis')).toBeInTheDocument()
    })

    it('renders herb recommendations section with all herbs', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} />)

      expect(screen.getByText('Recommended Herbs')).toBeInTheDocument()
      expect(screen.getByText('Ginseng')).toBeInTheDocument()
      expect(screen.getByText('Astragalus')).toBeInTheDocument()
      expect(screen.getByText('Ephedra')).toBeInTheDocument()
    })

    it('renders lifestyle recommendations when provided', () => {
      render(
        <HerbRecommendations
          patterns={mockPatterns}
          herbs={mockHerbs}
          lifestyleRecommendations={mockLifestyle}
        />
      )

      expect(screen.getByText('Lifestyle Recommendations')).toBeInTheDocument()
      expect(screen.getByText(/7-9 hours of sleep/i)).toBeInTheDocument()
      expect(screen.getByText(/Tai Chi/i)).toBeInTheDocument()
    })

    it('does not render lifestyle section when empty', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} />)

      expect(screen.queryByText('Lifestyle Recommendations')).not.toBeInTheDocument()
    })
  })

  describe('TCM Pattern Display', () => {
    it('shows confidence percentage for each pattern', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={[]} />)

      expect(screen.getByText('85% match')).toBeInTheDocument()
      expect(screen.getByText('70% match')).toBeInTheDocument()
    })

    it('displays pattern description', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={[]} />)

      expect(screen.getByText('A lack of vital energy')).toBeInTheDocument()
      expect(screen.getByText('Poor circulation of blood')).toBeInTheDocument()
    })

    it('shows root cause when provided', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={[]} />)

      expect(screen.getByText(/Chronic stress and overwork/i)).toBeInTheDocument()
      expect(screen.getByText(/Sedentary lifestyle/i)).toBeInTheDocument()
    })

    it('displays associated symptoms', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={[]} />)

      expect(screen.getByText('fatigue')).toBeInTheDocument()
      expect(screen.getByText('weakness')).toBeInTheDocument()
      expect(screen.getByText('shortness of breath')).toBeInTheDocument()
    })

    it('limits symptom display to 6 with overflow indicator', () => {
      const patternWithManySymptoms: TCMPattern = {
        name: 'Complex Pattern',
        description: 'Multiple symptoms',
        confidence: 80,
        symptoms: Array.from({ length: 10 }, (_, i) => `symptom${i + 1}`),
      }

      render(<HerbRecommendations patterns={[patternWithManySymptoms]} herbs={[]} />)

      expect(screen.getByText('+4 more')).toBeInTheDocument()
    })
  })

  describe('Herb Card Display', () => {
    it('shows herb name and scientific name', () => {
      render(<HerbRecommendations patterns={[]} herbs={mockHerbs} />)

      expect(screen.getByText('Ginseng')).toBeInTheDocument()
      expect(screen.getByText('Panax ginseng')).toBeInTheDocument()
    })

    it('displays TCM action and explanation', () => {
      render(<HerbRecommendations patterns={[]} herbs={mockHerbs} />)

      expect(screen.getByText('Tonifies Qi')).toBeInTheDocument()
      expect(screen.getByText('Powerful energy tonic')).toBeInTheDocument()
    })

    it('shows dosage when provided', () => {
      render(<HerbRecommendations patterns={[]} herbs={mockHerbs} />)

      expect(screen.getByText('3-9g daily')).toBeInTheDocument()
      expect(screen.getByText('9-30g daily')).toBeInTheDocument()
    })

    it('displays safety rating with appropriate icon and text', () => {
      render(<HerbRecommendations patterns={[]} herbs={mockHerbs} />)

      expect(screen.getByText('Use with caution')).toBeInTheDocument()
      expect(screen.getByText('Generally safe')).toBeInTheDocument()
      expect(screen.getByText('Consult practitioner')).toBeInTheDocument()
    })

    it('shows contraindications when present', () => {
      render(<HerbRecommendations patterns={[]} herbs={mockHerbs} />)

      // Multiple herbs can have the same contraindication, so use getAllByText
      const pregnancyWarnings = screen.getAllByText(/Pregnancy/i)
      expect(pregnancyWarnings.length).toBeGreaterThan(0)

      expect(screen.getByText(/High blood pressure/i)).toBeInTheDocument()
      expect(screen.getByText(/Heart disease/i)).toBeInTheDocument()
    })

    it('renders view details link for each herb', () => {
      render(<HerbRecommendations patterns={[]} herbs={mockHerbs} />)

      const links = screen.getAllByText('View Full Details')
      expect(links).toHaveLength(3)
      expect(links[0].closest('a')).toHaveAttribute('href', '/herbs/ginseng')
    })
  })

  describe('Loading State', () => {
    it('renders skeleton when isLoading is true', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} isLoading={true} />)

      // Skeleton should be visible
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows HerbRecommendationsSkeleton component', () => {
      const { container } = render(<HerbRecommendationsSkeleton />)

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      // Should have multiple skeleton elements
      const skeletonElements = container.querySelectorAll('.bg-gray-200')
      expect(skeletonElements.length).toBeGreaterThan(5)
    })
  })

  describe('Empty State', () => {
    it('shows empty message when no patterns or herbs', () => {
      render(<HerbRecommendations patterns={[]} herbs={[]} />)

      expect(screen.getByText('No recommendations available yet.')).toBeInTheDocument()
    })

    it('renders refresh button when onRefresh provided', () => {
      const onRefresh = vi.fn()

      render(<HerbRecommendations patterns={[]} herbs={[]} onRefresh={onRefresh} />)

      expect(screen.getByText('Generate Recommendations')).toBeInTheDocument()
    })

    it('calls onRefresh when empty state button clicked', async () => {
      const user = userEvent.setup()
      const onRefresh = vi.fn()

      render(<HerbRecommendations patterns={[]} herbs={[]} onRefresh={onRefresh} />)

      await user.click(screen.getByText('Generate Recommendations'))
      expect(onRefresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('Interactions', () => {
    it('calls onRefresh when refresh button clicked', async () => {
      const user = userEvent.setup()
      const onRefresh = vi.fn()

      render(
        <HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} onRefresh={onRefresh} />
      )

      await user.click(screen.getByText('Get New Recommendations'))
      expect(onRefresh).toHaveBeenCalledTimes(1)
    })

    it('herb name links to correct herb detail page', () => {
      render(<HerbRecommendations patterns={[]} herbs={mockHerbs.slice(0, 1)} />)

      const herbLink = screen.getByText('Ginseng').closest('a')
      expect(herbLink).toHaveAttribute('href', '/herbs/ginseng')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <HerbRecommendations
          patterns={mockPatterns}
          herbs={mockHerbs}
          lifestyleRecommendations={mockLifestyle}
        />
      )

      expect(screen.getByRole('heading', { name: /TCM Pattern Analysis/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Recommended Herbs/i })).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /Lifestyle Recommendations/i })
      ).toBeInTheDocument()
    })

    it('disclaimer has proper semantic structure', () => {
      render(<HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} />)

      const disclaimer = screen.getByText('Medical Disclaimer')
      expect(disclaimer.tagName).toBe('P')
    })

    it('all interactive elements are keyboard accessible', () => {
      const onRefresh = vi.fn()

      render(
        <HerbRecommendations patterns={mockPatterns} herbs={mockHerbs} onRefresh={onRefresh} />
      )

      const refreshButton = screen.getByText('Get New Recommendations')
      expect(refreshButton).toBeVisible()
      expect(refreshButton.tagName).toBe('BUTTON')
    })
  })

  describe('Responsive Design', () => {
    it('renders grid layout for patterns', () => {
      const { container } = render(<HerbRecommendations patterns={mockPatterns} herbs={[]} />)

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('renders grid layout for herbs with 3 columns on large screens', () => {
      const { container } = render(<HerbRecommendations patterns={[]} herbs={mockHerbs} />)

      const grid = container.querySelectorAll('.grid')[0]
      expect(grid).toHaveClass('lg:grid-cols-3')
    })
  })

  describe('Edge Cases', () => {
    it('handles pattern without root cause', () => {
      const patternNoRootCause: TCMPattern = {
        name: 'Test Pattern',
        description: 'Test description',
        confidence: 75,
        symptoms: ['symptom1'],
      }

      render(<HerbRecommendations patterns={[patternNoRootCause]} herbs={[]} />)

      expect(screen.queryByText(/Root Cause/i)).not.toBeInTheDocument()
    })

    it('handles herb without scientific name', () => {
      const herbNoScientific: HerbRecommendation = {
        id: '1',
        name: 'Test Herb',
        slug: 'test-herb',
        tcmAction: 'Test action',
        explanation: 'Test explanation',
        safetyRating: 'safe',
      }

      render(<HerbRecommendations patterns={[]} herbs={[herbNoScientific]} />)

      expect(screen.getByText('Test Herb')).toBeInTheDocument()
    })

    it('handles herb without contraindications', () => {
      const safeHerb: HerbRecommendation = {
        id: '1',
        name: 'Safe Herb',
        slug: 'safe-herb',
        tcmAction: 'Harmless action',
        explanation: 'Very safe',
        safetyRating: 'safe',
      }

      render(<HerbRecommendations patterns={[]} herbs={[safeHerb]} />)

      expect(screen.queryByText(/Contraindications/i)).not.toBeInTheDocument()
    })

    it('handles empty symptoms array in pattern', () => {
      const patternNoSymptoms: TCMPattern = {
        name: 'Test Pattern',
        description: 'Test',
        confidence: 80,
        symptoms: [],
      }

      render(<HerbRecommendations patterns={[patternNoSymptoms]} herbs={[]} />)

      expect(screen.queryByText(/Associated Symptoms/i)).not.toBeInTheDocument()
    })
  })
})
