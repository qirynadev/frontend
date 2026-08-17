import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toDestination, toDestinationList, toDestinationSummary } from '~/core/adapters/destination.adapter'
import { rawDestination, rawSchool, rawSchoolWithFormations } from './fixtures/all-data'

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

// Sans restauration, `spyOn` réutilise le même mock d'un test à l'autre et
// l'historique des appels s'accumule.
afterEach(() => {
  vi.restoreAllMocks()
})

describe('réponse nominale', () => {
  it('remet le nom du pays dans title et l’accroche dans tagline', () => {
    const destination = toDestination(rawDestination)

    // L’API met une accroche marketing dans `title` — le domaine ne s’y trompe pas.
    expect(destination.title).toBe('France')
    expect(destination.tagline).toBe('L’excellence universitaire reconnue, accessible et durable')
  })

  it('normalise le pays', () => {
    expect(toDestination(rawDestination).country).toEqual({ id: '73', name: 'France', code: 'FR', flag: null })
  })

  it('expose les écoles en version légère, sans présentation HTML', () => {
    const destination = toDestination(rawDestination)

    expect(destination.schools).toHaveLength(2)
    expect(destination.schools[0]).not.toHaveProperty('presentation')
    expect(destination.schools[0]).not.toHaveProperty('formations')
    expect(destination.schools[0]?.destinationSlug).toBe('france')
  })

  it('compte les formations réellement renseignées', () => {
    const [clermont, emlyon] = toDestination(rawDestination).schools
    expect(clermont?.formationCount).toBe(0)
    expect(emlyon?.formationCount).toBe(1)
  })

  it('déduit le SEO du contenu quand le back-office ne le renseigne pas', () => {
    const { seo } = toDestination(rawDestination)

    expect(seo.title).toBe('France')
    expect(seo.description).not.toContain('<')
    expect(seo.description.length).toBeLessThanOrEqual(161)
    expect(seo.image).toBe('https://admin.stage.qiryna.com/storage/photos/schools_files/france.png')
  })

  it('préfère le nombre réel d’écoles à nbr_schools', () => {
    // L’API annonce 108 mais n’en transporte que 2 : les deux divergent dès
    // qu’une école est dépubliée.
    expect(toDestination(rawDestination).schoolCount).toBe(2)
  })
})

describe('champs manquants', () => {
  it('ne lève pas sur un objet vide', () => {
    expect(() => toDestination({})).not.toThrow()

    const empty = toDestination({})
    expect(empty.id).toBe('')
    expect(empty.title).toBe('')
    expect(empty.schools).toEqual([])
    expect(empty.image).toBeNull()
    expect(empty.country).toEqual({ id: null, name: '', code: null, flag: null })
  })

  it('ne lève pas sur null, undefined ou un scalaire', () => {
    for (const value of [null, undefined, 42, 'texte', []]) {
      expect(() => toDestination(value)).not.toThrow()
      expect(toDestination(value).schools).toEqual([])
    }
  })

  it('retombe sur title et signale l’anomalie quand country.name manque', () => {
    const summary = toDestinationSummary({ ...rawDestination, country: null })

    expect(summary.title).toBe('L’excellence universitaire reconnue, accessible et durable')
    expect(summary.tagline).toBe('')
    expect(warn).toHaveBeenCalled()
  })

  it('écarte les écoles sans id ni slug plutôt que de les afficher', () => {
    const destination = toDestination({
      ...rawDestination,
      schools: [rawSchool, { ...rawSchool, id: '', slug: '' }, { title: 'orpheline' }],
    })

    expect(destination.schools).toHaveLength(1)
  })

  it('accepte une image en `image` quand `picture` est absent', () => {
    const { image } = toDestinationSummary({ ...rawDestination, picture: null, image: 'https://x.test/a.png' })
    expect(image).toBe('https://x.test/a.png')
  })
})

describe('slugs dupliqués', () => {
  const withDuplicates = {
    ...rawDestination,
    schools: [
      { ...rawSchoolWithFormations, id: 'ffff', slug: 'universite-lille' },
      rawSchool,
      { ...rawSchoolWithFormations, id: '0000', slug: 'universite-lille' },
    ],
  }

  it('ne retient qu’une école par slug', () => {
    const destination = toDestination(withDuplicates)
    const lille = destination.schools.filter((school) => school.slug === 'universite-lille')

    expect(lille).toHaveLength(1)
    // Arbitrage déterministe : premier `id` par ordre croissant.
    expect(lille[0]?.id).toBe('0000')
  })

  it('produit le même résultat quel que soit l’ordre de la réponse', () => {
    const forward = toDestination(withDuplicates).schools.map((s) => s.id)
    const backward = toDestination({ ...withDuplicates, schools: [...withDuplicates.schools].reverse() }).schools.map((s) => s.id)

    expect([...forward].sort()).toEqual([...backward].sort())
  })

  it('journalise la collision', () => {
    toDestination(withDuplicates)

    const messages = warn.mock.calls.map((call) => String(call[0]))
    expect(messages.some((message) => message.includes('collision(s) de slug'))).toBe(true)
    expect(messages.some((message) => message.includes('écoles de « france »'))).toBe(true)
  })

  it('déduplique aussi les destinations entre elles', () => {
    const list = toDestinationList([
      { ...rawDestination, id: 'zzz' },
      { ...rawDestination, id: 'aaa' },
      { ...rawDestination, id: 'bbb', slug: 'chine', country: { name: 'Chine', iso_alpha_2: 'cn' } },
    ])

    expect(list).toHaveLength(2)
    expect(list.find((d) => d.slug === 'france')?.id).toBe('aaa')
    expect(list.find((d) => d.slug === 'chine')?.country.code).toBe('CN')
  })

  it('ignore une liste qui n’en est pas une', () => {
    expect(toDestinationList(null)).toEqual([])
    expect(toDestinationList({ schoolSheets: [] })).toEqual([])
  })
})
