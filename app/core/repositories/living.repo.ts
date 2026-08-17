import type { LivingDestination } from '../contracts'
import { bffFetch } from '../http/client'

/**
 * Destinations logement.
 *
 * AUJOURD'HUI — `GET /livings` côté API, adapté et mis en cache par le BFF.
 * Miroir de `courseRepo` : la page tarifaire (paliers, checkout) passe par
 * `offerPageRepo`, comme pour une langue — ce repo ne sert que la liste des
 * destinations disponibles.
 */
export const livingRepo = {
  list(locale?: string): Promise<LivingDestination[]> {
    return bffFetch<LivingDestination[]>('/livings', { locale })
  },
}
