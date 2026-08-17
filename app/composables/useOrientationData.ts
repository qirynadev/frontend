import type { OrientationEvaluation } from '~/core/contracts'
import { orientationEvaluationRepo } from '~/core/repositories'

export type OrientationMilestoneStatus = 'done' | 'current' | 'upcoming'

export interface OrientationMilestone {
  id: 'test' | 'restitution' | 'report'
  titleKey: string
  status: OrientationMilestoneStatus
}

/**
 * Trois jalons **réels**, à la place des cinq de la maquette
 * (`mon-projet-orientation.html`) : « Inscription confirmée / Test de niveau /
 * Cours en cours / Évaluation intermédiaire / Certification finale » est un
 * récit de cours de langue, pas de bilan d'orientation — signalé, pas
 * reconduit. L'API ne porte que trois signaux réels pour une évaluation
 * (`ETestingController::mapEvaluation`) : le test lui-même, l'entretien de
 * restitution, le rapport — c'est ce que ces jalons montrent.
 */
function toMilestones(evaluation: OrientationEvaluation): OrientationMilestone[] {
  const steps: { id: OrientationMilestone['id'], titleKey: string, done: boolean }[] = [
    { id: 'test', titleKey: 'projectOrientation.milestoneTest', done: evaluation.state === 'finished' },
    { id: 'restitution', titleKey: 'projectOrientation.milestoneRestitution', done: evaluation.restitutionState === 'done' },
    { id: 'report', titleKey: 'projectOrientation.milestoneReport', done: evaluation.hasReport },
  ]
  const currentIndex = steps.findIndex((step) => !step.done)

  return steps.map((step, index) => ({
    id: step.id,
    titleKey: step.titleKey,
    status: step.done ? 'done' : index === currentIndex ? 'current' : 'upcoming',
  }))
}

/**
 * Bilan d'orientation, pour `mon-projet/orientation`.
 *
 * Branché sur `GET /etesting/evaluations` (auth, `orientationEvaluationRepo`)
 * — l'évaluation la plus récente si le client en a plusieurs (même
 * limitation qu'admission/logement : l'écran n'a pas de route par commande).
 * `Order.checklist` n'existe pas pour `profilage` (jamais alimenté côté
 * back-office, voir `OrderChecklistItem::seedDefaultsForOrder`) — c'est
 * l'évaluation e-testing elle-même qui porte l'avancement réel.
 */
export async function useOrientationData(locale: Ref<string>) {
  return usePageData(
    'mon-projet-orientation',
    async () => {
      const evaluations = await orientationEvaluationRepo.list(locale.value)
      const evaluation = [...evaluations]
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0] ?? null

      const milestones = evaluation ? toMilestones(evaluation) : []
      const done = milestones.filter((m) => m.status === 'done').length
      const progressPercent = milestones.length > 0 ? Math.round((done / milestones.length) * 100) : 0

      return { evaluation, milestones, progressPercent }
    },
    { watch: [locale] },
  )
}
