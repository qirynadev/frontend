import { describe, expect, it } from 'vitest'
import { plainText } from '~/core/adapters/primitives'
import { toFormations, toSchool, toSchoolSummary } from '~/core/adapters/school.adapter'
import { rawSchool, rawSchoolWithFormations } from './fixtures/all-data'

describe('réponse nominale', () => {
  it('traduit la fiche complète', () => {
    const school = toSchool(rawSchoolWithFormations, 'france')

    expect(school.slug).toBe('emlyon-business-school')
    expect(school.city).toBe('Lyon')
    expect(school.destinationSlug).toBe('france')
    expect(school.country).toEqual({ id: null, name: 'France', code: null, phoneCode: null, flag: null })
    expect(school.presentation).toContain('<p>')
  })

  it('écarte les entrées fantômes de details', () => {
    const school = toSchool(rawSchoolWithFormations)

    // L’API insère systématiquement un `{ title: null, description: null }`.
    expect(school.details).toHaveLength(1)
    expect(school.details[0]?.title).toBe('Classement')
  })

  it('donne des tableaux vides quand il n’y a que des entrées fantômes', () => {
    const school = toSchool(rawSchool)

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
      ['area', 'city', 'country', 'destinationSlug', 'excerpt', 'formationCount', 'foundedYear', 'id', 'image', 'logo', 'slug', 'studentCount', 'title'].sort(),
    )
    expect(summary.formationCount).toBe(1)
  })

  it('expose foundedYear et studentCount à null sans les inventer, réels le jour où l’API les alimentera', () => {
    expect(toSchoolSummary(rawSchool).foundedYear).toBeNull()
    expect(toSchoolSummary(rawSchool).studentCount).toBeNull()

    const summary = toSchoolSummary({ ...rawSchool, founded_year: 1810, student_count: '34000' })
    expect(summary.foundedYear).toBe(1810)
    expect(summary.studentCount).toBe(34_000)
  })
})

describe('version liste depuis /all-data?lite=1', () => {
  /** École telle que la sert la variante allégée : ni présentation, ni formations. */
  function liteFrom(raw: Record<string, unknown>, excerpt: string, formationCount: number) {
    const { presentation: _p, points_forts: _pf, formations: _f, details: _d, ...rest } = raw
    return { ...rest, excerpt, formation_count: formationCount }
  }

  it('donne le même résumé que la variante complète', () => {
    const full = toSchoolSummary(rawSchoolWithFormations, 'france')
    // Le back-office envoie le texte brut de la présentation (300 caractères au plus).
    const excerpt = plainText(String(rawSchoolWithFormations.presentation))
    const lite = toSchoolSummary(liteFrom(rawSchoolWithFormations, excerpt, full.formationCount), 'france')

    expect(lite).toEqual(full)
  })

  it('lit formation_count tel quel, y compris zéro', () => {
    expect(toSchoolSummary(liteFrom(rawSchool, 'Extrait.', 0)).formationCount).toBe(0)
    expect(toSchoolSummary(liteFrom(rawSchool, 'Extrait.', 4)).formationCount).toBe(4)
  })

  it('recoupe l’extrait à la longueur de la carte, sur un mot entier', () => {
    const summary = toSchoolSummary(liteFrom(rawSchool, 'formation internationale '.repeat(12).trim(), 1))

    expect(summary.excerpt.length).toBeLessThanOrEqual(181)
    expect(summary.excerpt.endsWith('…')).toBe(true)
  })

  it('ne retraite pas comme du HTML un extrait déjà brut', () => {
    const summary = toSchoolSummary(liteFrom(rawSchool, 'Âge requis < 25 ans, admission > 90 % des candidats.', 1))

    expect(summary.excerpt).toBe('Âge requis < 25 ans, admission > 90 % des candidats.')
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
    expect(school.destinationSlug).toBe('')
  })

  it('neutralise un logo dont l’URL est relative', () => {
    expect(toSchoolSummary({ ...rawSchool, logo: 'photos/logo.png' }).logo).toBeNull()
  })

  it('accepte un tableau details absent', () => {
    expect(toSchool({ ...rawSchool, details: 'oups' }).details).toEqual([])
  })
})

/**
 * `toFormations()` — consommée par `GET /schools/{id}/formations`
 * (directives-backend §12), plus par `toSchool()`.
 */
describe('toFormations', () => {
  it('écarte les entrées fantômes', () => {
    const formations = toFormations(rawSchoolWithFormations.formations)

    // L’API insère systématiquement un `{ title: null, description: null }`.
    expect(formations).toHaveLength(1)
    expect(formations[0]?.title).toBe('Global Bachelor of Business Administration')
    // `description` : HTML brut du back-office, non retravaillé (affiché tel
    // quel par la modale — voir `[school].vue`).
    expect(formations[0]?.description).toContain('<strong>Cible ?</strong>')
    expect(formations[0]?.description).toContain('Bachelor international')
    expect(formations[0]?.summary).toContain('Bachelor international')
  })

  it('donne un tableau vide quand il n’y a que des entrées fantômes, ou rien', () => {
    expect(toFormations(rawSchool.formations)).toEqual([])
    expect(toFormations(undefined)).toEqual([])
  })

  it('« - » si grade/duration ne sont pas renseignés, pas une valeur devinée depuis le titre', () => {
    const formations = toFormations(rawSchoolWithFormations.formations)

    expect(formations[0]?.grade).toBe('-')
    expect(formations[0]?.duration).toBe('-')
  })

  it('grade/duration réels quand le back-office les alimente', () => {
    const formations = toFormations([
      {
        title: 'Programme test',
        description: '<p>Accroche libre.</p>',
        grade: 'Grade Licence',
        duration: '4 ans',
      },
    ])

    expect(formations[0]?.grade).toBe('Grade Licence')
    expect(formations[0]?.duration).toBe('4 ans')
  })
})

describe('domaine de la fiche (une fiche par domaine, plan IA lot 7)', () => {
  const droit = { id: 'area-droit', title: 'Droit', slug: 'droit' }
  const medecine = { id: 'area-medecine', title: 'Médecine', slug: 'medecine' }

  it('lit le domaine de la fiche, dans la liste comme dans la fiche complète', () => {
    expect(toSchoolSummary({ ...rawSchool, area: medecine }).area).toEqual(medecine)
    expect(toSchool({ ...rawSchool, area: medecine }).area).toEqual(medecine)
  })

  it('donne null sans domaine, ou avec un domaine sans identifiant ni slug', () => {
    expect(toSchool(rawSchool).area).toBeNull()
    expect(toSchool({ ...rawSchool, area: null }).area).toBeNull()
    expect(toSchool({ ...rawSchool, area: { id: '', title: 'Droit', slug: 'droit' } }).area).toBeNull()
    expect(toSchool({ ...rawSchool, area: { id: 'area-droit', title: 'Droit', slug: '' } }).area).toBeNull()
  })

  it('lit les autres domaines de l’école', () => {
    const school = toSchool({ ...rawSchool, area: medecine, other_domains: [droit] })

    expect(school.otherDomains).toEqual([droit])
  })

  it('écarte des autres domaines celui de la fiche et les entrées inexploitables', () => {
    const school = toSchool({
      ...rawSchool,
      area: medecine,
      other_domains: [medecine, droit, { id: '', slug: 'x', title: 'X' }, 'n’importe quoi'],
    })

    expect(school.otherDomains).toEqual([droit])
  })

  it('donne une liste vide quand l’API ne renvoie pas les autres domaines', () => {
    expect(toSchool(rawSchool).otherDomains).toEqual([])
  })
})
