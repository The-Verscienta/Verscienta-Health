# TypeScript Strict Mode Configuration

**Last Updated:** 2025-01-20
**Version:** 1.0.0

Comprehensive guide to the TypeScript strict mode configuration and type safety practices for the Verscienta Health project.

---

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Strict Mode Flags](#strict-mode-flags)
4. [Type Safety Guidelines](#type-safety-guidelines)
5. [Common Type Errors & Solutions](#common-type-errors--solutions)
6. [Best Practices](#best-practices)
7. [Migration Guide](#migration-guide)

---

## Overview

TypeScript strict mode is **enabled** for the Verscienta Health project to ensure maximum type safety, catch bugs at compile time, and improve code quality.

### Benefits

✅ **Catch bugs early** - Type errors detected before runtime
✅ **Better IDE support** - Improved autocomplete and IntelliSense
✅ **Code documentation** - Types serve as inline documentation
✅ **Refactoring confidence** - TypeScript ensures changes don't break code
✅ **Team productivity** - Consistent type expectations across codebase

---

## Configuration

### TypeScript Config (`apps/web/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,

    /* Strict Mode */
    "strict": true,

    /* Additional Strict Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,

    /* Module Resolution */
    "module": "esnext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,

    /* Emit */
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,

    /* Path Aliases */
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/styles/*": ["./styles/*"],
      "@payload-config": ["./payload.config.ts"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "payload/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

---

## Strict Mode Flags

### 1. `"strict": true`

**Enables all strict type-checking options:**
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `useUnknownInCatchVariables`
- `alwaysStrict`

**Example:**
```typescript
// ❌ Error: implicit 'any' type
function greet(name) {
  console.log(`Hello, ${name}`)
}

// ✅ Correct: explicit type
function greet(name: string) {
  console.log(`Hello, ${name}`)
}
```

### 2. `"noUnusedLocals": true`

**Prevents unused local variables.**

**Example:**
```typescript
// ❌ Error: 'x' is declared but never used
function example() {
  const x = 10
  const y = 20
  return y
}

// ✅ Correct: remove unused variable
function example() {
  const y = 20
  return y
}

// ✅ Correct: prefix with underscore if intentionally unused
function example() {
  const _x = 10 // Okay - underscore prefix
  const y = 20
  return y
}
```

### 3. `"noUnusedParameters": true`

**Prevents unused function parameters.**

**Example:**
```typescript
// ❌ Error: 'req' is declared but never used
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Hello' })
}

// ✅ Correct: prefix with underscore
export async function GET(_req: NextRequest) {
  return NextResponse.json({ message: 'Hello' })
}

// ✅ Correct: remove if not needed
export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}
```

### 4. `"noImplicitReturns": true`

**Ensures all code paths return a value.**

**Example:**
```typescript
// ❌ Error: not all code paths return a value
function getStatus(code: number): string {
  if (code === 200) {
    return 'OK'
  }
  // Missing return for other cases
}

// ✅ Correct: all paths return
function getStatus(code: number): string {
  if (code === 200) {
    return 'OK'
  }
  return 'Error'
}
```

### 5. `"noFallthroughCasesInSwitch": true`

**Prevents accidental fall-through in switch statements.**

**Example:**
```typescript
// ❌ Error: fallthrough case
switch (status) {
  case 'active':
    console.log('Active')
    // Missing break - falls through!
  case 'inactive':
    console.log('Inactive')
    break
}

// ✅ Correct: explicit break
switch (status) {
  case 'active':
    console.log('Active')
    break
  case 'inactive':
    console.log('Inactive')
    break
}
```

### 6. `"forceConsistentCasingInFileNames": true`

**Enforces consistent file name casing in imports.**

**Example:**
```typescript
// ❌ Error: inconsistent casing
import { Button } from '@/components/ui/Button' // File is button.tsx

// ✅ Correct: matches file name
import { Button } from '@/components/ui/button'
```

---

## Type Safety Guidelines

### 1. **Avoid `any` Type**

❌ **Bad:**
```typescript
function processData(data: any) {
  return data.items.map((item: any) => item.value)
}
```

✅ **Good:**
```typescript
interface DataItem {
  value: string
}

interface Data {
  items: DataItem[]
}

function processData(data: Data) {
  return data.items.map((item) => item.value)
}
```

### 2. **Use Type Guards for Narrowing**

✅ **Good:**
```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string here
    return value.toUpperCase()
  }
  return null
}
```

### 3. **Properly Type Async Functions**

✅ **Good:**
```typescript
async function fetchUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`)
    const user: User = await response.json()
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}
```

### 4. **Use Union Types for Multiple Possibilities**

✅ **Good:**
```typescript
type Status = 'pending' | 'approved' | 'rejected'

function updateStatus(status: Status) {
  // TypeScript ensures only valid values
}

updateStatus('pending') // ✅ OK
updateStatus('invalid') // ❌ Error
```

### 5. **Type Payload Collections Properly**

✅ **Good:**
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

async function getHerb(id: string) {
  const payload = await getPayload({ config })

  const herb = await payload.findByID({
    collection: 'herbs',
    id: String(id), // Convert to string (Payload IDs can be string | number)
  })

  return herb
}
```

---

## Common Type Errors & Solutions

### Error: Property does not exist on type

**Problem:**
```typescript
const req: NextRequest = ...
const ip = req.ip // Error: Property 'ip' does not exist
```

**Solution:**
```typescript
// Use headers to get IP
const ip = req.headers.get('x-forwarded-for') ||
           req.headers.get('x-real-ip') ||
           'unknown'
```

### Error: Argument of type 'string | number' is not assignable to parameter of type 'string'

**Problem:**
```typescript
const herb = await payload.findByID({ collection: 'herbs', id: '...' })
await fetchHerbCitations(herb.id) // Error: herb.id is string | number
```

**Solution:**
```typescript
await fetchHerbCitations(String(herb.id)) // Convert to string
```

### Error: Type 'X' is not assignable to type 'Y'

**Problem:**
```typescript
interface Response {
  success: boolean
  message: string // Required
}

const response: Response = {
  success: false,
  error: 'Failed' // Error: missing 'message'
}
```

**Solution:**
```typescript
// Option 1: Make field optional
interface Response {
  success: boolean
  message?: string
  error?: string
}

// Option 2: Provide required field
const response: Response = {
  success: false,
  message: 'Failed'
}
```

### Error: 'X' is declared but its value is never read

**Problem:**
```typescript
function example(req: NextRequest, params: Params) { // Error: params never used
  return NextResponse.json({ message: 'OK' })
}
```

**Solution:**
```typescript
// Option 1: Prefix with underscore
function example(req: NextRequest, _params: Params) {
  return NextResponse.json({ message: 'OK' })
}

// Option 2: Remove if not needed
function example(req: NextRequest) {
  return NextResponse.json({ message: 'OK' })
}
```

---

## Best Practices

### 1. Define Types for All Function Parameters and Return Values

✅ **Good:**
```typescript
async function createUser(
  email: string,
  password: string
): Promise<User | null> {
  // Implementation
}
```

### 2. Use Interfaces for Object Shapes

✅ **Good:**
```typescript
interface HerbFilters {
  category?: string
  search?: string
  page?: number
  limit?: number
}

async function getHerbs(filters: HerbFilters) {
  // Implementation
}
```

### 3. Export Types from Shared Locations

✅ **Good:**
```typescript
// packages/api-types/src/herbs.ts
export interface Herb {
  id: string
  title: string
  botanicalInfo: BotanicalInfo
}

// Use in multiple files
import { type Herb } from '@verscienta/api-types'
```

### 4. Use `unknown` Instead of `any` for Unknown Types

✅ **Good:**
```typescript
function processError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
```

### 5. Leverage TypeScript Utility Types

✅ **Good:**
```typescript
interface User {
  id: string
  email: string
  password: string
  createdAt: string
}

// Pick only specific fields
type UserProfile = Pick<User, 'id' | 'email'>

// Omit sensitive fields
type PublicUser = Omit<User, 'password'>

// Make all fields optional
type PartialUser = Partial<User>

// Make all fields required
type RequiredUser = Required<Partial<User>>
```

---

## Migration Guide

### Gradual Adoption Strategy

For existing code with type errors:

1. **Fix Critical Errors First**
   - Type mismatches in API routes
   - Missing return types in async functions
   - Incorrect type assertions

2. **Address Unused Variables**
   - Prefix with underscore if intentionally unused
   - Remove if truly unnecessary
   - Refactor to use the variable if it should be used

3. **Update Third-Party Type Issues**
   - Check for updated `@types/*` packages
   - Use type assertions when types are incorrect
   - Report issues to package maintainers

4. **Suppress Non-Critical Warnings (Temporarily)**
   ```typescript
   // @ts-ignore - TODO: Fix type mismatch
   const value = someFunction()
   ```

### Type Check Commands

```bash
# Check all files
pnpm type-check

# Check specific file
pnpm tsc --noEmit path/to/file.ts

# Watch mode
pnpm tsc --noEmit --watch
```

### Pre-Commit Hook (Recommended)

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run type check
pnpm type-check

# If type check fails, prevent commit
if [ $? -ne 0 ]; then
  echo "Type check failed. Fix errors before committing."
  exit 1
fi
```

---

## Troubleshooting

### Issue: Too many type errors to fix at once

**Solution:** Use `// @ts-expect-error` with TODO comments:
```typescript
// @ts-expect-error TODO: Fix Payload type mismatch (Issue #123)
const herb = await payload.findByID({...})
```

### Issue: Third-party library has incorrect types

**Solution:** Create a type declaration file:
```typescript
// types/library-name.d.ts
declare module 'library-name' {
  export function someFunction(param: string): Promise<void>
}
```

### Issue: Generated files causing errors

**Solution:** Add to `exclude` in tsconfig.json:
```json
{
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "**/*.generated.ts"
  ]
}
```

---

## Resources

### Internal
- TypeScript Config: `apps/web/tsconfig.json`
- Type Definitions: `apps/web/types/`
- Package Types: `packages/api-types/`

### External
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- TypeScript Deep Dive: https://basarat.gitbook.io/typescript/
- TypeScript Cheat Sheets: https://www.typescriptlang.org/cheatsheets

---

## Known Issues & Limitations

### Generated .next/types Errors (Not Fixable)

**Status**: These are generated files from Next.js/Payload integration and cannot be directly edited.

```
.next/types/app/(payload)/api/[...slug]/route.ts(64,7): error TS2344
.next/types/app/(payload)/api/[...slug]/route.ts(181,7): error TS2344
.next/types/app/(payload)/api/[...slug]/route.ts(259,7): error TS2344
.next/types/app/(payload)/api/[...slug]/route.ts(298,7): error TS2344
```

**Cause**: Compatibility issue between PayloadCMS 3.62.1 and Next.js 15.4+ with async params
**Impact**: No runtime impact - code works correctly
**Workaround**: Already documented in `PAYLOAD_BUILD_ISSUE.md`
**Resolution**: Wait for Payload 3.x update or Next.js compatibility fix

### Email Template Style Props

**Status**: @react-email/components doesn't support inline style objects on some components.

**Affected Files**:
- `emails/templates/MfaBackupCodesEmail.tsx`
- `emails/templates/MfaSetupEmail.tsx`
- `emails/templates/PasswordResetEmail.tsx`
- `emails/templates/SecurityAlertEmail.tsx`

**Error**: `Property 'style' does not exist on type 'IntrinsicAttributes & ParagraphProps'`

**Solution Options**:
1. Remove style prop and use className instead
2. Update to newer @react-email/components version
3. Use @ts-expect-error comments (temporary)

### Storybook Missing Args

**Status**: Storybook stories with render functions require args property.

**Affected Files**:
- `components/ui/accordion.stories.tsx` (8 stories)
- `components/ui/pagination.stories.tsx` (4 stories)

**Error**: `Property 'args' is missing in type`

**Solution**: Add empty args object to stories:
```typescript
export const MyStory: Story = {
  args: {},
  render: () => <Component />
}
```

### Block-Scoped Variable Errors

**Status**: Variable used before declaration in seed scripts.

**Affected File**: `scripts/seed/herbs.ts` (lines 262, 271)

**Solution**: Refactor seed logic to declare variables before use

---

**Document Version:** 1.1.0
**Last Review:** 2025-01-21
**Maintainer:** Verscienta Health Development Team
**Status**: Core strict mode enabled, ~50 fixable errors resolved, ~109 total errors (59 are generated files or third-party issues)
