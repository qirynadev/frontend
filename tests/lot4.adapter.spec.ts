import { describe, expect, it, vi } from 'vitest'
import { toCourse, toCourseList, toCourseSummary } from '~/core/adapters/course.adapter'
import { orderTiers, toDomainOfferPage, toLanguageOfferPage } from '~/core/adapters/offer-page.adapter'
import { toArticleList, toOrientation } from '~/core/adapters/editorial.adapter'
import { flagUrl, toCountry } from '~/core/adapters/common.adapter'
import { rawCourse, rawOffer, rawProfilage } from './fixtures/all-data'

describe('langues', () => {
  it('sépare le nom de la langue du titre éditorial', () => {
    const course = toCourseSummary(rawCourse)

    // L’API met « Anglais » dans `language` et « Apprendre l’anglais » dans `title`.
    expect(course.name).toBe('Anglais')
    expect(course.title).toBe('Apprendre l’anglais')
  })

  it('reprend le drapeau fourni par l’API', () => {
    expect(toCourseSummary(rawCourse).flag).toBe('https://admin.stage.qiryna.com/vendor/blade-flags/country-gb.svg')
  })

  it('compte les niveaux et écarte ceux sans nom', () => {
    expect(toCourseSummary(rawCourse).levelCount).toBe(2)
    expect(toCourse(rawCourse).levels).toHaveLength(2)
  })

  it('retombe sur le titre quand `language` manque', () => {
    expect(toCourseSummary({ ...rawCourse, language: null }).name).toBe('Apprendre l’anglais')
  })

  it('expose `badge` à null sans l’inventer', () => {
    // La maquette montre « La plus demandée » ; le champ existe mais est vide.
    expect(toCourseSummary(rawCourse).badge).toBeNull()
  })

  it('ne lève sur aucune entrée dégradée', () => {
    for (const value of [null, undefined, {}, 42, []]) {
      expect(() => toCourse(value)).not.toThrow()
    }
    expect(toCourseList(null)).toEqual([])
  })

  it('déduplique par slug', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const list = toCourseList([{ ...rawCourse, id: 'zzz' }, { ...rawCourse, id: 'aaa' }])
    warn.mockRestore()

    expect(list).toHaveLength(1)
    expect(list[0]?.id).toBe('aaa')
  })
})

describe('page tarifaire unifiée', () => {
  it('construit trois paliers depuis une langue', () => {
    const page = toLanguageOfferPage(rawCourse)

    expect(page.kind).toBe('language')
    expect(page.title).toBe('Anglais')
    expect(page.tiers).toHaveLength(3)
    expect(page.tiers.every((tier) => tier.periodLabel === 'month')).toBe(true)
  })

  it('trie les paliers par prix croissant', () => {
    // L’API renvoie Kilimandjaro (200), Everest (400), Aconcagua (300) :
    // sans tri, le plus cher se retrouverait au milieu.
    expect(toLanguageOfferPage(rawCourse).tiers.map((tier) => tier.price.amount)).toEqual([200, 300, 400])
  })

  it('met en avant le palier le plus complet', () => {
    const tiers = toLanguageOfferPage(rawCourse).tiers
    expect(tiers.at(-1)?.highlighted).toBe(true)
    expect(tiers[0]?.highlighted).toBe(false)
  })

  it('ne met rien en avant quand il n’y a qu’un palier', () => {
    expect(orderTiers([{ ...toLanguageOfferPage(rawCourse).tiers[0]! }])[0]?.highlighted).toBe(false)
  })

  it('construit un palier unique depuis un domaine d’étude', () => {
    const page = toDomainOfferPage(rawOffer)

    expect(page.kind).toBe('domain')
    expect(page.tiers).toHaveLength(1)
    expect(page.tiers[0]?.price).toEqual({ amount: 490, currency: 'EUR', mode: 'once' })
    expect(page.tiers[0]?.periodLabel).toBe('once')
  })

  it('écarte les puces vides des deux formes', () => {
    // `offers[].items` contient une entrée `{ title: null }`.
    expect(toDomainOfferPage(rawOffer).tiers[0]?.features).toEqual([
      'Est molestias libero',
      'Provident cillum et',
    ])
  })

  it('ne lève sur aucune entrée dégradée', () => {
    for (const value of [null, undefined, {}, 42]) {
      expect(() => toLanguageOfferPage(value)).not.toThrow()
      expect(() => toDomainOfferPage(value)).not.toThrow()
    }
    expect(toLanguageOfferPage({}).tiers).toEqual([])
  })
})

describe('offre d’orientation', () => {
  it('traduit les catégories en « ce qui est inclus »', () => {
    const orientation = toOrientation(rawProfilage)!

    expect(orientation.title).toBe('L’avantage d’un bon profilage')
    expect(orientation.features).toHaveLength(2)
    expect(orientation.features[0]?.title).toBe('Étudiant')
  })

  it('renvoie null pour le prix plutôt que zéro', () => {
    // La maquette affiche 899 € ; l’API n’expose aucun prix.
    expect(toOrientation(rawProfilage)?.price).toBeNull()
  })

  it('lit le prix le jour où il sera alimenté', () => {
    expect(toOrientation({ ...rawProfilage, amount: 899 })?.price).toEqual({
      amount: 899,
      currency: 'EUR',
      mode: 'once',
    })
  })

  it('renvoie null plutôt qu’une coquille vide', () => {
    expect(toOrientation(null)).toBeNull()
    expect(toOrientation({})).toBeNull()
  })

  it('assainit la description', () => {
    const orientation = toOrientation({ ...rawProfilage, description: '<p>Sûr</p><script>alert(1)</script>' })
    expect(orientation?.description).toBe('<p>Sûr</p>')
  })
})

describe('articles', () => {
  it('gère l’endpoint vide de la recette', () => {
    expect(toArticleList([])).toEqual([])
    expect(toArticleList(null)).toEqual([])
  })

  it('estime une durée de lecture et normalise la date', () => {
    const [article] = toArticleList([
      {
        id: '1',
        slug: 'un-monde',
        title: 'Un monde de possibilités',
        content: `<p>${'mot '.repeat(400)}</p>`,
        picture: 'https://x.test/a.png',
        created_at: '19/08/2024',
      },
    ])

    expect(article?.readingMinutes).toBe(2)
    expect(article?.publishedAt).toBe('2024-08-19')
    expect(article?.excerpt).not.toContain('<p>')
  })

  it('renvoie null plutôt que « 0 min de lecture »', () => {
    expect(toArticleList([{ id: '1', title: 'Sans corps' }])[0]?.readingMinutes).toBeNull()
  })
})

describe('drapeaux', () => {
  it('déduit l’URL du drapeau depuis le code ISO', () => {
    expect(flagUrl('FR', 'https://admin.stage.qiryna.com/api'))
      .toBe('https://admin.stage.qiryna.com/vendor/blade-flags/country-fr.svg')
  })

  it('ne fabrique rien sans code ni base', () => {
    expect(flagUrl(null, 'https://x.test/api')).toBeNull()
    expect(flagUrl('FR')).toBeNull()
  })

  it('est branché sur toCountry', () => {
    expect(toCountry({ name: 'Chine', iso_alpha_2: 'CN' }, 'https://x.test/api').flag)
      .toBe('https://x.test/vendor/blade-flags/country-cn.svg')
  })
})
