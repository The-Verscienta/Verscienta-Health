import type { Meta, StoryObj } from '@storybook/react'
import { LiteYouTube, LiteYouTubeEmbed } from './lite-youtube'

const meta = {
  title: 'UI/LiteYouTube',
  component: LiteYouTube,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Performance-optimized YouTube embed using lite-youtube-embed. Reduces initial page weight by ~224KB per video.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    videoId: {
      control: 'text',
      description: 'YouTube video ID',
    },
    title: {
      control: 'text',
      description: 'Video title for accessibility',
    },
    posterQuality: {
      control: 'select',
      options: ['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'],
      description: 'Thumbnail quality',
    },
    noCookie: {
      control: 'boolean',
      description: 'Use youtube-nocookie.com for privacy',
    },
    params: {
      control: 'text',
      description: 'YouTube player parameters (e.g., "start=10&cc_load_policy=1")',
    },
    playlistId: {
      control: 'text',
      description: 'YouTube playlist ID',
    },
    mobileResolution: {
      control: 'radio',
      options: ['watch', 'play'],
      description: 'Mobile behavior',
    },
  },
} satisfies Meta<typeof LiteYouTube>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic video embed with default settings
 */
export const Basic: Story = {
  args: {
    videoId: 'jNQXAC9IVRw',
    title: 'Me at the zoo - First YouTube Video',
  },
}

/**
 * Educational content with captions enabled
 */
export const EducationalWithCaptions: Story = {
  args: {
    videoId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    params: 'cc_load_policy=1',
  },
}

/**
 * Video starting at a specific time (1:30)
 */
export const StartAtTime: Story = {
  args: {
    videoId: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up (from 1:30)',
    params: 'start=90',
  },
}

/**
 * Privacy-enhanced mode using youtube-nocookie.com
 */
export const PrivacyMode: Story = {
  args: {
    videoId: 'jNQXAC9IVRw',
    title: 'Privacy-Enhanced Video',
    noCookie: true,
  },
}

/**
 * High-quality thumbnail (maxresdefault)
 */
export const HighQualityThumbnail: Story = {
  args: {
    videoId: 'dQw4w9WgXcQ',
    title: 'High Quality Thumbnail',
    posterQuality: 'maxresdefault',
  },
}

/**
 * YouTube playlist embed
 */
export const Playlist: Story = {
  args: {
    videoId: 'videoseries',
    playlistId: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
    title: 'Web Dev Playlist',
  },
}

/**
 * LiteYouTubeEmbed wrapper with responsive container
 */
export const WithWrapper: StoryObj<typeof LiteYouTubeEmbed> = {
  render: (args) => <LiteYouTubeEmbed {...args} />,
  args: {
    videoId: 'jNQXAC9IVRw',
    title: 'First YouTube Video',
    aspectRatio: '16/9',
  },
}

/**
 * Vertical video (9:16 aspect ratio)
 */
export const VerticalVideo: StoryObj<typeof LiteYouTubeEmbed> = {
  render: (args) => <LiteYouTubeEmbed {...args} />,
  args: {
    videoId: 'dQw4w9WgXcQ',
    title: 'Vertical Format',
    aspectRatio: '9/16',
  },
}

/**
 * Square video (1:1 aspect ratio)
 */
export const SquareVideo: StoryObj<typeof LiteYouTubeEmbed> = {
  render: (args) => <LiteYouTubeEmbed {...args} />,
  args: {
    videoId: 'jNQXAC9IVRw',
    title: 'Square Format',
    aspectRatio: '1/1',
  },
}

/**
 * Multiple videos in a grid
 */
export const MultipleVideos: Story = {
  args: {
    videoId: 'jNQXAC9IVRw', // Default video ID (not used in custom render)
  },
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <LiteYouTubeEmbed videoId="jNQXAC9IVRw" title="First YouTube Video" />
      <LiteYouTubeEmbed
        videoId="dQw4w9WgXcQ"
        title="Never Gonna Give You Up"
        params="cc_load_policy=1"
      />
      <LiteYouTubeEmbed
        videoId="M7lc1UVf-VE"
        title="YouTube Rewind 2018"
        posterQuality="maxresdefault"
      />
      <LiteYouTubeEmbed videoId="kJQP7kiw5Fk" title="Luis Fonsi - Despacito" noCookie={true} />
    </div>
  ),
}

/**
 * Herb education example for Verscienta Health
 */
export const HerbEducation: Story = {
  args: {
    videoId: 'herb_video_id', // Placeholder for herb education video
  },
  render: () => (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Ginseng: Cultivation and Harvesting</h2>
        <p className="mb-4 text-gray-600">
          Learn about the traditional methods of cultivating and harvesting Panax ginseng, one of
          the most valued herbs in Traditional Chinese Medicine.
        </p>
        <LiteYouTubeEmbed
          videoId="dQw4w9WgXcQ"
          title="Ginseng Cultivation Tutorial"
          params="cc_load_policy=1"
        />
      </div>
      <div className="rounded-lg bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          <strong>Note:</strong> This is an educational resource. Always consult with a qualified
          healthcare practitioner before using herbs medicinally.
        </p>
      </div>
    </div>
  ),
}

/**
 * TCM diagnosis educational series
 */
export const TCMEducationSeries: Story = {
  args: {
    videoId: 'tcm_video_id', // Placeholder for TCM education video
  },
  render: () => (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-3xl font-bold">TCM Diagnosis Fundamentals</h2>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-xl font-semibold">1. Tongue Diagnosis</h3>
          <LiteYouTubeEmbed
            videoId="jNQXAC9IVRw"
            title="Introduction to Tongue Diagnosis"
            params="cc_load_policy=1"
          />
        </div>

        <div>
          <h3 className="mb-2 text-xl font-semibold">2. Pulse Diagnosis</h3>
          <LiteYouTubeEmbed
            videoId="dQw4w9WgXcQ"
            title="Understanding the Pulse in TCM"
            params="cc_load_policy=1"
          />
        </div>

        <div>
          <h3 className="mb-2 text-xl font-semibold">3. Pattern Differentiation</h3>
          <LiteYouTubeEmbed
            videoId="M7lc1UVf-VE"
            title="TCM Pattern Differentiation Basics"
            params="cc_load_policy=1"
            noCookie={true}
          />
        </div>
      </div>
    </div>
  ),
}
