/**
 * Source unique de la navigation principale.
 *
 * La maquette répète le même bloc `<nav class="bottom-nav">` dans ses 15 pages,
 * avec la classe `active` déplacée à la main. Ici, une seule liste.
 *
 * Les icônes sont les fichiers de la maquette (`public/img/icons/`). Elle fournit
 * une variante `-active` pour trois des cinq onglets ; `iconActive` reste
 * indéfini pour les autres, et l'onglet actif se distingue alors par la seule
 * couleur du libellé — exactement comme dans `home.html`.
 */

export interface NavEntry {
  /** Identifiant stable, utilisé pour désigner l'onglet actif. */
  id: string
  /** Chemin **non localisé** ; `useLocalePath()` le préfixe selon la langue. */
  to: string
  /** Clé i18n du libellé — jamais de texte en dur. */
  labelKey: string
  /** Fichier de `public/img/icons/`, sans extension. */
  icon: string
  /** Variante fournie par la maquette pour l'état actif. */
  iconActive?: string
  /** Dimensions d'affichage relevées dans `app.css`. */
  iconWidth: number
  iconHeight: number
  /**
   * Chemins supplémentaires qui doivent allumer cet onglet.
   *
   * Exemple : la fiche école (`/ecoles/hec-paris`) appartient à l'onglet
   * « Orientation ». Sans cela, l'onglet s'éteindrait dès qu'on descend d'un
   * niveau.
   */
  match?: string[]
}

export const bottomNavEntries: NavEntry[] = [
  {
    id: 'home',
    to: '/',
    labelKey: 'nav.home',
    icon: 'nav-home',
    iconActive: 'nav-home-active',
    iconWidth: 24,
    iconHeight: 24,
  },
  {
    id: 'messages',
    to: '/messages',
    labelKey: 'nav.messages',
    icon: 'nav-messages',
    iconWidth: 24,
    iconHeight: 24,
  },
  {
    id: 'orientation',
    to: '/orientation',
    labelKey: 'nav.orientation',
    // La maquette utilise le logo Qiryna, affiché plus grand que les autres.
    icon: 'ic-orientation-logo',
    iconWidth: 36,
    iconHeight: 34,
    match: ['/destinations', '/ecoles', '/domaines', '/offres', '/langues'],
  },
  {
    id: 'project',
    to: '/mon-projet',
    labelKey: 'nav.project',
    icon: 'nav-projet',
    iconActive: 'nav-projet-active',
    iconWidth: 24,
    iconHeight: 24,
    match: ['/paiement', '/paiement-reussi'],
  },
  {
    id: 'account',
    to: '/compte',
    labelKey: 'nav.account',
    icon: 'nav-compte',
    iconActive: 'nav-compte-active',
    iconWidth: 24,
    iconHeight: 24,
    match: ['/connexion', '/inscription', '/mot-de-passe'],
  },
]

/**
 * Déduit l'onglet actif d'un chemin.
 *
 * Le chemin reçu est **déjà délocalisé** (`/en/messages` → `/messages`) par
 * l'appelant : cette fonction reste pure, donc testable sans Nuxt.
 *
 * Règle : on retient la correspondance la plus longue. Sans cela, `/` — préfixe
 * de tout — gagnerait systématiquement.
 */
export function resolveActiveNavId(path: string, entries: NavEntry[] = bottomNavEntries): string | undefined {
  const normalized = path.replace(/\/+$/, '') || '/'

  let bestId: string | undefined
  let bestLength = -1

  for (const entry of entries) {
    for (const candidate of [entry.to, ...(entry.match ?? [])]) {
      const base = candidate.replace(/\/+$/, '') || '/'
      const matches = base === '/' ? normalized === '/' : normalized === base || normalized.startsWith(`${base}/`)

      if (matches && base.length > bestLength) {
        bestId = entry.id
        bestLength = base.length
      }
    }
  }

  return bestId
}
