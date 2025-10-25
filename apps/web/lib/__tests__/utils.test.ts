/**
 * Utils Test Suite
 *
 * Tests core utility functions used throughout the application
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cn,
  debounce,
  formatDate,
  generateId,
  getInitials,
  isClient,
  sleep,
  truncate,
} from '../utils'

describe('cn (className utility)', () => {
  it('merges class names', () => {
    expect(cn('px-2 py-1', 'text-red-500')).toBe('px-2 py-1 text-red-500')
  })

  it('handles conditional classes', () => {
    expect(cn('px-2', true && 'py-1', false && 'hidden')).toBe('px-2 py-1')
  })

  it('handles Tailwind conflicts correctly', () => {
    // twMerge should resolve conflicts
    expect(cn('px-2 px-4')).toBe('px-4')
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('handles arrays of classes', () => {
    expect(cn(['px-2', 'py-1'])).toBe('px-2 py-1')
  })

  it('handles objects with boolean values', () => {
    expect(cn({ 'px-2': true, 'py-1': false, 'text-red-500': true })).toBe('px-2 text-red-500')
  })

  it('handles undefined and null', () => {
    expect(cn('px-2', undefined, null, 'py-1')).toBe('px-2 py-1')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles complex nested combinations', () => {
    expect(
      cn('base-class', ['array-class1', 'array-class2'], { conditional: true }, undefined, 'final')
    ).toContain('base-class')
  })
})

describe('formatDate', () => {
  it('formats Date object to readable string', () => {
    const date = new Date('2025-01-15')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/January 1[45], 2025/) // Account for timezone differences
  })

  it('formats ISO date string', () => {
    const formatted = formatDate('2025-01-15')
    expect(formatted).toMatch(/January 1[45], 2025/)
  })

  it('formats timestamp', () => {
    const timestamp = new Date('2025-12-25').toISOString()
    const formatted = formatDate(timestamp)
    expect(formatted).toMatch(/December 2[45], 2025/)
  })

  it('handles leap year dates', () => {
    const formatted = formatDate('2024-02-29')
    // Allow for timezone differences (could be 28 or 29)
    expect(formatted).toMatch(/February (28|29), 2024/)
  })

  it('handles year boundaries', () => {
    const formatted = formatDate('2024-12-31')
    // Allow for timezone differences (could be 30 or 31)
    expect(formatted).toMatch(/December (30|31), 2024/)
  })

  it('formats various months correctly', () => {
    const date1 = formatDate('2025-01-15') // Mid-month to avoid timezone issues
    const date2 = formatDate('2025-06-15')
    const date3 = formatDate('2025-12-15')

    expect(date1).toContain('January')
    expect(date2).toContain('June')
    expect(date3).toContain('December')
  })
})

describe('truncate', () => {
  it('truncates text longer than maxLength', () => {
    expect(truncate('Hello, World!', 5)).toBe('Hello...')
  })

  it('does not truncate text shorter than maxLength', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('does not truncate text equal to maxLength', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('handles maxLength of 0', () => {
    expect(truncate('Hello', 0)).toBe('...')
  })

  it('handles single character', () => {
    expect(truncate('A', 0)).toBe('...')
    expect(truncate('A', 1)).toBe('A')
  })

  it('truncates very long text', () => {
    const longText = 'a'.repeat(1000)
    const truncated = truncate(longText, 50)
    expect(truncated).toBe('a'.repeat(50) + '...')
    expect(truncated.length).toBe(53) // 50 + '...'
  })

  it('handles multi-byte characters', () => {
    const text = 'こんにちは世界'
    // String has more than 6 characters, so use a safe maxLength
    expect(truncate(text, 10)).toBe(text) // Should not truncate
    expect(truncate(text, 5)).toBe('こんにちは...')
    expect(truncate(text, 3)).toBe('こんに...')
  })

  it('handles special characters', () => {
    expect(truncate('Hello! @#$%', 8)).toBe('Hello! @...')
  })
})

describe('generateId', () => {
  it('generates a string ID', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
  })

  it('generates ID of expected length', () => {
    const id = generateId()
    expect(id.length).toBe(9) // substring(2, 11) = 9 characters
  })

  it('generates unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    const id3 = generateId()

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('generates alphanumeric IDs', () => {
    const id = generateId()
    expect(id).toMatch(/^[a-z0-9]+$/)
  })

  it('generates multiple unique IDs', () => {
    const ids = Array.from({ length: 100 }, () => generateId())
    const uniqueIds = new Set(ids)
    // Allow for small collision chance, but expect mostly unique
    expect(uniqueIds.size).toBeGreaterThan(95)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('delays function execution', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(99)
    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('cancels previous calls', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    vi.advanceTimersByTime(50)
    debouncedFunc() // This should cancel the first call
    vi.advanceTimersByTime(50)

    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('passes arguments correctly', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc('arg1', 'arg2', 123)
    vi.advanceTimersByTime(100)

    expect(func).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('handles multiple rapid calls', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    debouncedFunc()
    debouncedFunc()
    debouncedFunc()

    vi.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('allows multiple executions after wait period', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    vi.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)

    debouncedFunc()
    vi.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(2)
  })

  it('works with different wait times', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 500)

    debouncedFunc()
    vi.advanceTimersByTime(499)
    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(func).toHaveBeenCalledTimes(1)
  })

  it('calls function with correct arguments after debounce', () => {
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc('test1', 'test2')
    debouncedFunc('test3', 'test4') // Should cancel previous

    vi.advanceTimersByTime(100)

    // Should only be called once with the last arguments
    expect(func).toHaveBeenCalledTimes(1)
    expect(func).toHaveBeenCalledWith('test3', 'test4')
  })
})

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a promise', () => {
    const result = sleep(100)
    expect(result).toBeInstanceOf(Promise)
  })

  it('resolves after specified time', async () => {
    const promise = sleep(100)
    let resolved = false

    promise.then(() => {
      resolved = true
    })

    expect(resolved).toBe(false)

    vi.advanceTimersByTime(99)
    await Promise.resolve() // Flush promises
    expect(resolved).toBe(false)

    vi.advanceTimersByTime(1)
    await Promise.resolve() // Flush promises
    expect(resolved).toBe(true)
  })

  it('works with async/await', async () => {
    const _start = Date.now()
    const sleepPromise = sleep(100)

    vi.advanceTimersByTime(100)
    await sleepPromise

    // Since we're using fake timers, we can't check real time
    // But we can verify the promise resolved
    expect(true).toBe(true)
  })

  it('handles zero milliseconds', async () => {
    const promise = sleep(0)
    vi.advanceTimersByTime(0)
    await promise
    expect(true).toBe(true)
  })

  it('handles large delays', async () => {
    const promise = sleep(10000)
    let resolved = false

    promise.then(() => {
      resolved = true
    })

    vi.advanceTimersByTime(9999)
    await Promise.resolve()
    expect(resolved).toBe(false)

    vi.advanceTimersByTime(1)
    await Promise.resolve()
    expect(resolved).toBe(true)
  })
})

describe('isClient', () => {
  it('is a boolean', () => {
    expect(typeof isClient).toBe('boolean')
  })

  it('correctly detects browser environment', () => {
    // In vitest with jsdom, window is defined
    expect(isClient).toBe(true)
  })

  it('returns consistent value', () => {
    const firstCheck = isClient
    const secondCheck = isClient
    expect(firstCheck).toBe(secondCheck)
  })
})

describe('getInitials', () => {
  it('returns initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns initials from single name', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('returns first two initials from multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('converts to uppercase', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('handles names with extra spaces', () => {
    expect(getInitials('John  Doe')).toBe('JD')
  })

  it('handles leading/trailing spaces', () => {
    expect(getInitials('  John Doe  ')).toBe('JD')
  })

  it('handles single character names', () => {
    expect(getInitials('J D')).toBe('JD')
  })

  it('handles empty string', () => {
    expect(getInitials('')).toBe('')
  })

  it('handles names with special characters', () => {
    expect(getInitials("O'Brien")).toBe('O')
    // Split on spaces only, so "Jean-Claude Van Damme" becomes ["Jean-Claude", "Van", "Damme"]
    // First two initials are J and V
    expect(getInitials('Jean-Claude Van Damme')).toBe('JV')
  })

  it('handles non-Latin characters', () => {
    // '李明' has no spaces, so split() returns ['李明'], and we take first 2 chars
    expect(getInitials('李明')).toBe('李')
    expect(getInitials('José García')).toBe('JG')
  })

  it('handles very long names', () => {
    expect(getInitials('Alexander Christopher Benjamin Montgomery')).toBe('AC')
  })

  it('handles names with numbers', () => {
    expect(getInitials('John Doe 3rd')).toBe('JD')
  })

  it('handles mixed case names', () => {
    expect(getInitials('mCdonald')).toBe('M')
    expect(getInitials('John McDoe')).toBe('JM')
  })
})

describe('Integration Tests', () => {
  it('cn and truncate work together', () => {
    const longClass = 'this-is-a-very-long-class-name-that-might-need-truncation'
    const truncated = truncate(longClass, 20)
    const classes = cn('base-class', truncated)

    expect(classes).toContain('base-class')
    expect(classes).toContain('...')
  })

  it('formatDate and truncate work together', () => {
    const date = formatDate('2025-01-15')
    const truncated = truncate(date, 10)

    expect(truncated).toContain('...')
    expect(truncated.length).toBeLessThanOrEqual(13) // 10 + '...'
  })

  it('generateId produces unique IDs for rapid calls', () => {
    const ids = Array.from({ length: 10 }, () => generateId())
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(10)
  })
})
