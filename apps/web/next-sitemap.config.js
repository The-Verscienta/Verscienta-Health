/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/admin',
    '/login',
    '/register',
    '/settings',
    '/profile',
    '/server-sitemap.xml', // Dynamic sitemap
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://verscienta.com/server-sitemap.xml', // Dynamic content from CMS
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/settings', '/profile'],
      },
    ],
  },
  // Transform function to customize URLs
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path.includes('/herbs/') || path.includes('/conditions/') ? 'weekly' : 'monthly',
      priority: path === '/' ? 1.0 : path.includes('/herbs/') ? 0.8 : 0.5,
      lastmod: new Date().toISOString(),
    }
  },
}
