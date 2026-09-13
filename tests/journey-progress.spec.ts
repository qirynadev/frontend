import { describe, expect, it } from 'vitest'
import type { Order, OrientationEvaluation } from '~/core/contracts'
import { globalJourneyProgress, orderProgress } from '~/utils/journey-progress'

/**
 * Progression globale (anneau de l'accueil et de l'aperçu) — règle du
 * responsable, 2026-09-13 : somme des progressions par commande sur le nombre
 * de commandes. Avant, la moyenne des quatre rubriques de `mon-projet` : un seul
 * achat à 14 % affichait 4 %.
 */

/** Commande minimale : seuls statut, type et checklist comptent ici. */
function order(overrides: { id?: string, serviceType?: string, status?: Order['status'], done?: number, total?: number }): Order {
  const { done = 0, total = 7 } = overrides
  const checklist = Array.from({ length: total }, (_, index) => ({
    id: `step-${index}`,
    stepKey: `step_${index}`,
    position: index + 1,
    status: index < done ? 'done' as const : 'upcoming' as const,
    completedAt: null,
  }))

  return {
    id: overrides.id ?? 'order-1',
    serviceType: overrides.serviceType ?? 'areaofstudy',
    status: overrides.status ?? 'confirmed',
    checklist,
  } as unknown as Order
}

function evaluation(overrides: Partial<OrientationEvaluation>): OrientationEvaluation {
  return {
    orderId: 'orientation-1',
    state: 'pending',
    restitutionState: 'pending',
    hasReport: false,
    ...overrides,
  } as unknown as OrientationEvaluation
}

describe('progression globale', () => {
  it('un seul achat : la progression globale est celle de cet achat', () => {
    // Le cas remonté : admission école, 1 étape sur 7 → 14 %, et non 4 %.
    expect(globalJourneyProgress([order({ done: 1, total: 7 })], [])).toBe(14)
  })

  it('somme des progressions par commande, divisée par le nombre de commandes', () => {
    const orders = [
      order({ id: 'a', serviceType: 'areaofstudy', done: 7, total: 7 }), // 100
      order({ id: 'b', serviceType: 'areaofstudy', done: 0, total: 7 }), // 0
      order({ id: 'c', serviceType: 'course', done: 1, total: 2 }), // 50
    ]

    // (100 + 0 + 50) / 3 = 50 — par commande, pas par rubrique ((50 + 50) / 2).
    expect(globalJourneyProgress(orders, [])).toBe(50)
  })

  it('une commande échouée n’est pas un achat : ni au numérateur, ni au dénominateur', () => {
    const orders = [
      order({ id: 'a', done: 7, total: 7 }),
      order({ id: 'b', status: 'failed', done: 0, total: 7 }),
    ]

    expect(globalJourneyProgress(orders, [])).toBe(100)
  })

  it('aucune commande : 0', () => {
    expect(globalJourneyProgress([], [])).toBe(0)
    expect(globalJourneyProgress([order({ status: 'failed' })], [])).toBe(0)
  })

  it('une commande d’orientation avance avec son bilan', () => {
    const orientation = order({ id: 'orientation-1', serviceType: 'profilage', total: 0 })
    const school = order({ id: 'school-1', done: 0, total: 7 })

    // Bilan terminé et restitution faite, pas encore de rapport : 2 jalons sur 3.
    const evaluations = [evaluation({ orderId: 'orientation-1', state: 'finished', restitutionState: 'done' })]

    expect(orderProgress(orientation, evaluations)).toBe(67)
    expect(globalJourneyProgress([orientation, school], evaluations)).toBe(34)
    // Sans bilan rattaché, la commande d'orientation compte 0.
    expect(orderProgress(orientation, [])).toBe(0)
  })
})
