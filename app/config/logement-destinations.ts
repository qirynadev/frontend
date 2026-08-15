/**
 * Les six destinations de la grille « Trouver mon logement ».
 *
 * Contenu **éditorial fixe**, comme les raccourcis de l'accueil : `menu.living`
 * de l'API donne bien les pays, mais ni photo ni drapeau. Les visuels viennent
 * donc de la maquette (`images/logement/`), convertis en webp.
 *
 * Le décompte « 350+ logements » est celui de la maquette : l'API ne compte pas
 * les logements. Il est porté par une clé i18n, pas par une donnée, pour que
 * l'écart soit visible le jour où l'endpoint existera.
 */
export interface LogementDestination {
  id: string
  /** Clé i18n du nom du pays. */
  labelKey: string
  photo: string
  flag: string
}

export const logementDestinations: LogementDestination[] = [
  { id: 'france', labelKey: 'housing.countryFrance', photo: '/img/logement/france.webp', flag: '/img/logement/flag-fr.webp' },
  { id: 'canada', labelKey: 'housing.countryCanada', photo: '/img/logement/canada.webp', flag: '/img/logement/flag-ca.webp' },
  { id: 'allemagne', labelKey: 'housing.countryGermany', photo: '/img/logement/allemagne.webp', flag: '/img/logement/flag-de.webp' },
  { id: 'chine', labelKey: 'housing.countryChina', photo: '/img/logement/chine.webp', flag: '/img/logement/flag-cn.webp' },
  { id: 'angleterre', labelKey: 'housing.countryEngland', photo: '/img/logement/angleterre.webp', flag: '/img/logement/flag-gb.webp' },
  { id: 'usa', labelKey: 'housing.countryUsa', photo: '/img/logement/usa.webp', flag: '/img/logement/flag-us.webp' },
]
