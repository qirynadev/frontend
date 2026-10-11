import { describe, expect, it } from 'vitest'
import type { Order, OrientationEvaluation } from '~/core/contracts'
import { globalJourneyProgress, orderChecklistProgress, orderProgress } from '~/utils/journey-progress'

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

/**
 * Étape « test de niveau » d'une commande de langue (remarque du responsable,
 * 2026-10-11) : hors LMS, le back-office la coche d'office à l'achat. Elle ne
 * doit créditer le client que si un test s'applique vraiment à sa commande.
 */
describe('test de niveau dans la progression d’une commande de langue', () => {
  const steps = (levelTest: 'done' | 'pending') => [
    { id: '1', stepKey: 'registration', position: 1, status: 'done' as const, completedAt: null },
    { id: '2', stepKey: 'level_test', position: 2, status: levelTest, completedAt: null },
    { id: '3', stepKey: 'course_in_progress', position: 3, status: 'upcoming' as const, completedAt: null },
    { id: '4', stepKey: 'midterm_evaluation', position: 4, status: 'upcoming' as const, completedAt: null },
    { id: '5', stepKey: 'final_certification', position: 5, status: 'upcoming' as const, completedAt: null },
  ]
  const course = (checklist: ReturnType<typeof steps>, levelTest: Order['levelTest']) =>
    ({ id: 'c1', serviceType: 'course', status: 'confirmed', checklist, levelTest }) as unknown as Order
  const test = (status: 'not_required' | 'pending' | 'completed') =>
    ({ status, planningLocked: status === 'pending', level: status === 'completed' ? 'B1' : null, commercialLevel: null })

  it('ne compte pas une étape cochée d’office quand aucun test ne s’applique', () => {
    // Inscription seule sur les 4 étapes restantes : 25 %, pas 2 sur 5.
    expect(orderChecklistProgress(course(steps('done'), test('not_required')))).toBe(25)
    expect(orderChecklistProgress(course(steps('done'), null))).toBe(25)
  })

  it('compte l’étape telle quelle quand un test s’applique', () => {
    expect(orderChecklistProgress(course(steps('pending'), test('pending')))).toBe(20)
    expect(orderChecklistProgress(course(steps('done'), test('completed')))).toBe(40)
  })
})
