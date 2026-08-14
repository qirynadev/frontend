/** Teintes de pastille relevées dans `app.css` (`.mp-badge--*`). */
export type ProjetBadgeTone = 'purple' | 'green' | 'pink' | 'orange'

export interface ProjetAccompagnement {
  id: string
  /** Clé i18n du libellé (« Admission école »…). */
  titleKey: string
  /** Clé i18n du sous-titre (« ESA Paris »…). */
  subKey: string
  /** Clé i18n du statut porté par la pastille. */
  statusKey: string
  badgeTone: ProjetBadgeTone
  progressPercent: number
  /** Couleur de remplissage de la barre, propre à chaque accompagnement. */
  progressColor: string
  /** Clé i18n du rôle du conseiller (accordé en genre dans la maquette). */
  advisorRoleKey: string
  advisorName: string
  /** Clé i18n de la fraîcheur de la mise à jour. */
  updatedKey: string
  icon: string
  /** Destination du drill-down ; `null` tant que l'écran n'existe pas. */
  to: string | null
}
