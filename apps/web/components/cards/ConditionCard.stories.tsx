import type { Meta, StoryObj } from '@storybook/react'
import { ConditionCard } from './ConditionCard'

const meta = {
  title: 'Components/ConditionCard',
  component: ConditionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    conditionId: { control: 'text' },
    title: { control: 'text' },
    slug: { control: 'text' },
    description: { control: 'text' },
    category: { control: 'text' },
    severity: {
      control: 'select',
      options: ['Mild', 'Moderate', 'Severe'],
    },
    relatedHerbsCount: { control: 'number' },
    relatedFormulasCount: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConditionCard>

export default meta
type Story = StoryObj<typeof meta>

// Default condition card
export const Default: Story = {
  args: {
    conditionId: 'C001',
    title: 'Chronic Fatigue',
    slug: 'chronic-fatigue',
    description:
      'A persistent state of tiredness and lack of energy that is not improved by rest, often associated with Qi deficiency in TCM.',
    category: 'Energy & Vitality',
    severity: 'Moderate',
    relatedHerbsCount: 12,
    relatedFormulasCount: 8,
  },
}

// Minimal data
export const Minimal: Story = {
  args: {
    conditionId: 'C002',
    title: 'Headache',
    slug: 'headache',
  },
}

// With description only
export const WithDescription: Story = {
  args: {
    conditionId: 'C003',
    title: 'Insomnia',
    slug: 'insomnia',
    description:
      'Difficulty falling asleep or staying asleep, often related to Yin deficiency, Heart-Spleen disharmony, or Liver Qi stagnation in TCM.',
    category: 'Sleep Disorders',
  },
}

// Mild severity
export const MildSeverity: Story = {
  args: {
    conditionId: 'C004',
    title: 'Occasional Anxiety',
    slug: 'occasional-anxiety',
    description: 'Periodic feelings of worry or nervousness that are mild and manageable.',
    category: 'Mental Health',
    severity: 'Mild',
    relatedHerbsCount: 15,
    relatedFormulasCount: 6,
  },
}

// Moderate severity
export const ModerateSeverity: Story = {
  args: {
    conditionId: 'C005',
    title: 'Digestive Issues',
    slug: 'digestive-issues',
    description:
      'Recurring digestive discomfort including bloating, gas, or irregular bowel movements, often related to Spleen Qi deficiency.',
    category: 'Digestive Health',
    severity: 'Moderate',
    relatedHerbsCount: 20,
    relatedFormulasCount: 12,
  },
}

// Severe severity
export const SevereSeverity: Story = {
  args: {
    conditionId: 'C006',
    title: 'Chronic Pain',
    slug: 'chronic-pain',
    description:
      'Persistent pain lasting more than three months, often involving Qi and Blood stagnation in TCM.',
    category: 'Pain Management',
    severity: 'Severe',
    relatedHerbsCount: 18,
    relatedFormulasCount: 14,
  },
}

// Respiratory condition
export const RespiratoryCondition: Story = {
  args: {
    conditionId: 'C007',
    title: 'Seasonal Allergies',
    slug: 'seasonal-allergies',
    description:
      'Allergic response to pollen and environmental triggers, related to Wei Qi deficiency in TCM.',
    category: 'Respiratory Health',
    severity: 'Mild',
    relatedHerbsCount: 10,
    relatedFormulasCount: 5,
  },
}

// Women's health
export const WomensHealth: Story = {
  args: {
    conditionId: 'C008',
    title: 'Menstrual Irregularities',
    slug: 'menstrual-irregularities',
    description:
      'Irregular menstrual cycles, often associated with Blood deficiency, Liver Qi stagnation, or Kidney deficiency.',
    category: "Women's Health",
    severity: 'Moderate',
    relatedHerbsCount: 16,
    relatedFormulasCount: 10,
  },
}

// Mental health
export const MentalHealth: Story = {
  args: {
    conditionId: 'C009',
    title: 'Depression',
    slug: 'depression',
    description:
      'Persistent low mood and lack of interest, often involving Heart-Spleen disharmony or Liver Qi stagnation in TCM.',
    category: 'Mental Health',
    severity: 'Severe',
    relatedHerbsCount: 14,
    relatedFormulasCount: 9,
  },
}

// Single related content
export const SingleRelated: Story = {
  args: {
    conditionId: 'C010',
    title: 'Rare Condition',
    slug: 'rare-condition',
    description: 'A less common condition with limited herbal treatment options.',
    category: 'Other',
    severity: 'Moderate',
    relatedHerbsCount: 1,
    relatedFormulasCount: 1,
  },
}

// No related content
export const NoRelatedContent: Story = {
  args: {
    conditionId: 'C011',
    title: 'Emerging Condition',
    slug: 'emerging-condition',
    description: 'A newly documented condition without established herbal protocols yet.',
    category: 'Research',
    severity: 'Mild',
  },
}

// Grid display
export const GridExample: Story = {
  args: undefined as any,
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl">
      <ConditionCard
        conditionId="C001"
        title="Chronic Fatigue"
        slug="chronic-fatigue"
        description="Persistent tiredness and lack of energy not improved by rest."
        category="Energy & Vitality"
        severity="Moderate"
        relatedHerbsCount={12}
        relatedFormulasCount={8}
      />
      <ConditionCard
        conditionId="C002"
        title="Insomnia"
        slug="insomnia"
        description="Difficulty falling asleep or staying asleep."
        category="Sleep Disorders"
        severity="Mild"
        relatedHerbsCount={15}
        relatedFormulasCount={6}
      />
      <ConditionCard
        conditionId="C003"
        title="Chronic Pain"
        slug="chronic-pain"
        description="Persistent pain involving Qi and Blood stagnation."
        category="Pain Management"
        severity="Severe"
        relatedHerbsCount={18}
        relatedFormulasCount={14}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [],
}

// Loading state
export const LoadingState: Story = {
  args: undefined as any,
  render: () => (
    <div className="w-[350px]">
      <div className="h-full overflow-hidden rounded-lg border border-gray-200 animate-pulse">
        <div className="p-6 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="h-6 bg-gray-200 rounded w-14" />
          </div>
        </div>
      </div>
    </div>
  ),
}
