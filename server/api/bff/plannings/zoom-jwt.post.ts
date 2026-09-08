import { asRecord, str } from '~~/app/core/adapters'

/**
 * Signature JWT nécessaire pour rejoindre une session Zoom Video SDK
 * (`meeting.session_name` d'une `PlannedSession`). Relaie `POST /zoom-jwt` —
 * le back-office impose `role_type: 0` (participant) côté serveur, jamais
 * host, quel que soit l'appelant (professeur ou élève).
 */
export default defineEventHandler(async (event): Promise<{ signature: string }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))

  const sessionName = str(body, 'sessionName')
  if (sessionName === '') {
    throw createError({ statusCode: 422, statusMessage: 'sessionName requis' })
  }

  try {
    const raw = asRecord(await client.request('/zoom-jwt', { method: 'POST', body: { sessionName } }))
    return { signature: str(raw, 'signature') }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
