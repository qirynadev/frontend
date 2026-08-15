import { describe, expect, it } from 'vitest'
import en from '../i18n/locales/en.json'
import fr from '../i18n/locales/fr.json'

type Messages = { [key: string]: string | Messages }

const locales: [string, Messages][] = [['fr', fr as Messages], ['en', en as Messages]]

/** Aplatit l'arbre en `namespace.cle` → valeur. */
function flatten(node: Messages, prefix = ''): [string, string][] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [[prefix + key, value] as [string, string]]
      : flatten(value, `${prefix}${key}.`),
  )
}

/** Vrai si toutes les clés sont triées, à tous les niveaux. */
function isSorted(node: Messages): boolean {
  const keys = Object.keys(node)
  if (JSON.stringify(keys) !== JSON.stringify([...keys].sort())) return false
  return Object.values(node).every(v => typeof v === 'string' || isSorted(v))
}

describe('fichiers de locale', () => {
  /**
   * Le garde-fou qui manquait.
   *
   * `@intlify/unplugin-vue-i18n` refuse le HTML dans les messages, et rejette
   * alors le **fichier entier** : le client démarre sans aucun namespace et
   * toutes les pages affichent leurs clés brutes après hydratation. Le rendu
   * serveur, lui, reste correct — le défaut est donc invisible à un `curl`.
   *
   * Une coupure de ligne ou un fragment en gras imposés par une maquette se
   * traitent au gabarit, avec des clés séparées.
   */
  it.each(locales)('%s ne contient aucune balise HTML', (_nom, messages) => {
    const fautives = flatten(messages)
      .filter(([, valeur]) => /<\/?[a-z][^>]*>/i.test(valeur))
      .map(([chemin, valeur]) => `${chemin} → ${valeur}`)

    expect(fautives).toEqual([])
  })

  it('fr et en portent exactement les mêmes clés', () => {
    const clesFr = flatten(fr as Messages).map(([k]) => k).sort()
    const clesEn = flatten(en as Messages).map(([k]) => k).sort()

    expect(clesFr.filter(k => !clesEn.includes(k))).toEqual([])
    expect(clesEn.filter(k => !clesFr.includes(k))).toEqual([])
  })

  it.each(locales)('%s garde ses clés triées alphabétiquement', (_nom, messages) => {
    expect(isSorted(messages)).toBe(true)
  })

  it.each(locales)('%s ne laisse aucun message vide', (_nom, messages) => {
    const vides = flatten(messages).filter(([, v]) => v.trim() === '').map(([k]) => k)
    expect(vides).toEqual([])
  })
})
