import { asRecord, str } from '~~/app/core/adapters'

/**
 * Réserve un créneau libre pour une commande.
 *
 * Le back-office fait tout le contrôle qui compte (quota d'heures restantes,
 * délai de 2h minimum, expiration à 3 mois de l'achat, créneau réellement
 * libre) — cette route ne fait que relayer, sans le dupliquer côté client.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))

  const planningId = str(body, 'planningId')
  const orderId = str(body, 'orderId')
  const title = str(body, 'title')
  const startAt = str(body, 'startAt')
  const endAt = str(body, 'endAt')
  if ([planningId, orderId, title, startAt, endAt].some((value) => value === '')) {
    throw createError({ statusCode: 422, statusMessage: 'planningId, orderId, title, startAt et endAt requis' })
  }

  try {
    await client.request('/user/plannings/create', {
      method: 'POST',
      body: { planning_id: planningId, order_id: orderId, title, start_at: startAt, end_at: endAt },
    })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
