import { asRecord, bool, optionalStr } from '~~/app/core/adapters'

/**
 * Clé publique VAPID des notifications push web. `enabled: false` tant que
 * l'environnement n'a pas sa paire de clés : le site ne propose alors pas les
 * notifications (voir `qiryna-backoffice/docs/push-web.md`).
 */
export default defineEventHandler(async (event): Promise<{ enabled: boolean, publicKey: string | null }> => {
  const client = authClient(event)

  try {
    const response = asRecord(await client.request('/user/push/key', { unwrap: false }))
    const publicKey = optionalStr(response, 'public_key')
    return { enabled: bool(response, 'enabled', false) && publicKey !== null, publicKey }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
