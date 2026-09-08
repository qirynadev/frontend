import { useNotificationsStore, useSessionStore } from '~/core/stores'

/**
 * Amorçage du compteur de notifications non lues — même principe que
 * `session.ts` : peuplé au rendu serveur pour un premier affichage de la
 * pastille déjà correct, sans clignotement après l'hydratation.
 *
 * `AppTopBar` se recharge lui-même à chaque montage (donc à chaque
 * navigation) pour rester exact au fil de la session ; ce plugin ne couvre
 * que le tout premier rendu.
 *
 * `session.hydrate()` est sans effet si la session est déjà résolue : appeler
 * ce plugin après `session.ts` ou avant ne change rien, aucun ordre explicite
 * n'est nécessaire entre les deux.
 */
export default defineNuxtPlugin(async () => {
  const session = useSessionStore()
  await session.hydrate()
  if (!session.isAuthenticated) return

  await useNotificationsStore().refresh()
})
