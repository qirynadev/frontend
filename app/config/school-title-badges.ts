/**
 * Badges du héros fiche école (Figma `Fiche ecole` 8:613).
 *
 * L’API école (`School` / `GET /schools/{id}`) n’expose ni le type
 * d’établissement (grande école, privée, publique…) ni les accréditations
 * (AACSB, Equis, AMBA). Repli éditorial jusqu’à un vrai champ back-office —
 * voir `docs/fiche-ecole-badges-mocks.md`.
 */

export interface SchoolTitleBadge {
  labelKey: string
  bg: string
  uppercase?: boolean
}

/** Tags Figma SKEMA (8:614 → 8:622). */
export const FIGMA_GRANDE_ECOLE_BADGES: SchoolTitleBadge[] = [
  { labelKey: 'desktop.ficheEcole.badgeGrandeEcole', bg: '#4a248a' },
  { labelKey: 'desktop.ficheEcole.badgePrivee', bg: '#3b3b3b' },
  { labelKey: 'desktop.ficheEcole.badgeAacsb', bg: '#279848' },
  { labelKey: 'desktop.ficheEcole.badgeEquis', bg: '#0066cc' },
  { labelKey: 'desktop.ficheEcole.badgeAmba', bg: '#0066cc', uppercase: true },
]

/** Heuristique pour les universités / facultés (ex. Jean Monnet). */
export const FIGMA_UNIVERSITE_BADGES: SchoolTitleBadge[] = [
  { labelKey: 'desktop.ficheEcole.badgeUniversite', bg: '#4a248a' },
  { labelKey: 'desktop.ficheEcole.badgePublique', bg: '#3b3b3b' },
]

/** Surcharges explicites par slug API, si l’heuristique ne suffit pas. */
export const SCHOOL_TITLE_BADGES_BY_SLUG: Record<string, SchoolTitleBadge[]> = {}

const UNIVERSITE_RE = /universit|facult[ée]|college|collège/i

export function schoolTitleBadges(school: { slug: string, title: string }): SchoolTitleBadge[] {
  const bySlug = SCHOOL_TITLE_BADGES_BY_SLUG[school.slug]
  if (bySlug) return bySlug
  if (UNIVERSITE_RE.test(school.title)) return FIGMA_UNIVERSITE_BADGES
  return FIGMA_GRANDE_ECOLE_BADGES
}
