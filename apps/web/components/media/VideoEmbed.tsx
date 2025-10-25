'use client'

import { useState } from 'react'

interface VideoData {
  provider: 'youtube' | 'vimeo' | 'facebook'
  providerUid: string
  url: string
}

interface VideoEmbedProps {
  video: VideoData
  title?: string
  className?: string
}

export function VideoEmbed({ video, title, className = '' }: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)

  const getEmbedUrl = () => {
    switch (video.provider) {
      case 'youtube':
        return `https://www.youtube.com/embed/${video.providerUid}`
      case 'vimeo':
        return `https://player.vimeo.com/video/${video.providerUid}`
      case 'facebook':
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.url)}`
      default:
        return ''
    }
  }

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-earth-500 border-t-transparent" />
        </div>
      )}
      <iframe
        src={getEmbedUrl()}
        title={title || 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}

interface VideoTutorialProps {
  video: VideoData
  title: string
  description?: string
  duration?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export function VideoTutorial({
  video,
  title,
  description,
  duration,
  difficulty,
}: VideoTutorialProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  }

  return (
    <div className="space-y-4">
      <VideoEmbed video={video} title={title} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {difficulty && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColors[difficulty]}`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          )}
        </div>

        {duration && (
          <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {duration}</p>
        )}

        {description && <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>}
      </div>
    </div>
  )
}
