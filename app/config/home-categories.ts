/**
 * Les quatre raccourcis de la page d'accueil.
 *
 * Contenu **éditorial fixe** : aucun endpoint ne le décrit. Icônes, teintes de
 * fond et libellés sur deux lignes sont repris de `home.html` à l'identique.
 *
 * `available: false` marque un service dont l'écran n'existe pas encore : la
 * carte reste visible — elle porte l'offre commerciale — mais mène à l'offre
 * d'orientation plutôt qu'à un 404.
 */
export interface HomeCategory {
  id: string
  to: string
  /** Deux clés i18n : la maquette impose le retour à la ligne. */
  labelKey1: string
  labelKey2: string
  /** Fichiers de `public/icons/`, sans extension. */
  icon: string
  buttonIcon: string
  /** Classe de fond, adossée à un token. */
  tint: string
  available: boolean
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
    available: true,
  },
  {
    id: 'career',
    to: '/orientation',
    labelKey1: 'home.category.career1',
    labelKey2: 'home.category.career2',
    icon: 'ic-home-cat-metier',
    buttonIcon: 'ic-home-cat-metier-btn',
    tint: 'bg-surface-2',
    available: true,
  },
  {
    id: 'housing',
    to: '/orientation',
    labelKey1: 'home.category.housing1',
    labelKey2: 'home.category.housing2',
    icon: 'ic-home-cat-logement',
    buttonIcon: 'ic-home-cat-logement-btn',
    tint: 'bg-tint-green',
    available: false,
  },
  {
    id: 'language',
    to: '/langues',
    labelKey1: 'home.category.language1',
    labelKey2: 'home.category.language2',
    icon: 'ic-home-cat-langue',
    buttonIcon: 'ic-home-cat-langue-btn',
    tint: 'bg-tint-yellow',
    available: true,
  },
]
