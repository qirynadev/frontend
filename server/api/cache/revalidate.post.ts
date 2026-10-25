/**
 * Signal « contenu modifié » envoyé par le back-office après chaque
 * enregistrement qui touche le site (2026-10-25) : le catalogue, les fiches et
 * les pages déjà calculées sont oubliés, la visite suivante relit l'API.
 *
 * Protégé par la clé partagée avec le back-office (`NUXT_BFF_SHARED_KEY`,
 * `BFF_SHARED_KEY` de l'autre côté), envoyée dans `X-Qiryna-Bff-Key`. Sans clé
 * configurée, l'adresse refuse tout : personne ne peut vider le cache.
 */
export default defineEventHandler(async (event) => {
  const expected = useRuntimeConfig(event).bffSharedKey
  const given = getHeader(event, 'x-qiryna-bff-key') ?? ''

  if (!expected || !sameSecret(given, expected)) {
    throw createError({ statusCode: 403, statusMessage: 'Clé absente ou invalide' })
  }

  const version = await bumpContentVersion()
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, version }
})
