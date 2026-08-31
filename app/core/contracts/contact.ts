/**
 * Message du formulaire « Centre d'aide » (`/reglages/contact`), compte connecté.
 *
 * `POST /user/messages` (API, authentifié) — même mécanisme que la rubrique
 * « Messagerie » du back-office (`Messaging::create`), visible immédiatement
 * dans son écran admin en plus d'envoyer l'e-mail de notification. Un seul
 * champ : le message part au nom du compte connecté, avec son profil réel
 * (nom/e-mail saisis dans le formulaire n'ont pas de champ dédié côté API,
 * regroupés dans `text` — voir `reglages/contact.vue`).
 */
export interface ContactMessageInput {
  text: string
}

/**
 * Même formulaire, visiteur non connecté (`/reglages/contact` accessible sans
 * session, 2026-08-30). `POST /send-email` (API, public) n'enregistre rien en
 * base — e-mail seulement, voir `docs/directives-backend.md` — mais accepte
 * de vraies coordonnées puisqu'aucun compte ne les fournit à sa place.
 */
export interface PublicContactMessageInput {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}
