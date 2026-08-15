/**
 * Les quatre raccourcis de la page d'accueil.
 *
 * Contenu **éditorial fixe** : aucun endpoint ne le décrit. Icônes, teintes de
 * fond et libellés sur deux lignes sont repris de `home.html` à l'identique.
 */
export interface HomeCategory {
  id: string
  to: string
  /** Deux clés i18n : la maquette impose le retour à la ligne. */
  labelKey1: string
  labelKey2: string
  /** Fichiers de `public/img/icons/`, sans extension. */
  icon: string
  buttonIcon: string
  /** Classe de fond, adossée à un token. */
  tint: string
}

export const homeCategories: HomeCategory[] = [
  {
    id: 'school',
    to: '/destinations',
    labelKey1: 'home.category.school1',
    labelKey2: 'home.category.school2',
    icon: 'ic-home-cat-school',
    buttonIcon: 'ic-home-cat-school-btn',
    tint: 'bg-tint-pink',
  },
  {
    id: 'career',
    to: '/orientation',
    labelKey1: 'home.category.career1',
    labelKey2: 'home.category.career2',
    icon: 'ic-home-cat-metier',
    buttonIcon: 'ic-home-cat-metier-btn',
    tint: 'bg-surface-2',
  },
  {
    id: 'housing',
    to: '/logement',
    labelKey1: 'home.category.housing1',
    labelKey2: 'home.category.housing2',
    icon: 'ic-home-cat-logement',
    buttonIcon: 'ic-home-cat-logement-btn',
    tint: 'bg-tint-green',
  },
  {
    id: 'language',
    to: '/langues',
    labelKey1: 'home.category.language1',
    labelKey2: 'home.category.language2',
    icon: 'ic-home-cat-langue',
    buttonIcon: 'ic-home-cat-langue-btn',
    tint: 'bg-tint-yellow',
  },
]
