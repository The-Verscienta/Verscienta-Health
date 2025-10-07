# API Reference

Welcome to the Verscienta Health API Reference. This document provides comprehensive information about our public API endpoints.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Webhooks](#webhooks)
- [SDKs](#sdks)

---

## Getting Started

### Base URL

```
Production: https://verscienta.com/api
Staging:    https://staging.verscienta.com/api
```

### Interactive Documentation

Visit our interactive API documentation powered by Swagger UI:
- **https://verscienta.com/api-docs**

### Quick Start Example

```bash
# Get list of herbs
curl https://verscienta.com/api/herbs?page=1&limit=10

# Get specific herb
curl https://verscienta.com/api/herbs/ginseng

# Search
curl https://verscienta.com/api/search?q=immune+support&type=herbs
```

---

## Authentication

### API Keys

Most endpoints are public and don't require authentication. However, some advanced features (like AI symptom analysis) require an API key.

**Request an API Key:**
1. Create an account at [verscienta.com](https://verscienta.com)
2. Navigate to [Developer Settings](https://verscienta.com/account/developer)
3. Click "Generate API Key"

**Using your API Key:**

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://verscienta.com/api/ai/analyze-symptoms
```

```javascript
// JavaScript
fetch('https://verscienta.com/api/ai/analyze-symptoms', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  method: 'POST',
  body: JSON.stringify({ symptoms: 'fatigue and cold hands' }),
})
```

```python
# Python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
}

response = requests.post(
    'https://verscienta.com/api/ai/analyze-symptoms',
    headers=headers,
    json={'symptoms': 'fatigue and cold hands'}
)
```

### Security Best Practices

- ✅ **Do**: Store API keys as environment variables
- ✅ **Do**: Rotate keys regularly
- ✅ **Do**: Use different keys for development and production
- ❌ **Don't**: Commit API keys to version control
- ❌ **Don't**: Expose keys in client-side code
- ❌ **Don't**: Share keys publicly

---

## Rate Limiting

Rate limits protect our API from abuse and ensure fair access for all users.

### Limits

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Public (unauthenticated) | 100 requests | 10 minutes |
| Authenticated | 1000 requests | 1 hour |
| AI Endpoints | 20 requests | 10 minutes |
| Search | 50 requests | 10 minutes |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

### Rate Limit Exceeded

When you exceed the rate limit, you'll receive a 429 status code:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 10 minutes.",
  "statusCode": 429,
  "retryAfter": 600
}
```

**Best Practices:**
- Implement exponential backoff
- Cache responses when possible
- Respect the `Retry-After` header

---

## Endpoints

### Herbs

#### `GET /api/herbs`

List all herbs with pagination and filtering.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max: 100) |
| `temperature` | string | - | Filter by TCM temperature |
| `taste` | string | - | Filter by TCM taste (comma-separated) |
| `meridians` | string | - | Filter by meridians (comma-separated) |
| `sort` | string | `name` | Sort field |
| `order` | string | `asc` | Sort order (`asc` or `desc`) |

**Example Request:**

```bash
curl "https://verscienta.com/api/herbs?page=1&limit=10&temperature=Warm&taste=Sweet"
```

**Example Response:**

```json
{
  "docs": [
    {
      "id": "cm123abc",
      "slug": "ginseng",
      "name": "Ginseng",
      "scientificName": "Panax ginseng",
      "commonNames": ["Korean Ginseng", "Asian Ginseng", "Ren Shen"],
      "pinyinName": "Rén Shēn",
      "chineseName": "人参",
      "description": "Known as the 'King of Herbs' in Traditional Chinese Medicine...",
      "tcmProperties": {
        "temperature": "Warm",
        "taste": ["Sweet", "Slightly Bitter"],
        "meridians": ["Lung", "Spleen", "Heart"],
        "actions": ["Tonifies Qi", "Strengthens Spleen", "Benefits Heart"]
      },
      "westernProperties": ["Adaptogen", "Immune Modulator", "Antioxidant"],
      "safetyInfo": {
        "rating": "Generally Safe",
        "contraindications": ["Pregnancy", "High blood pressure"],
        "interactions": ["Warfarin", "MAO inhibitors"]
      },
      "imageUrl": "https://images.verscienta.com/herbs/ginseng.jpg",
      "status": "published",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "totalDocs": 15243,
  "page": 1,
  "totalPages": 1525,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

#### `GET /api/herbs/{slug}`

Get detailed information about a specific herb.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Herb slug (e.g., "ginseng") |

**Example Request:**

```bash
curl "https://verscienta.com/api/herbs/ginseng"
```

**Example Response:**

```json
{
  "id": "cm123abc",
  "slug": "ginseng",
  "name": "Ginseng",
  "scientificName": "Panax ginseng",
  "family": "Araliaceae",
  "commonNames": ["Korean Ginseng", "Asian Ginseng", "Ren Shen"],
  "pinyinName": "Rén Shēn",
  "chineseName": "人参",
  "description": "Full detailed description...",
  "tcmProperties": {
    "temperature": "Warm",
    "taste": ["Sweet", "Slightly Bitter"],
    "meridians": ["Lung", "Spleen", "Heart"],
    "actions": ["Tonifies Qi", "Strengthens Spleen", "Benefits Heart"]
  },
  "westernProperties": ["Adaptogen", "Immune Modulator", "Antioxidant"],
  "activeConstituents": [
    {
      "name": "Ginsenosides",
      "chemicalFormula": "C42H72O14",
      "description": "Primary active compounds..."
    }
  ],
  "safetyInfo": {
    "rating": "Generally Safe",
    "contraindications": ["Pregnancy", "High blood pressure", "Acute infections"],
    "interactions": ["Warfarin", "MAO inhibitors", "Stimulants"],
    "sideEffects": ["Insomnia", "Headache", "Digestive upset"],
    "dosage": "1-2g daily of dried root"
  },
  "preparation": ["Decoction", "Powder", "Tincture", "Extract"],
  "partsUsed": ["Root"],
  "habitat": "Native to Korea and northeastern China",
  "cultivation": "Requires 4-6 years to mature...",
  "relatedHerbs": ["cm456def", "cm789ghi"],
  "relatedFormulas": ["cm111jkl"],
  "relatedConditions": ["cm222mno"],
  "images": [
    {
      "url": "https://images.verscienta.com/herbs/ginseng-root.jpg",
      "caption": "Fresh ginseng root",
      "type": "photograph"
    },
    {
      "url": "https://images.verscienta.com/herbs/ginseng-plant.jpg",
      "caption": "Ginseng plant in natural habitat",
      "type": "photograph"
    }
  ],
  "references": [
    {
      "title": "Ginseng, the 'Immunity Boost'",
      "authors": ["Smith, J.", "Doe, A."],
      "journal": "Journal of Ethnopharmacology",
      "year": 2023,
      "doi": "10.1016/j.jep.2023.12345"
    }
  ],
  "status": "published",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Formulas

#### `GET /api/formulas`

List all herbal formulas.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `tradition` | string | - | Filter by tradition (TCM, Western, Ayurveda) |
| `category` | string | - | Filter by category |

#### `GET /api/formulas/{slug}`

Get detailed formula information including all ingredients and preparation instructions.

### Conditions

#### `GET /api/conditions`

List all health conditions.

#### `GET /api/conditions/{slug}`

Get detailed condition information including recommended herbs and formulas.

### Practitioners

#### `GET /api/practitioners`

Find practitioners with filtering by location, specialty, and availability.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `latitude` | number | Latitude for geo-search |
| `longitude` | number | Longitude for geo-search |
| `radius` | number | Search radius in kilometers (default: 50) |
| `specialty` | string | Filter by specialty |
| `acceptingPatients` | boolean | Only show accepting patients |
| `verified` | boolean | Only show verified practitioners |

#### `GET /api/practitioners/{slug}`

Get practitioner profile details.

### Search

#### `GET /api/search`

Full-text search across all content types.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `type` | string | No | Content type (herbs, formulas, conditions, all) |
| `page` | integer | No | Page number |
| `limit` | integer | No | Results per page |

**Example:**

```bash
curl "https://verscienta.com/api/search?q=immune+support&type=herbs&page=1&limit=10"
```

### AI Endpoints

#### `POST /api/ai/analyze-symptoms`

Analyze symptoms and get herb recommendations using AI.

**Authentication Required**: Yes

**Request Body:**

```json
{
  "symptoms": "I have persistent fatigue, cold hands and feet, and low appetite",
  "age": 35,
  "gender": "female"
}
```

**Response:**

```json
{
  "analysis": "Based on your symptoms, you may be experiencing Spleen Qi deficiency...",
  "conditions": [
    {
      "name": "Spleen Qi Deficiency",
      "confidence": 0.85,
      "slug": "spleen-qi-deficiency"
    },
    {
      "name": "Blood Deficiency",
      "confidence": 0.72,
      "slug": "blood-deficiency"
    }
  ],
  "recommendedHerbs": [
    {
      "slug": "ginseng",
      "name": "Ginseng",
      "reason": "Tonifies Qi and strengthens Spleen"
    },
    {
      "slug": "astragalus",
      "name": "Astragalus",
      "reason": "Tonifies Qi and raises Yang"
    }
  ],
  "recommendedFormulas": [
    {
      "slug": "si-jun-zi-tang",
      "name": "Four Gentlemen Decoction",
      "reason": "Classic formula for Spleen Qi deficiency"
    }
  ],
  "disclaimer": "This analysis is for educational purposes only and should not replace professional medical advice..."
}
```

---

## Data Models

### Herb

```typescript
interface Herb {
  id: string
  slug: string
  name: string
  scientificName: string
  family?: string
  commonNames: string[]
  pinyinName?: string
  chineseName?: string
  description: string
  tcmProperties: {
    temperature: 'Hot' | 'Warm' | 'Neutral' | 'Cool' | 'Cold'
    taste: Array<'Sweet' | 'Bitter' | 'Sour' | 'Pungent' | 'Salty' | 'Bland'>
    meridians: string[]
    actions: string[]
  }
  westernProperties: string[]
  activeConstituents?: Array<{
    name: string
    chemicalFormula?: string
    description?: string
  }>
  safetyInfo: {
    rating: 'Safe' | 'Generally Safe' | 'Use with Caution' | 'Potentially Toxic'
    contraindications: string[]
    interactions: string[]
    sideEffects?: string[]
    dosage?: string
  }
  preparation: string[]
  partsUsed: string[]
  habitat?: string
  cultivation?: string
  imageUrl?: string
  images?: Array<{
    url: string
    caption: string
    type: 'photograph' | 'illustration'
  }>
  relatedHerbs?: string[]
  relatedFormulas?: string[]
  relatedConditions?: string[]
  references?: Array<{
    title: string
    authors: string[]
    journal?: string
    year: number
    doi?: string
    url?: string
  }>
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}
```

### Formula

```typescript
interface Formula {
  id: string
  slug: string
  name: string
  pinyinName?: string
  chineseName?: string
  tradition: 'TCM' | 'Western' | 'Ayurveda' | 'Other'
  category: string
  description: string
  ingredients: Array<{
    herb: string // Herb ID or slug
    quantity: string
    unit: string
    tcmRole?: 'Chief' | 'Deputy' | 'Assistant' | 'Envoy'
  }>
  preparation: string
  dosage: string
  indications: string[]
  contraindications: string[]
  modifications?: Array<{
    condition: string
    changes: string
  }>
  historicalContext?: string
  modernApplications?: string
  relatedFormulas?: string[]
  relatedConditions?: string[]
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}
```

### Condition

```typescript
interface Condition {
  id: string
  slug: string
  name: string
  westernName: string
  tcmName?: string
  category: string
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical'
  description: string
  symptoms: string[]
  affectedSystems: string[]
  causes?: {
    western?: string[]
    tcm?: string[]
  }
  diagnosis?: {
    western?: string
    tcm?: string
  }
  treatment?: {
    western?: string
    tcm?: string
  }
  recommendedHerbs: string[]
  recommendedFormulas: string[]
  lifestyle?: string[]
  prognosis?: string
  redFlags?: string[]
  relatedConditions?: string[]
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "statusCode": 400,
  "details": {
    "field": "Additional error context"
  }
}
```

### Common Errors

**Invalid Parameters:**
```json
{
  "error": "Validation Error",
  "message": "Invalid query parameters",
  "statusCode": 400,
  "details": {
    "page": "Must be a positive integer",
    "limit": "Must be between 1 and 100"
  }
}
```

**Authentication Required:**
```json
{
  "error": "Unauthorized",
  "message": "API key required for this endpoint",
  "statusCode": 401
}
```

**Resource Not Found:**
```json
{
  "error": "Not Found",
  "message": "Herb with slug 'unknown-herb' not found",
  "statusCode": 404
}
```

---

## Webhooks

*Coming Soon*

Webhooks allow you to receive real-time notifications when certain events occur.

**Planned Events:**
- `herb.created`
- `herb.updated`
- `formula.created`
- `practitioner.verified`

---

## SDKs

### Official SDKs

**JavaScript/TypeScript**
```bash
npm install @verscienta/api-client
```

```typescript
import { VersientaClient } from '@verscienta/api-client'

const client = new VersientaClient({
  apiKey: process.env.VERSCIENTA_API_KEY,
})

const herbs = await client.herbs.list({ page: 1, limit: 10 })
const ginseng = await client.herbs.get('ginseng')
```

**Python**
```bash
pip install verscienta
```

```python
from verscienta import Client

client = Client(api_key=os.environ['VERSCIENTA_API_KEY'])

herbs = client.herbs.list(page=1, limit=10)
ginseng = client.herbs.get('ginseng')
```

### Community SDKs

- **Ruby**: [verscienta-ruby](https://github.com/community/verscienta-ruby) (unofficial)
- **PHP**: [verscienta-php](https://github.com/community/verscienta-php) (unofficial)
- **Go**: [go-verscienta](https://github.com/community/go-verscienta) (unofficial)

---

## Support

### Documentation

- **Interactive API Docs**: https://verscienta.com/api-docs
- **Guide Articles**: https://docs.verscienta.com
- **GitHub**: https://github.com/verscienta

### Contact

- **Email**: developers@verscienta.com
- **Discord**: [Join our community](https://discord.gg/verscienta)
- **Issue Tracker**: https://github.com/verscienta/api-issues

### Status Page

Check API status and uptime: https://status.verscienta.com

---

## Changelog

### v1.0.0 (2025-01-01)
- Initial public API release
- Herbs, Formulas, Conditions, Practitioners endpoints
- Search functionality
- AI symptom analysis
- Rate limiting
- OpenAPI/Swagger documentation

---

**Last Updated**: January 2025
