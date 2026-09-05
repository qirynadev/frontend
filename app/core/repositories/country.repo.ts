import type { Country } from '../contracts'
import { bffFetch } from '../http/client'

export const countryRepo = {
  /** Sert le sélecteur pays de `reglages/informations-personnelles.vue`. */
  list(locale?: string): Promise<Country[]> {
    return bffFetch<Country[]>('/countries', { locale })
  },
}
