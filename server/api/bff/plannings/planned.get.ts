import type { PlannedSession } from '~~/app/core/contracts'
import { toPlannedSessionList } from '~~/app/core/adapters'

/** Séances de cours déjà casées dans un créneau. */
export default defineEventHandler(async (event): Promise<PlannedSession[]> => {
  const client = authClient(event)

  try {
    return toPlannedSessionList(await client.request('/user/plannings/planned'))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
