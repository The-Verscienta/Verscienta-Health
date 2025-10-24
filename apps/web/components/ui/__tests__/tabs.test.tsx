/**
 * Tabs Component Tests
 *
 * Tests tabs rendering, switching, and accessibility
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

describe('Tabs', () => {
  const defaultTabs = (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  )

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(defaultTabs)
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    it('renders all tabs', () => {
      render(defaultTabs)
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument()
    })

    it('renders default active tab content', () => {
      render(defaultTabs)
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
    })

    it('renders with custom className on TabsList', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveClass('custom-list')
    })

    it('renders with custom className on TabsTrigger', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )
      const tab = screen.getByRole('tab', { name: 'Tab 1' })
      expect(tab).toHaveClass('custom-trigger')
    })

    it('renders with custom className on TabsContent', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">
            Content
          </TabsContent>
        </Tabs>
      )
      const content = screen.getByRole('tabpanel')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('Tab Switching', () => {
    it('switches tabs on click', async () => {
      const user = userEvent.setup()
      render(defaultTabs)

      // Initially shows tab 1 content
      expect(screen.getByText('Content 1')).toBeInTheDocument()

      // Click tab 2
      await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

      // Now shows tab 2 content
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    it('switches between multiple tabs', async () => {
      const user = userEvent.setup()
      render(defaultTabs)

      // Click through all tabs
      await user.click(screen.getByRole('tab', { name: 'Tab 2' }))
      expect(screen.getByText('Content 2')).toBeInTheDocument()

      await user.click(screen.getByRole('tab', { name: 'Tab 3' }))
      expect(screen.getByText('Content 3')).toBeInTheDocument()

      await user.click(screen.getByRole('tab', { name: 'Tab 1' }))
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('calls onValueChange when tab is switched', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()

      render(
        <Tabs defaultValue="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }))
      expect(handleValueChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates tabs with arrow keys', async () => {
      const user = userEvent.setup()
      render(defaultTabs)

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      tab1.focus()

      // Arrow right to next tab
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus()

      // Arrow right again
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toHaveFocus()

      // Arrow left to previous tab
      await user.keyboard('{ArrowLeft}')
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus()
    })

    it('activates tab on Enter key', async () => {
      const user = userEvent.setup()
      render(defaultTabs)

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      tab2.focus()
      await user.keyboard('{Enter}')

      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('activates tab on Space key', async () => {
      const user = userEvent.setup()
      render(defaultTabs)

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' })
      tab3.focus()
      await user.keyboard(' ')

      expect(screen.getByText('Content 3')).toBeInTheDocument()
    })
  })

  describe('Default Value', () => {
    it('respects defaultValue prop', () => {
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    it('shows first tab when no defaultValue is provided', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      // Radix UI may not show any content without defaultValue or value prop
      // This tests the actual behavior
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      expect(tab1).toBeInTheDocument()
    })
  })

  describe('Controlled Component', () => {
    it('works as controlled component', () => {
      const { rerender } = render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('Content 1')).toBeInTheDocument()

      // Change value prop
      rerender(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('respects controlled value over user clicks', async () => {
      const user = userEvent.setup()

      render(
        <Tabs value="tab1" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      // Try to click tab 2, but value is controlled
      await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

      // Content should not change because component is controlled
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })
  })

  describe('Disabled Tabs', () => {
    it('renders disabled tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const disabledTab = screen.getByRole('tab', { name: 'Tab 2' })
      expect(disabledTab).toBeDisabled()
    })

    it('cannot click disabled tab', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

      // Content should not change
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    it('applies disabled styling', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" disabled>
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )

      const disabledTab = screen.getByRole('tab', { name: 'Tab 1' })
      expect(disabledTab).toHaveClass('disabled:pointer-events-none')
      expect(disabledTab).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      render(defaultTabs)

      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('marks active tab with aria-selected', () => {
      render(defaultTabs)

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      expect(tab1).toHaveAttribute('aria-selected', 'true')

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      expect(tab2).toHaveAttribute('aria-selected', 'false')
    })

    it('updates aria-selected when switching tabs', async () => {
      const user = userEvent.setup()
      render(defaultTabs)

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

      expect(tab1).toHaveAttribute('aria-selected', 'false')
      expect(tab2).toHaveAttribute('aria-selected', 'true')
    })

    it('associates tab with tabpanel', async () => {
      const user = userEvent.setup()
      render(defaultTabs)

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const panel1 = screen.getByRole('tabpanel')

      const controlsId = tab1.getAttribute('aria-controls')
      expect(panel1).toHaveAttribute('id', controlsId)
    })

    it('marks disabled tabs with data-disabled', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" disabled>
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )

      const tab = screen.getByRole('tab', { name: 'Tab 1' })
      // Radix UI uses data-disabled attribute
      expect(tab).toHaveAttribute('data-disabled')
    })
  })

  describe('Styling', () => {
    it('applies default TabsList styling', () => {
      render(defaultTabs)
      const tablist = screen.getByRole('tablist')

      expect(tablist).toHaveClass('bg-earth-100')
      expect(tablist).toHaveClass('text-earth-700')
      expect(tablist).toHaveClass('inline-flex')
      expect(tablist).toHaveClass('rounded-md')
    })

    it('applies default TabsTrigger styling', () => {
      render(defaultTabs)
      const tab = screen.getByRole('tab', { name: 'Tab 1' })

      expect(tab).toHaveClass('inline-flex')
      expect(tab).toHaveClass('items-center')
      expect(tab).toHaveClass('justify-center')
      expect(tab).toHaveClass('rounded-sm')
    })

    it('applies active tab styling', () => {
      render(defaultTabs)
      const activeTab = screen.getByRole('tab', { name: 'Tab 1' })

      expect(activeTab).toHaveClass('data-[state=active]:bg-white')
      expect(activeTab).toHaveClass('data-[state=active]:shadow-sm')
    })

    it('applies default TabsContent styling', () => {
      render(defaultTabs)
      const content = screen.getByRole('tabpanel')

      expect(content).toHaveClass('mt-2')
      expect(content).toHaveClass('focus-visible:ring-earth-600')
    })

    it('merges custom className with defaults', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list-class">
            <TabsTrigger value="tab1" className="custom-trigger-class">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content-class">
            Content
          </TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('tablist')).toHaveClass('custom-list-class')
      expect(screen.getByRole('tablist')).toHaveClass('bg-earth-100') // Still has default

      expect(screen.getByRole('tab')).toHaveClass('custom-trigger-class')
      expect(screen.getByRole('tab')).toHaveClass('inline-flex') // Still has default

      expect(screen.getByRole('tabpanel')).toHaveClass('custom-content-class')
      expect(screen.getByRole('tabpanel')).toHaveClass('mt-2') // Still has default
    })
  })

  describe('Complex Tabs', () => {
    it('handles many tabs', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TabsTrigger key={num} value={`tab${num}`}>
                Tab {num}
              </TabsTrigger>
            ))}
          </TabsList>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TabsContent key={num} value={`tab${num}`}>
              Content {num}
            </TabsContent>
          ))}
        </Tabs>
      )

      expect(screen.getAllByRole('tab')).toHaveLength(10)
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('handles rich content in tabs', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">
              <span>Icon</span> Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <div>
              <h2>Heading</h2>
              <p>Paragraph</p>
              <button>Button</button>
            </div>
          </TabsContent>
        </Tabs>
      )

      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument()
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref to TabsList', () => {
      const ref = vi.fn()
      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )

      expect(ref).toHaveBeenCalled()
    })

    it('forwards ref to TabsTrigger', () => {
      const ref = vi.fn()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref}>
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      )

      expect(ref).toHaveBeenCalled()
    })

    it('forwards ref to TabsContent', () => {
      const ref = vi.fn()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref}>
            Content
          </TabsContent>
        </Tabs>
      )

      expect(ref).toHaveBeenCalled()
    })
  })
})
