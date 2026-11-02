/**
 * Reçoit le code d'accès du formulaire de la page 403 (`server/utils/access-gate.ts`).
 * Sans JavaScript : un code correct pose le cookie et rouvre la page demandée.
 */
export default defineEventHandler(async (event) => {
  const code = siteAccessCode()
  if (code === '') throw createError({ statusCode: 404, statusMessage: 'Page introuvable' })

  const body = await readBody<Record<string, unknown> | null>(event).catch(() => null)
  const next = safeNextPath(body?.next)
  const locale = accessLocale(next, getRequestHeader(event, 'accept-language'))

  if (!hitRateLimit(RATE_LIMITS.siteAccess, clientIp(event) ?? 'inconnue')) {
    prepareAccessResponse(event, 429)
    return renderAccessPage(locale, next, 'rate-limited')
  }

  const given = typeof body?.code === 'string' ? body.code.trim() : ''
  if (!sameSecret(given, code)) {
    prepareAccessResponse(event, 403)
    return renderAccessPage(locale, next, 'invalid')
  }

  setCookie(event, ACCESS_COOKIE, accessToken(code), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  })
  setResponseHeader(event, 'cache-control', 'no-store')
  return sendRedirect(event, next, 303)
})
