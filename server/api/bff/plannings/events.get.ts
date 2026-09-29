import type { CalendarSlot } from '~~/app/core/contracts'
import { toCalendarSlotList } from '~~/app/core/adapters'

/**
 * Calendrier d'un professeur, `?teacherId=`. `?orderId=` (facultatif) : la
 * commande à planifier, pour que le back-office signale les séances de
 * groupe qu'elle peut rejoindre.
 */
export default defineEventHandler(async (event): Promise<CalendarSlot[]> => {
  const client = authClient(event)
  const teacherId = String(getQuery(event).teacherId ?? '')
  const orderId = String(getQuery(event).orderId ?? '')

  if (teacherId === '') {
    throw createError({ statusCode: 422, statusMessage: 'teacherId requis' })
  }

  try {
    return toCalendarSlotList(await client.request('/user/plannings/events', {
      query: { teacher_id: teacherId, order_id: orderId || undefined },
    }))
  }
  catch (error) {
    rethrowApiError(error)
  }
})
