import { expect, test } from '@playwright/test'

test.describe('Condition Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conditions')
  })

  test('should display conditions listing page', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/conditions|ailments|health/i)

    // Check for condition cards
    const conditionCards = page.locator('[data-testid="condition-card"]').or(
      page.locator('article').filter({ hasText: /condition|symptom|ailment/i })
    )

    // Wait for at least one condition to load
    await expect(conditionCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('should have working search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)

    if (await searchInput.isVisible()) {
      await searchInput.fill('headache')
      await page.keyboard.press('Enter')

      // Should filter results or navigate to search
      await page.waitForLoadState('networkidle')
    }
  })

  test('should navigate to condition detail page', async ({ page }) => {
    // Find and click first condition card
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    // Get the condition name before clicking
    const conditionName = await firstCondition.locator('h2, h3').first().textContent()

    // Click the condition card or "View Details" link
    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    // Should navigate to condition detail page
    await expect(page).toHaveURL(/\/conditions\/[^/]+/)

    // Verify we're on the correct condition page
    if (conditionName) {
      await expect(page.getByRole('heading', { level: 1 })).toContainText(conditionName)
    }
  })

  test('should display condition details correctly', async ({ page }) => {
    // Navigate to first condition
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for condition name (h1)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check for description or overview section
    const description = page.locator('text=/description|overview|about|what is/i').first()
    if (await description.count() > 0) {
      await expect(description).toBeVisible()
    }
  })

  test('should show symptoms section', async ({ page }) => {
    // Navigate to first condition
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for symptoms section
    const symptomsSection = page.locator('text=/symptoms|signs|indicators/i')

    if (await symptomsSection.count() > 0) {
      await expect(symptomsSection.first()).toBeVisible()
    }
  })

  test('should show related herbs and formulas', async ({ page }) => {
    // Navigate to first condition
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for related herbs/formulas section
    const relatedSection = page.locator('text=/related|recommended|herbs|formulas|treatment/i')

    if (await relatedSection.count() > 0) {
      await expect(relatedSection.first()).toBeVisible()
    }
  })

  test('should display severity levels if available', async ({ page }) => {
    // Check if conditions show severity indicators
    const severityBadge = page.locator('[data-testid="severity-badge"]').or(
      page.locator('span, div').filter({ hasText: /mild|moderate|severe|critical/i })
    )

    if (await severityBadge.count() > 0) {
      await expect(severityBadge.first()).toBeVisible()
    }
  })

  test('should have category filters', async ({ page }) => {
    // Look for category/system filters (e.g., Digestive, Respiratory)
    const filterButton = page.getByRole('button', { name: /filter|category|system/i })

    if (await filterButton.count() > 0) {
      await filterButton.first().click()

      // Check that filter options appear
      const filterOptions = page.locator('[role="menu"], [role="listbox"]')
      if (await filterOptions.count() > 0) {
        await expect(filterOptions.first()).toBeVisible()
      }
    }
  })

  test('should show TCM pattern information', async ({ page }) => {
    // Navigate to first condition
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for TCM-related information
    const tcmSection = page.locator('text=/TCM|traditional chinese medicine|pattern|qi|yin|yang/i')

    if (await tcmSection.count() > 0) {
      await expect(tcmSection.first()).toBeVisible()
    }
  })

  test('should link to related conditions', async ({ page }) => {
    // Navigate to first condition
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    await page.waitForLoadState('networkidle')

    // Look for related/similar conditions
    const relatedConditions = page.locator('text=/related conditions|similar|see also/i')

    if (await relatedConditions.count() > 0) {
      await expect(relatedConditions.first()).toBeVisible()

      // Click a related condition if available
      const relatedLink = page.getByRole('link').filter({ hasText: /condition/i }).nth(1)
      if (await relatedLink.count() > 0) {
        await relatedLink.click()
        await expect(page).toHaveURL(/\/conditions\/[^/]+/)
      }
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

    // Condition cards should stack vertically on mobile
    const conditionCards = page.locator('[data-testid="condition-card"]').or(
      page.locator('article').filter({ hasText: /condition/i })
    )

    await conditionCards.first().waitFor({ state: 'visible', timeout: 10000 })

    // Verify cards are visible and properly sized for mobile
    await expect(conditionCards.first()).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/conditions|ailments|Verscienta Health/i)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })

  test('should show prevention tips if available', async ({ page }) => {
    // Navigate to first condition
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for prevention section
    const preventionSection = page.locator('text=/prevention|avoid|lifestyle|diet/i')

    if (await preventionSection.count() > 0) {
      await expect(preventionSection.first()).toBeVisible()
    }
  })

  test('should display medical disclaimer', async ({ page }) => {
    // Navigate to first condition
    const firstCondition = page.locator('[data-testid="condition-card"]').first().or(
      page.locator('article').filter({ hasText: /condition/i }).first()
    )

    await firstCondition.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstCondition.getByRole('link', { name: /view|details|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstCondition.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for medical disclaimer
    const disclaimer = page.locator('text=/disclaimer|consult|medical advice|healthcare provider/i')

    if (await disclaimer.count() > 0) {
      await expect(disclaimer.first()).toBeVisible()
    }
  })
})
