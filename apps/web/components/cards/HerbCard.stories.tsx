import type { Meta, StoryObj } from '@storybook/react'
import { HerbCard } from './HerbCard'

const meta = {
  title: 'Components/HerbCard',
  component: HerbCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    herbId: { control: 'text' },
    title: { control: 'text' },
    slug: { control: 'text' },
    scientificName: { control: 'text' },
    description: { control: 'text' },
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
} satisfies Meta<typeof HerbCard>

export default meta
type Story = StoryObj<typeof meta>

// Default herb card
export const Default: Story = {
  args: {
    herbId: 'H001',
    title: 'Ginseng',
    slug: 'ginseng',
    scientificName: 'Panax ginseng',
    description:
      'A revered adaptogenic herb used in Traditional Chinese Medicine for thousands of years to boost energy, enhance mental clarity, and support overall vitality.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1607623488235-27e1c82c97f3?w=400',
      alt: 'Ginseng root',
    },
    tcmProperties: {
      taste: ['Sweet', 'Slightly Bitter'],
      temperature: 'Warm',
      category: 'Qi Tonics',
    },
    westernProperties: ['Adaptogen', 'Energy Booster', 'Cognitive Support'],
    averageRating: 4.7,
    reviewCount: 342,
  },
}

// Without image
export const WithoutImage: Story = {
  args: {
    herbId: 'H002',
    title: 'Astragalus',
    slug: 'astragalus',
    scientificName: 'Astragalus membranaceus',
    description:
      'A foundational herb in TCM primarily used to tonify Qi, strengthen the immune system, and support overall health and longevity.',
    tcmProperties: {
      taste: ['Sweet'],
      temperature: 'Slightly Warm',
      category: 'Qi Tonics',
    },
    westernProperties: ['Immune Support', 'Anti-inflammatory', 'Antioxidant'],
    averageRating: 4.5,
    reviewCount: 189,
  },
}

// With minimal data
export const Minimal: Story = {
  args: {
    herbId: 'H003',
    title: 'Ginkgo Biloba',
    slug: 'ginkgo-biloba',
    scientificName: 'Ginkgo biloba',
  },
}

// With many properties
export const ManyProperties: Story = {
  args: {
    herbId: 'H004',
    title: 'Licorice Root',
    slug: 'licorice-root',
    scientificName: 'Glycyrrhiza glabra',
    description:
      'A versatile herb used in both TCM and Western herbalism, known for its sweet taste and harmonizing properties in herbal formulas.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      alt: 'Licorice root',
    },
    tcmProperties: {
      taste: ['Sweet'],
      temperature: 'Neutral',
      category: 'Qi Tonics',
    },
    westernProperties: [
      'Digestive Support',
      'Anti-inflammatory',
      'Respiratory Health',
      'Adrenal Support',
      'Skin Health',
    ],
    averageRating: 4.3,
    reviewCount: 567,
  },
}

// High rating
export const HighRating: Story = {
  args: {
    herbId: 'H005',
    title: 'Reishi Mushroom',
    slug: 'reishi-mushroom',
    scientificName: 'Ganoderma lucidum',
    description:
      'The "mushroom of immortality" in TCM, prized for its calming properties and ability to support immune function and longevity.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400',
      alt: 'Reishi mushroom',
    },
    tcmProperties: {
      taste: ['Bitter', 'Sweet'],
      temperature: 'Neutral',
    },
    westernProperties: ['Adaptogen', 'Immune Support', 'Calming'],
    averageRating: 4.9,
    reviewCount: 891,
  },
}

// No rating
export const NoRating: Story = {
  args: {
    herbId: 'H006',
    title: 'Cordyceps',
    slug: 'cordyceps',
    scientificName: 'Cordyceps sinensis',
    description:
      'A rare and powerful medicinal mushroom traditionally used to enhance energy, stamina, and athletic performance.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
      alt: 'Cordyceps',
    },
    tcmProperties: {
      taste: ['Sweet'],
      temperature: 'Warm',
    },
    westernProperties: ['Energy', 'Athletic Performance', 'Respiratory Support'],
  },
}

// Only western properties
export const WesternOnly: Story = {
  args: {
    herbId: 'H007',
    title: 'Turmeric',
    slug: 'turmeric',
    scientificName: 'Curcuma longa',
    description:
      'A powerful anti-inflammatory herb widely used in both Ayurvedic and modern Western herbalism for its curcumin content.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400',
      alt: 'Turmeric root',
    },
    westernProperties: ['Anti-inflammatory', 'Antioxidant', 'Joint Support', 'Digestive Aid'],
    averageRating: 4.6,
    reviewCount: 1234,
  },
}

// Only TCM properties
export const TCMOnly: Story = {
  args: {
    herbId: 'H008',
    title: 'He Shou Wu',
    slug: 'he-shou-wu',
    scientificName: 'Polygonum multiflorum',
    description:
      'A famous TCM herb traditionally used to darken hair, strengthen the liver and kidneys, and promote longevity.',
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400',
      alt: 'He Shou Wu root',
    },
    tcmProperties: {
      taste: ['Bitter', 'Sweet', 'Astringent'],
      temperature: 'Slightly Warm',
      category: 'Blood Tonics',
    },
    averageRating: 4.4,
    reviewCount: 203,
  },
}

// Grid display
export const GridExample: Story = {
  args: undefined as any,
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl">
      <HerbCard
        herbId="H001"
        title="Ginseng"
        slug="ginseng"
        scientificName="Panax ginseng"
        description="A revered adaptogenic herb used for thousands of years."
        featuredImage={{
          url: 'https://images.unsplash.com/photo-1607623488235-27e1c82c97f3?w=400',
          alt: 'Ginseng',
        }}
        tcmProperties={{
          taste: ['Sweet', 'Slightly Bitter'],
          temperature: 'Warm',
        }}
        westernProperties={['Adaptogen', 'Energy']}
        averageRating={4.7}
        reviewCount={342}
      />
      <HerbCard
        herbId="H002"
        title="Astragalus"
        slug="astragalus"
        scientificName="Astragalus membranaceus"
        description="A foundational herb used to tonify Qi and strengthen immunity."
        tcmProperties={{
          taste: ['Sweet'],
          temperature: 'Slightly Warm',
        }}
        westernProperties={['Immune Support', 'Anti-inflammatory']}
        averageRating={4.5}
        reviewCount={189}
      />
      <HerbCard
        herbId="H003"
        title="Reishi"
        slug="reishi"
        scientificName="Ganoderma lucidum"
        description="The mushroom of immortality, prized for calming properties."
        featuredImage={{
          url: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400',
          alt: 'Reishi',
        }}
        tcmProperties={{
          taste: ['Bitter', 'Sweet'],
          temperature: 'Neutral',
        }}
        westernProperties={['Adaptogen', 'Immune Support']}
        averageRating={4.9}
        reviewCount={891}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [],
}

// Loading state simulation
export const LoadingState: Story = {
  args: undefined as any,
  render: () => (
    <div className="w-[350px]">
      <div className="h-full overflow-hidden rounded-lg border border-gray-200 animate-pulse">
        <div className="aspect-video w-full bg-gray-200" />
        <div className="p-6 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  ),
}
