import { toMessageThreads } from '~~/app/core/adapters'
import type { MessageThread } from '~~/app/core/contracts/message'

/**
 * Liste de messagerie (`/messages`, onglet « Messages ») → `GET /user/messages`.
 *
 * Réponse brute `{ sent, received }`, sans fil de conversation — reconstitué
 * par `toMessageThreads`. Voir `messageRepo`.
 */
export default defineEventHandler(async (event): Promise<MessageThread[]> => {
  const client = authClient(event)

  try {
    const raw = await client.request('/user/messages')
    return toMessageThreads(raw)
  }
  catch (error) {
    rethrowApiError(error)
  }
})
