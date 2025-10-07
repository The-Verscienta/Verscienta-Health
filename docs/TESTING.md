# Testing Documentation

Verscienta Health has a comprehensive test suite covering unit tests, end-to-end tests, and accessibility tests.

## 📋 Overview

- **Unit Tests**: Vitest for testing utilities and business logic
- **E2E Tests**: Playwright for testing user flows
- **Accessibility Tests**: Playwright + axe-core for WCAG 2.1 AA compliance

## 🧪 Unit Tests (Vitest)

### Running Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run tests in watch mode
pnpm test

# Run tests with coverage
pnpm test:unit --coverage
```

### Test Files

Unit tests are located in `__tests__` directories next to the files they test:

```
apps/web/lib/__tests__/
├── cloudflare-images.test.ts    # Image optimization tests
└── search-filters.test.ts       # Search filter logic tests
```

### What's Tested

**Cloudflare Images** (`cloudflare-images.test.ts`):

- Image URL generation
- Variant configurations
- srcset generation
- Blur placeholder creation
- Fallback behavior when Cloudflare not configured

**Search Filters** (`search-filters.test.ts`):

- Filter group configurations
- Filter application logic (AND/OR)
- Sorting logic (name, rating, reviews, severity)
- Multi-criteria filtering

### Writing New Unit Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

## 🎭 E2E Tests (Playwright)

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests in headed mode (see browser)
pnpm test:e2e --headed

# Run tests in UI mode (interactive)
pnpm test:e2e --ui

# Run specific test file
pnpm test:e2e e2e/homepage.spec.ts

# Run tests on specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

### Test Files

E2E tests are located in the `e2e/` directory:

```
apps/web/e2e/
├── homepage.spec.ts         # Homepage tests
├── search.spec.ts           # Search functionality tests
├── authentication.spec.ts   # Login/register tests
└── a11y/
    └── accessibility.spec.ts  # Accessibility tests
```

### What's Tested

**Homepage** (`homepage.spec.ts`):

- Page loads correctly
- Navigation links work
- Search bar functionality
- Hero section visible
- Responsive on mobile
- Proper meta tags
- No console errors

**Search** (`search.spec.ts`):

- Search results display
- Content type tabs
- Filter functionality
- Sort options
- Clear filters
- Empty results handling
- URL updates with query
- Accessibility

**Authentication** (`authentication.spec.ts`):

- Login page loads
- Registration page loads
- Form validation
- Email/password validation
- OAuth buttons visible
- Protected route redirects
- Password strength indicator
- Keyboard accessibility

### Writing New E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/path')

    // Interact with elements
    await page.getByRole('button', { name: /submit/i }).click()

    // Assert expectations
    await expect(page).toHaveURL(/success/)
  })
})
```

## ♿ Accessibility Tests

### Running Accessibility Tests

```bash
# Run all accessibility tests
pnpm test:a11y

# Run in UI mode
pnpm test:a11y --ui
```

### What's Tested

Accessibility tests use axe-core to check for WCAG 2.1 AA violations:

- **Color contrast**: Text has sufficient contrast with background
- **Heading hierarchy**: Proper h1, h2, h3 structure
- **Image alt text**: All images have descriptive alt attributes
- **Form labels**: All form fields have accessible labels
- **Keyboard navigation**: Interactive elements are keyboard accessible
- **ARIA attributes**: Proper use of ARIA roles and properties
- **Skip links**: Skip to main content link present

### Pages Tested

- Homepage
- Search page
- Login page
- Herbs listing
- Practitioner directory
- Symptom checker
- About page

### Example Accessibility Test

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('page should not have accessibility violations', async ({ page }) => {
  await page.goto('/')

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
})
```

## 📊 Test Coverage

### Viewing Coverage Reports

```bash
# Run tests with coverage
pnpm test:unit --coverage

# Open coverage report in browser
open coverage/index.html
```

### Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities and business logic
- **E2E Tests**: All critical user flows covered
- **Accessibility Tests**: All public pages tested

## 🔧 Configuration

### Vitest Configuration

`apps/web/vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### Playwright Configuration

`apps/web/playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

## 🚀 CI/CD Integration

### GitHub Actions

Tests run automatically on every push and pull request:

```yaml
# .github/workflows/ci.yml
- name: Run unit tests
  run: pnpm test:unit

- name: Run E2E tests
  run: pnpm test:e2e

- name: Run accessibility tests
  run: pnpm test:a11y
```

### Pre-commit Hooks

Run tests before committing:

```bash
# In package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["pnpm test:unit --run"]
  }
}
```

## 🐛 Debugging Tests

### Debug E2E Tests

```bash
# Run in debug mode
pnpm test:e2e --debug

# Run with headed browser and inspector
pnpm test:e2e --headed --debug
```

### View Test Reports

```bash
# Open Playwright report
pnpm exec playwright show-report

# Open accessibility report
pnpm exec playwright show-report playwright-report-a11y
```

### Common Issues

**Issue**: Tests fail locally but pass in CI

- **Solution**: Clear `.next` and `node_modules`, reinstall dependencies

**Issue**: Accessibility tests fail for color contrast

- **Solution**: Check Tailwind color classes, ensure proper contrast ratios

**Issue**: E2E tests timeout

- **Solution**: Increase timeout in test or check if dev server is running

## 📚 Best Practices

### Unit Tests

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Mock external dependencies**
5. **Keep tests isolated** (no shared state)

### E2E Tests

1. **Test critical user journeys**
2. **Use semantic selectors** (role, label, text)
3. **Avoid brittle selectors** (CSS classes, IDs)
4. **Test happy paths and error cases**
5. **Keep tests independent**
6. **Use page objects for complex flows**

### Accessibility Tests

1. **Test all public pages**
2. **Check WCAG 2.1 AA compliance**
3. **Test keyboard navigation**
4. **Verify screen reader compatibility**
5. **Check color contrast**

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)

---

**Questions?** Contact the development team or see the main README.md for more information.
