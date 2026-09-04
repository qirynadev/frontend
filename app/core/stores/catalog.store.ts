import { defineStore } from 'pinia'
import type { Catalog } from '../contracts'
import { catalogRepo } from '../repositories'
import { ApiError } from '../http/errors'

/**
 * Amorçage partagé par toute l'application.
 *
 * Chargé une fois au rendu serveur, transporté dans la charge utile Nuxt, puis
 * réutilisé lors des navigations client : le catalogue n'est jamais rechargé
 * pour rien.
 *
 * Le store ne connaît **ni URL, ni forme de l'API** : il ne parle qu'au
 * repository, qui ne parle qu'au BFF.
 */
export const useCatalogStore = defineStore('catalog', () => {
  const catalog = ref<Catalog | null>(null)
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const error = ref<ApiError | null>(null)

  /** Chargement idempotent : deux appels concurrents ne déclenchent qu'une requête. */
  let inflight: Promise<void> | null = null

  async function load(force = false): Promise<void> {
    if (!force && status.value === 'ready') return
    if (inflight) return inflight

    status.value = 'loading'
    error.value = null

    inflight = catalogRepo
      .load()
      .then((result) => {
        catalog.value = result
        status.value = 'ready'
      })
      .catch((cause: unknown) => {
        error.value = cause instanceof ApiError ? cause : null
        status.value = 'error'
        // Le catalogue précédent est conservé : une erreur de rafraîchissement
        // ne doit pas vider l'écran de l'utilisateur.
      })
      .finally(() => {
        inflight = null
      })

    return inflight
  }

  const isReady = computed(() => status.value === 'ready')
  const menu = computed(() => catalog.value?.menu ?? null)
  const settings = computed(() => catalog.value?.settings ?? null)
  const destinations = computed(() => catalog.value?.destinations ?? [])
  const offers = computed(() => catalog.value?.offers ?? [])
  const pages = computed(() => catalog.value?.pages ?? [])
  const partners = computed(() => catalog.value?.partners ?? [])

  return { catalog, status, error, isReady, menu, settings, destinations, offers, pages, partners, load }
})
