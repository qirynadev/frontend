import { describe, expect, it } from 'vitest'
import { toLivingPreferencesWithPrefill } from '~/core/adapters'

/**
 * `GET /client-data/show` lu sans déballage (2026-10-03) : le type de logement
 * choisi à l'achat (`prefill.accommodation_type`) préremplit le formulaire
 * d'après achat, sans jamais écraser ce que le client a enregistré.
 */
describe('toLivingPreferencesWithPrefill', () => {
  const saved = {
    planned_arrival_date: '2026-11-01',
    monthly_budget_estimate: 600,
    stay_duration_months: 10,
    accommodation_type: 'apartment',
  }

  it('rien d\'enregistré : seul le type choisi à l\'achat est prérempli', () => {
    expect(toLivingPreferencesWithPrefill({ status: true, data: null, prefill: { accommodation_type: 'shared' } }))
      .toEqual({ arrivalDate: null, monthlyBudget: null, stayDurationMonths: null, accommodationType: 'shared' })
  })

  it('ce que le client a enregistré l\'emporte', () => {
    expect(toLivingPreferencesWithPrefill({ data: saved, prefill: { accommodation_type: 'shared' } })?.accommodationType)
      .toBe('apartment')
  })

  it('complète un type resté vide dans l\'enregistrement', () => {
    expect(toLivingPreferencesWithPrefill({ data: { ...saved, accommodation_type: null }, prefill: { accommodation_type: 'dormitory' } }))
      .toMatchObject({ monthlyBudget: 600, accommodationType: 'dormitory' })
  })

  it('sans préremplissage valable, comportement d\'avant', () => {
    expect(toLivingPreferencesWithPrefill({ data: null, prefill: {} })).toBeNull()
    expect(toLivingPreferencesWithPrefill({ data: null, prefill: { accommodation_type: 'chateau' } })).toBeNull()
  })
})
