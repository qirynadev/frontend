/** Teintes de pastille relevées dans `app.css` (`.mp-badge--*`). */
export type ProjetBadgeTone = 'purple' | 'green' | 'pink' | 'orange'

/**
 * Une carte de `mon-projet/index` — un **type de service**, pas une commande.
 *
 * Exactement 4 cartes, une par rubrique (école/logement/langues/orientation),
 * quel que soit le nombre de commandes réelles derrière chacune — consigne du
 * responsable (2026-08-23) : `useProjetData.ts` agrège toujours plusieurs
 * commandes/langues/bilans en une seule carte par rubrique.
 */
export interface ProjetAccompagnement {
  /** Identifiant de la rubrique (un par `titleKey`, jamais deux cartes du même type). */
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
  /**
   * `false` quand la rubrique n'a aucune commande réelle derrière elle — la
   * carte affiche alors 0 % et n'est plus cliquable (rien à consulter).
   */
  hasOrder: boolean
  /** Couleur de remplissage de la barre, propre à chaque type de service. */
  progressColor: string
  /** `null` tant qu'aucun professeur/conseiller n'est assigné à la commande. */
  advisorName: string | null
  /** ISO `AAAA-MM-JJ` de dernière mise à jour, ou `null`. */
  updatedAt: string | null
  icon: string
  to: string
}
