import type { StrengthScore } from '~/design-system/types'

/**
 * Robustesse d'un mot de passe.
 *
 * Le script de `maquette/pwa/pages/inscription.html` décrivait 4 critères
 * (longueur/majuscule/chiffre/« un symbole quelconque »), mais ce n'est **pas**
 * la règle que le back-office applique réellement (`AuthController::register`) :
 *
 * ```
 * /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])[A-Za-z\d@$!%*?&\-_#]+$/
 * ```
 *
 * — minuscule **et** majuscule **et** chiffre **et** un symbole pris dans un
 * alphabet précis (`@$!%*?&-_#`), et **aucun caractère en dehors de cet
 * alphabet** nulle part dans le mot de passe (pas juste "au moins un symbole").
 * `legacy` teste ce même regex mot pour mot côté front. Notre ancienne version
 * ne vérifiait pas la minuscule et acceptait n'importe quel symbole — un mot
 * de passe validé par cet écran pouvait donc être rejeté par le back-office
 * en 422, sans qu'aucun message ne dise pourquoi avant la correction du
 * décodage d'erreur BFF (voir `core/http/errors.ts`). Corrigé le 2026-08-30
 * après un signalement d'inscription qui « ne passe pas ».
 *
 * Cinq critères, un point chacun (longueur/minuscule/majuscule/chiffre/
 * symbole) ; le score affiché reste sur 3 barres.
 */

export interface PasswordChecks {
  length: boolean
  lower: boolean
  upper: boolean
  digit: boolean
  symbol: boolean
}

/** Alphabet de symboles accepté par le back-office — ni plus, ni moins. */
const ALLOWED_SYMBOL = /[@$!%*?&\-_#]/
/** Reflète l'exigence du back-office : chaque caractère doit appartenir à cet alphabet. */
const ALLOWED_CHARS_ONLY = /^[A-Za-z\d@$!%*?&\-_#]*$/

export function evaluatePassword(value: string): PasswordChecks {
  return {
    length: value.length >= 8,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    digit: /\d/.test(value),
    symbol: ALLOWED_SYMBOL.test(value),
  }
}

export function strengthScore(checks: PasswordChecks): StrengthScore {
  const points = Object.values(checks).filter(Boolean).length
  if (points <= 2) return 0
  if (points <= 3) return 1
  if (points === 4) return 2
  return 3
}

/**
 * Validité réelle : tous les critères **et** aucun caractère hors alphabet
 * autorisé — un point que `checks` seul ne couvre pas (un mot de passe peut
 * cocher les 5 critères tout en contenant, par exemple, un `.` ou un espace).
 */
export function isPasswordValid(checks: PasswordChecks, value: string): boolean {
  return Object.values(checks).every(Boolean) && ALLOWED_CHARS_ONLY.test(value)
}

/** Critères encore manquants, dans l'ordre où la maquette les énumère. */
export function missingCriteria(checks: PasswordChecks): (keyof PasswordChecks)[] {
  return (Object.keys(checks) as (keyof PasswordChecks)[]).filter((key) => !checks[key])
}

/**
 * État réactif prêt à brancher sur `QPasswordStrength`.
 *
 * Les libellés restent à l'appelant : ce module ne connaît pas i18n.
 */
export function usePasswordStrength(password: Ref<string>) {
  const checks = computed(() => evaluatePassword(password.value))
  const score = computed<StrengthScore>(() => (password.value === '' ? 0 : strengthScore(checks.value)))
  const valid = computed(() => isPasswordValid(checks.value, password.value))
  const missing = computed(() => missingCriteria(checks.value))
  /** Caractère refusé par le back-office présent — cas que `missing` seul ne signale pas. */
  const hasDisallowedChars = computed(() => password.value !== '' && !ALLOWED_CHARS_ONLY.test(password.value))

  return { checks, score, valid, missing, hasDisallowedChars }
}
