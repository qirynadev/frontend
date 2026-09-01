/**
 * Évaluation d'orientation (« e-testing »/PT-TESTS), une par test acheté.
 *
 * `GET /etesting/evaluations` (auth) — voir `ETestingController::mapEvaluation`
 * côté back-office. Pas de suivi par étapes générique ici (`Order.checklist`
 * n'est jamais alimenté pour `profilage`, voir `OrderChecklistItem::
 * seedDefaultsForOrder`) : le test lui-même fait foi.
 */
export type EvaluationState = 'pending' | 'inProgress' | 'finished' | 'cancelled'
export type RestitutionState = 'notScheduled' | 'scheduled' | 'done'

export interface OrientationEvaluation {
  id: string
  orderId: string
  /** Nom du test (« ProfilJOB junior »…). */
  title: string
  state: EvaluationState
  /** Lien externe (PT-TESTS) pour passer ou reprendre le test — `null` une fois terminé/annulé. */
  testUrl: string | null
  /** Rapport de synthèse téléchargeable — `has_pdf` seul ; le PDF lui-même est servi par `/api/bff/etesting/{id}/pdf` (octets bruts, pas une URL). */
  hasReport: boolean
  restitutionState: RestitutionState
  /** ISO `AAAA-MM-JJ`, quand l'entretien est planifié ou passé. */
  restitutionDate: string | null
  advisorName: string | null
  createdAt: string | null
}
