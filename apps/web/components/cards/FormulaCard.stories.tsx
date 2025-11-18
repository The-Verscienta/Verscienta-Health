import type { Meta, StoryObj } from '@storybook/react'
import { FormulaCard } from './FormulaCard'

const meta = {
  title: 'Components/FormulaCard',
  component: FormulaCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    formulaId: { control: 'text' },
    title: { control: 'text' },
    slug: { control: 'text' },
    chineseName: { control: 'text' },
    pinyin: { control: 'text' },
    description: { control: 'text' },
    category: { control: 'text' },
    tradition: { control: 'text' },
    ingredientCount: { control: 'number' },
    averageRating: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
    reviewCount: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormulaCard>

export default meta
type Story = StoryObj<typeof meta>

// Default formula card
export const Default: Story = {
  args: {
    formulaId: 'F001',
    title: 'Si Junzi Tang',
    slug: 'si-junzi-tang',
    chineseName: '四君子湯',
    pinyin: 'Sì Jūnzǐ Tāng',
    description:
      'The Four Gentlemen Decoction is a foundational Qi-tonifying formula in Traditional Chinese Medicine, designed to strengthen the Spleen and Stomach to tonify Qi.',
    category: 'Qi Tonifying',
    tradition: 'Classical TCM',
    ingredientCount: 4,
    averageRating: 4.8,
    reviewCount: 156,
  },
}

// Without Chinese name/pinyin
export const MinimalData: Story = {
  args: {
    formulaId: 'F002',
    title: 'Jade Windscreen Formula',
    slug: 'jade-windscreen',
    description: 'A formula for strengthening protective Qi and preventing external invasions.',
    category: 'Immune Support',
    ingredientCount: 3,
    averageRating: 4.6,
    reviewCount: 89,
  },
}

// With all data
export const Complete: Story = {
  args: {
    formulaId: 'F003',
    title: 'Liu Wei Di Huang Wan',
    slug: 'liu-wei-di-huang-wan',
    chineseName: '六味地黃丸',
    pinyin: 'Liù Wèi Dì Huáng Wán',
    description:
      'Six Ingredient Rehmannia Pill is a fundamental Yin-tonifying formula that nourishes Kidney and Liver Yin, commonly used for conditions related to Yin deficiency.',
    category: 'Yin Tonifying',
    tradition: 'Classical TCM',
    ingredientCount: 6,
    averageRating: 4.9,
    reviewCount: 423,
  },
}

// High ingredient count
export const ManyIngredients: Story = {
  args: {
    formulaId: 'F004',
    title: 'Shi Quan Da Bu Tang',
    slug: 'shi-quan-da-bu-tang',
    chineseName: '十全大補湯',
    pinyin: 'Shí Quán Dà Bǔ Tāng',
    description:
      'The All-Inclusive Great Tonifying Decoction comprehensively tonifies both Qi and Blood, suitable for severe deficiency patterns.',
    category: 'Qi & Blood Tonifying',
    tradition: 'Classical TCM',
    ingredientCount: 10,
    averageRating: 4.7,
    reviewCount: 298,
  },
}

// Modern adaptation
export const ModernFormula: Story = {
  args: {
    formulaId: 'F005',
    title: 'Stress Relief Blend',
    slug: 'stress-relief-blend',
    description:
      'A modern adaptation combining TCM herbs with Western adaptogens to support stress management and emotional balance.',
    category: 'Stress Support',
    tradition: 'Modern TCM',
    ingredientCount: 8,
    averageRating: 4.5,
    reviewCount: 234,
  },
}

// No rating
export const NoRating: Story = {
  args: {
    formulaId: 'F006',
    title: 'Xiao Yao San',
    slug: 'xiao-yao-san',
    chineseName: '逍遙散',
    pinyin: 'Xiāo Yáo Sǎn',
    description:
      'Free and Easy Wanderer Powder harmonizes the Liver and strengthens the Spleen, commonly used for Liver Qi stagnation.',
    category: 'Harmonizing',
    tradition: 'Classical TCM',
    ingredientCount: 8,
  },
}

// Single ingredient (simple formula)
export const SingleIngredient: Story = {
  args: {
    formulaId: 'F007',
    title: 'Pure Ginseng Decoction',
    slug: 'pure-ginseng',
    chineseName: '獨參湯',
    pinyin: 'Dú Shēn Tāng',
    description: 'Emergency formula using only Ginseng for severe Qi collapse.',
    category: 'Emergency Qi Rescue',
    tradition: 'Classical TCM',
    ingredientCount: 1,
    averageRating: 4.3,
    reviewCount: 45,
  },
}

// Blood tonifying
export const BloodTonifying: Story = {
  args: {
    formulaId: 'F008',
    title: 'Si Wu Tang',
    slug: 'si-wu-tang',
    chineseName: '四物湯',
    pinyin: 'Sì Wù Tāng',
    description:
      'Four Substances Decoction is the fundamental Blood-tonifying formula, nourishing and invigorating Blood.',
    category: 'Blood Tonifying',
    tradition: 'Classical TCM',
    ingredientCount: 4,
    averageRating: 4.7,
    reviewCount: 312,
  },
}

// Clearing heat
export const ClearingHeat: Story = {
  args: {
    formulaId: 'F009',
    title: 'Huang Lian Jie Du Tang',
    slug: 'huang-lian-jie-du-tang',
    chineseName: '黃連解毒湯',
    pinyin: 'Huáng Lián Jiě Dú Tāng',
    description: 'Coptis Decoction to Resolve Toxicity clears Heat and resolves Fire toxins.',
    category: 'Clearing Heat',
    tradition: 'Classical TCM',
    ingredientCount: 4,
    averageRating: 4.4,
    reviewCount: 167,
  },
}

// Grid display
export const GridExample: Story = {
  args: undefined as any,
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl">
      <FormulaCard
        formulaId="F001"
        title="Si Junzi Tang"
        slug="si-junzi-tang"
        chineseName="四君子湯"
        pinyin="Sì Jūnzǐ Tāng"
        description="The Four Gentlemen Decoction tonifies Qi."
        category="Qi Tonifying"
        tradition="Classical TCM"
        ingredientCount={4}
        averageRating={4.8}
        reviewCount={156}
      />
      <FormulaCard
        formulaId="F002"
        title="Liu Wei Di Huang Wan"
        slug="liu-wei-di-huang-wan"
        chineseName="六味地黃丸"
        pinyin="Liù Wèi Dì Huáng Wán"
        description="Six Ingredient Rehmannia Pill nourishes Kidney Yin."
        category="Yin Tonifying"
        tradition="Classical TCM"
        ingredientCount={6}
        averageRating={4.9}
        reviewCount={423}
      />
      <FormulaCard
        formulaId="F003"
        title="Xiao Yao San"
        slug="xiao-yao-san"
        chineseName="逍遙散"
        pinyin="Xiāo Yáo Sǎn"
        description="Free and Easy Wanderer harmonizes Liver and Spleen."
        category="Harmonizing"
        tradition="Classical TCM"
        ingredientCount={8}
        averageRating={4.7}
        reviewCount={298}
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
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  ),
}
