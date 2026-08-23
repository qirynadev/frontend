import type { OrientationEvaluation } from '~/core/contracts'

/**
 * Avancement 0-100 d'une évaluation, sur ses 3 jalons réels (test / restitution
 * / rapport — voir `useOrientationData.ts`). Partagé avec `useProjetData.ts`
 * qui en fait la moyenne pour la carte « Orientation » du hub.
 */
export function orientationEvaluationProgress(evaluation: OrientationEvaluation): number {
  let done = 0
  if (evaluation.state === 'finished') done++
  if (evaluation.restitutionState === 'done') done++
  if (evaluation.hasReport) done++
  return Math.round((done / 3) * 100)
}
