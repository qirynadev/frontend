import type { CalendarSlot } from '~~/app/core/contracts'
import { toCalendarSlotList } from '~~/app/core/adapters'

/** Calendrier d'un professeur — `?teacherId=`. */
export default defineEventHandler(async (event): Promise<CalendarSlot[]> => {
  const client = authClient(event)
  const teacherId = String(getQuery(event).teacherId ?? '')

  if (teacherId === '') {
    throw createError({ statusCode: 422, statusMessage: 'teacherId requis' })
  }

  try {
    return toCalendarSlotList(await client.request('/user/plannings/events', { query: { teacher_id: teacherId } }))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
