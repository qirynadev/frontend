/**
 * Bloque le site tant que le code d'accès n'a pas été saisi, si `NUXT_ACCESS_CODE`
 * est renseignée sur ce serveur (voir `server/utils/access-gate.ts`).
 *
 * Nitro exécute ses middlewares par ordre alphabétique : celui-ci passe avant
 * `payment-return`, qui appelle l'API. Les fichiers de `public/` sont servis avant
 * tout middleware et ne sont donc pas protégés (logo, polices, scripts du site).
 */
export default defineEventHandler((event) => {
  const code = siteAccessCode()
  if (code === '' || isInternalRequest(event.node.req)) return

  const [path = '/'] = event.path.split('?')
  if (isOpenRoute(event.method, path)) return
  // L'application mobile n'a ni page 403 ni cookie d'accès : voir `app-host.ts`.
  if (isAppApiHost(getRequestHost(event)) && isAppApiPath(path)) return
  if (hasAccess(getCookie(event, ACCESS_COOKIE), code)) return

  const locale = accessLocale(event.path, getRequestHeader(event, 'accept-language'))

  if (path.startsWith('/api/')) {
    setResponseStatus(event, 403)
    setResponseHeader(event, 'cache-control', 'no-store')
    return { message: accessDeniedMessage(locale) }
  }

  prepareAccessResponse(event, 403)
  return renderAccessPage(locale, safeNextPath(event.path))
})
