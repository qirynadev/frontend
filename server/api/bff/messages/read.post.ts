/**
 * Marque les messages reçus comme lus (ouverture d'une conversation sur
 * `/messages`) → `POST /user/messages/read`.
 *
 * Le back-office marque **tous** les messages reçus non lus de l'utilisateur
 * (`MessageController::markAsRead`) : il n'existe qu'un fil en pratique, celui
 * de l'équipe. Voir `messageRepo.markRead`.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)

  try {
    await client.request('/user/messages/read', { method: 'POST' })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
