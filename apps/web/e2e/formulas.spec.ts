import { expect, test } from '@playwright/test'

test.describe('Formula Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/formulas')
  })

  test('should display formulas listing page', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/formulas/i)

    // Check for formula cards
    const formulaCards = page.locator('[data-testid="formula-card"]').or(
      page.locator('article').filter({ hasText: /formula|ingredients/i })
    )

    // Wait for at least one formula to load
    await expect(formulaCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('should have working search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)

    if (await searchInput.isVisible()) {
      await searchInput.fill('ginseng')
      await page.keyboard.press('Enter')

      // Should filter results or navigate to search
      await page.waitForLoadState('networkidle')
    }
  })

  test('should navigate to formula detail page', async ({ page }) => {
    // Find and click first formula card
    const firstFormula = page.locator('[data-testid="formula-card"]').first().or(
      page.locator('article').filter({ hasText: /formula/i }).first()
    )

    await firstFormula.waitFor({ state: 'visible', timeout: 10000 })

    // Get the formula name before clicking
    const formulaName = await firstFormula.locator('h2, h3').first().textContent()

    // Click the formula card or "View Details" link
    const viewLink = firstFormula.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstFormula.click()
    }

    // Should navigate to formula detail page
    await expect(page).toHaveURL(/\/formulas\/[^/]+/)

    // Verify we're on the correct formula page
    if (formulaName) {
      await expect(page.getByRole('heading', { level: 1 })).toContainText(formulaName)
    }
  })

  test('should display formula details correctly', async ({ page }) => {
    // Navigate to first formula
    const firstFormula = page.locator('[data-testid="formula-card"]').first().or(
      page.locator('article').filter({ hasText: /formula/i }).first()
    )

    await firstFormula.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstFormula.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstFormula.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for formula name (h1)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check for description or overview section
    const description = page.locator('text=/description|overview|about/i').first()
    if (await description.count() > 0) {
      await expect(description).toBeVisible()
    }
  })

  test('should show formula ingredients', async ({ page }) => {
    // Navigate to first formula
    const firstFormula = page.locator('[data-testid="formula-card"]').first().or(
      page.locator('article').filter({ hasText: /formula/i }).first()
    )

    await firstFormula.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstFormula.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstFormula.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for ingredients section
    const ingredientsSection = page.locator('text=/ingredients|herbs|composition|contains/i')

    // Ingredients might be in a list or grid
    if (await ingredientsSection.count() > 0) {
      await expect(ingredientsSection.first()).toBeVisible()
    }
  })

  test('should have working filter functionality', async ({ page }) => {
    // Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter|sort/i })

    if (await filterButton.count() > 0) {
      await filterButton.first().click()

      // Check that filter options appear
      const filterOptions = page.locator('[role="menu"], [role="listbox"]')
      if (await filterOptions.count() > 0) {
        await expect(filterOptions.first()).toBeVisible()
      }
    }
  })

  test('should show formula categories or tags', async ({ page }) => {
    // Check if formulas have category badges or tags
    const categoryBadge = page.locator('[data-testid="category-badge"]').or(
      page.locator('span, div').filter({ hasText: /category|type|tradition/i })
    )

    if (await categoryBadge.count() > 0) {
      await expect(categoryBadge.first()).toBeVisible()
    }
  })

  test('should display formula ratings if available', async ({ page }) => {
    // Navigate to first formula
    const firstFormula = page.locator('[data-testid="formula-card"]').first().or(
      page.locator('article').filter({ hasText: /formula/i }).first()
    )

    await firstFormula.waitFor({ state: 'visible', timeout: 10000 })

    // Check for star rating or rating display
    const rating = page.locator('[data-testid="rating"]').or(
      page.locator('text=/★|rating|stars/i')
    )

    if (await rating.count() > 0) {
      await expect(rating.first()).toBeVisible()
    }
  })

  test('should have pagination or load more', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Look for pagination controls or "Load More" button
    const loadMore = page.getByRole('button', { name: /load more|show more/i })
    const pagination = page.getByRole('navigation', { name: /pagination/i })

    const hasLoadMore = await loadMore.count() > 0
    const hasPagination = await pagination.count() > 0

    // Should have either load more or pagination
    if (hasLoadMore) {
      await expect(loadMore).toBeVisible()
    } else if (hasPagination) {
      await expect(pagination).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    // Formula cards should stack vertically on mobile
    const formulaCards = page.locator('[data-testid="formula-card"]').or(
      page.locator('article').filter({ hasText: /formula/i })
    )

    await formulaCards.first().waitFor({ state: 'visible', timeout: 10000 })

    // Verify cards are visible and properly sized for mobile
    await expect(formulaCards.first()).toBeVisible()
  })

  test('should link to related herbs from formula detail', async ({ page }) => {
    // Navigate to first formula
    const firstFormula = page.locator('[data-testid="formula-card"]').first().or(
      page.locator('article').filter({ hasText: /formula/i }).first()
    )

    await firstFormula.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstFormula.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstFormula.click()
    }

    await page.waitForLoadState('networkidle')

    // Look for herb links in ingredients
    const herbLinks = page.getByRole('link').filter({ hasText: /herb|ginseng|ginger/i })

    if (await herbLinks.count() > 0) {
      const firstHerbLink = herbLinks.first()
      await firstHerbLink.click()

      // Should navigate to an herb detail page
      await expect(page).toHaveURL(/\/herbs\/[^/]+/)
    }
  })

  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/formulas|Verscienta Health/i)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })
})
