/**
 * Contenu du menu latéral de l'accueil (`home-menu`, Figma 551:2).
 *
 * Deux sections, comme dans la maquette : « NOS SERVICES » et « AUTRE ».
 * Comme pour la barre basse, la liste est une **donnée** : ajouter une entrée
 * ne demande pas de toucher au composant.
 */
export interface SideMenuEntry {
  id: string
  to: string
  labelKey: string
  /** Fichier de `public/img/icons/`, sans extension. Affiché en 40×40. */
  icon: string
}

export interface SideMenuSection {
  /** Clé i18n de l'intertitre en capitales. */
  labelKey: string
  entries: SideMenuEntry[]
}

export const sideMenuSections: SideMenuSection[] = [
  {
    labelKey: 'menu.services',
    entries: [
      { id: 'school', to: '/destinations', labelKey: 'menu.school', icon: 'ic-menu-ecole' },
      { id: 'orientation', to: '/orientation', labelKey: 'menu.orientation', icon: 'ic-menu-orientation' },
      { id: 'housing', to: '/logement', labelKey: 'menu.housing', icon: 'ic-menu-logement' },
      { id: 'language', to: '/langues', labelKey: 'menu.language', icon: 'ic-menu-langue' },
    ],
  },
  {
    labelKey: 'menu.other',
    entries: [
      { id: 'settings', to: '/reglages', labelKey: 'menu.settings', icon: 'ic-menu-settings' },
    ],
  },
]
