import type { StrengthScore } from '~/design-system/types'

/**
 * Robustesse d'un mot de passe.
 *
 * **Portage littéral du script de `maquette/pwa/pages/inscription.html`**, qui
 * embarque sa propre règle — c'est la seule page de la maquette à décrire un
 * comportement, et il fait donc partie de la spécification au même titre que
 * les couleurs.
 *
 * Quatre critères, un point chacun :
 *
 * | Critère | Test |
 * |---|---|
 * | longueur | au moins 8 caractères |
 * | majuscule | `[A-ZÀ-Ÿ]` — accents compris |
 * | chiffre | `\d` |
 * | symbole | tout ce qui n'est ni lettre, ni chiffre, ni espace |
 *
 * Le score se lit ensuite : 0 point → aucune barre · 1 ou 2 → une barre rouge ·
 * 3 → deux barres oranges · 4 → trois barres vertes.
 *
 * ⚠️ Un mot de passe « moyen » (3 critères) est **refusé** : la maquette exige
 * les quatre. Les barres oranges disent « ça progresse », pas « c'est bon ».
 */

export interface PasswordChecks {
  length: boolean
  upper: boolean
  digit: boolean
  symbol: boolean
}

export function evaluatePassword(value: string): PasswordChecks {
  return {
    length: value.length >= 8,
    upper: /[A-ZÀ-Ÿ]/.test(value),
    digit: /\d/.test(value),
    symbol: /[^A-Za-zÀ-ÿ0-9\s]/.test(value),
  }
}

export function strengthScore(checks: PasswordChecks): StrengthScore {
  const points = Object.values(checks).filter(Boolean).length
  if (points === 0) return 0
  if (points <= 2) return 1
  if (points === 3) return 2
  return 3
}

export function isPasswordValid(checks: PasswordChecks): boolean {
  return Object.values(checks).every(Boolean)
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
  const valid = computed(() => isPasswordValid(checks.value))
  const missing = computed(() => missingCriteria(checks.value))

  return { checks, score, valid, missing }
}
