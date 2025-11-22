# Algolia Faceted Search - Edge Case Handling

**Created:** 2025-01-21
**Version:** 1.0.0
**Status:** Complete

Comprehensive documentation for edge case handling in Algolia faceted search implementation.

---

## Table of Contents

1. [Overview](#overview)
2. [Edge Cases Addressed](#edge-cases-addressed)
3. [Implementation Details](#implementation-details)
4. [Validation Rules](#validation-rules)
5. [Error Handling](#error-handling)
6. [Retry Logic](#retry-logic)
7. [Testing](#testing)
8. [Migration Guide](#migration-guide)

---

## Overview

The enhanced Algolia search implementation (`lib/algolia-enhanced.ts`) provides comprehensive edge case handling to ensure robust search operations across all scenarios.

### Key Features

✅ **Input Validation** - Validates and sanitizes all user inputs
✅ **Retry Logic** - Automatic retry with exponential backoff for network failures
✅ **Timeout Handling** - Prevents hanging queries with configurable timeouts
✅ **Credential Validation** - Checks Algolia credentials before operations
✅ **Pagination Bounds** - Enforces Algolia API limits on pagination
✅ **Filter Validation** - Validates filter structure and format
✅ **Fallback Behavior** - Returns empty results instead of throwing errors
✅ **Rate Limit Detection** - Detects and handles 429 responses

---

## Edge Cases Addressed

### 1. Input Validation Edge Cases

#### **1.1 Query Length Validation**

**Problem**: Algolia has a maximum query length of 512 characters
**Solution**: Automatically truncate queries that exceed the limit

```typescript
// Edge case: Very long query
const query = 'a'.repeat(1000)
await searchIndex('herbs', query) // Truncated to 512 chars with warning
```

**Behavior**:
- Queries > 512 characters are truncated
- Warning logged to console
- Search continues with truncated query

---

#### **1.2 Special Characters in Query**

**Problem**: Null bytes and some special characters can break queries
**Solution**: Sanitize queries before sending to Algolia

```typescript
// Edge case: Query with null bytes
const query = 'ginseng\0root'
await searchIndex('herbs', query) // Null bytes removed
```

**Sanitization**:
- Null bytes (`\0`) removed
- Leading/trailing whitespace trimmed
- Special characters logged for monitoring (`<>{}[]\`)

---

#### **1.3 Empty or Invalid Query**

**Problem**: Empty queries or non-string values
**Solution**: Convert to empty string and continue

```typescript
// Edge case: Non-string query
await searchIndex('herbs', null as any) // Converts to ''
await searchIndex('herbs', undefined as any) // Converts to ''
await searchIndex('herbs', 123 as any) // Converts to ''
```

---

### 2. Pagination Edge Cases

#### **2.1 Negative Page Number**

**Problem**: Negative page numbers are invalid
**Solution**: Clamp to 0 with warning

```typescript
// Edge case: Negative page
await searchIndex('herbs', 'ginseng', { page: -5 })
// Clamped to page: 0, warning logged
```

---

#### **2.2 Page Number Exceeds Limits**

**Problem**: Algolia limits page to 1000
**Solution**: Clamp to maximum with warning

```typescript
// Edge case: Page too high
await searchIndex('herbs', 'ginseng', { page: 5000 })
// Clamped to page: 1000, warning logged
```

---

#### **2.3 Invalid Hits Per Page**

**Problem**: hitsPerPage must be 1-1000
**Solution**: Clamp to valid range

```typescript
// Edge case: Invalid hitsPerPage
await searchIndex('herbs', 'ginseng', { hitsPerPage: 0 })
// Clamped to 1

await searchIndex('herbs', 'ginseng', { hitsPerPage: 2000 })
// Clamped to 1000
```

**Validation**:
- Minimum: 1
- Maximum: 1000 (Algolia limit)
- Default: 20

---

### 3. Filter Edge Cases

#### **3.1 Malformed Filter String**

**Problem**: Invalid filter syntax can cause errors
**Solution**: Validate filter structure before sending

```typescript
// Edge case: Potentially malformed filter
await searchIndex('herbs', 'ginseng', {
  filters: '((tcmCategory:tonifying))'
})
// Warning logged, filter still sent (Algolia handles syntax)
```

---

#### **3.2 Empty Facet Filters**

**Problem**: Empty facet filter arrays
**Solution**: Omit from request if empty

```typescript
// Edge case: Empty facet filters
await searchIndex('herbs', 'ginseng', {
  facetFilters: []
})
// facetFilters omitted from request
```

---

#### **3.3 Invalid Facet Filter Structure**

**Problem**: facetFilters must be Array<Array<string>>
**Solution**: Validate structure and return error

```typescript
// Edge case: Invalid structure
await searchIndex('herbs', 'ginseng', {
  facetFilters: ['invalid'] as any
})
// Error logged, returns empty results
```

**Valid Structure**:
```typescript
facetFilters: [
  ['tcmCategory:tonifying', 'tcmCategory:dispersing'], // OR
  ['tcmTaste:sweet'] // AND
]
```

---

### 4. Network and API Edge Cases

#### **4.1 Network Failures**

**Problem**: Connection failures, timeouts, DNS errors
**Solution**: Retry with exponential backoff

```typescript
// Edge case: Network failure
await searchIndex('herbs', 'ginseng')
// Retry 1: after 1s
// Retry 2: after 2s
// Retry 3: after 4s
// Returns empty results if all fail
```

**Retry Configuration**:
- Max retries: 3
- Initial delay: 1000ms
- Backoff: Exponential (2x)
- Retryable errors: Network, timeout, 503, 429

---

#### **4.2 Request Timeout**

**Problem**: Long-running queries can hang
**Solution**: 5-second timeout with configurable override

```typescript
// Edge case: Slow query
await searchIndex('herbs', 'complex query', { timeout: 10000 })
// Custom 10s timeout

// Default 5s timeout
await searchIndex('herbs', 'query')
```

---

#### **4.3 Rate Limiting (429)**

**Problem**: Algolia API rate limits exceeded
**Solution**: Detect 429, log error, retry with backoff

```typescript
// Edge case: Rate limit hit
await searchIndex('herbs', 'ginseng')
// Detects 429 response
// Retries with exponential backoff
// Logs rate limit error
```

---

### 5. Credential Edge Cases

#### **5.1 Missing Credentials**

**Problem**: ALGOLIA_APP_ID or ALGOLIA_SEARCH_API_KEY not set
**Solution**: Throw error immediately, don't attempt request

```typescript
// Edge case: No credentials
await searchIndex('herbs', 'ginseng')
// Error: NEXT_PUBLIC_ALGOLIA_APP_ID is not configured
// Returns empty results
```

---

#### **5.2 Invalid Credentials**

**Problem**: Credentials are set but invalid
**Solution**: Let Algolia return error, log it, return empty results

```typescript
// Edge case: Invalid credentials
await searchIndex('herbs', 'ginseng')
// Algolia returns 401
// Error logged
// Returns empty results
```

---

### 6. Index Edge Cases

#### **6.1 Invalid Index Name**

**Problem**: Index name doesn't exist in ALGOLIA_INDEXES
**Solution**: Validate before request, return empty results

```typescript
// Edge case: Invalid index
await searchIndex('invalid' as any, 'query')
// Error: Invalid index name. Must be one of: herbs, formulas, conditions, practitioners, modalities
// Returns empty results
```

---

#### **6.2 Index Not Configured**

**Problem**: Index exists in code but not in Algolia
**Solution**: Let Algolia return error, log it, return empty results

```typescript
// Edge case: Index not found in Algolia
await searchIndex('herbs', 'ginseng')
// Algolia returns index not found error
// Error logged
// Returns empty results
```

---

### 7. Multi-Index Search Edge Cases

#### **7.1 Mixed Valid/Invalid Indexes**

**Problem**: Some indexes valid, some invalid
**Solution**: Filter invalid, search valid ones only

```typescript
// Edge case: Mixed indexes
await searchMultipleIndexes('ginseng', ['herbs', 'invalid' as any, 'formulas'])
// Warning for 'invalid'
// Searches only 'herbs' and 'formulas'
// Returns: { herbs: [...], formulas: [...] }
```

---

#### **7.2 All Invalid Indexes**

**Problem**: No valid indexes provided
**Solution**: Return empty object

```typescript
// Edge case: All invalid
await searchMultipleIndexes('ginseng', ['invalid1' as any, 'invalid2' as any])
// Error: No valid indexes provided
// Returns: {}
```

---

### 8. Facet Edge Cases

#### **8.1 Empty Facet Name**

**Problem**: facetName is empty or whitespace
**Solution**: Validate and return empty array

```typescript
// Edge case: Empty facet name
await getFacets('herbs', '')
// Error: Facet name must be a non-empty string
// Returns: []
```

---

#### **8.2 Facet Doesn't Exist**

**Problem**: Requested facet not configured in index
**Solution**: Let Algolia return error, return empty array

```typescript
// Edge case: Unknown facet
await getFacets('herbs', 'unknownFacet')
// Algolia returns facet not found
// Error logged
// Returns: []
```

---

### 9. Response Edge Cases

#### **9.1 Invalid Response Structure**

**Problem**: Algolia response doesn't match expected structure
**Solution**: Validate response, return empty results if invalid

```typescript
// Edge case: Malformed response
// If Algolia returns unexpected structure
// Validation catches it
// Returns empty results
```

---

#### **9.2 Empty Results**

**Problem**: Search returns 0 hits
**Solution**: Return valid result structure with empty array

```typescript
await searchIndex('herbs', 'nonexistent')
// Returns: {
//   hits: [],
//   nbHits: 0,
//   page: 0,
//   nbPages: 0,
//   hitsPerPage: 20
// }
```

---

## Implementation Details

### File Structure

```
apps/web/lib/
├── algolia.ts              # Public API (delegates to enhanced)
├── algolia-enhanced.ts     # Enhanced implementation with edge cases
└── __tests__/
    └── algolia.test.ts     # Edge case tests
```

### Key Functions

#### **sanitizeQuery()**

Cleans and validates search queries:
- Converts non-strings to empty string
- Trims whitespace
- Removes null bytes
- Enforces max length (512 chars)
- Logs special characters

#### **validatePagination()**

Validates and normalizes pagination:
- Checks type (must be integer)
- Enforces bounds (page: 0-1000, hitsPerPage: 1-1000)
- Returns normalized values + validation errors

#### **validateIndexName()**

Validates index name:
- Checks type (must be string)
- Checks against VALID_INDEX_NAMES
- Returns validation result

#### **validateFacetFilters()**

Validates facet filter structure:
- Checks outer array
- Checks inner arrays
- Checks string values
- Returns validation result

#### **withRetry()**

Retry logic with exponential backoff:
- Max 3 retries
- Exponential backoff (1s, 2s, 4s)
- Only retries network/service errors
- Rethrows non-retryable errors

#### **withTimeout()**

Timeout wrapper:
- Default 5-second timeout
- Configurable per request
- Rejects promise on timeout

---

## Validation Rules

### Query Validation

| Rule | Value | Action |
|------|-------|--------|
| Max length | 512 chars | Truncate + warn |
| Null bytes | Not allowed | Remove |
| Empty string | Allowed | Process as is |
| Non-string | Not allowed | Convert to '' |

### Pagination Validation

| Parameter | Min | Max | Default | On Invalid |
|-----------|-----|-----|---------|------------|
| page | 0 | 1000 | 0 | Clamp + warn |
| hitsPerPage | 1 | 1000 | 20 | Clamp + warn |

### Filter Validation

| Rule | Requirement | On Invalid |
|------|-------------|------------|
| filters | String | Warn + continue |
| facetFilters | Array<Array<string>> | Error + empty results |
| Index name | In VALID_INDEX_NAMES | Error + empty results |

---

## Error Handling

### Error Logging

All errors are logged with context:

```typescript
console.error('[Algolia] Error searching herbs:', error)
console.error('[Algolia] Search timeout - query may be too complex')
console.error('[Algolia] Rate limit exceeded')
```

### Error Types

| Error Type | Detection | Handling |
|------------|-----------|----------|
| Validation | Pre-request | Return empty + log |
| Network | try/catch | Retry + fallback |
| Timeout | Promise.race | Cancel + fallback |
| Rate limit | 429 status | Retry + log |
| Credentials | Pre-request | Throw + log |

### Fallback Behavior

Instead of throwing exceptions to UI layer:
- Return empty results `{ hits: [], nbHits: 0, ... }`
- Return empty object `{}` for multi-index
- Return empty array `[]` for facets

This prevents UI crashes and shows "No results" messages.

---

## Retry Logic

### Retryable Errors

- Network errors (ECONNRESET, ENOTFOUND, ETIMEDOUT)
- HTTP 503 (Service Unavailable)
- HTTP 429 (Rate Limited)
- Timeout errors

### Non-Retryable Errors

- HTTP 401 (Unauthorized)
- HTTP 403 (Forbidden)
- HTTP 400 (Bad Request)
- Validation errors

### Retry Schedule

```
Attempt 1: Immediate
Attempt 2: Wait 1s
Attempt 3: Wait 2s
Attempt 4: Wait 4s
Final: Return empty results
```

---

## Testing

### Edge Case Test Coverage

Create test file: `apps/web/lib/__tests__/algolia-enhanced.test.ts`

```typescript
describe('Algolia Edge Cases', () => {
  describe('Query Validation', () => {
    it('should truncate queries > 512 characters')
    it('should remove null bytes from query')
    it('should handle empty query strings')
    it('should convert non-string queries to empty string')
  })

  describe('Pagination Validation', () => {
    it('should clamp negative page to 0')
    it('should clamp page > 1000 to 1000')
    it('should clamp hitsPerPage < 1 to 1')
    it('should clamp hitsPerPage > 1000 to 1000')
  })

  describe('Filter Validation', () => {
    it('should validate facet filter structure')
    it('should reject non-array facet filters')
    it('should reject invalid nested structure')
  })

  describe('Network Failures', () => {
    it('should retry on network errors')
    it('should not retry on 4xx errors')
    it('should use exponential backoff')
  })

  describe('Timeout Handling', () => {
    it('should timeout after 5 seconds by default')
    it('should respect custom timeout')
  })
})
```

### Manual Testing

Test with edge case data:

```bash
# Test very long query
curl "http://localhost:3000/api/search?q=$(printf 'a%.0s' {1..1000})"

# Test special characters
curl "http://localhost:3000/api/search?q=<script>alert('xss')</script>"

# Test invalid pagination
curl "http://localhost:3000/api/search?q=ginseng&page=-1&hitsPerPage=0"

# Test missing credentials
ALGOLIA_APP_ID= ALGOLIA_SEARCH_KEY= pnpm dev

# Test invalid index
curl "http://localhost:3000/api/search?index=invalid&q=test"
```

---

## Migration Guide

### For Existing Code

The enhanced implementation is **backward compatible**. No code changes required:

```typescript
// Old code still works
import { searchIndex } from '@/lib/algolia'

const results = await searchIndex('herbs', 'ginseng')
// Automatically uses enhanced version
```

### Opt-in to New Features

Use new helper functions:

```typescript
import { isAlgoliaAvailable, getAlgoliaStatus } from '@/lib/algolia'

// Check if configured
if (isAlgoliaAvailable()) {
  // Perform search
}

// Debug configuration
console.log(getAlgoliaStatus())
// {
//   configured: true,
//   appId: 'AB12...',
//   hasSearchKey: true,
//   availableIndexes: ['herbs', 'formulas', ...]
// }
```

### Custom Timeout

```typescript
// Old: No timeout control
await searchIndex('herbs', 'query')

// New: Custom timeout
await searchIndex('herbs', 'complex query', {
  timeout: 10000 // 10 seconds
})
```

---

## Best Practices

### 1. Always Use Typed Index Names

```typescript
// ✅ Good - TypeScript will catch errors
searchIndex('herbs', 'query')

// ❌ Bad - Runtime error possible
searchIndex(userInput as any, 'query')
```

### 2. Validate User Input Before Search

```typescript
// ✅ Good - Pre-validate pagination
const page = Math.max(0, Math.min(1000, Number(req.query.page) || 0))
await searchIndex('herbs', query, { page })

// ❌ Bad - Pass user input directly
await searchIndex('herbs', query, { page: req.query.page as any })
```

### 3. Handle Empty Results Gracefully

```typescript
// ✅ Good - Check for results
const { hits } = await searchIndex('herbs', query)
if (hits.length === 0) {
  return <NoResults />
}

// ❌ Bad - Assume results exist
return <ResultsList items={hits[0].items} />
```

### 4. Use Multi-Index Search for Performance

```typescript
// ✅ Good - Single request
const results = await searchMultipleIndexes('ginseng')

// ❌ Bad - Multiple requests
const herbs = await searchIndex('herbs', 'ginseng')
const formulas = await searchIndex('formulas', 'ginseng')
const conditions = await searchIndex('conditions', 'ginseng')
```

### 5. Monitor Errors in Production

```typescript
// Add error tracking
import * as Sentry from '@sentry/nextjs'

const { hits } = await searchIndex('herbs', query)
if (hits.length === 0) {
  Sentry.captureMessage('Empty search results', {
    extra: { query, index: 'herbs' }
  })
}
```

---

## Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_ALGOLIA_APP_ID=your-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-key

# Optional
ALGOLIA_TIMEOUT_MS=5000              # Default search timeout
ALGOLIA_MAX_RETRIES=3                 # Max retry attempts
ALGOLIA_RETRY_DELAY_MS=1000          # Initial retry delay
```

### Constants (Modify in algolia-enhanced.ts)

```typescript
const MAX_QUERY_LENGTH = 512
const MIN_HITS_PER_PAGE = 1
const MAX_HITS_PER_PAGE = 1000
const DEFAULT_HITS_PER_PAGE = 20
const MAX_PAGE_NUMBER = 1000
const SEARCH_TIMEOUT_MS = 5000
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 1000
```

---

## Troubleshooting

### Issue: All searches return empty results

**Possible Causes**:
1. Credentials not configured
2. Indexes not created in Algolia
3. No data indexed

**Solution**:
```typescript
import { getAlgoliaStatus } from '@/lib/algolia'

console.log(getAlgoliaStatus())
// Check if configured: true
// Check hasSearchKey: true
```

### Issue: Searches timeout frequently

**Possible Causes**:
1. Complex queries
2. Large result sets
3. Network issues

**Solution**:
```typescript
// Increase timeout
await searchIndex('herbs', query, { timeout: 10000 })

// Reduce hits per page
await searchIndex('herbs', query, { hitsPerPage: 10 })
```

### Issue: Rate limit errors

**Possible Causes**:
1. Too many requests
2. Shared API key

**Solution**:
- Implement request caching
- Add request throttling
- Use separate API keys per environment

---

## Resources

### Internal
- Implementation: `apps/web/lib/algolia-enhanced.ts`
- Public API: `apps/web/lib/algolia.ts`
- Search Components: `apps/web/components/search/`

### External
- [Algolia API Reference](https://www.algolia.com/doc/api-reference/)
- [Algolia Limits & Rate Limits](https://www.algolia.com/doc/guides/scaling/algolia-service-limits/)
- [Algolia Error Codes](https://www.algolia.com/doc/api-reference/api-errors/)

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-21
**Maintainer:** Verscienta Health Development Team
