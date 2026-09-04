/**
 * Route Nitro `GET /robots.txt` — absente jusqu'ici (404, relevé par l'audit
 * SEO du 4 septembre 2026), qui recommandait un blocage total sur le
 * staging pour éviter que Google n'indexe des URL de recette.
 *
 * Un seul code déployé sur plusieurs domaines (`stage.qiryna.com` en
 * recette, le domaine de production ensuite) : la distinction se fait en
 * comparant l'hôte de la requête à `NUXT_PUBLIC_SITE_URL` (déjà utilisé par
 * `@nuxtjs/i18n` pour les `hreflang`, voir `nuxt.config.ts`) plutôt qu'une
 * variable d'environnement dédiée à ajouter en plus.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const host = getRequestHost(event)
  const productionHost = new URL(useRuntimeConfig().public.siteUrl).host
  const isProduction = host === productionHost

  if (!isProduction) {
    return 'User-agent: *\nDisallow: /\n'
  }

  const protocol = getRequestProtocol(event)
  return `User-agent: *\nAllow: /\n\nSitemap: ${protocol}://${host}/sitemap.xml\n`
})
