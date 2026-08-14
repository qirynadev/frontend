import { useSessionStore } from '~/core/stores'

/**
 * Amorçage de la session.
 *
 * Tourne au **rendu serveur**, là où le cookie `httpOnly` est lisible : le
 * store est peuplé avant le premier rendu, transporté dans la charge utile
 * Nuxt, et l'hydratation ne redemande rien. Sans cela, chaque page protégée
 * afficherait un état déconnecté avant de se corriger — le clignotement
 * classique des applications qui lisent leur session en JavaScript.
 *
 * Côté navigateur, le plugin ne fait rien si l'amorçage a déjà eu lieu ; il ne
 * rattrape que le cas d'une page servie sans rendu serveur.
 *
 * **Aucune langue n'est transmise, volontairement.** L'en-tête `lang` sert au
 * back-office à traduire du *contenu* ; `/user/me` n'en renvoie pas. Passer la
 * langue ici obligerait ce plugin à dépendre de l'ordre d'initialisation de
 * `@nuxtjs/i18n`, pour un effet nul.
 */
export default defineNuxtPlugin(async () => {
  const session = useSessionStore()
  if (session.isResolved) return
  await session.hydrate()
})
