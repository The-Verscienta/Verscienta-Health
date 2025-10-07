# Storybook - Component Documentation

Verscienta Health uses Storybook for component development and documentation.

## 🚀 Getting Started

### Running Storybook

```bash
# From the root directory
cd apps/web
pnpm storybook
```

Storybook will be available at `http://localhost:6006`

### Building Storybook

```bash
# Build static Storybook for deployment
pnpm build-storybook
```

The static build will be in `apps/web/storybook-static/`

## 📁 Structure

```
apps/web/
├── .storybook/              # Storybook configuration
│   ├── main.ts             # Main configuration
│   ├── preview.tsx         # Global preview settings
│   └── Introduction.mdx    # Introduction page
└── components/
    └── ui/
        ├── button.tsx
        ├── button.stories.tsx
        ├── button.stories.mdx    # Detailed button documentation
        ├── badge.tsx
        ├── badge.stories.tsx
        ├── badge.stories.mdx     # Detailed badge documentation
        ├── card.tsx
        ├── card.stories.tsx
        └── card.stories.mdx      # Detailed card documentation
```

## 📝 Writing Stories

### Basic Story Example

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Click me',
  },
}
```

### Story with Multiple Variants

```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
}
```

### MDX Documentation

For comprehensive component documentation, create an MDX file alongside your stories:

**button.stories.mdx**

````mdx
import { Meta, Canvas, Story, Controls, Primary } from '@storybook/blocks'
import * as ButtonStories from './button.stories'

<Meta of={ButtonStories} />

# Button

A versatile button component built on Radix UI.

<Primary />

## Usage

```tsx
import { Button } from '@/components/ui/button'

;<Button variant="default">Click me</Button>
```
````

## Variants

<Canvas of={ButtonStories.Default} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Outline} />

## Props

<Controls />
```

**Benefits of MDX:**

- Rich markdown content with component examples
- Code syntax highlighting
- Interactive component previews
- Props documentation
- Usage guidelines and best practices
- Accessibility notes
- Design guidelines

## 🎨 Available Components

### UI Components

- **Button** - Primary interaction component with 6 variants
- **Badge** - Status and label component with 9 variants
- **Card** - Container component with header, content, footer
- **Input** - Form input fields
- **Dialog** - Modal dialogs
- **Tabs** - Tabbed navigation

### Card Variants

- **HerbCard** - Displays herb information
- **FormulaCard** - Displays formula information
- **ConditionCard** - Displays condition information
- **PractitionerCard** - Displays practitioner profiles

## 🎯 Component Guidelines

### Accessibility

All components must:

- Have proper ARIA labels
- Support keyboard navigation
- Meet WCAG 2.1 AA standards
- Be tested with axe-core

### TypeScript

```tsx
// Always export props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}
```

### Styling

- Use Tailwind CSS classes
- Follow the design system color palette
- Use `cn()` utility for class merging
- Support dark mode where applicable

## 🧪 Testing Stories

### Interaction Tests

```tsx
import { expect } from '@storybook/test'
import { within, userEvent } from '@storybook/testing-library'

export const Clickable: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  },
}
```

### Accessibility Tests

Storybook automatically runs accessibility tests with the `@storybook/addon-a11y` addon.

## 📦 Addons

Current addons installed:

- **@storybook/addon-essentials** - Core addons (controls, actions, docs, etc.)
- **@storybook/addon-interactions** - Interaction testing
- **@storybook/addon-links** - Link between stories

## 🔧 Configuration

### Main Configuration (.storybook/main.ts)

```ts
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)',
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
}

export default config
```

**Note:** The `.mdx` extension is included in the stories pattern to support MDX documentation files.

### Preview Configuration (.storybook/preview.tsx)

```tsx
import type { Preview } from '@storybook/react'
import '../app/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'earth', value: '#f5f3ef' },
      ],
    },
  },
}

export default preview
```

## 📊 Design Tokens

### Colors

**Earth (Primary)**

```tsx
<Button variant="default" /> // Uses earth-600
```

**Sage (Secondary)**

```tsx
<Badge variant="sage" /> // Uses sage-100/sage-700
```

**TCM Red**

```tsx
<Badge variant="tcm" /> // Uses #c1272d
```

**Gold (Verified)**

```tsx
<Badge variant="gold" /> // Uses #d4a574
```

## 🚀 Deployment

### Deploy to Chromatic (Recommended)

```bash
# Install Chromatic
pnpm add -D chromatic

# Deploy
pnpm chromatic --project-token=<your-token>
```

### Deploy to Static Host

```bash
# Build static Storybook
pnpm build-storybook

# Deploy storybook-static/ to any static host
# (Netlify, Vercel, GitHub Pages, etc.)
```

## 📚 Resources

- [Storybook Docs](https://storybook.js.org/docs)
- [Next.js Integration](https://storybook.js.org/docs/get-started/nextjs)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [Component Testing](https://storybook.js.org/docs/writing-tests)

## 🤝 Contributing

When adding new components:

1. Create the component in `components/ui/`
2. Add TypeScript types
3. Create a `.stories.tsx` file with all variants
4. Create a `.stories.mdx` file for comprehensive documentation
5. Add all variants and use cases
6. Test accessibility
7. Document props with JSDoc comments

Example component structure:

```
components/ui/
├── button.tsx           # Component implementation
├── button.stories.tsx   # Interactive stories (variants, states)
└── button.stories.mdx   # Detailed documentation (usage, guidelines)
```

Example JSDoc:

````tsx
/**
 * Primary button component for user interactions
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Click me
 * </Button>
 * ```
 */
export const Button = ({ ... }) => { ... }
````

**MDX Documentation Checklist:**

- [ ] Component overview and description
- [ ] Installation/usage instructions
- [ ] All variants with examples
- [ ] Props documentation (using `<Controls />`)
- [ ] Use cases and patterns
- [ ] Accessibility best practices
- [ ] Design guidelines (do's and don'ts)
- [ ] Related components
- [ ] Code examples

---

**Happy component building! 🎨**
