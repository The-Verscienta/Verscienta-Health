/**
 * Button Component Tests
 *
 * Tests all variants, sizes, and interaction states
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('renders with custom className', () => {
      render(<Button className="custom-class">Click me</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('renders with asChild prop', () => {
      render(
        <Button asChild>
          <a href="/test">Link button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: 'Link button' })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-earth-600')
      expect(button).toHaveClass('text-white')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-sage-100')
      expect(button).toHaveClass('text-sage-900')
    })

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-2')
      expect(button).toHaveClass('border-earth-600')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
      expect(button).toHaveClass('hover:bg-earth-50')
    })

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-danger')
      expect(button).toHaveClass('text-white')
    })

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-earth-600')
      expect(button).toHaveClass('underline-offset-4')
    })
  })

  describe('Sizes', () => {
    it('renders default size', () => {
      render(<Button size="default">Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')
      expect(button).toHaveClass('px-6')
    })

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('text-xs')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-12')
      expect(button).toHaveClass('px-8')
      expect(button).toHaveClass('text-base')
    })

    it('renders icon size', () => {
      render(<Button size="icon" aria-label="Icon button" />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('w-10')
    })
  })

  describe('States', () => {
    it('renders disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none')
      expect(button).toHaveClass('disabled:opacity-50')
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')
      button.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not trigger click when disabled', () => {
      const handleClick = vi.fn()
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      )
      const button = screen.getByRole('button')
      button.click()
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus styling', () => {
      render(<Button>Focus test</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
      expect(button).toHaveClass('focus-visible:ring-earth-600')
    })

    it('supports aria-label', () => {
      render(<Button aria-label="Submit form">Submit</Button>)
      const button = screen.getByRole('button', { name: 'Submit form' })
      expect(button).toBeInTheDocument()
    })

    it('supports aria-disabled', () => {
      render(<Button aria-disabled="true">Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Type Attribute', () => {
    it('defaults to button type', () => {
      render(<Button>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('supports submit type', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('supports reset type', () => {
      render(<Button type="reset">Reset</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('Edge Cases', () => {
    it('renders with multiple classNames combined', () => {
      render(
        <Button className="extra-class another-class" variant="outline" size="lg">
          Multiple classes
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toHaveClass('extra-class')
      expect(button).toHaveClass('another-class')
      expect(button).toHaveClass('border-2')
      expect(button).toHaveClass('h-12')
    })

    it('renders with no children', () => {
      render(<Button aria-label="Empty button" />)
      const button = screen.getByRole('button', { name: 'Empty button' })
      expect(button).toBeInTheDocument()
      expect(button.textContent).toBe('')
    })

    it('preserves ref forwarding', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Ref test</Button>)
      expect(ref).toHaveBeenCalled()
    })
  })
})
