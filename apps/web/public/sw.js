if (!self.define) {
  let e,
    s = {}
  const c = (c, a) => (
    (c = new URL(c + '.js', a).href),
    s[c] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;(e.src = c), (e.onload = s), document.head.appendChild(e)
        } else (e = c), importScripts(c), s()
      }).then(() => {
        let e = s[c]
        if (!e) throw new Error(`Module ${c} didn’t register its module`)
        return e
      })
  )
  self.define = (a, t) => {
    const i = e || ('document' in self ? document.currentScript.src : '') || location.href
    if (s[i]) return
    let n = {}
    const f = (e) => c(e, i),
      b = { module: { uri: i }, exports: n, require: f }
    s[i] = Promise.all(a.map((e) => b[e] || f(e))).then((e) => (t(...e), n))
  }
}
define(['./workbox-01fd22c6'], function (e) {
  'use strict'
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '1bc029149c745ed6f3d1c8df64719498' },
        { url: '/_next/static/chunks/1044.ae287e9a3667882b.js', revision: 'ae287e9a3667882b' },
        { url: '/_next/static/chunks/1101-144d7e7d693a241d.js', revision: '144d7e7d693a241d' },
        { url: '/_next/static/chunks/1111.01b446252e970505.js', revision: '01b446252e970505' },
        { url: '/_next/static/chunks/1149-9e7c67a4db743bdf.js', revision: '9e7c67a4db743bdf' },
        { url: '/_next/static/chunks/1187-69283d78202eda4d.js', revision: '69283d78202eda4d' },
        { url: '/_next/static/chunks/135-b7800980c452afe2.js', revision: 'b7800980c452afe2' },
        { url: '/_next/static/chunks/139-a60282da1a500414.js', revision: 'a60282da1a500414' },
        { url: '/_next/static/chunks/1401.f1813b02e6ee3c4e.js', revision: 'f1813b02e6ee3c4e' },
        { url: '/_next/static/chunks/1743.5224ec91263e6163.js', revision: '5224ec91263e6163' },
        { url: '/_next/static/chunks/2109-491d88dfb700c97f.js', revision: '491d88dfb700c97f' },
        { url: '/_next/static/chunks/2506.391b183517878d6b.js', revision: '391b183517878d6b' },
        { url: '/_next/static/chunks/2567-20000cd81d4c1feb.js', revision: '20000cd81d4c1feb' },
        { url: '/_next/static/chunks/2623.14280a928a8db654.js', revision: '14280a928a8db654' },
        { url: '/_next/static/chunks/264.dfa5675b02779e4f.js', revision: 'dfa5675b02779e4f' },
        { url: '/_next/static/chunks/2878.976c601eb5ad897d.js', revision: '976c601eb5ad897d' },
        { url: '/_next/static/chunks/2971.8268a23a49e9cad7.js', revision: '8268a23a49e9cad7' },
        { url: '/_next/static/chunks/2978.9e6910afc7fe1684.js', revision: '9e6910afc7fe1684' },
        { url: '/_next/static/chunks/3176.5ff36feb02b2a960.js', revision: '5ff36feb02b2a960' },
        { url: '/_next/static/chunks/3223f137-bca431b1647afbea.js', revision: 'bca431b1647afbea' },
        { url: '/_next/static/chunks/3337-7b7bf72f3ddddc51.js', revision: '7b7bf72f3ddddc51' },
        { url: '/_next/static/chunks/342.3238545a91c4ae38.js', revision: '3238545a91c4ae38' },
        { url: '/_next/static/chunks/3436.00ff2a48d8079024.js', revision: '00ff2a48d8079024' },
        { url: '/_next/static/chunks/3530.aa7ddf4cda960c16.js', revision: 'aa7ddf4cda960c16' },
        { url: '/_next/static/chunks/3548.c923fe7c036d8cd4.js', revision: 'c923fe7c036d8cd4' },
        { url: '/_next/static/chunks/3592.e515fc7b1c618b5b.js', revision: 'e515fc7b1c618b5b' },
        { url: '/_next/static/chunks/3695.301aaa5d3e30e400.js', revision: '301aaa5d3e30e400' },
        { url: '/_next/static/chunks/3782.6332f6ad44c552aa.js', revision: '6332f6ad44c552aa' },
        { url: '/_next/static/chunks/3806.e32dc730042d2153.js', revision: 'e32dc730042d2153' },
        { url: '/_next/static/chunks/3864.b52267fce4a3efe7.js', revision: 'b52267fce4a3efe7' },
        { url: '/_next/static/chunks/4015-3408b3b5b1437171.js', revision: '3408b3b5b1437171' },
        { url: '/_next/static/chunks/455.c2c60532d39b2b1c.js', revision: 'c2c60532d39b2b1c' },
        { url: '/_next/static/chunks/4553.fa9d78013cd873eb.js', revision: 'fa9d78013cd873eb' },
        { url: '/_next/static/chunks/459-e783f59f144d7619.js', revision: 'e783f59f144d7619' },
        { url: '/_next/static/chunks/4791-fb85f8afd46c9006.js', revision: 'fb85f8afd46c9006' },
        { url: '/_next/static/chunks/4964.7602b177a3339699.js', revision: '7602b177a3339699' },
        { url: '/_next/static/chunks/4998.cf98b53b5c74042e.js', revision: 'cf98b53b5c74042e' },
        { url: '/_next/static/chunks/5077-b1f6323e494cf1bc.js', revision: 'b1f6323e494cf1bc' },
        { url: '/_next/static/chunks/5647.29b4224a25f7cc7f.js', revision: '29b4224a25f7cc7f' },
        { url: '/_next/static/chunks/5657.481b4cf475f86b33.js', revision: '481b4cf475f86b33' },
        { url: '/_next/static/chunks/5672.27339ad830664a43.js', revision: '27339ad830664a43' },
        { url: '/_next/static/chunks/5736-9d01975c638404b0.js', revision: '9d01975c638404b0' },
        { url: '/_next/static/chunks/5918.4fd1f9e095e3bbb3.js', revision: '4fd1f9e095e3bbb3' },
        { url: '/_next/static/chunks/6023-037bef71f3eb8891.js', revision: '037bef71f3eb8891' },
        { url: '/_next/static/chunks/609.2fceea68f9ed5b3d.js', revision: '2fceea68f9ed5b3d' },
        { url: '/_next/static/chunks/6629.9cd44c462bce7550.js', revision: '9cd44c462bce7550' },
        { url: '/_next/static/chunks/6731.4c28432a57fdfee4.js', revision: '4c28432a57fdfee4' },
        { url: '/_next/static/chunks/6793.d6e3d5c6e87ceeb1.js', revision: 'd6e3d5c6e87ceeb1' },
        { url: '/_next/static/chunks/6984.bb1536317f141bc1.js', revision: 'bb1536317f141bc1' },
        { url: '/_next/static/chunks/6987.49d99b9f6f2e1b8d.js', revision: '49d99b9f6f2e1b8d' },
        { url: '/_next/static/chunks/6bbf2eaa-c2b999731c856542.js', revision: 'c2b999731c856542' },
        { url: '/_next/static/chunks/7186.b053a9344d69084e.js', revision: 'b053a9344d69084e' },
        { url: '/_next/static/chunks/7296-4bbb8dc9c3043963.js', revision: '4bbb8dc9c3043963' },
        { url: '/_next/static/chunks/7545.1f8957342e0fba2f.js', revision: '1f8957342e0fba2f' },
        { url: '/_next/static/chunks/7752-bf78bd141280c155.js', revision: 'bf78bd141280c155' },
        { url: '/_next/static/chunks/8020.83b898882727b3aa.js', revision: '83b898882727b3aa' },
        { url: '/_next/static/chunks/8287.5bc75fb6a914964d.js', revision: '5bc75fb6a914964d' },
        { url: '/_next/static/chunks/8461-51e171d255c41fcb.js', revision: '51e171d255c41fcb' },
        { url: '/_next/static/chunks/8658.ba58536c14a13846.js', revision: 'ba58536c14a13846' },
        { url: '/_next/static/chunks/8717.a98653201727f3b5.js', revision: 'a98653201727f3b5' },
        { url: '/_next/static/chunks/8779.af79c9cd82dd729f.js', revision: 'af79c9cd82dd729f' },
        { url: '/_next/static/chunks/8969.bdd3ff313cd1d974.js', revision: 'bdd3ff313cd1d974' },
        { url: '/_next/static/chunks/9.70c5e4458fde2aa5.js', revision: '70c5e4458fde2aa5' },
        { url: '/_next/static/chunks/902.5c8dc747bb9e8033.js', revision: '5c8dc747bb9e8033' },
        { url: '/_next/static/chunks/9032.69348b8c37a80971.js', revision: '69348b8c37a80971' },
        { url: '/_next/static/chunks/9054.b9a34e37d98c6ffa.js', revision: 'b9a34e37d98c6ffa' },
        { url: '/_next/static/chunks/9122.c122ef68961ce133.js', revision: 'c122ef68961ce133' },
        { url: '/_next/static/chunks/9323.0417b8fe86870b9e.js', revision: '0417b8fe86870b9e' },
        { url: '/_next/static/chunks/9373.0d51eb6d3d3f1b26.js', revision: '0d51eb6d3d3f1b26' },
        { url: '/_next/static/chunks/9778.2ae35f6488290b58.js', revision: '2ae35f6488290b58' },
        { url: '/_next/static/chunks/9973.c4b0aef4bfa4f0a1.js', revision: 'c4b0aef4bfa4f0a1' },
        { url: '/_next/static/chunks/a801be0b.877ca1a092186b14.js', revision: '877ca1a092186b14' },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/about/page-5d29f9f27e416da8.js',
          revision: '5d29f9f27e416da8',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/conditions/%5Bslug%5D/page-2eacd960434a6b0c.js',
          revision: '2eacd960434a6b0c',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/conditions/page-8a174c6efbc58df9.js',
          revision: '8a174c6efbc58df9',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/contact/layout-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/contact/page-9a5b100876c3d875.js',
          revision: '9a5b100876c3d875',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/disclaimer/page-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/faq/page-144b4fa8f92007a9.js',
          revision: '144b4fa8f92007a9',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/formulas/%5Bslug%5D/page-3df90f1439d3f7ce.js',
          revision: '3df90f1439d3f7ce',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/formulas/page-8a174c6efbc58df9.js',
          revision: '8a174c6efbc58df9',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/herbs/%5Bslug%5D/page-924ab4926dff9019.js',
          revision: '924ab4926dff9019',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/herbs/page-02db153fabf73591.js',
          revision: '02db153fabf73591',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/layout-13f90979aa58e8dd.js',
          revision: '13f90979aa58e8dd',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/loading-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/login/layout-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/login/page-6051b2279777c7a7.js',
          revision: '6051b2279777c7a7',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/modalities/%5Bslug%5D/page-62108ae93ee5dfd6.js',
          revision: '62108ae93ee5dfd6',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/modalities/page-8a174c6efbc58df9.js',
          revision: '8a174c6efbc58df9',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/not-found-5d29f9f27e416da8.js',
          revision: '5d29f9f27e416da8',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/page-8a174c6efbc58df9.js',
          revision: '8a174c6efbc58df9',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/practitioners/%5Bslug%5D/page-24d9c3bb40f3ef2d.js',
          revision: '24d9c3bb40f3ef2d',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/practitioners/page-b9910c84be76cdfd.js',
          revision: 'b9910c84be76cdfd',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/privacy/page-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/profile/layout-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/profile/page-588c1f389335b67c.js',
          revision: '588c1f389335b67c',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/register/layout-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/register/page-5dc85800467fb16a.js',
          revision: '5dc85800467fb16a',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/search/layout-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/search/page-ac82adc4641ff6a6.js',
          revision: 'ac82adc4641ff6a6',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/settings/layout-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/settings/page-9be91414fd92eaea.js',
          revision: '9be91414fd92eaea',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/symptom-checker/layout-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/symptom-checker/page-ce3504618bfc4c45.js',
          revision: 'ce3504618bfc4c45',
        },
        {
          url: '/_next/static/chunks/app/%5Blang%5D/terms/page-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/(payload)/admin/%5B%5B...segments%5D%5D/page-dec7ad754e43bab9.js',
          revision: 'dec7ad754e43bab9',
        },
        {
          url: '/_next/static/chunks/app/(payload)/api/%5B...slug%5D/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/(payload)/graphql/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/(payload)/layout-dd01e2dd48418bbf.js',
          revision: 'dd01e2dd48418bbf',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-d0492732a9d22685.js',
          revision: 'd0492732a9d22685',
        },
        {
          url: '/_next/static/chunks/app/api-docs/page-01d4fa6a6a5845de.js',
          revision: '01d4fa6a6a5845de',
        },
        {
          url: '/_next/static/chunks/app/api/admin/account-lockout/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/admin/api-logs/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/admin/security-breach/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/admin/security-events/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/auth/%5B...all%5D/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/auth/mfa/setup/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/auth/session-log/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/contact/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/grok/symptom-analysis/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/health/cert/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/health/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/herbs/%5Bslug%5D/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/images/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/internal/security-alert/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/mobile/config/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/mobile/register-device/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/mobile/sync/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/mobile/unregister-device/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/og/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/profile/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/settings/delete-account/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/api/settings/password/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/layout-6525cb60880cf901.js',
          revision: '6525cb60880cf901',
        },
        { url: '/_next/static/chunks/app/page-5d29f9f27e416da8.js', revision: '5d29f9f27e416da8' },
        {
          url: '/_next/static/chunks/app/robots.txt/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/server-sitemap.xml/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        {
          url: '/_next/static/chunks/app/sitemap.xml/route-0bfd13bc6f0f19be.js',
          revision: '0bfd13bc6f0f19be',
        },
        { url: '/_next/static/chunks/c8f30056-d81e865743de6487.js', revision: 'd81e865743de6487' },
        { url: '/_next/static/chunks/fe074b1f-dac886d3181a7c42.js', revision: 'dac886d3181a7c42' },
        { url: '/_next/static/chunks/fe69a73d.df3d252fa447bb89.js', revision: 'df3d252fa447bb89' },
        { url: '/_next/static/chunks/framework-d8d292e015299cba.js', revision: 'd8d292e015299cba' },
        { url: '/_next/static/chunks/main-app-8c49a1714ef618ea.js', revision: '8c49a1714ef618ea' },
        { url: '/_next/static/chunks/main-e3a3b5569b5064e2.js', revision: 'e3a3b5569b5064e2' },
        {
          url: '/_next/static/chunks/pages/_app-c020ce4123e0f1e8.js',
          revision: 'c020ce4123e0f1e8',
        },
        {
          url: '/_next/static/chunks/pages/_error-0c635c119c6f5f04.js',
          revision: '0c635c119c6f5f04',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/webpack-535e843cca136292.js', revision: '535e843cca136292' },
        { url: '/_next/static/css/270f37f1bedc6185.css', revision: '270f37f1bedc6185' },
        { url: '/_next/static/css/29d56dea62a8cc21.css', revision: '29d56dea62a8cc21' },
        { url: '/_next/static/css/726cdacd827613d4.css', revision: '726cdacd827613d4' },
        { url: '/_next/static/css/bb872523dc8b334a.css', revision: 'bb872523dc8b334a' },
        { url: '/_next/static/css/ef46db3751d8e999.css', revision: 'ef46db3751d8e999' },
        { url: '/_next/static/css/f6f4d5618c5917a9.css', revision: 'f6f4d5618c5917a9' },
        {
          url: '/_next/static/l4Nz3VLWBxO3rFOxdS56y/_buildManifest.js',
          revision: '785469ea08eb565c98900d23d4a277d4',
        },
        {
          url: '/_next/static/l4Nz3VLWBxO3rFOxdS56y/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
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
        {
          url: '/_next/static/media/payload-favicon-dark.c322d81c.png',
          revision: '4c31609aee206e0eb75dd7846f2a772a',
        },
        {
          url: '/_next/static/media/payload-favicon-light.b8a65007.png',
          revision: '382618c44522729f9672b85122fee4b3',
        },
        {
          url: '/_next/static/media/payload-favicon.7c819288.svg',
          revision: 'dbff6f8789f751a54f3af3fdcc5fff76',
        },
        {
          url: '/_next/static/media/static-og-image.477255a8.png',
          revision: '26a4966cdfe30507a10d41f3c6a43e3d',
        },
        { url: '/manifest.json', revision: 'aa308136c5780778ec07748dd3f1ab79' },
        { url: '/robots.txt', revision: '8ce1c61dfeb046fec40e1be9cc48c88d' },
        { url: '/sitemap.xml', revision: 'fb70fbc7aff79659bee632df6d71f1f1' },
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
            cacheWillUpdate: async ({ request: e, response: s, event: c, state: a }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
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
        var s = e.url
        if (
          !(s.origin === new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').origin)
        )
          return !1
        var c = s.pathname
        return !c.startsWith('/api/') && !c.includes('/admin')
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    )
})
