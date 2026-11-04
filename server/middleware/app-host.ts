/**
 * Le domaine de l'application mobile ne sert que l'API : une page demandée ici
 * renvoie vers le site. Passe après `access-gate`, qui répond 403 tant que le site
 * est fermé. Voir `server/utils/app-host.ts`.
 */
export default defineEventHandler((event) => {
  if (isInternalRequest(event.node.req) || !isAppApiHost(getRequestHost(event))) return

  const [path = '/'] = event.path.split('?')
  if (path.startsWith('/api/')) return

  return sendRedirect(event, `${SITE_ORIGIN}${event.path}`, 302)
})
