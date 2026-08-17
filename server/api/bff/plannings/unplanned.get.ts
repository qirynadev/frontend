import type { LanguageProgress } from '~~/app/core/contracts'
import { toLanguageProgressList } from '~~/app/core/adapters'

/** Heures de cours restant à planifier, groupées par langue. */
export default defineEventHandler(async (event): Promise<LanguageProgress[]> => {
  const client = authClient(event)

  try {
    return toLanguageProgressList(await client.request('/user/plannings/unplanned'))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
