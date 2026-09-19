import { describe, expect, it } from 'vitest'
import { splitLegalHtml } from '~/utils/split-legal-html'

describe('splitLegalHtml', () => {
  it('extrait la date et ignore le h2-titre cookies suivi de la mise à jour', () => {
    const html = [
      '<h2>Politique relative aux cookies et autres traceurs</h2>',
      '<p>Dernière mise à jour : 5 septembre 2026</p>',
      '<h3>1. Qui sommes-nous ?</h3>',
      '<p>Qiryna est une plateforme EdTech.</p>',
      '<h3>2. Qu\'est-ce qu\'un cookie ?</h3>',
      '<p>Un petit fichier texte.</p>',
    ].join('')

    const doc = splitLegalHtml(html, 'Cookies')
    expect(doc.updated).toBe('5 septembre 2026')
    expect(doc.leadHtml).toBe('')
    expect(doc.sections).toHaveLength(2)
    expect(doc.sections[0].title).toBe('1. Qui sommes-nous ?')
    expect(doc.sections[0].html).toContain('plateforme EdTech')
    expect(doc.sections[1].title).toBe('2. Qu\'est-ce qu\'un cookie ?')
  })

  it('découpe les h2 privacy et lit la date dans le préambule', () => {
    const html = [
      '<p><strong>Dernière mise à jour : avril 2025</strong></p>',
      '<p><br></p>',
      '<h2>1. Introduction</h2>',
      '<p>Qiryna protège vos données.</p>',
      '<h2>2. Responsable du traitement</h2>',
      '<p>Qiryna SAS</p>',
    ].join('')

    const doc = splitLegalHtml(html, 'Politique de confidentialité')
    expect(doc.updated).toBe('avril 2025')
    expect(doc.sections.map(s => s.title)).toEqual([
      '1. Introduction',
      '2. Responsable du traitement',
    ])
  })
})
