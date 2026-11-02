import { asRecord, str } from '~~/app/core/adapters'

/**
 * Suppression du compte par le client (2026-11-02). Le back-office efface les données,
 * garde les commandes anonymisées et révoque les jetons ; le cookie part ensuite.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))

  try {
    await client.request('/user/account', {
      method: 'DELETE',
      body: { confirm: body.confirm === true, password: str(body, 'password') },
      // Déjà supprimé au premier essai : un second appel répondrait 401.
      retry: 0,
    })
  }
  catch (error) {
    rethrowApiError(error)
  }

  clearSessionCookie(event)
  return { ok: true }
})
