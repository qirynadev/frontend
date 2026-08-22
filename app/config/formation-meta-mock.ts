/**
 * Métadonnées carte formation (`.ed-form-meta` — grade + durée).
 *
 * L’API stage (2026-08-22) ne renvoie que `{ title, description }` sur chaque
 * formation — pas de `grade` / `duration`. La maquette (`schools.js`) les
 * affiche systématiquement. Tant que le back-office ne les expose pas, on :
 *
 * 1. lit `grade` / `duration` / `duration_label` s’ils arrivent un jour ;
 * 2. sinon infère un mock léger depuis le titre (Bachelor, Master, MBA…) ;
 * 3. sinon repli documenté « Grade Master » / « 3 ans » (valeurs fréquentes
 *    dans la maquette).
 *
 * Voir `ARCHITECTURE-API.md` § écarts catalogue, point formations.
 */

export interface FormationMeta {
  grade: string
  duration: string
  /** `true` si grade ou durée viennent du mock, pas de l’API. */
  mocked: boolean
}

const DEFAULT_GRADE = 'Grade Master'
const DEFAULT_DURATION = '3 ans'

/** Ex. « Global BBA (4 ans) », « Mastère … — 1 an ». */
function durationFromTitle(title: string): string | null {
  const match = title.match(/\((\d+\s*à\s*\d+\s*mois|\d+\s*à\s*\d+\s*ans|\d+\s*ans?|\d+\s*mois)\)/i)
    ?? title.match(/\b(\d+\s*à\s*\d+\s*mois|\d+\s*à\s*\d+\s*ans|\d+\s*ans?|\d+\s*mois)\b/i)
  return match?.[1]?.replace(/\s+/g, ' ').trim() ?? null
}

function inferFromTitle(title: string): Pick<FormationMeta, 'grade' | 'duration'> {
  const t = title.toLowerCase()
  const fromTitle = durationFromTitle(title)

  if (/\b(mba|executive\s*mba|gemba)\b/.test(t)) {
    return { grade: 'Grade MBA', duration: fromTitle ?? '12 à 18 mois' }
  }
  if (/\b(mast[eè]re|ms\b|msc)\b/.test(t)) {
    return { grade: 'Grade Mastère Spécialisé', duration: fromTitle ?? '1 an' }
  }
  if (/\b(bachelor|bba|licence|cesem|tema)\b/.test(t)) {
    return { grade: 'Grade Bachelor', duration: fromTitle ?? '3 ans' }
  }
  if (/\b(master|pge|grande\s*école|grade\s*master)\b/.test(t)) {
    return { grade: 'Grade Master', duration: fromTitle ?? '2 ans' }
  }

  return { grade: DEFAULT_GRADE, duration: fromTitle ?? DEFAULT_DURATION }
}

/**
 * Résout grade + durée pour une carte formation.
 * `apiGrade` / `apiDuration` : champs optionnels lus sur la payload brute.
 */
export function resolveFormationMeta(
  title: string,
  apiGrade: string | null,
  apiDuration: string | null,
): FormationMeta {
  if (apiGrade && apiDuration) {
    return { grade: apiGrade, duration: apiDuration, mocked: false }
  }

  const inferred = inferFromTitle(title)
  return {
    grade: apiGrade || inferred.grade,
    duration: apiDuration || inferred.duration,
    mocked: !(apiGrade && apiDuration),
  }
}
