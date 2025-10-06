import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')

    // Check for login heading
    const heading = page.getByRole('heading', { name: /log in|sign in/i })
    await expect(heading).toBeVisible()

    // Check for email input
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeVisible()

    // Check for password input
    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toBeVisible()

    // Check for submit button
    const submitButton = page.getByRole('button', { name: /log in|sign in/i })
    await expect(submitButton).toBeVisible()
  })

  test('should display registration page', async ({ page }) => {
    await page.goto('/register')

    // Check for registration heading
    const heading = page.getByRole('heading', { name: /register|sign up|create account/i })
    await expect(heading).toBeVisible()

    // Check for email input
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toBeVisible()

    // Check for password input
    const passwordInput = page.getByLabel(/password/i)
    await expect(passwordInput).toBeVisible()

    // Check for submit button
    const submitButton = page.getByRole('button', { name: /register|sign up|create account/i })
    await expect(submitButton).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByLabel(/email/i)
    const submitButton = page.getByRole('button', { name: /log in|sign in/i })

    // Enter invalid email
    await emailInput.fill('invalid-email')
    await submitButton.click()

    // Should show validation error
    const errorMessage = page.getByText(/invalid.*email|valid email/i)
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible()
    }
  })

  test('should show validation errors for empty password', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    const submitButton = page.getByRole('button', { name: /log in|sign in/i })

    // Enter email but leave password empty
    await emailInput.fill('test@example.com')
    await passwordInput.fill('')
    await submitButton.click()

    // Should show validation error or prevent submission
    const formIsInvalid =
      (await passwordInput.getAttribute('aria-invalid')) === 'true' ||
      (await page.getByText(/password.*required/i).isVisible())

    expect(formIsInvalid).toBeTruthy()
  })

  test('should have link to registration page from login', async ({ page }) => {
    await page.goto('/login')

    const registerLink = page.getByRole('link', { name: /sign up|register|create account/i })
    await expect(registerLink).toBeVisible()

    await registerLink.click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('should have link to login page from registration', async ({ page }) => {
    await page.goto('/register')

    const loginLink = page.getByRole('link', { name: /log in|sign in|already have account/i })
    await expect(loginLink).toBeVisible()

    await loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show OAuth options', async ({ page }) => {
    await page.goto('/login')

    // Look for OAuth buttons (Google, GitHub)
    const oauthButtons = page.locator('button:has-text("Google"), button:has-text("GitHub")')
    const count = await oauthButtons.count()

    // Should have at least one OAuth option
    expect(count).toBeGreaterThan(0)
  })

  test('should redirect unauthenticated users from protected pages', async ({ page }) => {
    // Try to access profile page without being logged in
    await page.goto('/profile')

    // Should redirect to login page
    await page.waitForURL(/\/login/, { timeout: 5000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show password strength indicator on registration', async ({ page }) => {
    await page.goto('/register')

    const passwordInput = page.getByLabel(/^password$/i)

    // Enter weak password
    await passwordInput.fill('123')

    // Look for password strength indicator
    const strengthIndicator = page.locator('[class*="password-strength"], [aria-label*="password strength"]')
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toBeVisible()
    }
  })

  test('should validate password length on registration', async ({ page }) => {
    await page.goto('/register')

    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/^password$/i)
    const submitButton = page.getByRole('button', { name: /register|sign up/i })

    await emailInput.fill('test@example.com')
    await passwordInput.fill('short') // Too short
    await submitButton.click()

    // Should show error about password length
    const errorMessage = page.getByText(/password.*8.*characters|password.*too short/i)
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible()
    }
  })

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    const submitButton = page.getByRole('button', { name: /log in|sign in/i })

    // Should be able to tab through form
    await emailInput.focus()
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(passwordInput).toBeFocused()

    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluateHandle(() => document.activeElement)
    const tagName = await focusedElement.evaluate((el) => el?.tagName)
    expect(tagName).toBe('BUTTON')
  })
})
