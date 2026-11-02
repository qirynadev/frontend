import { asRecord, str } from '~~/app/core/adapters'

/**
 * Ouvre une pièce du dossier. Les pièces sont sur un disque privé du back-office :
 * à chaque clic, la session du client obtient un lien signé de quelques minutes,
 * vers lequel on redirige. Le lien n'est donc jamais périmé dans une page restée
 * ouverte, et n'apparaît ni dans le rendu ni dans les données de la page.
 *
 * `Accept: application/json` renvoie `{ url }` sans rediriger : l'application
 * mobile, dont les pages n'ont pas le cookie du site, ouvre ainsi le lien.
 */
export default defineEventHandler(async (event) => {
  const { orderId, type } = getQuery(event)
  if (typeof orderId !== 'string' || !/^[\da-f-]{36}$/i.test(orderId) || typeof type !== 'string' || !/^[a-z0-9_]+$/.test(type)) {
    throw createError({ statusCode: 422, statusMessage: 'Pièce invalide' })
  }

  setResponseHeader(event, 'cache-control', 'no-store')

  const wantsJson = (getRequestHeader(event, 'accept') ?? '').includes('application/json')

  // Session expirée, depuis un lien ouvert dans un onglet : retour à la connexion.
  if (!wantsJson && readSessionToken(event) === null) {
    return sendRedirect(event, `/connexion?redirect=${encodeURIComponent('/mon-projet/admission?tab=document')}`, 302)
  }

  let url = ''
  try {
    const raw = await authClient(event).request('/client-data/document-link', { query: { order_id: orderId, type } })
    url = str(asRecord(raw), 'url')
  }
  catch (error) {
    rethrowApiError(error)
  }

  if (url === '') throw createError({ statusCode: 502, statusMessage: 'Lien indisponible' })

  return wantsJson ? { url } : sendRedirect(event, url, 302)
})
