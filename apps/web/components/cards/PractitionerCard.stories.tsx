import type { Meta, StoryObj } from '@storybook/react'
import { PractitionerCard } from './PractitionerCard'

const meta = {
  title: 'Components/PractitionerCard',
  component: PractitionerCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    practitionerId: { control: 'text' },
    name: { control: 'text' },
    slug: { control: 'text' },
    title: { control: 'text' },
    averageRating: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
    reviewCount: { control: 'number' },
    verificationStatus: {
      control: 'select',
      options: ['verified', 'pending', 'unverified'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PractitionerCard>

export default meta
type Story = StoryObj<typeof meta>

// Default practitioner card with photo
export const Default: Story = {
  args: {
    practitionerId: 'P001',
    name: 'Dr. Sarah Chen',
    slug: 'sarah-chen',
    photo: {
      url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
      alt: 'Dr. Sarah Chen',
    },
    title: 'L.Ac., Dipl. OM',
    modalities: ['Acupuncture', 'Chinese Herbal Medicine', 'Cupping'],
    address: {
      city: 'San Francisco',
      state: 'CA',
    },
    averageRating: 4.9,
    reviewCount: 127,
    verificationStatus: 'verified',
  },
}

// Without photo (shows initials)
export const WithoutPhoto: Story = {
  args: {
    practitionerId: 'P002',
    name: 'Michael Thompson',
    slug: 'michael-thompson',
    title: 'Herbalist, RH (AHG)',
    modalities: ['Western Herbalism', 'Nutrition'],
    address: {
      city: 'Portland',
      state: 'OR',
    },
    averageRating: 4.7,
    reviewCount: 89,
    verificationStatus: 'verified',
  },
}

// Minimal data
export const Minimal: Story = {
  args: {
    practitionerId: 'P003',
    name: 'Emily Rodriguez',
    slug: 'emily-rodriguez',
  },
}

// Verified practitioner
export const Verified: Story = {
  args: {
    practitionerId: 'P004',
    name: 'Dr. James Liu',
    slug: 'james-liu',
    photo: {
      url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200',
      alt: 'Dr. James Liu',
    },
    title: 'DAOM, L.Ac.',
    modalities: ['Traditional Chinese Medicine', 'Acupuncture', 'Moxibustion'],
    address: {
      city: 'Seattle',
      state: 'WA',
    },
    averageRating: 4.8,
    reviewCount: 203,
    verificationStatus: 'verified',
  },
}

// Pending verification
export const PendingVerification: Story = {
  args: {
    practitionerId: 'P005',
    name: 'Amanda Martinez',
    slug: 'amanda-martinez',
    photo: {
      url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
      alt: 'Amanda Martinez',
    },
    title: 'Certified Herbalist',
    modalities: ['Herbal Medicine', 'Wellness Coaching'],
    address: {
      city: 'Austin',
      state: 'TX',
    },
    averageRating: 4.6,
    reviewCount: 45,
    verificationStatus: 'pending',
  },
}

// Unverified
export const Unverified: Story = {
  args: {
    practitionerId: 'P006',
    name: 'David Kim',
    slug: 'david-kim',
    title: 'Herbal Consultant',
    modalities: ['Herbal Remedies', 'Lifestyle Medicine'],
    address: {
      city: 'Denver',
      state: 'CO',
    },
    averageRating: 4.2,
    reviewCount: 12,
    verificationStatus: 'unverified',
  },
}

// Many modalities (shows overflow)
export const ManyModalities: Story = {
  args: {
    practitionerId: 'P007',
    name: 'Dr. Lisa Wang',
    slug: 'lisa-wang',
    photo: {
      url: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200',
      alt: 'Dr. Lisa Wang',
    },
    title: 'ND, L.Ac., RYT',
    modalities: [
      'Acupuncture',
      'Herbal Medicine',
      'Naturopathy',
      'Yoga Therapy',
      'Nutrition',
      'Mind-Body Medicine',
    ],
    address: {
      city: 'Los Angeles',
      state: 'CA',
    },
    averageRating: 4.9,
    reviewCount: 312,
    verificationStatus: 'verified',
  },
}

// High rating
export const HighRating: Story = {
  args: {
    practitionerId: 'P008',
    name: 'Dr. Robert Zhang',
    slug: 'robert-zhang',
    photo: {
      url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
      alt: 'Dr. Robert Zhang',
    },
    title: 'Ph.D. TCM, L.Ac.',
    modalities: ['TCM Diagnostics', 'Pulse Diagnosis', 'Herbal Formulation'],
    address: {
      city: 'New York',
      state: 'NY',
    },
    averageRating: 5.0,
    reviewCount: 156,
    verificationStatus: 'verified',
  },
}

// No rating
export const NoRating: Story = {
  args: {
    practitionerId: 'P009',
    name: 'Jennifer Lee',
    slug: 'jennifer-lee',
    photo: {
      url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200',
      alt: 'Jennifer Lee',
    },
    title: 'Herbalist, Nutritionist',
    modalities: ['Western Herbalism', 'Clinical Nutrition'],
    address: {
      city: 'Boston',
      state: 'MA',
    },
    verificationStatus: 'verified',
  },
}

// City only
export const CityOnly: Story = {
  args: {
    practitionerId: 'P010',
    name: 'Marcus Johnson',
    slug: 'marcus-johnson',
    title: 'Acupuncturist',
    modalities: ['Acupuncture', 'Electroacupuncture'],
    address: {
      city: 'Chicago',
    },
    averageRating: 4.5,
    reviewCount: 67,
    verificationStatus: 'verified',
  },
}

// State only
export const StateOnly: Story = {
  args: {
    practitionerId: 'P011',
    name: 'Sophia Patel',
    slug: 'sophia-patel',
    title: 'Ayurvedic Practitioner',
    modalities: ['Ayurveda', 'Herbal Medicine'],
    address: {
      state: 'FL',
    },
    averageRating: 4.7,
    reviewCount: 91,
    verificationStatus: 'verified',
  },
}

// Single modality
export const SingleModality: Story = {
  args: {
    practitionerId: 'P012',
    name: 'Thomas Anderson',
    slug: 'thomas-anderson',
    photo: {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      alt: 'Thomas Anderson',
    },
    title: 'Certified Acupuncturist',
    modalities: ['Acupuncture'],
    address: {
      city: 'Miami',
      state: 'FL',
    },
    averageRating: 4.6,
    reviewCount: 78,
    verificationStatus: 'verified',
  },
}

// Grid display
export const GridExample: Story = {
  args: undefined as any,
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl">
      <PractitionerCard
        practitionerId="P001"
        name="Dr. Sarah Chen"
        slug="sarah-chen"
        photo={{
          url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200',
          alt: 'Dr. Sarah Chen',
        }}
        title="L.Ac., Dipl. OM"
        modalities={['Acupuncture', 'Herbal Medicine']}
        address={{ city: 'San Francisco', state: 'CA' }}
        averageRating={4.9}
        reviewCount={127}
        verificationStatus="verified"
      />
      <PractitionerCard
        practitionerId="P002"
        name="Michael Thompson"
        slug="michael-thompson"
        title="Herbalist, RH (AHG)"
        modalities={['Western Herbalism', 'Nutrition']}
        address={{ city: 'Portland', state: 'OR' }}
        averageRating={4.7}
        reviewCount={89}
        verificationStatus="verified"
      />
      <PractitionerCard
        practitionerId="P003"
        name="Dr. Lisa Wang"
        slug="lisa-wang"
        photo={{
          url: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200',
          alt: 'Dr. Lisa Wang',
        }}
        title="ND, L.Ac."
        modalities={['Acupuncture', 'Naturopathy', 'Nutrition', 'Mind-Body', 'Yoga']}
        address={{ city: 'Los Angeles', state: 'CA' }}
        averageRating={4.9}
        reviewCount={312}
        verificationStatus="verified"
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
    <div className="w-[400px]">
      <div className="h-full overflow-hidden rounded-lg border border-gray-200 animate-pulse">
        <div className="p-6 space-y-3">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  ),
}
