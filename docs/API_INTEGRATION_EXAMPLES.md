# API Integration Examples

This guide provides practical examples for integrating with the Verscienta Health API in various programming languages and frameworks.

## Table of Contents

- [Getting Started](#getting-started)
- [JavaScript/TypeScript](#javascripttypescript)
- [Python](#python)
- [PHP](#php)
- [Ruby](#ruby)
- [cURL](#curl)
- [Common Use Cases](#common-use-cases)
- [Best Practices](#best-practices)

---

## Getting Started

### Base URL

```
https://verscienta.com/api
```

### Authentication

For endpoints requiring authentication, include your API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

Request your API key at: [https://verscienta.com/developers](https://verscienta.com/developers)

---

## JavaScript/TypeScript

### Using Fetch API

**Basic GET Request:**

```javascript
// Get list of herbs
async function getHerbs(page = 1, limit = 20) {
  const response = await fetch(
    `https://verscienta.com/api/herbs?page=${page}&limit=${limit}`
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

// Usage
const herbs = await getHerbs(1, 10)
console.log(`Found ${herbs.totalDocs} herbs`)
herbs.docs.forEach(herb => {
  console.log(`- ${herb.name} (${herb.scientificName})`)
})
```

**Get Specific Herb:**

```javascript
async function getHerb(slug) {
  const response = await fetch(`https://verscienta.com/api/herbs/${slug}`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Herb '${slug}' not found`)
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

// Usage
const ginseng = await getHerb('ginseng')
console.log(`${ginseng.name}:`, ginseng.tcmProperties.temperature)
```

**Search with Filters:**

```javascript
async function searchHerbs(query, filters = {}) {
  const params = new URLSearchParams({
    q: query,
    type: 'herbs',
    ...filters
  })

  const response = await fetch(
    `https://verscienta.com/api/search?${params}`
  )

  return await response.json()
}

// Usage
const results = await searchHerbs('immune support', {
  temperature: 'Warm',
  page: 1,
  limit: 10
})
```

**AI Symptom Analysis (Authenticated):**

```javascript
async function analyzeSymptoms(symptoms, apiKey) {
  const response = await fetch(
    'https://verscienta.com/api/ai/analyze-symptoms',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        symptoms,
        age: 35,
        gender: 'female',
      }),
    }
  )

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

// Usage
const analysis = await analyzeSymptoms(
  'fatigue, cold hands, low appetite',
  process.env.VERSCIENTA_API_KEY
)
console.log('Analysis:', analysis.analysis)
console.log('Recommended herbs:', analysis.recommendedHerbs)
```

### Using Axios

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://verscienta.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add authentication token
api.interceptors.request.use(config => {
  const token = process.env.VERSCIENTA_API_KEY
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle rate limiting
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      console.log(`Rate limited. Retry after ${retryAfter} seconds`)
    }
    return Promise.reject(error)
  }
)

// Get herbs with filtering
async function getWarmHerbs() {
  const { data } = await api.get('/herbs', {
    params: {
      temperature: 'Warm',
      page: 1,
      limit: 50,
    },
  })
  return data
}

// Get practitioner by location
async function findPractitioners(lat, lng, radius = 50) {
  const { data } = await api.get('/practitioners', {
    params: {
      latitude: lat,
      longitude: lng,
      radius,
      acceptingPatients: true,
      verified: true,
    },
  })
  return data
}
```

### React Hook

```typescript
// useHerbs.ts
import { useState, useEffect } from 'react'

interface Herb {
  id: string
  slug: string
  name: string
  scientificName: string
  // ... other fields
}

interface UseHerbsOptions {
  page?: number
  limit?: number
  temperature?: string
}

export function useHerbs(options: UseHerbsOptions = {}) {
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const fetchHerbs = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: String(options.page || 1),
          limit: String(options.limit || 20),
          ...(options.temperature && { temperature: options.temperature }),
        })

        const response = await fetch(
          `https://verscienta.com/api/herbs?${params}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch herbs')
        }

        const data = await response.json()
        setHerbs(data.docs)
        setTotalPages(data.totalPages)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchHerbs()
  }, [options.page, options.limit, options.temperature])

  return { herbs, loading, error, totalPages }
}

// Usage in component
function HerbList() {
  const { herbs, loading, error } = useHerbs({
    page: 1,
    limit: 10,
    temperature: 'Warm',
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {herbs.map(herb => (
        <li key={herb.id}>{herb.name}</li>
      ))}
    </ul>
  )
}
```

---

## Python

### Using Requests Library

```python
import requests
from typing import Dict, List, Optional

class VersientaClient:
    def __init__(self, api_key: Optional[str] = None):
        self.base_url = "https://verscienta.com/api"
        self.api_key = api_key
        self.session = requests.Session()

        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}'
            })

    def get_herbs(self, page: int = 1, limit: int = 20, **filters) -> Dict:
        """Get list of herbs with optional filters."""
        params = {
            'page': page,
            'limit': limit,
            **filters
        }

        response = self.session.get(
            f'{self.base_url}/herbs',
            params=params
        )
        response.raise_for_status()
        return response.json()

    def get_herb(self, slug: str) -> Dict:
        """Get specific herb by slug."""
        response = self.session.get(f'{self.base_url}/herbs/{slug}')
        response.raise_for_status()
        return response.json()

    def search(self, query: str, content_type: str = 'all', **kwargs) -> Dict:
        """Search across content."""
        params = {
            'q': query,
            'type': content_type,
            **kwargs
        }

        response = self.session.get(
            f'{self.base_url}/search',
            params=params
        )
        response.raise_for_status()
        return response.json()

    def analyze_symptoms(self, symptoms: str, age: int = None, gender: str = None) -> Dict:
        """Analyze symptoms with AI (requires API key)."""
        if not self.api_key:
            raise ValueError("API key required for symptom analysis")

        data = {'symptoms': symptoms}
        if age:
            data['age'] = age
        if gender:
            data['gender'] = gender

        response = self.session.post(
            f'{self.base_url}/ai/analyze-symptoms',
            json=data
        )
        response.raise_for_status()
        return response.json()

# Usage
client = VersientaClient()

# Get herbs
herbs = client.get_herbs(page=1, limit=10, temperature='Warm')
print(f"Found {herbs['totalDocs']} herbs")

for herb in herbs['docs']:
    print(f"- {herb['name']} ({herb['scientificName']})")

# Get specific herb
ginseng = client.get_herb('ginseng')
print(f"\n{ginseng['name']}:")
print(f"Temperature: {ginseng['tcmProperties']['temperature']}")
print(f"Taste: {', '.join(ginseng['tcmProperties']['taste'])}")

# Search
results = client.search('immune support', content_type='herbs')
print(f"\nSearch results: {len(results['results'])} found")

# AI Analysis (with API key)
authenticated_client = VersientaClient(api_key='your-api-key')
analysis = authenticated_client.analyze_symptoms(
    symptoms='fatigue, cold hands, low appetite',
    age=35,
    gender='female'
)
print(f"\nAnalysis: {analysis['analysis']}")
print(f"Recommended herbs: {[h['name'] for h in analysis['recommendedHerbs']]}")
```

### Async with aiohttp

```python
import aiohttp
import asyncio
from typing import Dict, List

async def get_herbs_async(page: int = 1, limit: int = 20) -> Dict:
    """Async function to get herbs."""
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f'https://verscienta.com/api/herbs',
            params={'page': page, 'limit': limit}
        ) as response:
            response.raise_for_status()
            return await response.json()

