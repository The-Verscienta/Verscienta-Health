/**
 * LiteYouTube Component Tests
 *
 * Tests performance-optimized YouTube embed functionality
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LiteYouTube, LiteYouTubeEmbed } from '../lite-youtube'

// Mock the lite-youtube-embed module
vi.mock('lite-youtube-embed', () => ({}))

// Mock CSS import
vi.mock('lite-youtube-embed/src/lite-yt-embed.css', () => ({}))

describe('LiteYouTube', () => {
  const defaultProps = {
    videoId: 'dQw4w9WgXcQ',
    title: 'Test Video',
  }

  describe('Rendering', () => {
    it('renders lite-youtube element', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toBeInTheDocument()
    })

    it('sets video ID attribute', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('videoid', 'dQw4w9WgXcQ')
    })

    it('renders fallback link for accessibility', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const link = container.querySelector('a.lty-playbtn')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    })

    it('renders visually hidden title for accessibility', () => {
      render(<LiteYouTube {...defaultProps} />)

      const title = screen.getByText('Test Video')
      expect(title).toHaveClass('lyt-visually-hidden')
    })
  })

  describe('Video ID', () => {
    it('handles different video IDs', () => {
      const { container } = render(<LiteYouTube videoId="abc123XYZ" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('videoid', 'abc123XYZ')
    })

    it('sets background image with video ID', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveStyle({
        backgroundImage: `url('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg')`,
      })
    })
  })

  describe('Title', () => {
    it('uses provided title in link', () => {
      const { container } = render(<LiteYouTube videoId="test" title="My Custom Title" />)

      const link = container.querySelector('a.lty-playbtn')
      expect(link).toHaveAttribute('title', 'Play My Custom Title')
    })

    it('uses default title when not provided', () => {
      const { container } = render(<LiteYouTube videoId="test" />)

      const link = container.querySelector('a.lty-playbtn')
      expect(link).toHaveAttribute('title', 'Play YouTube Video')
    })

    it('renders title text for screen readers', () => {
      render(<LiteYouTube videoId="test" title="Herb Education Video" />)

      expect(screen.getByText('Herb Education Video')).toBeInTheDocument()
    })
  })

  describe('Poster Quality', () => {
    it('uses hqdefault by default', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('posterquality', 'hqdefault')
    })

    it('accepts custom poster quality', () => {
      const { container } = render(<LiteYouTube {...defaultProps} posterQuality="maxresdefault" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('posterquality', 'maxresdefault')
    })

    it('updates background image with poster quality', () => {
      const { container } = render(<LiteYouTube {...defaultProps} posterQuality="sddefault" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveStyle({
        backgroundImage: `url('https://i.ytimg.com/vi/dQw4w9WgXcQ/sddefault.jpg')`,
      })
    })

    it('supports all poster quality options', () => {
      const qualities = ['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'] as const

      qualities.forEach((quality) => {
        const { container } = render(<LiteYouTube videoId="test" posterQuality={quality} />)
        const element = container.querySelector('lite-youtube')
        expect(element).toHaveAttribute('posterquality', quality)
      })
    })
  })

  describe('Playlist Support', () => {
    it('sets playlist ID when provided', () => {
      const { container } = render(
        <LiteYouTube videoId="videoseries" playlistId="PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf" />
      )

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('playlistid', 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf')
    })

    it('uses playlist thumbnail when playlist ID provided', () => {
      const { container } = render(<LiteYouTube videoId="videoseries" playlistId="PLtest123" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveStyle({
        backgroundImage: `url('https://i.ytimg.com/vi/PLtest123/hqdefault.jpg')`,
      })
    })

    it('includes playlist in fallback link', () => {
      const { container } = render(<LiteYouTube videoId="test" playlistId="PLtest123" />)

      const link = container.querySelector('a.lty-playbtn')
      expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=test&list=PLtest123')
    })
  })

  describe('Custom Parameters', () => {
    it('sets params attribute when provided', () => {
      const { container } = render(<LiteYouTube {...defaultProps} params="start=10&end=60" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('params', 'start=10&end=60')
    })

    it('includes params in fallback link', () => {
      const { container } = render(
        <LiteYouTube videoId="test" params="autoplay=1&cc_load_policy=1" />
      )

      const link = container.querySelector('a.lty-playbtn')
      expect(link).toHaveAttribute(
        'href',
        'https://www.youtube.com/watch?v=test&autoplay=1&cc_load_policy=1'
      )
    })

    it('works without params', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).not.toHaveAttribute('params')
    })
  })

  describe('Privacy Mode (noCookie)', () => {
    it('sets nocookie attribute when enabled', () => {
      const { container } = render(<LiteYouTube {...defaultProps} noCookie={true} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('nocookie')
    })

    it('does not set nocookie by default', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).not.toHaveAttribute('nocookie')
    })
  })

  describe('Announce (Screen Readers)', () => {
    it('sets announce attribute when provided', () => {
      const { container } = render(
        <LiteYouTube {...defaultProps} announce="Now playing educational video" />
      )

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('announce', 'Now playing educational video')
    })

    it('works without announce attribute', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).not.toHaveAttribute('announce')
    })
  })

  describe('Mobile Resolution', () => {
    it('sets mobile resolution to play by default', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('mobileresolution', 'play')
    })

    it('accepts watch as mobile resolution', () => {
      const { container } = render(<LiteYouTube {...defaultProps} mobileResolution="watch" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('mobileresolution', 'watch')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(<LiteYouTube {...defaultProps} className="custom-class" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveClass('custom-class')
    })

    it('applies max-w-full class by default', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveClass('max-w-full')
    })

    it('combines custom class with default classes', () => {
      const { container } = render(<LiteYouTube {...defaultProps} className="my-video" />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveClass('max-w-full')
      expect(element).toHaveClass('my-video')
    })
  })

  describe('Accessibility', () => {
    it('provides fallback link for non-JavaScript users', () => {
      const { container } = render(<LiteYouTube {...defaultProps} />)

      const link = container.querySelector('a.lty-playbtn')
      expect(link).toHaveAttribute('href')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('includes title attribute on play button', () => {
      const { container } = render(<LiteYouTube videoId="test" title="Educational Content" />)

      const link = container.querySelector('a.lty-playbtn')
      expect(link).toHaveAttribute('title', 'Play Educational Content')
    })

    it('provides visually hidden text for screen readers', () => {
      render(<LiteYouTube videoId="test" title="Screen Reader Text" />)

      const hiddenText = screen.getByText('Screen Reader Text')
      expect(hiddenText).toHaveClass('lyt-visually-hidden')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long video IDs', () => {
      const longId = 'a'.repeat(100)
      const { container } = render(<LiteYouTube videoId={longId} />)

      const element = container.querySelector('lite-youtube')
      expect(element).toHaveAttribute('videoid', longId)
    })

    it('handles special characters in title', () => {
      render(<LiteYouTube videoId="test" title="Video & Title: Special <Characters>" />)

      expect(screen.getByText('Video & Title: Special <Characters>')).toBeInTheDocument()
    })

    it('handles empty params string', () => {
      const { container } = render(<LiteYouTube videoId="test" params="" />)

      const element = container.querySelector('lite-youtube')
      // Empty params string is falsy, so attribute is not set
      expect(element).not.toHaveAttribute('params')

      // Link should not include empty params
      const link = container.querySelector('a.lty-playbtn')
      expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=test')
    })
  })
})

describe('LiteYouTubeEmbed', () => {
  const defaultProps = {
    videoId: 'test123',
    title: 'Embedded Video',
  }

  describe('Rendering', () => {
    it('renders wrapper div', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} />)

      const wrapper = container.querySelector(
        '.relative.w-full.overflow-hidden.rounded-lg.shadow-md'
      )
      expect(wrapper).toBeInTheDocument()
    })

    it('renders LiteYouTube component inside wrapper', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} />)

      const liteYoutube = container.querySelector('lite-youtube')
      expect(liteYoutube).toBeInTheDocument()
    })

    it('applies absolute positioning to LiteYouTube', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} />)

      const liteYoutube = container.querySelector('lite-youtube')
      expect(liteYoutube).toHaveClass('absolute')
      expect(liteYoutube).toHaveClass('inset-0')
      expect(liteYoutube).toHaveClass('h-full')
      expect(liteYoutube).toHaveClass('w-full')
    })
  })

  describe('Aspect Ratio', () => {
    it('uses 16/9 aspect ratio by default', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} />)

      const wrapper = container.firstElementChild
      expect(wrapper).toHaveStyle({ aspectRatio: '16/9' })
    })

    it('accepts custom aspect ratio', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} aspectRatio="4/3" />)

      const wrapper = container.firstElementChild
      expect(wrapper).toHaveStyle({ aspectRatio: '4/3' })
    })

    it('supports vertical aspect ratio', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} aspectRatio="9/16" />)

      const wrapper = container.firstElementChild
      expect(wrapper).toHaveStyle({ aspectRatio: '9/16' })
    })
  })

  describe('Props Forwarding', () => {
    it('forwards all LiteYouTube props', () => {
      const { container } = render(
        <LiteYouTubeEmbed
          videoId="test"
          title="Forwarded Props"
          params="start=10"
          noCookie={true}
          posterQuality="maxresdefault"
        />
      )

      const liteYoutube = container.querySelector('lite-youtube')
      expect(liteYoutube).toHaveAttribute('videoid', 'test')
      expect(liteYoutube).toHaveAttribute('params', 'start=10')
      expect(liteYoutube).toHaveAttribute('nocookie')
      expect(liteYoutube).toHaveAttribute('posterquality', 'maxresdefault')
    })

    it('forwards playlist ID', () => {
      const { container } = render(<LiteYouTubeEmbed videoId="videoseries" playlistId="PLtest" />)

      const liteYoutube = container.querySelector('lite-youtube')
      expect(liteYoutube).toHaveAttribute('playlistid', 'PLtest')
    })
  })

  describe('Styling', () => {
    it('applies rounded corners', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} />)

      const wrapper = container.firstElementChild
      expect(wrapper).toHaveClass('rounded-lg')
    })

    it('applies shadow', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} />)

      const wrapper = container.firstElementChild
      expect(wrapper).toHaveClass('shadow-md')
    })

    it('prevents overflow', () => {
      const { container } = render(<LiteYouTubeEmbed {...defaultProps} />)

      const wrapper = container.firstElementChild
      expect(wrapper).toHaveClass('overflow-hidden')
    })
  })
})
