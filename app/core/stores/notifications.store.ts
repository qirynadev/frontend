import { defineStore } from 'pinia'
import { notificationRepo } from '../repositories'

/**
 * Compteur de notifications non lues (pastille de la cloche, `AppTopBar`).
 *
 * Un seul état partagé par toute l'app plutôt qu'un `:notifications="3"`
 * recopié sur chaque page (26 occurrences avant ce correctif, toutes figées
 * à la même valeur inventée) : `AppTopBar` lit ce store directement et se
 * recharge à chaque montage — donc à chaque navigation, puisqu'il vit dans
 * chaque page plutôt que dans un layout persistant — pour rester exact
 * quelle que soit la page affichée. `messages.vue` partage le même store
 * (au lieu de son propre appel `unreadCount`) pour que la cloche et le
 * badge de l'onglet « Notification » ne divergent jamais.
 */
export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)

  async function refresh(locale?: string): Promise<void> {
    try {
      const { count } = await notificationRepo.unreadCount(locale)
      unreadCount.value = count
    }
    catch {
      // Non authentifié, ou panne du BFF : pas de pastille plutôt qu'une
      // erreur bloquante sur un élément d'en-tête présent sur toutes les pages.
      unreadCount.value = 0
    }
  }

  /** Mise à jour immédiate depuis une réponse qui renvoie déjà le compte à jour (ex. `markRead`). */
  function setCount(count: number): void {
    unreadCount.value = count
  }

  return { unreadCount, refresh, setCount }
})