async def get_multiple_herbs(slugs: List[str]) -> List[Dict]:
    """Fetch multiple herbs concurrently."""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for slug in slugs:
            task = session.get(f'https://verscienta.com/api/herbs/{slug}')
            tasks.append(task)

        responses = await asyncio.gather(*tasks)
        herbs = []
        for response in responses:
            response.raise_for_status()
            herbs.append(await response.json())

        return herbs

# Usage
herbs = asyncio.run(get_herbs_async(1, 10))
multiple_herbs = asyncio.run(get_multiple_herbs(['ginseng', 'astragalus', 'licorice']))
```

---

## PHP

### Using cURL

```php
<?php

class VersientaClient {
    private $baseUrl = 'https://verscienta.com/api';
    private $apiKey;

    public function __construct($apiKey = null) {
        $this->apiKey = $apiKey;
    }

    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        $headers = ['Content-Type: application/json'];
        if ($this->apiKey) {
            $headers[] = 'Authorization: Bearer ' . $this->apiKey;
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($data && ($method === 'POST' || $method === 'PUT')) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("HTTP Error: $httpCode");
        }

        return json_decode($response, true);
    }

    public function getHerbs($page = 1, $limit = 20, $filters = []) {
        $params = array_merge(['page' => $page, 'limit' => $limit], $filters);
        $query = http_build_query($params);
        return $this->request('GET', "/herbs?$query");
    }

    public function getHerb($slug) {
        return $this->request('GET', "/herbs/$slug");
    }

    public function search($query, $type = 'all') {
        $params = http_build_query(['q' => $query, 'type' => $type]);
        return $this->request('GET', "/search?$params");
    }

    public function analyzeSymptoms($symptoms, $age = null, $gender = null) {
        $data = ['symptoms' => $symptoms];
        if ($age) $data['age'] = $age;
        if ($gender) $data['gender'] = $gender;

        return $this->request('POST', '/ai/analyze-symptoms', $data);
    }
}

