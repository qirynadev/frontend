/**
 * Route Nitro `GET /robots.txt` — absente jusqu'ici (404, relevé par l'audit
 * SEO du 4 septembre 2026), qui recommandait un blocage total sur le
 * staging pour éviter que Google n'indexe des URL de recette.
 *
 * Un seul code déployé sur plusieurs domaines : voir `isIndexableHost`.
 * Adresses en `https` écrites en dur : derrière Cloudflare et nginx, le protocole
 * vu par le serveur peut être `http`.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const host = getRequestHost(event)

  if (!isIndexableHost(host)) {
    return 'User-agent: *\nDisallow: /\n'
  }

  return `User-agent: *\nAllow: /\n\nSitemap: https://${host}/sitemap.xml\n`
})
