export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Proxy configuration for Coolify/Traefik (Strapi v5 format)
  // Enables Koa's built-in method for trusted reverse proxies
  proxy: {
    koa: true,
  },
  url: env('PUBLIC_URL', 'http://localhost:1337'),
})