// Usage
$client = new VersientaClient();

// Get herbs
$herbs = $client->getHerbs(1, 10, ['temperature' => 'Warm']);
echo "Found {$herbs['totalDocs']} herbs\n";

foreach ($herbs['docs'] as $herb) {
    echo "- {$herb['name']} ({$herb['scientificName']})\n";
}

// Get specific herb
$ginseng = $client->getHerb('ginseng');
echo "\n{$ginseng['name']}:\n";
echo "Temperature: {$ginseng['tcmProperties']['temperature']}\n";

// Search
$results = $client->search('immune support', 'herbs');
echo "\nSearch results: " . count($results['results']) . " found\n";

// AI Analysis (with API key)
$authClient = new VersientaClient('your-api-key');
$analysis = $authClient->analyzeSymptoms(
    'fatigue, cold hands, low appetite',
    35,
    'female'
);
echo "\nAnalysis: {$analysis['analysis']}\n";
?>
```

---

## Ruby

### Using Net::HTTP

```ruby
require 'net/http'
require 'json'
require 'uri'

class VersientaClient
  BASE_URL = 'https://verscienta.com/api'

  def initialize(api_key = nil)
    @api_key = api_key
  end

  def get_herbs(page: 1, limit: 20, **filters)
    params = { page: page, limit: limit }.merge(filters)
    request(:get, '/herbs', params: params)
  end

  def get_herb(slug)
    request(:get, "/herbs/#{slug}")
  end

  def search(query, type: 'all', **options)
    params = { q: query, type: type }.merge(options)
    request(:get, '/search', params: params)
  end

  def analyze_symptoms(symptoms, age: nil, gender: nil)
    data = { symptoms: symptoms }
    data[:age] = age if age
    data[:gender] = gender if gender

    request(:post, '/ai/analyze-symptoms', body: data)
  end

  private

  def request(method, endpoint, params: nil, body: nil)
    uri = URI("#{BASE_URL}#{endpoint}")
    uri.query = URI.encode_www_form(params) if params

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = case method
              when :get
                Net::HTTP::Get.new(uri)
              when :post
                Net::HTTP::Post.new(uri)
              end

    request['Content-Type'] = 'application/json'
    request['Authorization'] = "Bearer #{@api_key}" if @api_key
    request.body = body.to_json if body

    response = http.request(request)

    raise "HTTP Error: #{response.code}" unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  end
end

# Usage
client = VersientaClient.new

# Get herbs
herbs = client.get_herbs(page: 1, limit: 10, temperature: 'Warm')
puts "Found #{herbs['totalDocs']} herbs"

herbs['docs'].each do |herb|
  puts "- #{herb['name']} (#{herb['scientificName']})"
end

# Get specific herb
ginseng = client.get_herb('ginseng')
puts "\n#{ginseng['name']}:"
puts "Temperature: #{ginseng['tcmProperties']['temperature']}"

# Search
results = client.search('immune support', type: 'herbs')
puts "\nSearch results: #{results['results'].length} found"

