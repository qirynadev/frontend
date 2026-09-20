/**
 * Écran destination desktop — replis statiques.
 *
 * Depuis le 2026-09-20, un seul écran sert toutes les destinations
 * (`desktop-pages/destination.vue`), sur le design de `/destinations/france`
 * (Figma `694:2`). Tout ce que l'API sert est dynamique : nom, accroche,
 * image, statistiques, domaines, présentation, logos d'écoles.
 *
 * Ce fichier ne garde que ce que l'API ne sert PAS encore, en repli :
 * les illustrations (l'API ne fournit pas d'icône de statistique ni de
 * domaine dessinée) et les quatre arguments rédigés pour les cinq pays
 * d'origine. Demandes correspondantes : `docs/directives-backend.md` §29.
 */

/** Dossier des visuels de la maquette de référence, partagés par toutes les destinations. */
export const DESTINATION_ASSET = '/img/desktop/destination/france'

export type DomainIconKind = 'fill' | 'circle'

export interface DomainVisuel {
  icon: string
  kind: DomainIconKind
  bg?: string
}

/**
 * Visuels de domaine par slug back-office. L'icône administrée (`area.icon`)
 * prend le relais pour tout domaine absent d'ici — c'est le cas de `mba`.
 */
export const VISUELS_DOMAINE: Record<string, DomainVisuel> = {
  'classes-prepa': { icon: `${DESTINATION_ASSET}/domain/prepa.svg`, kind: 'fill' },
  'prepa': { icon: `${DESTINATION_ASSET}/domain/prepa.svg`, kind: 'fill' },
  'classe-prepa': { icon: `${DESTINATION_ASSET}/domain/prepa.svg`, kind: 'fill' },
  'medecine': { icon: `${DESTINATION_ASSET}/domain/medecine.svg`, kind: 'circle', bg: 'bg-[#f3f5fe]' },
  'management': { icon: `${DESTINATION_ASSET}/domain/management.svg`, kind: 'circle', bg: 'bg-[#eaf6e8]' },
  'ingenierie': { icon: `${DESTINATION_ASSET}/domain/ingenierie.svg`, kind: 'fill' },
  'sciences-politiques': { icon: `${DESTINATION_ASSET}/domain/sciences-politiques.svg`, kind: 'circle', bg: 'bg-[#f4edff]' },
  'droit': { icon: `${DESTINATION_ASSET}/domain/droit.svg`, kind: 'circle', bg: 'bg-[#fcf0f0]' },
  'architecture': { icon: `${DESTINATION_ASSET}/domain/architecture.svg`, kind: 'circle', bg: 'bg-[#f3f9f7]' },
}

/** Icônes des quatre statistiques, par position — l'API n'en fournit pas. */
export const ICONES_STAT = [
  `${DESTINATION_ASSET}/stats/stat-1.svg`,
  `${DESTINATION_ASSET}/stats/stat-2.svg`,
  `${DESTINATION_ASSET}/stats/stat-3.svg`,
  `${DESTINATION_ASSET}/stats/stat-4.svg`,
] as const

/** Bandeau de réassurance : mêmes promesses pour toutes les destinations. */
export const REASSURANCES = [
  { icon: `${DESTINATION_ASSET}/trust-verified.svg`, lines: ['desktop.destinationPays.trust1'] },
  { icon: `${DESTINATION_ASSET}/trust-compare.svg`, lines: ['desktop.destinationPays.trust2'] },
  { icon: `${DESTINATION_ASSET}/trust-support.svg`, lines: ['desktop.destinationPays.trust3Line1', 'desktop.destinationPays.trust3Line2'] },
  { icon: `${DESTINATION_ASSET}/trust-premium.svg`, lines: ['desktop.destinationPays.trust4Line1', 'desktop.destinationPays.trust4Line2'] },
] as const

/**
 * Les quatre arguments « Pourquoi » — faits propres à chaque pays (frais de
 * scolarité, brevets déposés…), donc impossibles à deviner. Rédigés pour les
 * cinq destinations d'origine ; ailleurs, l'écran affiche la présentation
 * réelle de l'API à la place. Un champ `highlights` par destination est
 * demandé côté back-office (§29.3).
 */
export const ARGUMENTS_PAR_DESTINATION: Record<string, string> = {
  'france': 'desktop.destination.france',
  'chine': 'desktop.destination.chine',
  'canada': 'desktop.destination.canada',
  'royaume-uni': 'desktop.destination.angleterre',
  'angleterre': 'desktop.destination.angleterre',
  'etats-unis': 'desktop.destination.usa',
  'usa': 'desktop.destination.usa',
}

/** Icônes des quatre arguments, par position. */
export const ICONES_ARGUMENT = [
  `${DESTINATION_ASSET}/features/feature-1.svg`,
  `${DESTINATION_ASSET}/features/feature-2.svg`,
  `${DESTINATION_ASSET}/features/feature-3.png`,
  `${DESTINATION_ASSET}/features/feature-4.png`,
] as const
