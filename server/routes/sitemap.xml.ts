import type { H3Event } from 'h3'

/**
 * Route Nitro `GET /sitemap.xml` — LOT 6 (Étape 6.3).
 *
 * Génère dynamiquement le sitemap XML complet pour le référencement naturel (SEO),
 * couvrant :
 * - Les pages statiques (Accueil, Destinations, Langues, Orientation...)
 * - Les fiches destinations, les listes d'écoles et les fiches écoles
 * - Les formules de cours et offres
 * - Les déclarations multilingues FR et EN avec balises <xhtml:link rel="alternate">
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  const host = getRequestHost(event)
  const protocol = getRequestProtocol(event)
  const baseUrl = `${protocol}://${host}`

  // Charger le catalogue pour FR et EN de manière résiliente
  const [snapshotFr] = await Promise.all([
    getSnapshotForLocale(event, 'fr'),
    getSnapshotForLocale(event, 'en'),
  ])

  const staticRoutes = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/destinations', priority: '0.9', changefreq: 'weekly' },
    { path: '/langues', priority: '0.9', changefreq: 'weekly' },
    { path: '/orientation', priority: '0.9', changefreq: 'weekly' },
    // Absentes jusqu'ici (relevé par l'audit SEO du 4 septembre 2026) — la
    // liste ci-dessus est écrite à la main, pas générée depuis les routes
    // déclarées : ce sont des pages publiques comme les autres.
    { path: '/logement', priority: '0.9', changefreq: 'weekly' },
  ]

  const urls: Array<{
    loc: string
    changefreq: string
    priority: string
    alternates: Array<{ code: string; href: string }>
  }> = []

  // 1. Pages statiques
  for (const route of staticRoutes) {
    const locFr = `${baseUrl}${route.path}`
    const locEn = `${baseUrl}/en${route.path}`

    urls.push({
      loc: locFr,
      changefreq: route.changefreq,
      priority: route.priority,
      alternates: [
        { code: 'fr', href: locFr },
        { code: 'en', href: locEn },
      ],
    })
  }

  // 2. Destinations
  const destinationsFr = snapshotFr?.destinations ?? []
  for (const dest of destinationsFr) {
    const locFr = `${baseUrl}/destinations/${dest.slug}`
    const locEn = `${baseUrl}/en/destinations/${dest.slug}`
    const alternates = [
      { code: 'fr', href: locFr },
      { code: 'en', href: locEn },
    ]

    urls.push({ loc: locFr, changefreq: 'weekly', priority: '0.8', alternates })

    const schoolsLocFr = `${baseUrl}/destinations/${dest.slug}/ecoles`
    const schoolsLocEn = `${baseUrl}/en/destinations/${dest.slug}/ecoles`
    urls.push({
      loc: schoolsLocFr,
      changefreq: 'weekly',
      priority: '0.8',
      alternates: [
        { code: 'fr', href: schoolsLocFr },
        { code: 'en', href: schoolsLocEn },
      ],
    })
  }

  // 2bis. Logement — mêmes destinations pays, absentes du sitemap jusqu'ici
  // (l'audit SEO du 4 septembre 2026 les a trouvées publiques et bien
  // titrées, mais jamais listées ici).
  const livingsFr = snapshotFr?.livings ?? []
  for (const living of livingsFr) {
    const locFr = `${baseUrl}/logement/${living.slug}`
    const locEn = `${baseUrl}/en/logement/${living.slug}`

    urls.push({
      loc: locFr,
      changefreq: 'weekly',
      priority: '0.7',
      alternates: [
        { code: 'fr', href: locFr },
        { code: 'en', href: locEn },
      ],
    })
  }

  // 3. Écoles
  const schoolsFr = snapshotFr?.schools ?? []
  for (const school of schoolsFr) {
    const destSlug = school.destinationSlug || 'france'
    const locFr = `${baseUrl}/destinations/${destSlug}/ecoles/${school.slug}`
    const locEn = `${baseUrl}/en/destinations/${destSlug}/ecoles/${school.slug}`

    urls.push({
      loc: locFr,
      changefreq: 'weekly',
      priority: '0.7',
      alternates: [
        { code: 'fr', href: locFr },
        { code: 'en', href: locEn },
      ],
    })
  }

  // 4. Offres
  const offersFr = snapshotFr?.offers ?? []
  for (const offer of offersFr) {
    const locFr = `${baseUrl}/offres/${offer.slug}`
    const locEn = `${baseUrl}/en/offres/${offer.slug}`

    urls.push({
      loc: locFr,
      changefreq: 'monthly',
      priority: '0.6',
      alternates: [
        { code: 'fr', href: locFr },
        { code: 'en', href: locEn },
      ],
    })
  }

  // Construction du XML
  const xmlUrls = urls
    .map((u) => {
      const altTags = u.alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.code}" href="${escapeXml(a.href)}" />`)
        .join('\n')

      return `  <url>
    <loc>${escapeXml(u.loc)}</loc>
${altTags}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlUrls}
</urlset>`
})

async function getSnapshotForLocale(event: H3Event, locale: string) {
  try {
    return await getSnapshot(event)
  } catch (_e) {
    return null
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
