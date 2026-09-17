import { describe, expect, it } from 'vitest'
import type { Country } from '~/core/contracts'
import { drapeauEmoji, normaliserRecherche, rechercherPays } from '~/utils/country-search'

function pays(name: string, code: string, phoneCode: string | null): Country {
  return { id: code, name, code, phoneCode, flag: null }
}

// Libellés tels que l'API de recette les renvoie (casse et apostrophe typographique comprises).
const liste: Country[] = [
  pays('États-Unis', 'US', '1'),
  pays('Bahamas', 'BS', '1242'),
  pays('Canada', 'CA', '1'),
  pays('Bénin', 'BJ', '229'),
  pays('Côte D’ivoire', 'CI', '225'),
  pays('France', 'FR', '33'),
  pays('Guyane Française', 'GF', '594'),
  pays('Antarctique', 'AQ', null),
]

const noms = (resultat: Country[]) => resultat.map((c) => c.name)

describe('normaliserRecherche', () => {
  it('ignore la casse et les accents', () => {
    expect(normaliserRecherche('  Côte D’Ivoire ')).toBe('cote d’ivoire')
  })
})

describe('drapeauEmoji', () => {
  it('déduit le drapeau du code ISO, quelle que soit la casse', () => {
    expect(drapeauEmoji('FR')).toBe('🇫🇷')
    expect(drapeauEmoji('bj')).toBe('🇧🇯')
  })

  it('ne produit rien pour un code absent ou invalide', () => {
    expect(drapeauEmoji(null)).toBe('')
    expect(drapeauEmoji('FRA')).toBe('')
  })
})

describe('rechercherPays', () => {
  it('rend toute la liste, par ordre alphabétique, sans saisie', () => {
    expect(noms(rechercherPays(liste, '   '))).toEqual([
      'Antarctique', 'Bahamas', 'Bénin', 'Canada', 'Côte D’ivoire', 'États-Unis', 'France', 'Guyane Française',
    ])
  })

  it('trouve un nom sans ses accents', () => {
    expect(noms(rechercherPays(liste, 'cote'))).toEqual(['Côte D’ivoire'])
    expect(noms(rechercherPays(liste, 'benin'))).toEqual(['Bénin'])
  })

  it('trouve un mot à l’intérieur du nom, après une apostrophe ou un tiret', () => {
    expect(noms(rechercherPays(liste, 'ivoire'))).toEqual(['Côte D’ivoire'])
    expect(noms(rechercherPays(liste, 'unis'))).toEqual(['États-Unis'])
  })

  it('place le code ISO exact avant les noms qui commencent pareil', () => {
    // « fr » : France par son code, puis Guyane Française par un mot de son nom.
    expect(noms(rechercherPays(liste, 'fr'))).toEqual(['France', 'Guyane Française'])
  })

  it('cherche un indicatif avec ou sans « + »', () => {
    expect(noms(rechercherPays(liste, '229'))).toEqual(['Bénin'])
    expect(noms(rechercherPays(liste, '+225'))).toEqual(['Côte D’ivoire'])
  })

  it('place l’indicatif exact avant ceux qui le prolongent', () => {
    expect(noms(rechercherPays(liste, '+1'))).toEqual(['Canada', 'États-Unis', 'Bahamas'])
  })

  it('ne rend rien quand aucun pays ne correspond', () => {
    expect(rechercherPays(liste, 'atlantide')).toEqual([])
    expect(rechercherPays(liste, '999')).toEqual([])
  })
})
