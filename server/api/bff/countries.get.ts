import type { Country } from '~~/app/core/contracts'
import { toCountry } from '~~/app/core/adapters'

/**
 * Liste des pays — `GET /countries`, public (aucune session requise).
 *
 * Sert le sélecteur pays de `reglages/informations-personnelles.vue`
 * (`lc_country_id`, exigé par `POST /user/update-profile`) : jusqu'ici un
 * champ texte libre, alors que le back-office attend un identifiant réel.
 */
export default defineEventHandler(async (event): Promise<Country[]> => {
  const client = publicClient(event)

  let raw: unknown
  try {
    raw = await client.request('/countries')
  }
  catch (error) {
    rethrowApiError(error)
  }

  return (Array.isArray(raw) ? raw : [])
    .map((entry) => toCountry(entry))
    .filter((country) => country.id !== null && country.name !== '')
})
