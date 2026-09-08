import { asRecord, optionalNum, optionalStr, str } from '~~/app/core/adapters'

/**
 * Enregistre les préférences logement d'une commande (`ClientPostPurchaseData`,
 * `service_type: 'living'`) — voir `docs/directives-backend.md` pour le détail
 * des champs sans colonne dédiée, regroupés dans `special_requirements`.
 */
export default defineEventHandler(async (event): Promise<{ ok: boolean }> => {
  const client = authClient(event)
  const body = asRecord(await readBody(event).catch(() => ({})))

  const orderId = str(body, 'orderId')
  if (orderId === '') {
    throw createError({ statusCode: 422, statusMessage: 'orderId requis' })
  }

  try {
    await client.request('/client-data/store', {
      method: 'POST',
      body: {
        order_id: orderId,
        planned_arrival_date: optionalStr(body, 'arrivalDate'),
        monthly_budget_estimate: optionalNum(body, 'monthlyBudget'),
        stay_duration_months: optionalNum(body, 'stayDurationMonths'),
        accommodation_type: optionalStr(body, 'accommodationType'),
        special_requirements: optionalStr(body, 'additionalNotes'),
      },
    })
    return { ok: true }
  }
  catch (error) {
    rethrowApiError(error)
  }
})
