import type { Teacher } from '~~/app/core/contracts'
import { toTeacherList } from '~~/app/core/adapters'

/** Professeurs d'un cours ayant au moins un créneau libre. */
export default defineEventHandler(async (event): Promise<Teacher[]> => {
  const client = authClient(event)
  const courseId = getRouterParam(event, 'courseId') ?? ''

  try {
    return toTeacherList(await client.request(`/user/plannings/teachers/${encodeURIComponent(courseId)}`))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
