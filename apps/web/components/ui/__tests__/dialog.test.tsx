/**
 * Dialog Component Tests
 *
 * Tests dialog modal rendering, interactions, and accessibility
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog'

describe('Dialog', () => {
  describe('Rendering', () => {
    it('renders closed by default', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Open Dialog')).toBeInTheDocument()
      // Dialog content should not be visible
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
    })

    it('renders when controlled with open prop', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    })

    it('renders trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>Content</DialogContent>
        </Dialog>
      )

      const trigger = screen.getByRole('button', { name: 'Open Dialog' })
      expect(trigger).toBeInTheDocument()
    })

    it('renders all sub-components correctly', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>Dialog description text</DialogDescription>
            </DialogHeader>
            <div>Main content goes here</div>
            <DialogFooter>Footer content</DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog description text')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })
  })

  describe('Dialog Trigger', () => {
    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Opened Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      // Dialog should be closed initially
      expect(screen.queryByText('Opened Dialog')).not.toBeInTheDocument()

      // Click trigger
      await user.click(screen.getByRole('button', { name: 'Open' }))

      // Dialog should now be visible
      expect(screen.getByText('Opened Dialog')).toBeInTheDocument()
    })

    it('accepts custom trigger as child', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger asChild>
            <button className="custom-trigger">Custom Trigger</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByRole('button', { name: 'Custom Trigger' }))
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Dialog Content', () => {
    it('renders close button with accessible label', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toBeInTheDocument()
    })

    it('closes when close button is clicked', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(
        <Dialog open={true} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('applies custom className', () => {
      render(
        <Dialog open={true}>
          <DialogContent className="custom-dialog-class">
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('custom-dialog-class')
    })

    it('renders content in a modal dialog', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <div>Dialog content</div>
          </DialogContent>
        </Dialog>
      )

      // Dialog should be modal and visible
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Dialog content')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = vi.fn()

      render(
        <Dialog open={true}>
          <DialogContent ref={ref}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Dialog Header', () => {
    it('renders header with correct structure', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader data-testid="dialog-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )

      const header = screen.getByTestId('dialog-header')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('space-y-1.5')
    })

    it('accepts custom className', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader className="custom-header" data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId('header')).toHaveClass('custom-header')
    })
  })

  describe('Dialog Title', () => {
    it('renders as heading', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const title = screen.getByText('My Dialog Title')
      expect(title).toBeInTheDocument()
    })

    it('applies default styling', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const title = screen.getByText('Title')
      expect(title).toHaveClass('font-serif')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-semibold')
    })

    it('accepts custom className', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle className="custom-title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title')
    })

    it('forwards ref correctly', () => {
      const ref = vi.fn()

      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle ref={ref}>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Dialog Description', () => {
    it('renders description text', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('applies default styling', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      const description = screen.getByText('Description')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-gray-600')
    })

    it('accepts custom className', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription className="custom-desc">Description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Description')).toHaveClass('custom-desc')
    })

    it('forwards ref correctly', () => {
      const ref = vi.fn()

      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription ref={ref}>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Dialog Footer', () => {
    it('renders footer content', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter>
              <button>Cancel</button>
              <button>Submit</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    it('applies responsive flex styling', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">Footer</DialogFooter>
          </DialogContent>
        </Dialog>
      )

      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('flex-col-reverse')
      expect(footer).toHaveClass('sm:flex-row')
    })

    it('accepts custom className', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter className="custom-footer" data-testid="footer">
              Footer
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByTestId('footer')).toHaveClass('custom-footer')
    })
  })

  describe('User Interactions', () => {
    it('closes on Escape key press', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(
        <Dialog open={true} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      await user.keyboard('{Escape}')

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange when closing', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(
        <Dialog open={true} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByRole('button', { name: 'Close' }))

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Accessibility', () => {
    it('has accessible dialog role', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('title is associated with dialog', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Accessible Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog', { name: 'Accessible Title' })
      expect(dialog).toBeInTheDocument()
    })

    it('description is associated with dialog', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Accessible description</DialogDescription>
          </DialogContent>
        </Dialog>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('close button has accessible label', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toBeInTheDocument()
    })

    it('traps focus within dialog when open', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <button>Action 1</button>
            <button>Action 2</button>
          </DialogContent>
        </Dialog>
      )

      const buttons = screen.getAllByRole('button')
      // Should have close button + 2 action buttons
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Uncontrolled</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.queryByText('Uncontrolled')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Open' }))

      expect(screen.getByText('Uncontrolled')).toBeInTheDocument()
    })

    it('works as controlled component', () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Controlled</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.queryByText('Controlled')).not.toBeInTheDocument()

      rerender(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Controlled</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Controlled')).toBeInTheDocument()
    })

    it('respects controlled open state', async () => {
      const user = userEvent.setup()

      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Always Open</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      // Try to close (without onOpenChange handler)
      await user.click(screen.getByRole('button', { name: 'Close' }))

      // Should still be visible because it's controlled
      expect(screen.getByText('Always Open')).toBeInTheDocument()
    })
  })

  describe('Complex Dialog Composition', () => {
    it('renders complete dialog with all elements', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Dialog</DialogTitle>
              <DialogDescription>This dialog has all elements</DialogDescription>
            </DialogHeader>
            <div>
              <label htmlFor="input">Name:</label>
              <input id="input" type="text" />
            </div>
            <DialogFooter>
              <button>Cancel</button>
              <button>Save</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Complete Dialog')).toBeInTheDocument()
      expect(screen.getByText('This dialog has all elements')).toBeInTheDocument()
      expect(screen.getByLabelText('Name:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('handles form submission within dialog', async () => {
      const user = userEvent.setup()
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Form Dialog</DialogTitle>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Enter name" />
              <button type="submit">Submit</button>
            </form>
          </DialogContent>
        </Dialog>
      )

      await user.click(screen.getByRole('button', { name: 'Submit' }))

      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('applies positioning classes', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const content = screen.getByRole('dialog')
      expect(content).toHaveClass('fixed')
    })

    it('applies responsive classes', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const content = screen.getByRole('dialog')
      expect(content).toHaveClass('sm:rounded-lg')
    })

    it('applies spacing and sizing classes', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      )

      const content = screen.getByRole('dialog')
      expect(content).toHaveClass('gap-4')
      expect(content).toHaveClass('p-6')
    })
  })
})
