/** Teintes d'étiquette relevées dans `app.css` (`.msg-tag--*`). */
export type MessageTagTone = 'purple' | 'green' | 'orange' | 'pink' | 'violet' | 'blue'

export interface MessageConversation {
  id: string
  nameKey: string
  tagKey: string
  tagTone: MessageTagTone
  previewKey: string
  /** Horodatage tel que la maquette l'affiche : heure, « Hier », ou date. */
  time: string
  /** Nombre de non-lus ; `0` affiche la pastille pleine sans chiffre. */
  unread: number
  online?: boolean
  /** Photo 48×48, ou icône 24×24 sur fond teinté. */
  avatar: { kind: 'photo', src: string }
  | { kind: 'icon', icon: string, tint: string }
  | { kind: 'illus', icon: string }
}

/**
 * Les six conversations de `messages.html`.
 *
 * Données d'essai : l'API n'expose pas encore de messagerie. Les horodatages
 * restent des chaînes brutes, comme dans la maquette — les formater
 * supposerait des dates réelles que rien ne fournit.
 */
export const messageConversations: MessageConversation[] = [
  {
    id: 'orientation',
    nameKey: 'messages.advisorOrientation',
    tagKey: 'messages.tagAdvisorF',
    tagTone: 'purple',
    previewKey: 'messages.previewOrientation',
    time: '10:30',
    unread: 2,
    online: true,
    avatar: { kind: 'photo', src: '/img/msg-avatar-orientation.webp' },
  },
  {
    id: 'langues',
    nameKey: 'messages.advisorLanguages',
    tagKey: 'messages.tagAdvisorM',
    tagTone: 'green',
    previewKey: 'messages.previewLanguages',
    time: 'Hier',
    unread: 0,
    online: true,
    avatar: { kind: 'photo', src: '/img/msg-avatar-langues.webp' },
  },
  {
    id: 'logement',
    nameKey: 'messages.advisorHousing',
    tagKey: 'messages.tagAdvisorM',
    tagTone: 'orange',
    previewKey: 'messages.previewHousing',
    time: '12/05/2024',
    unread: 0,
    avatar: { kind: 'icon', icon: 'ic-msg-home', tint: 'bg-msg-avatar-home' },
  },
  {
    id: 'admission',
    nameKey: 'messages.advisorAdmission',
    tagKey: 'messages.tagAdvisorM',
    tagTone: 'pink',
    previewKey: 'messages.previewAdmission',
    time: '10/05/2024',
    unread: 0,
    avatar: { kind: 'photo', src: '/img/msg-avatar-admission.webp' },
  },
  {
    id: 'support-qiryna',
    nameKey: 'messages.supportQiryna',
    tagKey: 'messages.tagTeam',
    tagTone: 'violet',
    previewKey: 'messages.previewQiryna',
    time: '08/05/2024',
    unread: 0,
    avatar: { kind: 'icon', icon: 'ic-msg-target', tint: 'bg-msg-avatar-target' },
  },
  {
    id: 'support-client',
    nameKey: 'messages.supportClient',
    tagKey: 'messages.tagCustomerService',
    tagTone: 'blue',
    previewKey: 'messages.previewClient',
    time: '03/05/2024',
    unread: 0,
    avatar: { kind: 'illus', icon: 'ic-msg-support' },
  },
]
