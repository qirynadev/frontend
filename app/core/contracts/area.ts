/**
 * Domaine d'étude, propre à une destination.
 *
 * `GET /areas-of-studies/by-country/{schoolFileId}` — distinct du catalogue
 * générique d'offres (`Catalog.offers`, une formule d'accompagnement par
 * domaine, valable pour toute destination). Deux destinations n'ont pas les
 * mêmes domaines : la France n'en a que deux (Management, Médecine) quand la
 * plupart des autres en ont cinq.
 */
export interface AreaOfStudySummary {
  id: string
  /** Fourni par l'API (`AreaOfStudy.slug`) — pas dérivé du titre ici. */
  slug: string
  title: string
  /** Icône réelle du back-office — jamais une icône locale devinée pour un domaine inconnu. */
  icon: string | null
  schoolCount: number
}
