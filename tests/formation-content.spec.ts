import { describe, expect, it } from 'vitest'
import { summaryFromHtml } from '~/utils/formation-content'

describe('summaryFromHtml', () => {
  it('dépouille le HTML pour une accroche carte en texte brut', () => {
    const html = '<p class="ql-align-justify"><strong>Cible ?</strong>&nbsp;Le lycéen motivé.</p>'

    expect(summaryFromHtml(html)).toBe('Cible ? Le lycéen motivé.')
  })

  it('tronque proprement sur un espace au-delà de la limite', () => {
    const html = `<p>${'Cursus en trois ans avec stages internationaux et parcours personnalisé. '.repeat(4)}</p>`

    const summary = summaryFromHtml(html, 40)

    expect(summary.length).toBeLessThanOrEqual(41)
    expect(summary.endsWith('…')).toBe(true)
  })

  it('retourne une chaîne vide pour un HTML vide', () => {
    expect(summaryFromHtml('')).toBe('')
    expect(summaryFromHtml('   ')).toBe('')
  })
})