# AI Analysis (with API key)
auth_client = VersientaClient.new('your-api-key')
analysis = auth_client.analyze_symptoms(
  'fatigue, cold hands, low appetite',
  age: 35,
  gender: 'female'
)
puts "\nAnalysis: #{analysis['analysis']}"
```

---

## cURL

### Basic Requests

**Get list of herbs:**

```bash
curl "https://verscienta.com/api/herbs?page=1&limit=10"
```

**Get specific herb:**

```bash
curl "https://verscienta.com/api/herbs/ginseng"
```

**Search:**

```bash
curl "https://verscienta.com/api/search?q=immune+support&type=herbs"
```

**Filter herbs by TCM properties:**

```bash
curl "https://verscienta.com/api/herbs?temperature=Warm&taste=Sweet&page=1&limit=20"
```

**AI Symptom Analysis (with API key):**

```bash
curl -X POST "https://verscienta.com/api/ai/analyze-symptoms" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "symptoms": "fatigue, cold hands, low appetite",
    "age": 35,
    "gender": "female"
  }'
```

### With Pretty Output

```bash
# Install jq for JSON formatting
# macOS: brew install jq
# Ubuntu: sudo apt install jq

curl -s "https://verscienta.com/api/herbs/ginseng" | jq '.'

# Extract specific fields
curl -s "https://verscienta.com/api/herbs/ginseng" | jq '.name, .scientificName, .tcmProperties.temperature'
```

---

## Common Use Cases

### Building a Herb Search Widget

```javascript
class HerbSearch {
  constructor(apiKey = null) {
    this.baseUrl = 'https://verscienta.com/api'
    this.apiKey = apiKey
  }

