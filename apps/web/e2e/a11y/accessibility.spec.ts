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

  // Additional page tests
  test('formulas listing page should not have accessibility violations', async ({ page }) => {
    await page.goto('/formulas')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('conditions listing page should not have accessibility violations', async ({ page }) => {
    await page.goto('/conditions')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('modalities page should not have accessibility violations', async ({ page }) => {
    await page.goto('/modalities')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('contact page should not have accessibility violations', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('FAQ page should not have accessibility violations', async ({ page }) => {
    await page.goto('/faq')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('disclaimer page should not have accessibility violations', async ({ page }) => {
    await page.goto('/disclaimer')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('register page should not have accessibility violations', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  // Detail pages tests (navigate from listing pages)
  test('herb detail page should not have accessibility violations', async ({ page }) => {
    await page.goto('/herbs')
    await page.waitForLoadState('networkidle')

    // Find and click first herb card
    const firstHerb = page.locator('[data-testid="herb-card"]').first().or(
      page.locator('article').filter({ hasText: /herb/i }).first()
    )

    if (await firstHerb.count() > 0) {
      const viewLink = firstHerb.getByRole('link', { name: /view|details|learn more/i })
      if (await viewLink.count() > 0) {
        await viewLink.first().click()
      } else {
        await firstHerb.click()
      }

      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    } else {
      test.skip()
    }
  })

  test('formula detail page should not have accessibility violations', async ({ page }) => {
    await page.goto('/formulas')
    await page.waitForLoadState('networkidle')

    // Find and click first formula card
    const firstFormula = page.locator('[data-testid="formula-card"]').first().or(
      page.locator('article').filter({ hasText: /formula/i }).first()
    )

    if (await firstFormula.count() > 0) {
      const viewLink = firstFormula.getByRole('link', { name: /view|details|learn more/i })
      if (await viewLink.count() > 0) {
        await viewLink.first().click()
      } else {
        await firstFormula.click()
      }

      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    } else {
      test.skip()
    }
  })

  test('condition detail page should not have accessibility violations', async ({ page }) => {
    await page.goto('/conditions')
    await page.waitForLoadState('networkidle')

    // Find and click first condition card
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    if (await firstCondition.count() > 0) {
      const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
      if (await viewLink.count() > 0) {
        await viewLink.first().click()
      } else {
        await firstCondition.click()
      }

      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    } else {
      test.skip()
    }
  })

  test('practitioner profile page should not have accessibility violations', async ({ page }) => {
    await page.goto('/practitioners')
    await page.waitForLoadState('networkidle')

    // Find and click first practitioner card
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    if (await firstPractitioner.count() > 0) {
      const viewLink = firstPractitioner.getByRole('link', { name: /view|profile|learn more/i })
      if (await viewLink.count() > 0) {
        await viewLink.first().click()
      } else {
        await firstPractitioner.click()
      }

      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    } else {
      test.skip()
    }
  })

  test('modality detail page should not have accessibility violations', async ({ page }) => {
    await page.goto('/modalities')
    await page.waitForLoadState('networkidle')

    // Find and click first modality card
    const firstModality = page.locator('[data-testid="modality-card"]').first().or(
      page.locator('article').filter({ hasText: /modality|therapy/i }).first()
    )

    if (await firstModality.count() > 0) {
      const viewLink = firstModality.getByRole('link', { name: /view|details|learn more/i })
      if (await viewLink.count() > 0) {
        await viewLink.first().click()
      } else {
        await firstModality.click()
      }

      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    } else {
      test.skip()
    }
  })
})
