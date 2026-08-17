import { describe, expect, it } from 'vitest'
import { toSchool, toSchoolSummary } from '~/core/adapters/school.adapter'
import { rawSchool, rawSchoolWithFormations } from './fixtures/all-data'

describe('réponse nominale', () => {
  it('traduit la fiche complète', () => {
    const school = toSchool(rawSchoolWithFormations, 'france')

    expect(school.slug).toBe('emlyon-business-school')
    expect(school.city).toBe('Lyon')
    expect(school.destinationSlug).toBe('france')
    expect(school.country).toEqual({ id: null, name: 'France', code: null, flag: null })
    expect(school.presentation).toContain('<p>')
  })

  it('écarte les entrées fantômes de formations et details', () => {
    const school = toSchool(rawSchoolWithFormations)

    // L’API insère systématiquement un `{ title: null, description: null }`.
    expect(school.formations).toHaveLength(1)
    expect(school.formations[0]?.title).toBe('Global Bachelor of Business Administration')
    expect(school.details).toHaveLength(1)
    expect(school.details[0]?.title).toBe('Classement')
  })

  it('donne des tableaux vides quand il n’y a que des entrées fantômes', () => {
    const school = toSchool(rawSchool)

    expect(school.formations).toEqual([])
    expect(school.details).toEqual([])
    expect(school.formationCount).toBe(0)
  })

  it('expose foundedYear et studentCount à null sans les inventer', () => {
    const school = toSchool(rawSchool)

    expect(school.foundedYear).toBeNull()
    expect(school.studentCount).toBeNull()
  })

  it('lit foundedYear le jour où l’API l’alimentera', () => {
    const school = toSchool({ ...rawSchool, founded_year: 1810, student_count: '34000' })

    expect(school.foundedYear).toBe(1810)
    expect(school.studentCount).toBe(34_000)
  })

  it('construit un SEO exploitable à partir de la présentation', () => {
    const { seo } = toSchool(rawSchool)

    expect(seo.title).toBe('Université Clermond Auvergne')
    expect(seo.description).not.toContain('<strong>')
    expect(seo.description).not.toContain('&nbsp;')
    expect(seo.image).toBe(rawSchool.image)
  })
})

describe('version liste', () => {
  it('ne transporte que ce dont une liste a besoin', () => {
    const summary = toSchoolSummary(rawSchoolWithFormations, 'france')

    expect(Object.keys(summary).sort()).toEqual(
      ['city', 'country', 'destinationSlug', 'formationCount', 'id', 'image', 'logo', 'slug', 'title'].sort(),
    )
    expect(summary.formationCount).toBe(1)
  })
})

describe('champs manquants', () => {
  it('ne lève sur aucune entrée dégradée', () => {
    for (const value of [null, undefined, {}, 42, [], 'texte']) {
      expect(() => toSchool(value)).not.toThrow()
      expect(() => toSchoolSummary(value)).not.toThrow()
    }
  })

  it('produit des valeurs par défaut sûres', () => {
    const school = toSchool({})

    expect(school.id).toBe('')
    expect(school.title).toBe('')
    expect(school.logo).toBeNull()
    expect(school.image).toBeNull()
    expect(school.presentation).toBe('')
    expect(school.formations).toEqual([])
    expect(school.destinationSlug).toBe('')
  })

  it('neutralise un logo dont l’URL est relative', () => {
    expect(toSchoolSummary({ ...rawSchool, logo: 'photos/logo.png' }).logo).toBeNull()
  })

  it('accepte un tableau formations absent', () => {
    expect(toSchool({ ...rawSchool, formations: undefined, details: 'oups' }).formations).toEqual([])
    expect(toSchool({ ...rawSchool, details: 'oups' }).details).toEqual([])
  })
})
