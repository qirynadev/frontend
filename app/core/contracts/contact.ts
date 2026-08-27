/**
 * Message du formulaire « Centre d'aide » (`/reglages/contact`).
 *
 * `POST /send-email` (API, public — aucune session requise) envoie un e-mail
 * à l'adresse de support configurée côté back-office (`Setting` clé `site`) ;
 * il **n'enregistre rien en base** (`MessageAction::sendEmail`, commentaire
 * `TODO #56` dans le code source) — donc rien de visible dans le
 * back-office lui-même, seulement dans la boîte mail qui reçoit la notification.
 * Voir `docs/directives-backend.md` pour la directive correspondante.
 */
export interface ContactMessageInput {
  firstName: string
  lastName: string
  phone: string | null
  email: string
  subject: string
  message: string
}
