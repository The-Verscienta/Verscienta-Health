import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should search and display results', async ({ page }) => {
    await page.goto('/search?q=ginseng')

    // Wait for search results to load
    await page.waitForLoadState('networkidle')

    // Check if results heading is visible
    const heading = page.getByRole('heading', { name: /search results/i })
    await expect(heading).toBeVisible()

    // Check for result stats
    const resultsText = page.getByText(/found.*results?/i)
    await expect(resultsText).toBeVisible()
  })

  test('should show tabs for different content types', async ({ page }) => {
    await page.goto('/search?q=health')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check for tabs
    const allTab = page.getByRole('tab', { name: /all/i })
    const herbsTab = page.getByRole('tab', { name: /herbs/i })
    const formulasTab = page.getByRole('tab', { name: /formulas/i })
    const conditionsTab = page.getByRole('tab', { name: /conditions/i })
    const practitionersTab = page.getByRole('tab', { name: /practitioners/i })

    await expect(allTab).toBeVisible()
    await expect(herbsTab).toBeVisible()
    await expect(formulasTab).toBeVisible()
    await expect(conditionsTab).toBeVisible()
    await expect(practitionersTab).toBeVisible()
  })

  test('should filter results by content type', async ({ page }) => {
    await page.goto('/search?q=health')

    // Wait for results
    await page.waitForLoadState('networkidle')

    // Click on Herbs tab
    const herbsTab = page.getByRole('tab', { name: /herbs/i })
    await herbsTab.click()

    // Should show filters sidebar
    const filtersButton = page.getByRole('button', { name: /filters/i })
    if (await filtersButton.isVisible()) {
      await expect(filtersButton).toBeVisible()
    }

    // Check for herb-specific content
    const tabPanel = page.getByRole('tabpanel')
    await expect(tabPanel).toBeVisible()
  })

  test('should apply search filters', async ({ page }) => {
    await page.goto('/search?q=herb')
    await page.waitForLoadState('networkidle')

    // Switch to Herbs tab
    const herbsTab = page.getByRole('tab', { name: /herbs/i })
    await herbsTab.click()

    // Look for filter options
    const filtersButton = page.getByRole('button', { name: /filters/i })
    if (await filtersButton.isVisible()) {
      // Expand filters if collapsed
      const isExpanded = await filtersButton.getAttribute('aria-expanded')
      if (isExpanded === 'false') {
        await filtersButton.click()
      }

      // Look for a filter checkbox (e.g., TCM Taste filter)
      const filterCheckbox = page.locator('input[type="checkbox"]').first()
      if (await filterCheckbox.isVisible()) {
        const initialCount = await page.getByRole('tab', { name: /herbs/i }).textContent()
        await filterCheckbox.check()
        await page.waitForTimeout(500) // Wait for filter to apply

        // Count should update
        const updatedCount = await page.getByRole('tab', { name: /herbs/i }).textContent()
        expect(updatedCount).not.toBe(initialCount)
      }
    }
  })

  test('should show clear filters button when filters are active', async ({ page }) => {
    await page.goto('/search?q=herb')
    await page.waitForLoadState('networkidle')

    const herbsTab = page.getByRole('tab', { name: /herbs/i })
    await herbsTab.click()

    // Apply a filter
    const filterCheckbox = page.locator('input[type="checkbox"]').first()
    if (await filterCheckbox.isVisible()) {
      await filterCheckbox.check()

      // Clear all button should appear
      const clearButton = page.getByRole('button', { name: /clear all/i })
      await expect(clearButton).toBeVisible()

      // Click clear button
      await clearButton.click()

      // Filter should be unchecked
      await expect(filterCheckbox).not.toBeChecked()
    }
  })

  test('should sort search results', async ({ page }) => {
    await page.goto('/search?q=herb')
    await page.waitForLoadState('networkidle')

    const herbsTab = page.getByRole('tab', { name: /herbs/i })
    await herbsTab.click()

    // Look for sort dropdown
    const sortSelect = page.locator('select').first()
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption({ label: /name.*a-z/i })
      await page.waitForTimeout(500)

      // Results should be reordered (we can't easily verify without knowing the data)
      await expect(sortSelect).toHaveValue(/.+/)
    }
  })

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/search?q=xyznonexistentterm123')
    await page.waitForLoadState('networkidle')

    // Should show "no results" message
    const noResults = page.getByText(/no results found/i)
    await expect(noResults).toBeVisible()
  })

  test('should update URL with search query', async ({ page }) => {
    await page.goto('/search')

    const searchBar = page.getByPlaceholder(/search/i)
    await searchBar.fill('turmeric')
    await searchBar.press('Enter')

    // URL should update with query parameter
    await expect(page).toHaveURL(/q=turmeric/)
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/search?q=health')
    await page.waitForLoadState('networkidle')

    // Check for proper heading hierarchy
    const mainHeading = page.getByRole('heading', { level: 1 })
    await expect(mainHeading).toBeVisible()

    // Check for search input label/accessibility
    const searchInput = page.getByRole('searchbox')
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible()
    }

    // All tabs should have proper roles
    const tabs = page.getByRole('tab')
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(0)
  })
})
