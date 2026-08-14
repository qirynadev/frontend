import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from '~/core/adapters/sanitize'

/**
 * Le HTML du back-office finit dans un `v-html`. Ces tests décrivent ce qui
 * doit en sortir vivant, et surtout ce qui ne doit pas.
 */

describe('ce qui est conservé', () => {
  it('laisse passer le balisage éditorial courant', () => {
    const input = '<p class="ql-align-justify">Étudier en <strong>France</strong>, c’est <em>un choix</em>.</p>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('conserve listes, titres et citations', () => {
    const input = '<h2>Programmes</h2><ul><li>Bachelor</li><li>Master</li></ul><blockquote>Excellence</blockquote>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('conserve les classes d’alignement de l’éditeur', () => {
    expect(sanitizeHtml('<p class="ql-align-center">Centré</p>')).toContain('class="ql-align-center"')
  })
})

describe('ce qui est neutralisé', () => {
  it('retire un script avec son contenu', () => {
    expect(sanitizeHtml('<p>Avant</p><script>alert(1)</script><p>Après</p>')).toBe('<p>Avant</p><p>Après</p>')
  })

  it('retire style, iframe et object', () => {
    expect(sanitizeHtml('<style>body{display:none}</style>')).toBe('')
    expect(sanitizeHtml('<iframe src="https://evil.test"></iframe>')).toBe('')
    expect(sanitizeHtml('<object data="x.swf"></object>')).toBe('')
  })

  it('retire les gestionnaires d’événements', () => {
    const output = sanitizeHtml('<p onclick="alert(1)" onmouseover="steal()">Texte</p>')
    expect(output).toBe('<p>Texte</p>')
    expect(output).not.toContain('onclick')
  })

  it('bloque les URL javascript: et data:', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">Cliquez</a>')).toBe('<a>Cliquez</a>')
    expect(sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">X</a>')).not.toContain('data:')
  })

  it('bloque les schémas exotiques mais garde http, https, mailto et tel', () => {
    expect(sanitizeHtml('<a href="vbscript:x">A</a>')).toBe('<a>A</a>')
    expect(sanitizeHtml('<a href="https://qiryna.com">A</a>')).toContain('href="https://qiryna.com"')
    expect(sanitizeHtml('<a href="mailto:contact@qiryna.com">A</a>')).toContain('mailto:')
    expect(sanitizeHtml('<a href="/cgu">A</a>')).toContain('href="/cgu"')
  })

  it('retire les classes non issues de l’éditeur', () => {
    const output = sanitizeHtml('<p class="ql-align-right fixed inset-0 z-50">Texte</p>')
    expect(output).toBe('<p class="ql-align-right">Texte</p>')
  })

  it('retire les balises inconnues en gardant leur texte', () => {
    expect(sanitizeHtml('<marquee>Défilant</marquee>')).toBe('Défilant')
    expect(sanitizeHtml('<custom-element>Contenu</custom-element>')).toBe('Contenu')
  })

  it('retire les commentaires', () => {
    expect(sanitizeHtml('<p>A</p><!-- caché --><p>B</p>')).toBe('<p>A</p><p>B</p>')
  })
})

describe('liens externes', () => {
  it('ajoute target et rel sur un lien externe', () => {
    const output = sanitizeHtml('<a href="https://qiryna.com">Qiryna</a>')
    expect(output).toContain('target="_blank"')
    expect(output).toContain('rel="noopener noreferrer"')
  })

  it('n’ajoute rien sur un lien interne', () => {
    expect(sanitizeHtml('<a href="/cgu">CGU</a>')).not.toContain('target')
  })
})

describe('robustesse', () => {
  it('ne lève sur aucune entrée', () => {
    for (const value of [null, undefined, 42, {}, [], '']) {
      expect(() => sanitizeHtml(value)).not.toThrow()
      expect(sanitizeHtml(value)).toBe('')
    }
  })

  it('survit à un balisage mal fermé', () => {
    expect(() => sanitizeHtml('<p>Texte <strong>gras')).not.toThrow()
  })

  it('échappe les guillemets dans une valeur d’attribut', () => {
    const output = sanitizeHtml('<a href="https://x.test/?a=1&b=2">Lien</a>')
    expect(output).toContain('&amp;')
  })
})
