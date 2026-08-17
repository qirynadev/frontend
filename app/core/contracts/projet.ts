/** Teintes de pastille relevées dans `app.css` (`.mp-badge--*`). */
export type ProjetBadgeTone = 'purple' | 'green' | 'pink' | 'orange'

/**
 * Une carte de `mon-projet/index` — une commande, pas un type de service.
 *
 * `Order` (générique, tout le domaine) devient `ProjetAccompagnement` (propre
 * à cet écran) via `toAccompagnements` : le gabarit n'a pas à connaître la
 * forme d'une commande, seulement celle d'une carte.
 */
export interface ProjetAccompagnement {
  /** Identifiant de la commande — plusieurs cartes peuvent partager `titleKey`. */
  id: string
  /** Clé i18n du libellé de type (« Cours de langues »…), pas de la commande. */
  titleKey: string
  /** Résolu, pas une clé : dérivé de la commande (langue, formule…), non traduisible. */
  sub: string
  /** Clé i18n du statut porté par la pastille. */
  statusKey: string
  badgeTone: ProjetBadgeTone
  /**
   * `null` quand aucune donnée réelle ne permet d'estimer l'avancement — la
   * plupart des commandes aujourd'hui. La barre est alors masquée plutôt que
   * remplie d'un chiffre inventé.
   */
  progressPercent: number | null
  /** Couleur de remplissage de la barre, propre à chaque type de service. */
  progressColor: string
  /** `null` tant qu'aucun professeur/conseiller n'est assigné à la commande. */
  advisorName: string | null
  /** ISO `AAAA-MM-JJ` de dernière mise à jour, ou `null`. */
  updatedAt: string | null
  icon: string
  /** Destination du drill-down ; `null` tant que l'écran n'existe pas. */
  to: string | null
}
