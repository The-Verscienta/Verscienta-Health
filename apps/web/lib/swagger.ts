/**
 * Swagger/OpenAPI Configuration for Verscienta Health API
 *
 * This file defines the OpenAPI specification for our public API endpoints.
 * API documentation is available at /api-docs
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Verscienta Health API',
    version: '1.0.0',
    description: `
# Verscienta Health Public API

Welcome to the Verscienta Health API documentation. This API provides access to our comprehensive database of herbs, formulas, conditions, and practitioners.

## Features

- **15,000+ Herbs**: Traditional Chinese Medicine (TCM) and Western herbalism properties
- **Herbal Formulas**: Traditional and modern formulas with precise ingredient information
- **Conditions Database**: Health conditions with associated treatments
- **Practitioner Directory**: Find verified holistic health practitioners
- **AI Symptom Analysis**: Get herb recommendations based on symptoms (requires API key)

## Authentication

Some endpoints require authentication. Include your API key in the request header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

Request an API key at: [https://verscienta.com/developers](https://verscienta.com/developers)

## Rate Limiting

- **Public endpoints**: 100 requests per 10 minutes
- **Authenticated endpoints**: 1000 requests per hour
- **AI endpoints**: 20 requests per 10 minutes

Rate limit information is included in response headers:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Requests remaining
- \`X-RateLimit-Reset\`: Time when the rate limit resets (Unix timestamp)

## Support

- **Documentation**: [https://docs.verscienta.com](https://docs.verscienta.com)
- **GitHub Issues**: [https://github.com/verscienta/api-issues](https://github.com/verscienta/api-issues)
- **Email**: developers@verscienta.com
    `,
    contact: {
      name: 'Verscienta Health API Support',
      email: 'developers@verscienta.com',
      url: 'https://verscienta.com/developers',
    },
    license: {
      name: 'Proprietary',
      url: 'https://verscienta.com/terms',
    },
  },
  servers: [
    {
      url: 'https://verscienta.com/api',
      description: 'Production server',
    },
    {
      url: 'https://staging.verscienta.com/api',
      description: 'Staging server',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Herbs',
      description: 'Operations related to herbs and herbal medicine',
    },
    {
      name: 'Formulas',
      description: 'Traditional and modern herbal formulas',
    },
    {
      name: 'Conditions',
      description: 'Health conditions and associated treatments',
    },
    {
      name: 'Practitioners',
      description: 'Find and manage practitioner profiles',
    },
    {
      name: 'Search',
      description: 'Advanced search capabilities',
    },
    {
      name: 'AI',
      description: 'AI-powered symptom analysis and recommendations',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your API key',
      },
    },
    schemas: {
      Herb: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'cm123abc456',
          },
          slug: {
            type: 'string',
            example: 'ginseng',
          },
          name: {
            type: 'string',
            example: 'Ginseng',
          },
          scientificName: {
            type: 'string',
            example: 'Panax ginseng',
          },
          commonNames: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Korean Ginseng', 'Asian Ginseng', 'Ren Shen'],
          },
          pinyinName: {
            type: 'string',
            example: 'Rén Shēn',
          },
          chineseName: {
            type: 'string',
            example: '人参',
          },
          description: {
            type: 'string',
            example: 'Known as the "King of Herbs" in Traditional Chinese Medicine...',
          },
          tcmProperties: {
            type: 'object',
            properties: {
              temperature: {
                type: 'string',
                enum: ['Hot', 'Warm', 'Neutral', 'Cool', 'Cold'],
                example: 'Warm',
              },
              taste: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Sweet', 'Bitter', 'Sour', 'Pungent', 'Salty', 'Bland'],
                },
                example: ['Sweet', 'Slightly Bitter'],
              },
              meridians: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: ['Lung', 'Spleen', 'Heart'],
              },
              actions: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: ['Tonifies Qi', 'Strengthens Spleen', 'Benefits Heart'],
              },
            },
          },
          westernProperties: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Adaptogen', 'Immune Modulator', 'Antioxidant'],
          },
          safetyInfo: {
            type: 'object',
            properties: {
              rating: {
                type: 'string',
                enum: ['Safe', 'Generally Safe', 'Use with Caution', 'Potentially Toxic'],
                example: 'Generally Safe',
              },
              contraindications: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: ['Pregnancy', 'High blood pressure', 'Acute infections'],
              },
              interactions: {
                type: 'array',
                items: {
                  type: 'string',
                },
                example: ['Warfarin', 'MAO inhibitors', 'Stimulants'],
              },
            },
          },
          imageUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://images.verscienta.com/herbs/ginseng.jpg',
          },
          status: {
            type: 'string',
            enum: ['published', 'draft', 'archived'],
            example: 'published',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Formula: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          slug: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          pinyinName: {
            type: 'string',
          },
          chineseName: {
            type: 'string',
          },
          tradition: {
            type: 'string',
            enum: ['TCM', 'Western', 'Ayurveda', 'Other'],
          },
          category: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                herb: {
                  type: 'string',
                },
                quantity: {
                  type: 'string',
                },
                unit: {
                  type: 'string',
                },
                tcmRole: {
                  type: 'string',
                  enum: ['Chief', 'Deputy', 'Assistant', 'Envoy'],
                },
              },
            },
          },
          preparation: {
            type: 'string',
          },
          dosage: {
            type: 'string',
          },
        },
      },
      Condition: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          slug: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          westernName: {
            type: 'string',
          },
          tcmName: {
            type: 'string',
          },
          category: {
            type: 'string',
          },
          severity: {
            type: 'string',
            enum: ['Mild', 'Moderate', 'Severe', 'Critical'],
          },
          description: {
            type: 'string',
          },
          symptoms: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          affectedSystems: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          recommendedHerbs: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          recommendedFormulas: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      Practitioner: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          slug: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          credentials: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          specialties: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          bio: {
            type: 'string',
          },
          location: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
              },
              city: {
                type: 'string',
              },
              state: {
                type: 'string',
              },
              country: {
                type: 'string',
              },
              latitude: {
                type: 'number',
              },
              longitude: {
                type: 'number',
              },
            },
          },
          verified: {
            type: 'boolean',
          },
          acceptingPatients: {
            type: 'boolean',
          },
          rating: {
            type: 'number',
            format: 'float',
          },
          reviewCount: {
            type: 'integer',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          statusCode: {
            type: 'integer',
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          docs: {
            type: 'array',
            items: {},
          },
          totalDocs: {
            type: 'integer',
          },
          page: {
            type: 'integer',
          },
          totalPages: {
            type: 'integer',
          },
          hasNextPage: {
            type: 'boolean',
          },
          hasPrevPage: {
            type: 'boolean',
          },
        },
      },
    },
  },
  paths: {
    '/herbs': {
      get: {
        tags: ['Herbs'],
        summary: 'List all herbs',
        description: 'Retrieve a paginated list of herbs with optional filtering',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1,
            },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 20,
              maximum: 100,
            },
            description: 'Number of items per page',
          },
          {
            name: 'temperature',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['Hot', 'Warm', 'Neutral', 'Cool', 'Cold'],
            },
            description: 'Filter by TCM temperature',
          },
          {
            name: 'taste',
            in: 'query',
            schema: {
              type: 'string',
            },
            description: 'Filter by TCM taste (comma-separated)',
          },
          {
            name: 'meridians',
            in: 'query',
            schema: {
              type: 'string',
            },
            description: 'Filter by meridians (comma-separated)',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PaginatedResponse',
                },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/herbs/{slug}': {
      get: {
        tags: ['Herbs'],
        summary: 'Get herb by slug',
        description: 'Retrieve detailed information about a specific herb',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Herb slug (e.g., "ginseng")',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Herb',
                },
              },
            },
          },
          404: {
            description: 'Herb not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Search across all content',
        description: 'Full-text search across herbs, formulas, and conditions',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Search query',
          },
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['herbs', 'formulas', 'conditions', 'all'],
              default: 'all',
            },
            description: 'Content type to search',
          },
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 20,
            },
          },
        ],
        responses: {
          200: {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {},
                    },
                    total: {
                      type: 'integer',
                    },
                    query: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/ai/analyze-symptoms': {
      post: {
        tags: ['AI'],
        summary: 'Analyze symptoms with AI',
        description: 'Get herb recommendations based on symptom description',
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['symptoms'],
                properties: {
                  symptoms: {
                    type: 'string',
                    description: 'Description of symptoms',
                    example: 'I have a persistent cough with clear phlegm and feel cold',
                  },
                  age: {
                    type: 'integer',
                    example: 35,
                  },
                  gender: {
                    type: 'string',
                    enum: ['male', 'female', 'other'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'AI analysis results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    analysis: {
                      type: 'string',
                    },
                    conditions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                          },
                          confidence: {
                            type: 'number',
                          },
                        },
                      },
                    },
                    recommendedHerbs: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    disclaimer: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - API key required',
          },
          429: {
            description: 'Rate limit exceeded',
          },
        },
      },
    },
  },
}
