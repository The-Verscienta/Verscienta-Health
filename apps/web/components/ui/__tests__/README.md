# LiteYouTube Component

## Overview

The `LiteYouTube` component provides a performance-optimized way to embed YouTube videos using the [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed) library by Paul Irish.

### Performance Benefits

- **~224KB reduction** in initial page weight per video
- **Faster page load** - no YouTube player scripts until user interaction
- **Better Core Web Vitals** - improved LCP, FID, and CLS scores
- **Lazy loading** - YouTube player loads only when user clicks play

## Components

### `LiteYouTube`

The base component for embedding YouTube videos.

```tsx
import { LiteYouTube } from '@/components/ui/lite-youtube'

<LiteYouTube
  videoId="dQw4w9WgXcQ"
  title="Rick Astley - Never Gonna Give You Up"
/>
```

### `LiteYouTubeEmbed`

A wrapper component with common styling for embedded videos (responsive container with aspect ratio).

```tsx
import { LiteYouTubeEmbed } from '@/components/ui/lite-youtube'

<LiteYouTubeEmbed
  videoId="dQw4w9WgXcQ"
  title="Educational Video"
  aspectRatio="16/9"
/>
```

## Props

### LiteYouTube Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `videoId` | `string` | **Required** | YouTube video ID (e.g., "dQw4w9WgXcQ") |
| `title` | `string` | "YouTube Video" | Video title for accessibility |
| `playlistId` | `string` | - | Optional playlist ID |
| `params` | `string` | - | YouTube player parameters |
| `posterQuality` | `'default' \| 'mqdefault' \| 'hqdefault' \| 'sddefault' \| 'maxresdefault'` | `'hqdefault'` | Thumbnail quality |
| `className` | `string` | - | Custom CSS class |
| `announce` | `string` | - | Screen reader announcement text |
| `noCookie` | `boolean` | `false` | Use youtube-nocookie.com domain |
| `mobileResolution` | `'watch' \| 'play'` | `'play'` | Mobile behavior |

### LiteYouTubeEmbed Props

All `LiteYouTube` props plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `aspectRatio` | `string` | `"16/9"` | Container aspect ratio |

## Usage Examples

### Basic Video Embed

```tsx
<LiteYouTube
  videoId="jNQXAC9IVRw"
  title="Me at the zoo"
/>
```

### With Custom Parameters

Start video at 1:30 and enable captions:

```tsx
<LiteYouTube
  videoId="dQw4w9WgXcQ"
  title="Never Gonna Give You Up"
  params="start=90&cc_load_policy=1"
/>
```

### Playlist Embed

```tsx
<LiteYouTube
  videoId="videoseries"
  playlistId="PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
  title="TCM Education Playlist"
/>
```

### Privacy-Enhanced Mode

Use youtube-nocookie.com domain (no tracking cookies until user clicks play):

```tsx
<LiteYouTube
  videoId="dQw4w9WgXcQ"
  title="Privacy-Enhanced Video"
  noCookie={true}
/>
```

### Custom Aspect Ratio

```tsx
<LiteYouTubeEmbed
  videoId="example123"
  title="Vertical Video"
  aspectRatio="9/16"
/>
```

### High-Quality Thumbnail

```tsx
<LiteYouTube
  videoId="dQw4w9WgXcQ"
  title="High Quality Thumbnail"
  posterQuality="maxresdefault"
/>
```

## YouTube Player Parameters

Common parameters for the `params` prop:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `start` | Start time in seconds | `"start=90"` |
| `end` | End time in seconds | `"end=120"` |
| `autoplay` | Auto-play video (1 = yes) | `"autoplay=1"` |
| `loop` | Loop video (1 = yes) | `"loop=1"` |
| `cc_load_policy` | Show captions (1 = yes) | `"cc_load_policy=1"` |
| `color` | Player color (red/white) | `"color=white"` |
| `controls` | Show controls (0/1) | `"controls=1"` |
| `fs` | Show fullscreen button | `"fs=1"` |
| `modestbranding` | Minimize YouTube branding | `"modestbranding=1"` |

