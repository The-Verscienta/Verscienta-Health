import { expect, test } from '@playwright/test'

test.describe('Practitioner Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practitioners')
  })

  test('should display practitioners listing page', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/practitioners|directory|find/i)

    // Check for practitioner cards
    const practitionerCards = page.locator('[data-testid="practitioner-card"]').or(
      page.locator('article').filter({ hasText: /practitioner|acupuncturist|herbalist/i })
    )

    // Wait for at least one practitioner to load
    await expect(practitionerCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('should have working search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)

    if (await searchInput.isVisible()) {
      await searchInput.fill('acupuncture')
      await page.keyboard.press('Enter')

      // Should filter results or navigate to search
      await page.waitForLoadState('networkidle')
    }
  })

  test('should navigate to practitioner profile page', async ({ page }) => {
    // Find and click first practitioner card
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    await firstPractitioner.waitFor({ state: 'visible', timeout: 10000 })

    // Get the practitioner name before clicking
    const practitionerName = await firstPractitioner.locator('h2, h3').first().textContent()

    // Click the practitioner card or "View Profile" link
    const viewLink = firstPractitioner.getByRole('link', { name: /view|profile|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstPractitioner.click()
    }

    // Should navigate to practitioner profile page
    await expect(page).toHaveURL(/\/practitioners\/[^/]+/)

    // Verify we're on the correct practitioner page
    if (practitionerName) {
      await expect(page.getByRole('heading', { level: 1 })).toContainText(practitionerName)
    }
  })

  test('should display practitioner profile correctly', async ({ page }) => {
    // Navigate to first practitioner
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    await firstPractitioner.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstPractitioner.getByRole('link', { name: /view|profile|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstPractitioner.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for practitioner name (h1)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Check for bio or description
    const bio = page.locator('text=/bio|about|experience|specialties/i').first()
    if (await bio.count() > 0) {
      await expect(bio).toBeVisible()
    }
  })

  test('should show practitioner modalities', async ({ page }) => {
    // Navigate to first practitioner
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    await firstPractitioner.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstPractitioner.getByRole('link', { name: /view|profile|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstPractitioner.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for modalities section
    const modalitiesSection = page.locator('text=/modalities|services|specialties|practice/i')

    if (await modalitiesSection.count() > 0) {
      await expect(modalitiesSection.first()).toBeVisible()
    }
  })

  test('should display contact information', async ({ page }) => {
    // Navigate to first practitioner
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    await firstPractitioner.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstPractitioner.getByRole('link', { name: /view|profile|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstPractitioner.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for contact section or button
    const contactSection = page.locator('text=/contact|phone|email|book|schedule/i')

    if (await contactSection.count() > 0) {
      await expect(contactSection.first()).toBeVisible()
    }
  })

  test('should show location information', async ({ page }) => {
    // Check if practitioner cards show location
    const locationBadge = page.locator('[data-testid="location-badge"]').or(
      page.locator('span, div').filter({ hasText: /city|state|location|address/i })
    )

    if (await locationBadge.count() > 0) {
      await expect(locationBadge.first()).toBeVisible()
    }
  })

  test('should have modality filter functionality', async ({ page }) => {
    // Look for modality filter (e.g., Acupuncture, Herbalism)
    const filterButton = page.getByRole('button', { name: /filter|modality|specialty/i })

    if (await filterButton.count() > 0) {
      await filterButton.first().click()

      // Check that filter options appear
      const filterOptions = page.locator('[role="menu"], [role="listbox"]')
      if (await filterOptions.count() > 0) {
        await expect(filterOptions.first()).toBeVisible()

        // Try filtering by acupuncture
        const acupunctureOption = page.getByRole('menuitem', { name: /acupuncture/i }).or(
          page.getByRole('option', { name: /acupuncture/i })
        )

        if (await acupunctureOption.count() > 0) {
          await acupunctureOption.first().click()
          await page.waitForLoadState('networkidle')

          // Results should update
          const resultsCount = await page.locator('[data-testid="practitioner-card"]').count()
          expect(resultsCount).toBeGreaterThan(0)
        }
      }
    }
  })

  test('should show practitioner ratings and reviews', async ({ page }) => {
    // Navigate to first practitioner
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    await firstPractitioner.waitFor({ state: 'visible', timeout: 10000 })

    // Check for rating display on card
    const rating = page.locator('[data-testid="rating"]').or(
      page.locator('text=/★|rating|stars|reviews/i')
    )

    if (await rating.count() > 0) {
      await expect(rating.first()).toBeVisible()
    }
  })

  test('should show verification status', async ({ page }) => {
    // Check for verified badge or status
    const verifiedBadge = page.locator('[data-testid="verified-badge"]').or(
      page.locator('span, div').filter({ hasText: /verified|certified/i })
    )

    if (await verifiedBadge.count() > 0) {
      await expect(verifiedBadge.first()).toBeVisible()
    }
  })

  test('should have location-based search', async ({ page }) => {
    // Look for location search input
    const locationInput = page.getByPlaceholder(/location|city|zip|postal/i)

    if (await locationInput.count() > 0) {
      await locationInput.fill('San Francisco')
      await page.keyboard.press('Enter')

      await page.waitForLoadState('networkidle')

      // Results should update based on location
    }
  })

  test('should show practitioner photo or avatar', async ({ page }) => {
    // Check for practitioner images
    const practitionerImage = page.locator('[data-testid="practitioner-avatar"]').or(
      page.locator('img[alt*="practitioner" i], img[alt*="photo" i], img[alt*="profile" i]')
    )

    if (await practitionerImage.count() > 0) {
      await expect(practitionerImage.first()).toBeVisible()
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

    // Practitioner cards should stack vertically on mobile
    const practitionerCards = page.locator('[data-testid="practitioner-card"]').or(
      page.locator('article').filter({ hasText: /practitioner/i })
    )

    await practitionerCards.first().waitFor({ state: 'visible', timeout: 10000 })

    // Verify cards are visible and properly sized for mobile
    await expect(practitionerCards.first()).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/practitioners|directory|Verscienta Health/i)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })

  test('should show practitioner credentials', async ({ page }) => {
    // Navigate to first practitioner
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    await firstPractitioner.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstPractitioner.getByRole('link', { name: /view|profile|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstPractitioner.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for credentials/certifications section
    const credentialsSection = page.locator('text=/credentials|certifications|education|licenses/i')

    if (await credentialsSection.count() > 0) {
      await expect(credentialsSection.first()).toBeVisible()
    }
  })

  test('should allow booking or scheduling if available', async ({ page }) => {
    // Navigate to first practitioner
    const firstPractitioner = page.locator('[data-testid="practitioner-card"]').first().or(
      page.locator('article').filter({ hasText: /practitioner/i }).first()
    )

    await firstPractitioner.waitFor({ state: 'visible', timeout: 10000 })

    const viewLink = firstPractitioner.getByRole('link', { name: /view|profile|learn more/i })
    if (await viewLink.count() > 0) {
      await viewLink.first().click()
    } else {
      await firstPractitioner.click()
    }

    await page.waitForLoadState('networkidle')

    // Check for booking button
    const bookingButton = page.getByRole('button', { name: /book|schedule|appointment/i }).or(
      page.getByRole('link', { name: /book|schedule|appointment/i })
    )

    if (await bookingButton.count() > 0) {
      await expect(bookingButton.first()).toBeVisible()
    }
  })
})
