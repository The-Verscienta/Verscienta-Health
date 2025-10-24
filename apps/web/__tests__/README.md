# Testing Documentation

Comprehensive testing guide for Verscienta Health web application.

## Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Categories](#test-categories)
5. [Writing Tests](#writing-tests)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)

---

## Overview

The project uses a multi-layered testing strategy:

- **Unit Tests**: Component and utility function tests (Vitest)
- **Integration Tests**: API and service integration tests (Vitest)
- **E2E Tests**: Full user flow tests (Playwright)
- **Accessibility Tests**: WCAG compliance tests (axe-core + Playwright)
- **Performance Tests**: Bundle size and runtime performance (Vitest)
- **Security Tests**: Authentication and authorization tests (Vitest)

### Testing Stack

- **Vitest**: Unit and integration tests
- **Testing Library**: React component testing
- **Playwright**: E2E and accessibility testing
- **Axe-core**: Accessibility auditing
- **MSW** (future): API mocking

---

## Test Structure

```
apps/web/
├── __tests__/
│   ├── security/              # Security-focused tests
│   │   ├── authentication.test.ts
│   │   └── rate-limiting.test.ts
│   ├── performance/           # Performance tests
│   │   └── bundle-size.test.ts
│   └── README.md             # This file
├── components/
│   ├── ui/__tests__/         # UI component tests
│   │   ├── button.test.tsx
│   │   └── card.test.tsx
│   ├── cards/__tests__/      # Feature component tests
│   │   └── HerbCard.test.tsx
│   └── ...
├── hooks/__tests__/          # Custom hook tests
│   └── use-idle-timeout.test.ts
├── lib/__tests__/            # Utility function tests
│   ├── cloudflare-images.test.ts
│   ├── search-filters.test.ts
│   └── strapi-api.test.ts
└── e2e/                      # E2E tests
    ├── homepage.spec.ts
    ├── search.spec.ts
    ├── authentication.spec.ts
    └── a11y/
        └── accessibility.spec.ts
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run specific test file
pnpm test button.test.tsx

# Run with coverage
pnpm test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Run specific test
pnpm test:e2e homepage.spec.ts

# Debug mode
pnpm test:e2e --debug
```

### Accessibility Tests

```bash
# Run accessibility tests
pnpm test:a11y

# Run with specific browser
pnpm test:a11y --project=chromium
```

---

## Test Categories

### 1. Component Unit Tests

Test individual React components in isolation.

**Location**: `components/*/__tests__/*.test.tsx`

**Example**:
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

it('renders correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})
```

**Coverage**:
- ✅ Button component
- ✅ Card components (Card, CardHeader, CardTitle, CardContent, CardFooter)
- ✅ HerbCard feature component
- ⏳ FormulaCard, ConditionCard, PractitionerCard
- ⏳ SearchBar, SearchFilters
- ⏳ Layout components (Header, Footer)

### 2. Custom Hook Tests

Test React hooks in isolation.

**Location**: `hooks/__tests__/*.test.ts`

**Example**:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useIdleTimeout } from '../use-idle-timeout'

it('triggers timeout after inactivity', () => {
  const onTimeout = vi.fn()
  renderHook(() => useIdleTimeout({ timeoutMinutes: 5, onTimeout }))

  act(() => {
    vi.advanceTimersByTime(5 * 60 * 1000)
  })

  expect(onTimeout).toHaveBeenCalled()
})
```

**Coverage**:
- ✅ useIdleTimeout (HIPAA compliance)
- ⏳ Additional custom hooks

### 3. API Integration Tests

Test API client integration with Strapi CMS.

**Location**: `lib/__tests__/strapi-api.test.ts`

**Example**:
```typescript
it('fetches herbs with pagination', async () => {
  const mockResponse = {
    data: [{ id: 1, title: 'Ginseng' }],
    meta: { pagination: { page: 1, total: 50 } }
  }

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockResponse
  })

  const result = await getHerbs(1, 12)
  expect(result.docs).toHaveLength(1)
})
```

**Coverage**:
- ✅ Strapi API integration
- ✅ Response transformation
- ✅ Error handling
- ✅ Retry logic
- ⏳ GraphQL queries (if added)

### 4. Security Tests

Test authentication, authorization, and security features.

**Location**: `__tests__/security/*.test.ts`

**Examples**:
- ✅ Password hashing and validation
- ✅ Session management
- ✅ Account lockout after failed attempts
- ✅ Two-factor authentication (MFA)
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ HIPAA audit logging

### 5. Performance Tests

Monitor bundle size and runtime performance.

**Location**: `__tests__/performance/*.test.ts`

**Coverage**:
- ✅ Bundle size limits
- ✅ Code splitting verification
- ✅ Tree shaking checks
- ✅ Image optimization
- ✅ Core Web Vitals thresholds
- ✅ Lighthouse score requirements

### 6. E2E Tests

Test complete user flows from start to finish.

**Location**: `e2e/*.spec.ts`

**Coverage**:
- ✅ Homepage rendering
- ✅ Search functionality
- ✅ Authentication flow
- ⏳ Herb detail pages
- ⏳ Formula browsing
- ⏳ Practitioner directory
- ⏳ Symptom checker

### 7. Accessibility Tests

Ensure WCAG 2.1 AA compliance.

**Location**: `e2e/a11y/*.spec.ts`

**Coverage**:
- ✅ 7 pages tested (homepage, herbs, formulas, practitioners, conditions, modalities, symptom checker)
- ⏳ Interactive elements
- ⏳ Form validation
- ⏳ Dynamic content

---

## Writing Tests

### Best Practices

#### 1. Test Structure

Use **Arrange-Act-Assert** pattern:

```typescript
it('validates password complexity', () => {
  // Arrange
  const password = 'weak'

  // Act
  const result = validatePassword(password)

  // Assert
  expect(result.valid).toBe(false)
})
```

#### 2. Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => { ... })

// ✅ Good
it('displays error message when password is too short', () => { ... })
```

#### 3. Test One Thing at a Time

```typescript
// ❌ Bad - testing multiple things
it('button works', () => {
  render(<Button onClick={fn}>Text</Button>)
  expect(screen.getByText('Text')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button'))
  expect(fn).toHaveBeenCalled()
})

// ✅ Good - separate tests
it('renders with correct text', () => { ... })
it('calls onClick when clicked', () => { ... })
```

#### 4. Use Testing Library Queries Properly

Priority order:
1. `getByRole` - Accessibility-focused
2. `getByLabelText` - Form inputs
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Text content
5. `getByTestId` - Last resort

```typescript
// ✅ Best - accessible
screen.getByRole('button', { name: 'Submit' })

// ⚠️ OK - but less accessible
screen.getByText('Submit')

// ❌ Avoid - not accessibility-focused
screen.getByTestId('submit-button')
```

#### 5. Mock External Dependencies

```typescript
// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: [] })
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))
```

#### 6. Clean Up After Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
})
```

---

## Test Coverage Goals

### Current Coverage

- **Unit Tests**: ~40% (Goal: 80%)
- **Integration Tests**: ~30% (Goal: 70%)
- **E2E Tests**: ~20% (Goal: 60%)
- **Accessibility**: ~15% (Goal: 90%)

### Priority Areas

1. **UI Components** (Goal: 90% coverage)
   - All components in `components/ui/`
   - Feature components in `components/cards/`, `components/search/`, `components/auth/`

2. **Business Logic** (Goal: 95% coverage)
   - `lib/` utilities
   - API clients
   - Form validation

3. **Critical Paths** (Goal: 100% E2E coverage)
   - User registration/login
   - Search and filtering
   - Practitioner directory
   - Symptom checker

4. **Security Features** (Goal: 100% coverage)
   - Authentication flows
   - Authorization checks
   - Rate limiting
   - Session management
   - HIPAA compliance features

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:e2e

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:a11y
```

### Pre-commit Hooks

```bash
# Run tests before commit
pnpm test:unit --run

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

```typescript
// Increase timeout for slow tests
it('slow test', async () => {
  // ...
}, 10000) // 10 second timeout
```

#### 2. Flaky Tests

```typescript
// Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Use fake timers
vi.useFakeTimers()
act(() => {
  vi.advanceTimersByTime(1000)
})
vi.useRealTimers()
```

#### 3. Mock Issues

```typescript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules() // For module-level mocks
})
```

---

## Next Steps

### Immediate Priorities

1. ✅ **Component Unit Tests** - Button, Card, HerbCard
2. ✅ **Hook Tests** - useIdleTimeout
3. ✅ **Security Tests** - Authentication, rate limiting
4. ✅ **API Tests** - Strapi integration
5. ✅ **Performance Tests** - Bundle size monitoring

### Upcoming

1. **Feature Component Tests** - FormulaCard, ConditionCard, PractitionerCard, SearchBar
2. **Layout Component Tests** - Header, Footer, Navigation
3. **Integration Tests** - Database operations, caching
4. **E2E Test Expansion** - Cover all major user flows
5. **Accessibility Test Expansion** - All interactive components

### Future Enhancements

1. **Visual Regression Testing** - Chromatic or Percy
2. **Load Testing** - k6 or Artillery
3. **Contract Testing** - Pact for API contracts
4. **Mutation Testing** - Stryker for test quality
5. **Performance Monitoring** - Lighthouse CI in CI/CD

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Axe-core](https://github.com/dequelabs/axe-core)
- [Kent C. Dodds - Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2025-10-20
**Test Coverage**: 40% → Target: 80%
