/**
 * Récapitulatif de confirmation contact — Figma `1572:3044`.
 *
 * Aucun endpoint d’envoi de message : après validation locale du formulaire
 * `/reglages/contact`, l’écran succès affiche le récap saisi. Les valeurs
 * ci-dessous ne servent qu’en **repli d’illustration** si un champ est vide —
 * voir `docs/reglages-contact-mocks.md`.
 */
export const contactSuccessMock = {
  subjectLabel: 'Demande écrite',
  name: 'Prénom et nom',
  email: 'exemple@email.com',
} as const
