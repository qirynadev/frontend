import type { EvaluationState, OrientationEvaluation, RestitutionState } from '../contracts'
import { asArray, asRecord, bool, num, optionalStr, str, toIsoDate, toUrl } from './primitives'

/**
 * Évaluations d'orientation — couche anti-corruption pour
 * `GET /etesting/evaluations`.
 *
 * `etat_eval` est un entier PT-TESTS sans vocabulaire (0/1/2/3) : traduit une
 * fois ici plutôt que comparé en dur à chaque écran.
 */
function toEvaluationState(rawEtatEval: unknown): EvaluationState {
  const value = num(asRecord({ v: rawEtatEval }), 'v', -1)
  if (value === 1) return 'inProgress'
  if (value === 2) return 'finished'
  if (value === 3) return 'cancelled'
  return 'pending'
}

function toRestitutionState(raw: unknown): RestitutionState {
  const status = str(asRecord(raw), 'status')
  if (status === 'done') return 'done'
  if (status === 'scheduled') return 'scheduled'
  return 'notScheduled'
}

export function toOrientationEvaluation(raw: unknown): OrientationEvaluation | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  const orderId = str(source, 'order_id')
  if (id === '' || orderId === '') return null

  return {
    id,
    orderId,
    title: str(source, 'nom'),
    state: toEvaluationState(source.etat_eval),
    testUrl: toUrl(source.url_eval),
    hasReport: bool(source, 'has_pdf', false),
    restitutionState: toRestitutionState(source.restitution),
    restitutionDate: toIsoDate(str(asRecord(source.restitution), 'start_date')),
    advisorName: optionalStr(source, 'restitution.advisor.name'),
    createdAt: toIsoDate(source.created_at),
  }
}

export function toOrientationEvaluationList(raw: unknown): OrientationEvaluation[] {
  return asArray(raw)
    .map(toOrientationEvaluation)
    .filter((evaluation): evaluation is OrientationEvaluation => evaluation !== null)
}
