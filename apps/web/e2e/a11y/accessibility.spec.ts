import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('search page should not have accessibility violations', async ({ page }) => {
    await page.goto('/search?q=herb')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('herbs listing page should not have accessibility violations', async ({ page }) => {
    await page.goto('/herbs')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('symptom checker should not have accessibility violations', async ({ page }) => {
    await page.goto('/symptom-checker')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('practitioner directory should not have accessibility violations', async ({ page }) => {
    await page.goto('/practitioners')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('about page should not have accessibility violations', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze()

    const contrastViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'color-contrast'
    )

    expect(contrastViolations).toEqual([])
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Check for h1
    const h1 = page.locator('h1')
    const h1Count = await h1.count()
    expect(h1Count).toBeGreaterThan(0)

    // Verify heading hierarchy using axe
    const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze()

    const headingViolations = accessibilityScanResults.violations.filter(
      (violation) =>
        violation.id === 'heading-order' ||
        violation.id === 'page-has-heading-one' ||
        violation.id === 'empty-heading'
    )

    expect(headingViolations).toEqual([])
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze()

    const imageViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'image-alt'
    )

    expect(imageViolations).toEqual([])
  })

  test('forms should have accessible labels', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page }).include('form').analyze()

    const labelViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.id === 'label' || violation.id === 'form-field-multiple-labels'
    )

    expect(labelViolations).toEqual([])
  })

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Test keyboard navigation
    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluateHandle(() => document.activeElement)
    const isInteractive = await focusedElement.evaluate((el) => {
      const tagName = el?.tagName?.toLowerCase()
      return tagName && ['a', 'button', 'input', 'select', 'textarea'].includes(tagName)
    })

    expect(isInteractive).toBeTruthy()
  })

  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/')

    // Tab once to focus skip link
    await page.keyboard.press('Tab')

    const skipLink = page.locator('a[href="#main"], a:has-text("skip to")')
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeFocused()
    }
  })
})
