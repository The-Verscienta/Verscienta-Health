export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Proxy configuration for Coolify/Traefik
  proxy: env.bool('IS_PROXIED', true),
  url: env('STRAPI_ADMIN_BACKEND_URL', 'http://localhost:1337'),
})
