import { asRecord, str } from '~~/app/core/adapters'

/** Assigne (ou change) le professeur d'une commande de langue. */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))

  const orderId = str(body, 'orderId')
  const teacherId = str(body, 'teacherId')
  if (orderId === '' || teacherId === '') {
    throw createError({ statusCode: 422, statusMessage: 'orderId et teacherId requis' })
  }

  try {
    await client.request('/user/plannings/new-teacher', {
      method: 'POST',
      body: { order_id: orderId, teacher_id: teacherId },
    })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
