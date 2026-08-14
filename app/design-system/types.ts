/**
 * Vocabulaire partagé par les primitives.
 *
 * Les classes listées ici ne contiennent que des noms de tokens (`bg-primary`,
 * `text-danger`…) définis dans `app/assets/css/main.css`. Aucune valeur brute.
 */

import type { IconName } from './icons'

/**
 * Nom d'icône accepté par `QIcon` et par toutes les primitives qui en portent
 * une : soit une clé du registre interne, soit un fichier de `public/img/icons/`
 * repris de la maquette (`ic-bell`, `nav-home`, `flag-fr`…).
 */
export type AnyIconName = IconName | (string & {})

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
export type Size = 'sm' | 'md' | 'lg'

/** Force d'un mot de passe : 0 = vide, 1 = faible, 2 = moyen, 3 = fort. */
export type StrengthScore = 0 | 1 | 2 | 3

/** Option de `QSegmentedControl`. */
export interface SegmentOption {
  value: string
  label: string
  disabled?: boolean
}

/** Étape de `QStepper`. */
export interface StepItem {
  title: string
  description?: string
  /** Icône affichée dans la pastille ; à défaut, le numéro d'étape. */
  icon?: IconName
  tone?: Tone
}

/** Entrée de `QTrustBar`. */
export interface TrustItem {
  /** Fichier de `public/img/icons/`, sans extension. */
  icon: string
  /** Première ligne du libellé — la maquette force le retour à la ligne. */
  label: string
  /** Seconde ligne. */
  label2: string
  /** Icône dans une pastille ronde verte (seule la garantie centrale l'a). */
  circled?: boolean
}

/** Entrée de `QBottomNav`. */
export interface NavItem {
  /** Identifiant comparé à la prop `active`. */
  id: string
  to: string
  /** Libellé déjà traduit : la primitive ne connaît pas i18n. */
  label: string
  /** Fichier de `public/img/icons/`, sans extension. */
  icon: string
  /** Variante fournie par la maquette pour l'état actif. */
  iconActive?: string
  /** Dimensions relevées dans `app.css` — 24×24, ou 36×34 pour « Orientation ». */
  iconWidth: number
  iconHeight: number
}

export const TONES: Tone[] = ['primary', 'success', 'warning', 'danger', 'info', 'neutral']

/** Fond teinté + texte de la tonalité. Badges, encarts, pastilles d'icône. */
export const toneSoft: Record<Tone, string> = {
  primary: 'bg-primary-bg text-primary-link',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  neutral: 'bg-neutral-bg text-neutral',
}

/** Fond plein de la tonalité, texte blanc. */
export const toneSolid: Record<Tone, string> = {
  primary: 'bg-primary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
  info: 'bg-info text-white',
  neutral: 'bg-neutral text-white',
}

/** Contour + texte de la tonalité, fond transparent. */
export const toneOutline: Record<Tone, string> = {
  primary: 'border border-primary-link text-primary-link',
  success: 'border border-success text-success',
  warning: 'border border-warning text-warning',
  danger: 'border border-danger text-danger',
  info: 'border border-info text-info',
  neutral: 'border border-border text-neutral',
}

/** Texte seul. */
export const toneText: Record<Tone, string> = {
  primary: 'text-primary-link',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-neutral',
}
