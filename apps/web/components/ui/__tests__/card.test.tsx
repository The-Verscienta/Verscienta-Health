/**
 * Card Component Tests
 *
 * Tests Card and all its sub-components
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly', () => {
      render(<Card data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card.textContent).toBe('Card content')
    })

    it('applies default classes', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('border-gray-200')
      expect(card).toHaveClass('bg-white')
      expect(card).toHaveClass('shadow-md')
    })

    it('merges custom className', () => {
      render(
        <Card data-testid="card" className="custom-class">
          Content
        </Card>
      )
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
      expect(card).toHaveClass('rounded-lg') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header.textContent).toBe('Header content')
    })

    it('applies default classes', () => {
      render(<CardHeader data-testid="header">Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('space-y-1.5')
      expect(header).toHaveClass('p-6')
    })

    it('merges custom className', () => {
      render(
        <CardHeader data-testid="header" className="custom-header">
          Content
        </CardHeader>
      )
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
      expect(header).toHaveClass('flex')
    })
  })

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Title text</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title.textContent).toBe('Title text')
    })

    it('applies default classes', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByRole('heading')
      expect(title).toHaveClass('text-earth-900')
      expect(title).toHaveClass('text-xl')
      expect(title).toHaveClass('font-bold')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
    })

    it('merges custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      const title = screen.getByRole('heading')
      expect(title).toHaveClass('custom-title')
      expect(title).toHaveClass('text-xl')
    })
  })

  describe('CardDescription', () => {
    it('renders as paragraph element', () => {
      render(<CardDescription>Description text</CardDescription>)
      const description = screen.getByText('Description text')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('P')
    })

    it('applies default classes', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const description = screen.getByTestId('desc')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-gray-600')
    })

    it('merges custom className', () => {
      render(
        <CardDescription data-testid="desc" className="custom-desc">
          Description
        </CardDescription>
      )
      const description = screen.getByTestId('desc')
      expect(description).toHaveClass('custom-desc')
      expect(description).toHaveClass('text-sm')
    })
  })

  describe('CardContent', () => {
    it('renders correctly', () => {
      render(<CardContent data-testid="content">Content text</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content.textContent).toBe('Content text')
    })

    it('applies default classes', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('merges custom className', () => {
      render(
        <CardContent data-testid="content" className="custom-content">
          Content
        </CardContent>
      )
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
      expect(content).toHaveClass('p-6')
    })
  })

  describe('CardFooter', () => {
    it('renders correctly', () => {
      render(<CardFooter data-testid="footer">Footer text</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer.textContent).toBe('Footer text')
    })

    it('applies default classes', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('p-6')
      expect(footer).toHaveClass('pt-0')
    })

    it('merges custom className', () => {
      render(
        <CardFooter data-testid="footer" className="custom-footer">
          Footer
        </CardFooter>
      )
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
      expect(footer).toHaveClass('flex')
    })
  })

  describe('Full Card Composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Main content goes here</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>
      )

      const card = screen.getByTestId('full-card')
      expect(card).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
      expect(screen.getByText('Card Description')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('works without header', () => {
      render(
        <Card data-testid="card">
          <CardContent>Content only</CardContent>
        </Card>
      )

      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })

    it('works without footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Dark Mode Classes', () => {
    it('includes dark mode styles for Card', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('dark:border-gray-700')
      expect(card).toHaveClass('dark:bg-gray-800')
    })

    it('includes dark mode styles for CardDescription', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const description = screen.getByTestId('desc')
      expect(description).toHaveClass('dark:text-gray-400')
    })
  })

  describe('Accessibility', () => {
    it('supports ARIA attributes on Card', () => {
      render(
        <Card aria-label="Product card" role="article">
          Content
        </Card>
      )
      const card = screen.getByRole('article', { name: 'Product card' })
      expect(card).toBeInTheDocument()
    })

    it('supports ARIA attributes on CardTitle', () => {
      render(<CardTitle aria-describedby="card-desc">Title</CardTitle>)
      const title = screen.getByRole('heading')
      expect(title).toHaveAttribute('aria-describedby', 'card-desc')
    })

    it('has proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>H3 Heading</CardTitle>
          </CardHeader>
        </Card>
      )
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toBeInTheDocument()
    })
  })
})
