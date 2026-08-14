/**
 * Registre d'icônes SVG inline.
 *
 * Remplace les 206 `<img src="assets/icons/*.svg">` de la maquette : une requête
 * réseau de moins par icône, et la couleur suit `currentColor`.
 *
 * Toutes les icônes sont tracées sur une grille 24×24, trait 1.5, bouts arrondis.
 * Le `path` n'embarque aucune couleur : c'est `QIcon` qui applique `stroke`/`fill`.
 */

export type IconStyle = 'stroke' | 'fill'

export interface IconDefinition {
  /** Contenu interne du `<svg>` (sans la balise racine). */
  body: string
  /** `stroke` (défaut) trace les contours, `fill` remplit les formes. */
  style?: IconStyle
}

export const icons = {
  // ─── Navigation ────────────────────────────────────────────────
  'chevron-left': { body: '<path d="M15 18 9 12l6-6"/>' },
  'chevron-right': { body: '<path d="m9 18 6-6-6-6"/>' },
  'chevron-down': { body: '<path d="m6 9 6 6 6-6"/>' },
  'chevron-up': { body: '<path d="m18 15-6-6-6 6"/>' },
  'arrow-right': { body: '<path d="M4 12h16M14 6l6 6-6 6"/>' },
  'arrow-left': { body: '<path d="M20 12H4M10 18l-6-6 6-6"/>' },
  close: { body: '<path d="M18 6 6 18M6 6l12 12"/>' },
  menu: { body: '<path d="M4 7h16M4 12h16M4 17h16"/>' },

  // ─── Barre de navigation basse ─────────────────────────────────
  home: { body: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>' },
  message: { body: '<path d="M4 4h16v12H7l-3 3z"/>' },
  target: {
    body: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/>',
  },
  briefcase: {
    body: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>',
  },
  account: { body: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/>' },

  // ─── Formulaire ────────────────────────────────────────────────
  mail: { body: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 6 9-6"/>' },
  lock: {
    body: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  },
  user: { body: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/>' },
  eye: { body: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/>' },
  'eye-off': {
    body: '<path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3 3.6M6.3 7.9A17 17 0 0 0 2 12s3.6 6 10 6a9.6 9.6 0 0 0 4-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/>',
  },
  search: { body: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>' },

  // ─── Retours d'état ────────────────────────────────────────────
  check: { body: '<path d="m5 13 4.5 4.5L19 7"/>' },
  'check-circle': { body: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>' },
  'alert-circle': { body: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.2v.1"/>' },
  'alert-triangle': {
    body: '<path d="M10.3 4.3 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17v.1"/>',
  },
  info: { body: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.1"/>' },
  clock: { body: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>' },

  // ─── Métier Qiryna ─────────────────────────────────────────────
  bell: {
    body: '<path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  },
  shield: { body: '<path d="M12 3 4.5 5.8V11c0 5 3.3 9.3 7.5 10 4.2-.7 7.5-5 7.5-10V5.8z"/>' },
  award: { body: '<circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.6-1.4 7L12 18l4.8 2.6-1.4-7"/>' },
  smile: {
    body: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.2a4.5 4.5 0 0 0 7 0"/><path d="M9.2 9.6v.1M14.8 9.6v.1"/>',
  },
  headset: {
    body: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.5" y="14" width="4" height="6" rx="1.5"/><rect x="17.5" y="14" width="4" height="6" rx="1.5"/>',
  },
  globe: {
    body: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  },
  'map-pin': { body: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>' },
  calendar: {
    body: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  },
  graduation: { body: '<path d="M12 4 2.5 9 12 14l9.5-5z"/><path d="M6.5 11.3V16c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4.7"/>' },
  building: {
    body: '<rect x="4" y="3.5" width="16" height="17" rx="1.5"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M10 20.5v-4h4v4"/>',
  },
  heart: { body: '<path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.5 2.9C19.5 15.6 12 20 12 20z"/>' },
  star: { body: '<path d="m12 4 2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.8z"/>' },
  'trending-up': { body: '<path d="m3 16 6-6 4 4 8-8"/><path d="M15 6h6v6"/>' },
  'credit-card': { body: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h3"/>' },
  users: {
    body: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3 2.9-5.5 6.5-5.5s6.5 2.5 6.5 5.5"/><path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 14.9c2.4.7 4 2.6 4 5.1"/>',
  },
  lightbulb: {
    body: '<path d="M9 17a6 6 0 1 1 6 0v1.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 18.5z"/><path d="M10 21h4"/>',
  },
  book: { body: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 0 4 20.5z"/><path d="M4 17.5h15"/>' },
  plane: { body: '<path d="M2.5 13.5 21 5l-4 8.5 1 6.5-3.5-1.5-2 2-1-4.5-9-3z"/>' },
  file: { body: '<path d="M13.5 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M13.5 3v5h5"/>' },
  play: { body: '<path d="M8 5.5v13l10-6.5z"/>' },
  plus: { body: '<path d="M12 5v14M5 12h14"/>' },
  video: { body: '<rect x="2.5" y="6" width="13" height="12" rx="2"/><path d="m15.5 10.5 6-3v9l-6-3z"/>' },
  settings: {
    body: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.8-1.1V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.7 1.2z"/>',
  },
  logout: { body: '<path d="M15 17l5-5-5-5M20 12H9"/><path d="M12 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h6"/>' },
} as const satisfies Record<string, IconDefinition>

export type IconName = keyof typeof icons

export const iconNames = Object.keys(icons) as IconName[]
