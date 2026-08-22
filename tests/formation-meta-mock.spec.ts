import { describe, expect, it } from 'vitest'
import { resolveFormationMeta } from '~/config/formation-meta-mock'

describe('resolveFormationMeta', () => {
  it('préfère les champs API quand les deux sont présents', () => {
    expect(resolveFormationMeta('Ignore', 'Grade Licence', '4 ans')).toEqual({
      grade: 'Grade Licence',
      duration: '4 ans',
      mocked: false,
    })
  })

  it('infère Bachelor / durée depuis le titre', () => {
    const meta = resolveFormationMeta('Global BBA et Bachelors', null, null)
    expect(meta.grade).toBe('Grade Bachelor')
    expect(meta.duration).toBe('3 ans')
    expect(meta.mocked).toBe(true)
  })

  it('lit une durée explicite dans le titre', () => {
    const meta = resolveFormationMeta('Programme Grande École (2 ans)', null, null)
    expect(meta.grade).toBe('Grade Master')
    expect(meta.duration).toBe('2 ans')
  })

  it('infère MBA', () => {
    const meta = resolveFormationMeta('Global Executive MBA', null, null)
    expect(meta.grade).toBe('Grade MBA')
    expect(meta.duration).toBe('12 à 18 mois')
  })

  it('garde un grade API et mocke seulement la durée manquante', () => {
    const meta = resolveFormationMeta('Master Finance', 'Grade Master', null)
    expect(meta.grade).toBe('Grade Master')
    expect(meta.duration).toBe('2 ans')
    expect(meta.mocked).toBe(true)
  })
})
