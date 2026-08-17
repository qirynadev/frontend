import type { Country } from './common'

/**
 * Destination logement, telle qu'affichée dans le sélecteur `/logement`.
 *
 * Uniquement les pays réellement dotés de formules côté back-office : la
 * grille est dynamique (décision du responsable, 2026-08-17) — pas de carte
 * pour un pays sans offre réelle. Cinq pays sur les six de l'ancienne liste
 * éditoriale au 2026-08-17, l'Allemagne n'ayant aucune formule publiée.
 */
export interface LivingDestination {
  slug: string
  /** Nom du pays : « France ». Comme `DestinationSummary.title`, ce n'est pas `title` côté API — celui-ci porte une accroche marketing. */
  country: Country
  /** Accroche marketing (le `title` de l'API), ex. « Votre logement étudiant en France, en toute sécurité ». */
  tagline: string
  photo: string | null
}

/**
 * Bandeau statistique d'une destination logement, vu sur sa page tarifaire.
 *
 * Chaque champ est `null` tant que le back-office ne l'a pas renseigné pour ce
 * pays — au 2026-08-17, seule la France les porte tous ; les quatre autres
 * destinations réelles n'ont rien. La page doit masquer une statistique
 * absente plutôt que réutiliser celle d'un autre pays (bug corrigé de
 * l'implémentation précédente, qui affichait les mêmes chiffres partout).
 */
export interface LivingStats {
  heroTagline: string | null
  depositLabel: string | null
  leaseDurationLabel: string | null
  chargesLabel: string | null
  averageRentLabel: string | null
}
