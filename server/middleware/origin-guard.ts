/**
 * Refuse les écritures sur le BFF venant d'un autre site (2026-11-02) : un navigateur
 * joint toujours `Origin` à un envoi inter-sites, et un site tiers ne peut pas la
 * falsifier. Complète le cookie `SameSite=Lax`. Voir `server/utils/origin.ts`.
 */
export default defineEventHandler((event) => {
  if (isInternalRequest(event.node.req)) return

  const allowed = isAllowedWrite({
    method: event.method,
    path: event.path.split('?')[0] ?? '/',
    origin: getRequestHeader(event, 'origin'),
    referer: getRequestHeader(event, 'referer'),
    hosts: [
      getRequestHeader(event, 'host'),
      getRequestHeader(event, 'x-forwarded-host'),
      useRuntimeConfig(event).public.siteUrl,
    ],
    extraOrigins: String(useRuntimeConfig(event).allowedOrigins ?? ''),
  })

  if (!allowed) {
    throw createError({ statusCode: 403, statusMessage: 'Origine refusée' })
  }
})
