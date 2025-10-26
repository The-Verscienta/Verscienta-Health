export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Proxy configuration for Coolify/Traefik
  // Set to true to trust X-Forwarded-* headers from reverse proxy
  proxy: true,
  url: env('URL', 'http://localhost:1337'),
})