  async searchWithAutocomplete(query) {
    if (query.length < 2) return []

    const response = await fetch(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=herbs&limit=5`
    )

    if (!response.ok) throw new Error('Search failed')

    const data = await response.json()
    return data.results.map(herb => ({
      label: `${herb.name} (${herb.scientificName})`,
      value: herb.slug,
      ...herb
    }))
  }

  async getHerbDetails(slug) {
    const response = await fetch(`${this.baseUrl}/herbs/${slug}`)
    if (!response.ok) throw new Error('Herb not found')
    return await response.json()
  }
}

// Usage in web page
const search = new HerbSearch()
const searchInput = document.getElementById('herb-search')
const resultsDiv = document.getElementById('results')

searchInput.addEventListener('input', async (e) => {
  const results = await search.searchWithAutocomplete(e.target.value)

  resultsDiv.innerHTML = results.map(herb => `
    <div class="result" data-slug="${herb.slug}">
      <h4>${herb.name}</h4>
      <p>${herb.scientificName}</p>
    </div>
  `).join('')
})
```

### Finding Nearby Practitioners

```python
import requests
from geopy.geocoders import Nominatim
from typing import List, Dict

class PractitionerFinder:
    def __init__(self):
        self.base_url = "https://verscienta.com/api"
        self.geolocator = Nominatim(user_agent="verscienta_app")

    def get_coordinates(self, address: str) -> tuple:
        """Convert address to coordinates."""
        location = self.geolocator.geocode(address)
        if not location:
            raise ValueError(f"Could not geocode address: {address}")
        return (location.latitude, location.longitude)

    def find_practitioners(
        self,
        address: str,
        radius_km: int = 50,
        specialty: str = None,
        verified_only: bool = True
    ) -> List[Dict]:
        """Find practitioners near an address."""
        lat, lng = self.get_coordinates(address)

        params = {
            'latitude': lat,
            'longitude': lng,
            'radius': radius_km,
            'acceptingPatients': True,
        }

        if verified_only:
            params['verified'] = True
        if specialty:
            params['specialty'] = specialty

        response = requests.get(
            f'{self.base_url}/practitioners',
            params=params
        )
        response.raise_for_status()

        return response.json()['docs']

    def display_practitioners(self, practitioners: List[Dict]):
        """Display practitioner information."""
        print(f"Found {len(practitioners)} practitioners:\n")

        for p in practitioners:
            print(f"{p['name']}")
            print(f"  Credentials: {', '.join(p['credentials'])}")
            print(f"  Location: {p['location']['city']}, {p['location']['state']}")
            print(f"  Rating: {p.get('rating', 'N/A')} ({p.get('reviewCount', 0)} reviews)")
            print(f"  Accepting Patients: {'Yes' if p['acceptingPatients'] else 'No'}")
            print()

# Usage
finder = PractitionerFinder()
practitioners = finder.find_practitioners(
    address="123 Main St, San Francisco, CA",
    radius_km=25,
    specialty="Acupuncture",
    verified_only=True
)
finder.display_practitioners(practitioners)
```

### Rate Limit Handling

```typescript
class RateLimitedClient {
  private baseUrl = 'https://verscienta.com/api'
  private requestQueue: Array<() => Promise<any>> = []
  private processing = false

  async request(endpoint: string, options: RequestInit = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, options)

          // Check rate limit headers
          const remaining = response.headers.get('X-RateLimit-Remaining')
          const reset = response.headers.get('X-RateLimit-Reset')

          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
            console.log(`Rate limited. Waiting ${retryAfter} seconds...`)
            await this.sleep(retryAfter * 1000)
            return this.request(endpoint, options) // Retry
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          resolve(data)

          // Add delay if approaching rate limit
          if (remaining && parseInt(remaining) < 10) {
            await this.sleep(1000)
          }
        } catch (error) {
          reject(error)
        }
      })

      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    this.processing = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!
      await request()
      await this.sleep(100) // Small delay between requests
    }

    this.processing = false
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

---

## Best Practices

### 1. Error Handling

```javascript
async function safeRequest(url) {
  try {
    const response = await fetch(url)

    // Handle different status codes
    if (response.status === 404) {
      console.error('Resource not found')
      return null
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      console.log(`Rate limited. Retry after ${retryAfter} seconds`)
      throw new Error('RATE_LIMITED')
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error.message === 'RATE_LIMITED') {
      // Handle rate limiting
    } else if (error.name === 'TypeError') {
      // Network error
      console.error('Network error:', error)
    } else {
      console.error('Request failed:', error)
    }
    throw error
  }
}
```

### 2. Caching Responses

```javascript
class CachedClient {
  constructor() {
    this.cache = new Map()
    this.cacheDuration = 60 * 60 * 1000 // 1 hour
  }

  async get(endpoint) {
    const cached = this.cache.get(endpoint)

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log('Cache hit:', endpoint)
      return cached.data
    }

    console.log('Cache miss:', endpoint)
    const response = await fetch(`https://verscienta.com/api${endpoint}`)
    const data = await response.json()

    this.cache.set(endpoint, {
      data,
      timestamp: Date.now()
    })

    return data
  }

  invalidate(endpoint) {
    this.cache.delete(endpoint)
  }
}
```

### 3. Batch Requests

```javascript
async function batchGetHerbs(slugs) {
  // Instead of making N requests sequentially
  // Make them concurrently

  const promises = slugs.map(slug =>
    fetch(`https://verscienta.com/api/herbs/${slug}`)
      .then(r => r.json())
  )

  return await Promise.all(promises)
}

// Usage
const herbs = await batchGetHerbs(['ginseng', 'astragalus', 'licorice'])
```

### 4. Pagination Handling

```javascript
async function getAllHerbs() {
  const allHerbs = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await fetch(
      `https://verscienta.com/api/herbs?page=${page}&limit=100`
    )
    const data = await response.json()

    allHerbs.push(...data.docs)
    hasMore = data.hasNextPage
    page++

    // Add small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return allHerbs
}
```

### 5. Secure API Key Storage

```javascript
// ❌ Don't: Hardcode API keys
const apiKey = 'sk_live_abc123...'

// ✅ Do: Use environment variables
const apiKey = process.env.VERSCIENTA_API_KEY

// ✅ Do: Use server-side only
// Never expose API keys in client-side code
```

---

## Support

For more examples and help:

- **Documentation**: https://verscienta.com/api-docs
- **GitHub Discussions**: https://github.com/verscienta/verscienta-health/discussions
- **Email**: developers@verscienta.com

---

**Happy coding! 🌿**
