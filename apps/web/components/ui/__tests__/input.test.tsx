/**
 * Input Component Tests
 *
 * Tests input field rendering, states, and accessibility
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../input'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      render(<Input className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('flex') // Still has default classes
    })

    it('forwards ref correctly', () => {
      const ref = vi.fn()
      render(<Input ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Input Types', () => {
    it('renders as text input by default', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')
      // React doesn't set type="text" explicitly, it's the default
      expect(input.tagName).toBe('INPUT')
    })

    it('renders as email input', () => {
      render(<Input type="email" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders as password input', () => {
      render(<Input type="password" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders as number input', () => {
      render(<Input type="number" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders as tel input', () => {
      render(<Input type="tel" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('renders as url input', () => {
      render(<Input type="url" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('renders as search input', () => {
      render(<Input type="search" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('type', 'search')
    })
  })

  describe('Props', () => {
    it('accepts placeholder text', () => {
      render(<Input placeholder="Enter text here" />)
      const input = screen.getByPlaceholderText('Enter text here')
      expect(input).toBeInTheDocument()
    })

    it('accepts default value', () => {
      render(<Input defaultValue="Initial value" />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Initial value')
    })

    it('accepts controlled value', () => {
      render(<Input value="Controlled value" onChange={() => {}} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Controlled value')
    })

    it('accepts name attribute', () => {
      render(<Input name="username" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('name', 'username')
    })

    it('accepts id attribute', () => {
      render(<Input id="email-input" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('accepts required attribute', () => {
      render(<Input required data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toBeRequired()
    })

    it('accepts readOnly attribute', () => {
      render(<Input readOnly data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('readonly')
    })

    it('accepts maxLength attribute', () => {
      render(<Input maxLength={10} data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('accepts minLength attribute', () => {
      render(<Input minLength={3} data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('minLength', '3')
    })

    it('accepts pattern attribute', () => {
      render(<Input pattern="[0-9]*" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('pattern', '[0-9]*')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
    })

    it('handles focus state', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus:ring-earth-600')
      expect(input).toHaveClass('focus:border-transparent')
      expect(input).toHaveClass('focus:outline-none')
      expect(input).toHaveClass('focus:ring-2')
    })
  })

  describe('User Interactions', () => {
    it('handles onChange event', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'Hello')

      expect(handleChange).toHaveBeenCalledTimes(5) // Once per character
    })

    it('handles onFocus event', async () => {
      const handleFocus = vi.fn()
      const user = userEvent.setup()

      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')

      await user.click(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('handles onBlur event', async () => {
      const handleBlur = vi.fn()
      const user = userEvent.setup()

      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')

      await user.click(input)
      await user.tab() // Blur the input

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('handles onKeyDown event', async () => {
      const handleKeyDown = vi.fn()
      const user = userEvent.setup()

      render(<Input onKeyDown={handleKeyDown} />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'a')

      expect(handleKeyDown).toHaveBeenCalled()
    })

    it('allows text input', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      await user.type(input, 'Test input')

      expect(input.value).toBe('Test input')
    })

    it('prevents input when disabled', async () => {
      const user = userEvent.setup()
      render(<Input disabled defaultValue="Initial" />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      await user.type(input, 'New text')

      expect(input.value).toBe('Initial') // Value unchanged
    })

    it('prevents input when readOnly', async () => {
      const user = userEvent.setup()
      render(<Input readOnly defaultValue="Read only" />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      await user.type(input, 'New text')

      expect(input.value).toBe('Read only') // Value unchanged
    })
  })

  describe('Accessibility', () => {
    it('can be labeled with aria-label', () => {
      render(<Input aria-label="Email address" />)
      const input = screen.getByLabelText('Email address')
      expect(input).toBeInTheDocument()
    })

    it('can be labeled with aria-labelledby', () => {
      render(
        <>
          <label id="email-label">Email</label>
          <Input aria-labelledby="email-label" />
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-labelledby', 'email-label')
    })

    it('can be described with aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" />
          <span id="helper-text">Enter your email address</span>
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'helper-text')
    })

    it('supports aria-invalid for error state', () => {
      render(<Input aria-invalid="true" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('supports aria-required', () => {
      render(<Input aria-required="true" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Styling', () => {
    it('applies default styles', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')

      expect(input).toHaveClass('flex')
      expect(input).toHaveClass('h-11')
      expect(input).toHaveClass('w-full')
      expect(input).toHaveClass('rounded-md')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('border-gray-300')
      expect(input).toHaveClass('bg-white')
    })

    it('applies focus styles', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')

      expect(input).toHaveClass('focus:ring-earth-600')
      expect(input).toHaveClass('focus:border-transparent')
      expect(input).toHaveClass('focus:outline-none')
      expect(input).toHaveClass('focus:ring-2')
    })

    it('applies disabled styles', () => {
      render(<Input disabled data-testid="input" />)
      const input = screen.getByTestId('input')

      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
    })

    it('applies dark mode styles', () => {
      render(<Input data-testid="input" />)
      const input = screen.getByTestId('input')

      expect(input).toHaveClass('dark:border-gray-700')
      expect(input).toHaveClass('dark:bg-gray-800')
      expect(input).toHaveClass('dark:text-gray-100')
      expect(input).toHaveClass('dark:placeholder:text-gray-500')
    })

    it('merges custom styles with defaults', () => {
      render(<Input className="bg-red-500 text-white" data-testid="input" />)
      const input = screen.getByTestId('input')

      expect(input).toHaveClass('bg-red-500')
      expect(input).toHaveClass('text-white')
      expect(input).toHaveClass('flex') // Still has default class
    })
  })

  describe('Edge Cases', () => {
    it('handles empty value', () => {
      render(<Input value="" onChange={() => {}} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('handles very long text', async () => {
      const longText = 'a'.repeat(1000)
      render(<Input defaultValue={longText} />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      expect(input.value).toBe(longText)
    })

    it('handles special characters', async () => {
      const specialChars = '!@#$%^&*()_+-={}[]|:";\'<>?,./~`'
      render(<Input defaultValue={specialChars} />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      expect(input.value).toBe(specialChars)
    })

    it('handles unicode characters', async () => {
      const unicode = '你好世界 🌍 Hello'
      render(<Input defaultValue={unicode} />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      expect(input.value).toBe(unicode)
    })

    it('handles paste event', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      await user.click(input)
      await user.paste('Pasted text')

      // Paste event should update the input value
      expect(input.value).toContain('Pasted text')
    })
  })

  describe('Form Integration', () => {
    it('works with form submission', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())

      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" defaultValue="testuser" />
          <button type="submit">Submit</button>
        </form>
      )

      const button = screen.getByRole('button')
      button.click()

      expect(handleSubmit).toHaveBeenCalled()
    })

    it('respects autocomplete attribute', () => {
      render(<Input autoComplete="email" data-testid="input" />)
      const input = screen.getByTestId('input')
      expect(input).toHaveAttribute('autoComplete', 'email')
    })
  })
})
