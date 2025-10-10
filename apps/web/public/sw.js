if (!self.define) {
  let e,
    c = {}
  const s = (s, a) => (
    (s = new URL(s + '.js', a).href),
    c[s] ||
      new Promise((c) => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;(e.src = s), (e.onload = c), document.head.appendChild(e)
        } else (e = s), importScripts(s), c()
      }).then(() => {
        let e = c[s]
        if (!e) throw new Error(`Module ${s} didn’t register its module`)
        return e
      })
  )
  self.define = (a, t) => {
    const i = e || ('document' in self ? document.currentScript.src : '') || location.href
    if (c[i]) return
    let n = {}
    const r = (e) => s(e, i),
      o = { module: { uri: i }, exports: n, require: r }
    c[i] = Promise.all(a.map((e) => o[e] || r(e))).then((e) => (t(...e), n))
  }
}
define(['./workbox-01fd22c6'], function (e) {
  'use strict'
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: 'ea9c9603c7c0ea486ed4d7daf8ba2197' },
        {
          url: '/_next/static/OdYSG9eQ5Ck_gELWtL97d/_buildManifest.js',
          revision: 'dcfc8ab758ca5240436775504ffddea7',
        },
        {
          url: '/_next/static/OdYSG9eQ5Ck_gELWtL97d/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/1112-b40921eec83c929f.js', revision: 'b40921eec83c929f' },
        { url: '/_next/static/chunks/1186d840.0fc5819fac4739e3.js', revision: '0fc5819fac4739e3' },
        { url: '/_next/static/chunks/1675-bc19003fb84e9ca3.js', revision: 'bc19003fb84e9ca3' },
        { url: '/_next/static/chunks/191-0bc7596791e5ca7d.js', revision: '0bc7596791e5ca7d' },
        { url: '/_next/static/chunks/3064-7cf3d0aad1212501.js', revision: '7cf3d0aad1212501' },
        { url: '/_next/static/chunks/3625-aef8c520a816ac1a.js', revision: 'aef8c520a816ac1a' },
        { url: '/_next/static/chunks/3739.2a755acbea21d10a.js', revision: '2a755acbea21d10a' },
        { url: '/_next/static/chunks/4201-23841d9df7215efa.js', revision: '23841d9df7215efa' },
        { url: '/_next/static/chunks/5297-5a1cc21d71e6b666.js', revision: '5a1cc21d71e6b666' },
        { url: '/_next/static/chunks/6630.a2c5aa1151b428cf.js', revision: 'a2c5aa1151b428cf' },
        { url: '/_next/static/chunks/70873206-2c4e52495c0ec266.js', revision: '2c4e52495c0ec266' },
        { url: '/_next/static/chunks/7890-98ae8e3505c2100e.js', revision: '98ae8e3505c2100e' },
        { url: '/_next/static/chunks/8333-3e7fc3e0c69ce222.js', revision: '3e7fc3e0c69ce222' },
        { url: '/_next/static/chunks/8709-17e49d85c016add5.js', revision: '17e49d85c016add5' },
        { url: '/_next/static/chunks/8866.a0b3922ad57a935f.js', revision: 'a0b3922ad57a935f' },
        { url: '/_next/static/chunks/9339-e5b97487b3259d8c.js', revision: 'e5b97487b3259d8c' },
        { url: '/_next/static/chunks/9884-ea667df9dec8528b.js', revision: 'ea667df9dec8528b' },
        {
          url: '/_next/static/chunks/app/_not-found/page-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/about/page-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api-docs/page-33be35eaa5844e03.js',
          revision: '33be35eaa5844e03',
        },
        {
          url: '/_next/static/chunks/app/api/auth/%5B...all%5D/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/auth/mfa/setup/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/contact/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/grok/symptom-analysis/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/health/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/herbs/%5Bslug%5D/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/internal/security-alert/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/profile/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/settings/delete-account/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/api/settings/password/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/conditions/%5Bslug%5D/page-66f38a627ec97493.js',
          revision: '66f38a627ec97493',
        },
        {
          url: '/_next/static/chunks/app/conditions/page-c73f746f50039416.js',
          revision: 'c73f746f50039416',
        },
        {
          url: '/_next/static/chunks/app/contact/page-4007027a632f49e7.js',
          revision: '4007027a632f49e7',
        },
        {
          url: '/_next/static/chunks/app/disclaimer/page-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/formulas/%5Bslug%5D/page-68600becbefe6764.js',
          revision: '68600becbefe6764',
        },
        {
          url: '/_next/static/chunks/app/formulas/page-c73f746f50039416.js',
          revision: 'c73f746f50039416',
        },
        {
          url: '/_next/static/chunks/app/herbs/%5Bslug%5D/page-3322d1c2d870c634.js',
          revision: '3322d1c2d870c634',
        },
        {
          url: '/_next/static/chunks/app/herbs/page-cd116dacd28fdb5a.js',
          revision: 'cd116dacd28fdb5a',
        },
        {
          url: '/_next/static/chunks/app/layout-cef54c772659d12a.js',
          revision: 'cef54c772659d12a',
        },
        {
          url: '/_next/static/chunks/app/loading-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/login/page-0a98b9aacae9e2e2.js',
          revision: '0a98b9aacae9e2e2',
        },
        {
          url: '/_next/static/chunks/app/modalities/%5Bslug%5D/page-8d868e91ac83b691.js',
          revision: '8d868e91ac83b691',
        },
        {
          url: '/_next/static/chunks/app/modalities/page-c73f746f50039416.js',
          revision: 'c73f746f50039416',
        },
        {
          url: '/_next/static/chunks/app/not-found-19a80ea4059b212b.js',
          revision: '19a80ea4059b212b',
        },
        { url: '/_next/static/chunks/app/page-84f6d72870d559f6.js', revision: '84f6d72870d559f6' },
        {
          url: '/_next/static/chunks/app/practitioners/%5Bslug%5D/page-d4dcd7226084e128.js',
          revision: 'd4dcd7226084e128',
        },
        {
          url: '/_next/static/chunks/app/practitioners/page-b6092ef70d848faf.js',
          revision: 'b6092ef70d848faf',
        },
        {
          url: '/_next/static/chunks/app/privacy/page-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/profile/page-58520f83f8eef463.js',
          revision: '58520f83f8eef463',
        },
        {
          url: '/_next/static/chunks/app/register/page-b4e823d4b309ea9a.js',
          revision: 'b4e823d4b309ea9a',
        },
        {
          url: '/_next/static/chunks/app/robots.txt/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/search/page-afc7575cbe7212b0.js',
          revision: 'afc7575cbe7212b0',
        },
        {
          url: '/_next/static/chunks/app/settings/page-aaedc143e669123b.js',
          revision: 'aaedc143e669123b',
        },
        {
          url: '/_next/static/chunks/app/sitemap.xml/route-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        {
          url: '/_next/static/chunks/app/symptom-checker/page-1b76676f28f84913.js',
          revision: '1b76676f28f84913',
        },
        {
          url: '/_next/static/chunks/app/terms/page-953c0cc5158c3b47.js',
          revision: '953c0cc5158c3b47',
        },
        { url: '/_next/static/chunks/fe69a73d-d66f56b3a3a1b691.js', revision: 'd66f56b3a3a1b691' },
        { url: '/_next/static/chunks/framework-c4874602ed7431ea.js', revision: 'c4874602ed7431ea' },
        { url: '/_next/static/chunks/main-94c1dda080f93e57.js', revision: '94c1dda080f93e57' },
        { url: '/_next/static/chunks/main-app-a0595a5b23e1b0ec.js', revision: 'a0595a5b23e1b0ec' },
        {
          url: '/_next/static/chunks/pages/_app-6c4263292017ffbb.js',
          revision: '6c4263292017ffbb',
        },
        {
          url: '/_next/static/chunks/pages/_error-3c472617a1f84350.js',
          revision: '3c472617a1f84350',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/webpack-559b11dc74278fa9.js', revision: '559b11dc74278fa9' },
        { url: '/_next/static/css/3f9e96ae2b4f71bd.css', revision: '3f9e96ae2b4f71bd' },
        { url: '/_next/static/css/c65696011e54f24a.css', revision: 'c65696011e54f24a' },
        {
          url: '/_next/static/media/0aa834ed78bf6d07-s.woff2',
          revision: '324703f03c390d2e2a4f387de85fe63d',
        },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        },
        {
          url: '/_next/static/media/19d1df89b922a96a-s.woff2',
          revision: '4f1e956301be0d14286d1b2ae92f792d',
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541',
        },
        {
          url: '/_next/static/media/3296bccdacdd55f7-s.p.woff2',
          revision: '1b9819b24a0a246c2675c1fe9c75bee2',
        },
        {
          url: '/_next/static/media/5bde35a59d0f161b-s.woff2',
          revision: '29bde146cc8937cbc56d802513336b27',
        },
        {
          url: '/_next/static/media/67957d42bae0796d-s.woff2',
          revision: '54f02056e07c55023315568c637e3a96',
        },
        {
          url: '/_next/static/media/886030b0b59bc5a7-s.woff2',
          revision: 'c94e6e6c23e789fcb0fc60d790c9d2c1',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/939c4f875ee75fbb-s.woff2',
          revision: '4a4e74bed5809194e4bc6538eb1a1e30',
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
        },
        {
          url: '/_next/static/media/bb3ef058b751a6ad-s.p.woff2',
          revision: '782150e6836b9b074d1a798807adcb18',
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        {
          url: '/_next/static/media/f911b923c6adde36-s.woff2',
          revision: '0f8d347d49960d05c9430d83e49edeb7',
        },
        { url: '/_next/static/media/layers-2x.9859cd12.png', revision: '9859cd12' },
        { url: '/_next/static/media/layers.ef6db872.png', revision: 'ef6db872' },
        { url: '/_next/static/media/marker-icon.d577052a.png', revision: 'd577052a' },
        { url: '/manifest.json', revision: 'aa308136c5780778ec07748dd3f1ab79' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: c, event: s, state: a }) =>
              c && 'opaqueredirect' === c.type
                ? new Response(c.body, { status: 200, statusText: 'OK', headers: c.headers })
                : c,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var c = e.url
        if (
          !(c.origin === new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').origin)
        )
          return !1
        var s = c.pathname
        return !s.startsWith('/api/') && !s.includes('/admin')
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    )
})
