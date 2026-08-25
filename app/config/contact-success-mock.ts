/**
 * Récapitulatif de confirmation contact — capture produit (WhatsApp 2026-08-23).
 *
 * Aucun endpoint d’envoi de message : après validation locale du formulaire
 * `/reglages/contact`, l’écran succès affiche le récap saisi. Les valeurs
 * ci-dessous ne servent qu’en **repli d’illustration** (capture / démo) si
 * un champ est vide — voir `docs/reglages-contact-mocks.md`.
 */
export const contactSuccessMock = {
  subjectLabel: 'Demande écrite',
  name: 'Prénom et nom',
  email: 'exemple@email.com',
} as const
