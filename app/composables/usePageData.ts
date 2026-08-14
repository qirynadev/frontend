import { ApiError } from '~/core/http/errors'

/**
 * Chargement de données pour une page publique.
 *
 * Enveloppe `useAsyncData` avec ce que les quatre états attendus supposent :
 *
 * - **chargement** — `status === 'pending'`, la page affiche des squelettes ;
 * - **erreur** — `apiError` porte une `ApiError` typée, pas une `FetchError` ;
 * - **vide** — décidé par la page via `isEmpty` ;
 * - **nominal** — `data`.
 *
 * Rendu côté serveur par défaut : une page publique doit être indexable et
 * lisible sans JavaScript.
 */
export interface PageDataOptions {
  /** Recharge quand ces sources changent (paramètre de route, filtre…). */
  watch?: import('vue').WatchSource[]
  /** Conserve la valeur précédente pendant un rechargement — évite le clignotement. */
  keepPrevious?: boolean
}

export async function usePageData<T>(
  key: string,
  handler: () => Promise<T>,
  options: PageDataOptions = {},
) {
  const result = await useAsyncData<T>(key, handler, {
    watch: options.watch,
    // `null` initial : la page distingue « pas encore chargé » de « vide ».
    default: () => null as T,
  })

  /**
   * Erreur normalisée.
   *
   * `useAsyncData` enveloppe l'exception dans une `NuxtError` : la vraie cause
   * est dans `.cause`. On la déballe ici pour que les pages n'aient pas à
   * connaître ce détail.
   */
  const apiError = computed<ApiError | null>(() => {
    const raw = result.error.value
    if (!raw) return null
    if (raw instanceof ApiError) return raw
    return raw.cause instanceof ApiError ? raw.cause : null
  })

  /** `true` uniquement au tout premier chargement, pas aux rechargements. */
  const isInitialLoading = computed(() => result.status.value === 'pending' && result.data.value === null)

  return { ...result, apiError, isInitialLoading }
}
