'use client'

/**
 * LiteYouTube Component
 *
 * A performance-optimized YouTube embed using lite-youtube-embed.
 * Reduces initial page weight by ~224KB and improves Core Web Vitals.
 *
 * Features:
 * - Lazy loads YouTube player only when user clicks
 * - Shows thumbnail and play button immediately
 * - Supports playlists and custom parameters
 * - Accessible with keyboard navigation
 * - Responsive design
 *
 * @see https://github.com/paulirish/lite-youtube-embed
 */

import React, { useEffect } from 'react'
import 'lite-youtube-embed/src/lite-yt-embed.css'

export interface LiteYouTubeProps {
  /**
   * YouTube video ID (e.g., "dQw4w9WgXcQ" from https://www.youtube.com/watch?v=dQw4w9WgXcQ)
   */
  videoId: string

  /**
   * Optional video title for accessibility
   */
  title?: string

  /**
   * Optional playlist ID
   */
  playlistId?: string

  /**
   * YouTube player parameters
   * @see https://developers.google.com/youtube/player_parameters
   */
  params?: string

  /**
   * Poster image quality
   * @default 'hqdefault'
   */
  posterQuality?: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault'

  /**
   * Optional CSS class name
   */
  className?: string

  /**
   * Announcement text for screen readers when video loads
   * @default 'Watch {title}'
   */
  announce?: string

  /**
   * Custom noCookie domain (youtube-nocookie.com)
   * @default false
   */
  noCookie?: boolean

  /**
   * Mobile click behavior: 'watch' (YouTube app) or 'play' (inline)
   * @default 'play'
   */
  mobileResolution?: 'watch' | 'play'
}

/**
 * LiteYouTube - Performance-optimized YouTube embed
 *
 * @example
 * ```tsx
 * <LiteYouTube
 *   videoId="dQw4w9WgXcQ"
 *   title="Rick Astley - Never Gonna Give You Up"
 * />
 * ```
 *
 * @example With playlist
 * ```tsx
 * <LiteYouTube
 *   videoId="videoseries"
 *   playlistId="PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
 *   title="Herb Education Playlist"
 * />
 * ```
 *
 * @example With custom parameters
 * ```tsx
 * <LiteYouTube
 *   videoId="dQw4w9WgXcQ"
 *   title="Educational Video"
 *   params="start=10&end=60&cc_load_policy=1"
 * />
 * ```
 */
export function LiteYouTube({
  videoId,
  title = 'YouTube Video',
  playlistId,
  params,
  posterQuality = 'hqdefault',
  className = '',
  announce,
  noCookie = false,
  mobileResolution = 'play',
}: LiteYouTubeProps) {
  useEffect(() => {
    // Dynamically import the custom element only on client side
    import('lite-youtube-embed')
  }, [])

  // Build the poster URL
  const posterUrl = playlistId
    ? `https://i.ytimg.com/vi/${playlistId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/${posterQuality}.jpg`

  // Build the props object for the custom element
  const liteYouTubeProps: Record<string, any> = {
    videoid: videoId,
    posterquality: posterQuality,
    className: `max-w-full ${className}`,
    style: {
      backgroundImage: `url('${posterUrl}')`,
    },
  }

  if (playlistId) liteYouTubeProps.playlistid = playlistId
  if (params) liteYouTubeProps.params = params
  if (noCookie) liteYouTubeProps.nocookie = ''
  if (announce) liteYouTubeProps.announce = announce
  if (mobileResolution) liteYouTubeProps.mobileResolution = mobileResolution

  // Use React.createElement to bypass JSX type checking for custom element
  return React.createElement(
    'lite-youtube',
    liteYouTubeProps,
    <a
      href={`https://www.youtube.com/watch?v=${videoId}${playlistId ? `&list=${playlistId}` : ''}${params ? `&${params}` : ''}`}
      className="lty-playbtn"
      title={`Play ${title}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="lyt-visually-hidden">{title}</span>
    </a>
  )
}

/**
 * LiteYouTubeEmbed - Wrapper with common styling for embedded videos
 *
 * @example
 * ```tsx
 * <LiteYouTubeEmbed
 *   videoId="dQw4w9WgXcQ"
 *   title="Introduction to TCM"
 *   aspectRatio="16/9"
 * />
 * ```
 */
export function LiteYouTubeEmbed({
  aspectRatio = '16/9',
  ...props
}: LiteYouTubeProps & { aspectRatio?: string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow-md"
      style={{ aspectRatio }}
    >
      <LiteYouTube {...props} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
