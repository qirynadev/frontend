/**
 * Types transverses du domaine.
 *
 * Rappel : ces types décrivent ce que **l'application veut consommer**, pas ce
 * que l'API renvoie aujourd'hui. Les écarts sont absorbés par `core/adapters/`.
 */

/** Métadonnées SEO d'une page publique (cf. Lot 6). */
export interface SeoMeta {
  title: string
  description: string
  image: string | null
}

/** Pays normalisé. L'API renvoie tantôt `{ name }`, tantôt `{ id, name, iso_alpha_2 }`. */
export interface Country {
  /** Identifiant numérique back-office — `null` quand l'API ne le fournit pas. Sert à `GET /schools/{countryId}/{areaId}`. */
  id: string | null
  name: string
  /** ISO 3166-1 alpha-2 en majuscules, ou `null` si l'API ne l'a pas fourni. */
  code: string | null
  /**
   * Drapeau **SVG** servi par le back-office
   * (`/vendor/blade-flags/country-fr.svg`).
   *
   * Rempli par la couche serveur, qui seule connaît l'hôte de l'API. `null`
   * quand le code pays manque — la carte affiche alors un aplat neutre plutôt
   * qu'une image cassée.
   */
  flag: string | null
}

/** Prix normalisé. L'API renvoie `amount` en nombre et `payment_type` en chaîne. */
export interface Price {
  /** Montant en unité principale (euros), pas en centimes. */
  amount: number
  currency: 'EUR'
  /** `once` = paiement unique, `subscription` = abonnement. */
  mode: 'once' | 'subscription'
}

/** Élément de liste « ce qui est inclus » (formules, fiches). */
export interface FeatureItem {
  title: string
  /** HTML, potentiellement vide. */
  description: string
  icon: string | null
  included: boolean
}

/** Entrée de menu de navigation. */
export interface MenuEntry {
  id: string
  title: string
  slug: string
  badge: string | null
}

export interface MenuSection {
  /** Libellé de la section tel qu'administré côté back-office. */
  label: string
  entries: MenuEntry[]
}

export interface Menu {
  destinations: MenuSection
  courses: MenuSection
  living: MenuSection
  mba: MenuSection
  profiling: MenuSection
}

export interface SocialLink {
  /** Normalisé en minuscules : l'API mélange `facebook` et `Instagram`. */
  name: string
  url: string
}

export interface SiteSettings {
  name: string
  description: string
  email: string
  phone: string
  stripePublicKey: string | null
  analyticsId: string | null
  socials: SocialLink[]
  locales: Array<{ code: string; label: string }>
}
