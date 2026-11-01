import { describe, expect, it } from 'vitest'
import { html } from '~/core/adapters/primitives'
import { frenchSpacing, markRubriques } from '~/core/adapters/typography'

const NBSP = ' '

describe('frenchSpacing', () => {
  it('ne coupe plus un nombre entre ses groupes de chiffres', () => {
    expect(frenchSpacing('<p>56 715 étudiants, 1 234 567 euros</p>'))
      .toBe(`<p>56${NBSP}715 étudiants, 1${NBSP}234${NBSP}567 euros</p>`)
  })

  it('lie les signes doubles, le pourcentage et les guillemets au mot voisin', () => {
    expect(frenchSpacing('<p>Taux : 7 % ; vraiment ? oui ! « Oser l&#039;impossible »</p>'))
      .toBe(`<p>Taux${NBSP}: 7${NBSP}%${NBSP}; vraiment${NBSP}? oui${NBSP}! «${NBSP}Oser l&#039;impossible${NBSP}»</p>`)
  })

  it('ne touche jamais l\'intérieur d\'une balise', () => {
    expect(frenchSpacing('<a href="https://x.test/a b ?c" title="Note : 3 %">lien : ici</a>'))
      .toBe(`<a href="https://x.test/a b ?c" title="Note : 3 %">lien${NBSP}: ici</a>`)
  })

  it('laisse un texte anglais tel quel', () => {
    expect(frenchSpacing('<p>Rate: 7%. Is it true? Yes!</p>')).toBe('<p>Rate: 7%. Is it true? Yes!</p>')
  })

  it('s\'applique à tout HTML éditorial, après l\'assainissement', () => {
    expect(html({ presentation: '<p>En 2026 : <strong>56 715</strong> inscrits.</p><script>x</script>' }, 'presentation'))
      .toBe(`<p>En 2026${NBSP}: <strong>56${NBSP}715</strong> inscrits.</p>`)
  })
})

describe('markRubriques', () => {
  it('marque un paragraphe fait uniquement de gras, avec ou sans attribut', () => {
    expect(markRubriques('<p><strong>Cible</strong></p><p>Texte.</p><p class="ql-align-center"><strong>Frais</strong></p>'))
      .toBe('<p data-rubrique><strong>Cible</strong></p><p>Texte.</p><p data-rubrique class="ql-align-center"><strong>Frais</strong></p>')
  })

  it('laisse un paragraphe qui commence en gras puis continue en texte', () => {
    const html = '<p><strong>Cible ?</strong>&nbsp;Le lycéen.</p><p>Un <strong>7 %</strong> seul.</p>'
    expect(markRubriques(html)).toBe(html)
  })

  it('s\'applique au HTML éditorial des formations', () => {
    expect(html({ d: '<p><strong>Admissions</strong></p><p>Sur dossier.</p>' }, 'd'))
      .toBe('<p data-rubrique><strong>Admissions</strong></p><p>Sur dossier.</p>')
  })
})
