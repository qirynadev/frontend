import { describe, expect, it } from 'vitest'
import { parseFormationDescription } from '~/utils/formation-content'

describe('parseFormationDescription', () => {
  it('extrait les rubriques modale et une accroche hors « Cible »', () => {
    const html = [
      '<p class="ql-align-justify"><strong>Cible ?</strong>&nbsp;Le lycéen motivé.</p>',
      '<p class="ql-align-justify"><strong>Programmes ?</strong>&nbsp;Cursus en 3 ans avec stages internationaux et parcours personnalisé.</p>',
      '<p><strong>Frais ?</strong>&nbsp;Environ 12 000 € par an.</p>',
    ].join('')

    const parsed = parseFormationDescription(html)

    expect(parsed.summary).toContain('Cursus en 3 ans')
    expect(parsed.summary).not.toContain('Cible')
    expect(parsed.summary).not.toContain('Le lycéen')
    expect(parsed.bodyHtml).toBe('')
    expect(parsed.sections.map((s) => s.label)).toEqual(['Cible', 'Programmes', 'Frais'])
  })

  it('privilégie un paragraphe d’intro libre, même avec emphase <strong>', () => {
    const html = [
      '<p class="ql-align-justify"><strong>Cible ?</strong>&nbsp;Le lycéen qui veut une formation internationale.</p>',
      '<p class="ql-align-justify">NEOMA propose plusieurs programmes. Le&nbsp;<strong>Global BBA</strong>&nbsp;(4 ans) est le programme phare.</p>',
      '<p>Complément sur les doubles diplômes et l’alternance.</p>',
    ].join('')

    const parsed = parseFormationDescription(html)

    expect(parsed.summary).toContain('NEOMA propose plusieurs programmes')
    expect(parsed.summary).not.toContain('Le lycéen qui veut')
    expect(parsed.sections).toHaveLength(1)
    expect(parsed.sections[0]?.label).toBe('Cible')
    expect(parsed.bodyHtml).toContain('Global BBA')
    expect(parsed.bodyHtml).toContain('doubles diplômes')
  })

  it('ne réutilise jamais « Cible » comme accroche carte', () => {
    const html = '<p class="ql-align-justify"><strong>Cible ?</strong>&nbsp;Le lycéen…</p>'
    const parsed = parseFormationDescription(html)

    expect(parsed.sections).toHaveLength(1)
    expect(parsed.summary).toBe('')
    expect(parsed.bodyHtml).toBe('')
  })

  it('fonctionne après assainissement HTML (pipeline adapter)', async () => {
    const { sanitizeHtml } = await import('~/core/adapters/sanitize')
    const raw = [
      '<p class="ql-align-justify"><strong>Cible ?</strong>&nbsp;Le lycéen…</p>',
      '<p>Cursus public alliant conception et urbanité.</p>',
    ].join('')
    const parsed = parseFormationDescription(sanitizeHtml(raw))

    expect(parsed.sections).toHaveLength(1)
    expect(parsed.summary).toBe('Cursus public alliant conception et urbanité.')
    expect(parsed.bodyHtml).toContain('Cursus public')
  })
})
