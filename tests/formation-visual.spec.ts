import { describe, expect, it } from 'vitest'
import { formationVisual } from '~/config/formation-visual'

const icon = (title: string, grade: string) => formationVisual({ title, grade }).icon

describe('formationVisual', () => {
  it('distingue les quatre formations d’une même école, toutes saisies « Master » ou presque', () => {
    expect(icon('Diplôme d’ingénieur', 'Master')).toBe('settings')
    expect(icon('Master', 'Master')).toBe('book')
    expect(icon('Mastère Spécialisé', 'Master')).toBe('award')
    expect(icon('Doctorat', 'PhD')).toBe('lightbulb')
  })

  it('reconnaît les variantes de saisie (accents, casse, anglais)', () => {
    expect(icon('Mastère Spécialisé® Architecture & Innovation', 'Grade Mastère Spécialisé')).toBe('award')
    expect(icon('Bachelor of Science', 'Licence')).toBe('graduation')
    expect(icon('PhD Track', '-')).toBe('lightbulb')
    expect(icon('Executive Master', 'Master')).toBe('briefcase')
    expect(icon('Classes préparatoires', '-')).toBe('trending-up')
  })

  it('le grade suffit quand le titre est libre', () => {
    expect(icon('Global BBA', 'Licence')).toBe('graduation')
    expect(icon('Architecture & Transition écologique', 'Master')).toBe('book')
  })

  it('retombe sur l’icône par défaut quand rien n’est reconnu', () => {
    expect(formationVisual({ title: 'Diplôme d’État d’Architecture', grade: '-' }))
      .toEqual({ icon: 'graduation', bg: 'bg-[#f1f0fe]', fg: 'text-[#552bfc]' })
  })

  it('donne une teinte différente à chaque type d’une même école', () => {
    const teintes = [
      ['Diplôme d’ingénieur', 'Master'],
      ['Master', 'Master'],
      ['Mastère Spécialisé', 'Master'],
      ['Doctorat', 'PhD'],
    ].map(([title, grade]) => formationVisual({ title: title!, grade: grade! }).bg)
    expect(new Set(teintes).size).toBe(4)
  })
})
