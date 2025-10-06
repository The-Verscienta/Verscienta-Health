import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the homepage correctly', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check for navigation
    await expect(page.getByRole('navigation')).toBeVisible()

    // Check for footer
    await expect(page.locator('footer')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Test Herbs link
    const herbsLink = page.getByRole('link', { name: /herbs/i })
    await expect(herbsLink).toBeVisible()
    await herbsLink.click()
    await expect(page).toHaveURL(/\/herbs/)

    // Go back to homepage
    await page.goto('/')

    // Test Formulas link
    const formulasLink = page.getByRole('link', { name: /formulas/i })
    await expect(formulasLink).toBeVisible()
    await formulasLink.click()
    await expect(page).toHaveURL(/\/formulas/)
  })

  test('should have working search bar', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()

    await searchInput.fill('ginseng')
    await searchInput.press('Enter')

    // Should navigate to search results
    await expect(page).toHaveURL(/\/search/)
    await expect(page).toHaveURL(/q=ginseng/)
  })

  test('should display hero section', async ({ page }) => {
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    // Check for CTA buttons
    const ctaButtons = page.getByRole('link', { name: /explore|get started|learn more/i })
    await expect(ctaButtons.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    // Check mobile navigation
    const mobileMenuButton = page.getByRole('button', { name: /menu|navigation/i })
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.getByRole('navigation')).toBeVisible()
    }
  })

  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Verscienta Health/)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Allow certain expected errors but fail on unexpected ones
    const unexpectedErrors = errors.filter(
      (error) =>
        !error.includes('favicon') && // Favicon 404s are common in dev
        !error.includes('socketio') // Socket.io connection errors in dev
    )

    expect(unexpectedErrors).toHaveLength(0)
  })
})
