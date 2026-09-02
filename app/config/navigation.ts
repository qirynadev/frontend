/**
 * Source unique de la navigation principale.
 *
 * Une seule liste pour toutes les pages (accueil, auth, tunnels) — même
 * bottom-nav que `home.html`, y compris le logo Orientation agrandi.
 *
 * Les icônes sont les fichiers de la maquette (`public/img/icons/`). Elle fournit
 * une variante `-active` (violet) pour Accueil / Messages / Projet / Compte ;
 * Orientation garde toujours le logo Qiryna, seul le libellé passe en actif.
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
  /** Variante fournie par la maquette pour l'état actif (couleur). */
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

/**
 * Écrans d'authentification — l'onglet « Compte » s'y allume.
 */
const AUTH_PATHS = ['/connexion', '/inscription', '/mot-de-passe']

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
    iconActive: 'nav-messages-active',
    iconWidth: 24,
    iconHeight: 24,
  },
  {
    id: 'orientation',
    to: '/orientation',
    labelKey: 'nav.orientation',
    // Logo Qiryna partout (accueil = référence) — jamais teinté à l'actif.
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
    // `/compte` redirige vers `/reglages` ; auth + réglages allument l'onglet.
    match: [...AUTH_PATHS, '/reglages'],
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
