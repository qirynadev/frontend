import { describe, expect, it } from 'vitest'
import { toOrientationEvaluation, toOrientationEvaluationList } from '~/core/adapters/orientation-evaluation.adapter'

/** Forme d'une évaluation telle que `GET /etesting/evaluations` la renvoie (`ETestingController::mapEvaluation`). */
const rawEvaluation = {
  id: 'fffbe481-55e7-4e0e-8994-7ac199dec30e',
  order_id: '6a0880ce-f1a7-4da7-9630-fa4cf44d4a68',
  nom: 'ProfilJOB junior',
  etat_eval: 0,
  url_eval: 'https://tests-qiryna.com/index.php?rlgc=abc',
  has_pdf: false,
  created_at: '2026-08-08T11:20:44.000000Z',
  restitution: { status: 'not_scheduled', start_date: null, end_date: null, advisor: null },
}

describe('réponse nominale', () => {
  it('traduit une évaluation en attente', () => {
    const evaluation = toOrientationEvaluation(rawEvaluation)

    expect(evaluation?.id).toBe('fffbe481-55e7-4e0e-8994-7ac199dec30e')
    expect(evaluation?.orderId).toBe('6a0880ce-f1a7-4da7-9630-fa4cf44d4a68')
    expect(evaluation?.title).toBe('ProfilJOB junior')
    expect(evaluation?.state).toBe('pending')
    expect(evaluation?.testUrl).toBe('https://tests-qiryna.com/index.php?rlgc=abc')
    expect(evaluation?.hasReport).toBe(false)
    expect(evaluation?.restitutionState).toBe('notScheduled')
    expect(evaluation?.restitutionDate).toBeNull()
    expect(evaluation?.advisorName).toBeNull()
    expect(evaluation?.createdAt).toBe('2026-08-08')
  })

  it('traduit les quatre états `etat_eval`', () => {
    expect(toOrientationEvaluation({ ...rawEvaluation, etat_eval: 0 })?.state).toBe('pending')
    expect(toOrientationEvaluation({ ...rawEvaluation, etat_eval: 1 })?.state).toBe('inProgress')
    expect(toOrientationEvaluation({ ...rawEvaluation, etat_eval: 2 })?.state).toBe('finished')
    expect(toOrientationEvaluation({ ...rawEvaluation, etat_eval: 3 })?.state).toBe('cancelled')
  })

  it('traduit une évaluation terminée avec restitution planifiée', () => {
    const finished = {
      ...rawEvaluation,
      etat_eval: 2,
      url_eval: null,
      has_pdf: true,
      restitution: {
        status: 'scheduled',
        start_date: '2026-09-01T10:00:00.000000Z',
        end_date: '2026-09-01T10:30:00.000000Z',
        advisor: { id: 'a1', name: 'Sarah Kouamé' },
      },
    }
    const evaluation = toOrientationEvaluation(finished)

    expect(evaluation?.state).toBe('finished')
    expect(evaluation?.testUrl).toBeNull()
    expect(evaluation?.hasReport).toBe(true)
    expect(evaluation?.restitutionState).toBe('scheduled')
    expect(evaluation?.restitutionDate).toBe('2026-09-01')
    expect(evaluation?.advisorName).toBe('Sarah Kouamé')
  })
})

describe('champ manquant', () => {
  it('ne lève sur aucune forme d’entrée', () => {
    for (const input of [null, undefined, 42, 'texte', [], {}]) {
      expect(() => toOrientationEvaluation(input)).not.toThrow()
      expect(() => toOrientationEvaluationList(input)).not.toThrow()
    }
  })

  it('écarte une évaluation sans identifiant ou sans commande', () => {
    expect(toOrientationEvaluation({ ...rawEvaluation, id: undefined })).toBeNull()
    expect(toOrientationEvaluation({ ...rawEvaluation, order_id: undefined })).toBeNull()
  })

  it('retombe sur `pending` pour un `etat_eval` absent ou inconnu', () => {
    expect(toOrientationEvaluation({ ...rawEvaluation, etat_eval: undefined })?.state).toBe('pending')
    expect(toOrientationEvaluation({ ...rawEvaluation, etat_eval: 42 })?.state).toBe('pending')
  })

  it('accepte une liste nue', () => {
    expect(toOrientationEvaluationList([rawEvaluation])).toHaveLength(1)
    expect(toOrientationEvaluationList([rawEvaluation, { id: 'x' }])).toHaveLength(1)
  })
})
