/**
 * TypeScript definitions for lite-youtube-embed custom element
 *
 * Adds type support for the <lite-youtube> custom element in JSX/TSX
 */

declare module 'lite-youtube-embed' {
  const LiteYouTubeEmbed: any
  export default LiteYouTubeEmbed
}

declare namespace JSX {
  interface IntrinsicElements {
    'lite-youtube': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        videoid?: string
        playlistid?: string
        params?: string
        posterquality?: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault'
        nocookie?: string | boolean
        announce?: string
        mobileResolution?: 'watch' | 'play'
      },
      HTMLElement
    >
  }
}
