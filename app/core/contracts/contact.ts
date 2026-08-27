/**
 * Message du formulaire « Centre d'aide » (`/reglages/contact`).
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