Combine multiple parameters with `&`:

```tsx
<LiteYouTube
  videoId="example"
  params="start=30&end=90&cc_load_policy=1&color=white"
/>
```

[Full parameter reference](https://developers.google.com/youtube/player_parameters)

## Accessibility

The component includes several accessibility features:

1. **Fallback Link**: Non-JavaScript users get a direct YouTube link
2. **Title Attribute**: Play button has descriptive title
3. **Visually Hidden Text**: Screen readers announce the video title
4. **Keyboard Navigation**: Component is fully keyboard accessible
5. **Custom Announcements**: Use `announce` prop for custom screen reader text

```tsx
<LiteYouTube
  videoId="example"
  title="Traditional Chinese Medicine Introduction"
  announce="Now playing: Introduction to TCM principles"
/>
```

## Use Cases in Verscienta Health

### Herb Detail Pages

```tsx
<LiteYouTubeEmbed
  videoId="herb_video_id"
  title="Growing and Harvesting Ginseng"
  aspectRatio="16/9"
/>
```

### Educational Content

```tsx
<div className="space-y-4">
  <h2>TCM Diagnosis Fundamentals</h2>
  <LiteYouTubeEmbed
    videoId="tcm_diagnosis_id"
    title="TCM Diagnosis: Reading the Tongue and Pulse"
    params="cc_load_policy=1"
  />
</div>
```

### Practitioner Profiles

```tsx
<LiteYouTubeEmbed
  videoId="practitioner_intro"
  title="Dr. Smith - Introduction to My Practice"
  aspectRatio="16/9"
  noCookie={true}
/>
```

### Formula Preparation Videos

```tsx
<LiteYouTubeEmbed
  videoId="formula_prep"
  title="How to Prepare Si Jun Zi Tang"
  params="start=0&cc_load_policy=1"
/>
```

## Testing

The component has comprehensive test coverage (45 tests):

```bash
pnpm test:unit lite-youtube.test.tsx
```

Test coverage includes:
- Basic rendering and video ID handling
- Title and accessibility features
- Poster quality options
- Playlist support
- Custom parameters
- Privacy mode (noCookie)
- Mobile resolution options
- Custom styling
- Edge cases (long IDs, special characters, empty params)
- LiteYouTubeEmbed wrapper functionality

## Performance Comparison

### Traditional YouTube Embed
- **Initial Load**: ~540KB JavaScript
- **HTTP Requests**: 8-10 requests
- **Load Time**: ~2-3 seconds

### LiteYouTube
- **Initial Load**: ~3KB JavaScript + thumbnail image
- **HTTP Requests**: 1 request (thumbnail)
- **Load Time**: <100ms
- **Full Player**: Loads only when user clicks (lazy)

### Impact on Core Web Vitals

- **LCP (Largest Contentful Paint)**: Faster by ~1-2 seconds
- **FID (First Input Delay)**: Reduced by ~50-100ms
- **CLS (Cumulative Layout Shift)**: Improved by fixing container aspect ratio

## Migration from Standard YouTube Embeds

### Before (Standard iframe)

```tsx
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  title="Video Title"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>
```

### After (LiteYouTube)

```tsx
<LiteYouTubeEmbed
  videoId="dQw4w9WgXcQ"
  title="Video Title"
/>
```

**Benefits**: Same visual result, ~220KB lighter, faster page load.

## Browser Support

Supports all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

Falls back gracefully to direct YouTube link for older browsers.

## Related Resources

- [lite-youtube-embed GitHub](https://github.com/paulirish/lite-youtube-embed)
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- [Web.dev: Lazy-load YouTube videos](https://web.dev/patterns/web-vitals-patterns/video-embeds/youtube-lite)

## License

The lite-youtube-embed library is licensed under MIT.
