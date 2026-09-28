import { describe, expect, it } from 'vitest'
import { toMbaRegionSchools } from '~/core/adapters'

/**
 * Forme réelle de `GET /mba/schools?region=europe` (back-office local,
 * 2026-09-28) : le pays de l'école n'a que son nom, son identifiant est à la
 * racine (`lc_country_id`).
 */
const page = {
  current_page: 2,
  per_page: 4,
  total: 17,
  last_page: 5,
  data: [
    { id: 'a', title: 'INSEAD', slug: 'insead', city: 'Fontainebleau', lc_country_id: 73, country: { name: 'France' } },
    { id: 'b', title: 'Rotterdam School of Management', slug: 'rsm', city: 'Rotterdam', lc_country_id: 150, country: { name: 'Pays-Bas' } },
    { id: 'c', title: 'IE Business School', slug: 'ie', city: 'Madrid', lc_country_id: 199, country: { name: 'Espagne' } },
  ],
}

const destinations = [
  { slug: 'france', country: { id: '73' } },
  { slug: 'royaume-uni', country: { id: '75' } },
  { slug: 'espagne-sans-id', country: { id: null } },
]

const region = { slug: 'europe', title: 'Europe' }
const mba = { id: 'm', title: 'MBA', slug: 'mba', icon: 'https://x/mba.png', nbr_schools: 32 }

describe('toMbaRegionSchools', () => {
  it('reprend la pagination du back-office', () => {
    const result = toMbaRegionSchools(page, mba, region, destinations, 2)
    expect(result).toMatchObject({ region, page: 2, perPage: 4, total: 17, totalPages: 5 })
    expect(result.items.map(school => school.slug)).toEqual(['insead', 'rsm', 'ie'])
  })

  it('ouvre une école sous la destination de son pays, sinon sous le nom du pays', () => {
    const slugs = toMbaRegionSchools(page, mba, region, destinations, 2).items.map(school => school.destinationSlug)
    expect(slugs).toEqual(['france', 'pays-bas', 'espagne'])
  })

  it('garde le domaine MBA pour la puce sélectionnée', () => {
    expect(toMbaRegionSchools(page, mba, region, destinations, 2).area).toMatchObject({ id: 'm', slug: 'mba', title: 'MBA' })
  })

  it('écarte un autre domaine renvoyé par erreur, ou une absence', () => {
    const wrong = { id: 'p', title: 'Science Politique', slug: 'science-politique' }
    expect(toMbaRegionSchools(page, wrong, region, destinations, 2).area).toBeNull()
    expect(toMbaRegionSchools(page, null, region, destinations, 2).area).toBeNull()
  })

  it('une zone sans école donne une liste vide', () => {
    const empty = { current_page: 1, per_page: 4, total: 0, last_page: 1, data: [] }
    expect(toMbaRegionSchools(empty, mba, { slug: 'afrique', title: 'Afrique' }, destinations, 1))
      .toMatchObject({ items: [], total: 0, totalPages: 1 })
  })
})
