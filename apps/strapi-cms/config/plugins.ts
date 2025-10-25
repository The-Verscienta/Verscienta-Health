export default ({ env }) => ({
  upload: {
    config: {
      // Cloudflare Images for optimized image delivery
      // Fallback to R2 if Cloudflare Images is not configured
      provider: env('CLOUDFLARE_IMAGES_API_TOKEN') ? 'cloudflare-images' : 'aws-s3',
      providerOptions: env('CLOUDFLARE_IMAGES_API_TOKEN')
        ? {
            // Cloudflare Images configuration
            accountId: env('CLOUDFLARE_ACCOUNT_ID'),
            apiToken: env('CLOUDFLARE_IMAGES_API_TOKEN'),
            deliveryUrl: env('CLOUDFLARE_IMAGES_DELIVERY_URL', 'https://imagedelivery.net'),
          }
        : {
            // Fallback to R2 (S3-compatible)
            s3Options: {
              credentials: {
                accessKeyId: env('CLOUDFLARE_ACCESS_KEY_ID'),
                secretAccessKey: env('CLOUDFLARE_SECRET_ACCESS_KEY'),
              },
              region: 'auto',
              params: {
                Bucket: env('CLOUDFLARE_BUCKET_NAME', 'verscienta-media'),
              },
              endpoint: `https://${env('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
            },
          },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  sentry: {
    enabled: env.bool('SENTRY_ENABLED', true),
    config: {
      dsn: env('SENTRY_DSN'),
      environment: env('NODE_ENV', 'development'),
      sendMetadata: true,
    },
  },
  'strapi-algolia': {
    enabled: true,
    config: {
      apiKey: env('ALGOLIA_ADMIN_API_KEY'),
      applicationId: env('ALGOLIA_APP_ID'),
      contentTypes: [
        {
          name: 'api::herb.herb',
          index: 'herbs',
          populate: {
            featuredImage: true,
            tcmProperties: true,
            actions: true,
            channels: true,
          },
        },
        {
          name: 'api::formula.formula',
          index: 'formulas',
          populate: {
            ingredients: true,
            actions: true,
            conditions: true,
          },
        },
        {
          name: 'api::condition.condition',
          index: 'conditions',
          populate: {
            symptoms: true,
            relatedHerbs: true,
            relatedFormulas: true,
          },
        },
        {
          name: 'api::practitioner.practitioner',
          index: 'practitioners',
          populate: {
            photo: true,
            modalities: true,
            certifications: true,
          },
        },
      ],
    },
  },
});
