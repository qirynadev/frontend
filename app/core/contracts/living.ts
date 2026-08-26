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

/**
 * Liste fermée côté API (`ClientPostPurchaseData.accommodation_type`,
 * `qiryna-backoffice`) — pas de texte libre accepté pour ce champ.
 */
export type LivingAccommodationType = 'apartment' | 'shared' | 'dormitory' | 'host_family' | 'other'

/**
 * Préférences de logement déjà soumises pour une commande (`GET
 * /client-data/show`) — sert à préremplir `logement/paiement-reussi.vue`.
 * Seules les colonnes réelles de l'API sont ici ; école/ville/occupants/
 * préférences libres n'ont pas de colonne dédiée (voir `LivingPreferencesInput`).
 */
export interface LivingPreferences {
  /** ISO `AAAA-MM-JJ`, ou `null`. */
  arrivalDate: string | null
  monthlyBudget: number | null
  stayDurationMonths: number | null
  accommodationType: LivingAccommodationType | null
}

/**
 * Ce que le formulaire envoie à `POST /client-data/store`.
 *
 * École, ville, nombre d'occupants et préférences libres n'ont **aucune**
 * colonne dédiée côté API pour une commande logement (vérifié 2026-08-24,
 * voir `docs/directives-backend.md`) — regroupés en une note lisible dans
 * `additionalNotes`, envoyée dans `special_requirements` (le champ libre le
 * plus proche, documenté côté back-office pour d'autres besoins — un
 * pis-aller en attendant de vraies colonnes, pas une perte de saisie).
 */
export interface LivingPreferencesInput {
  orderId: string
  arrivalDate: string | null
  monthlyBudget: number | null
  stayDurationMonths: number | null
  accommodationType: LivingAccommodationType | null
  additionalNotes: string
}
