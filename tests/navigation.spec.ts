import { describe, expect, it } from 'vitest'
import { bottomNavEntries, resolveActiveNavId } from '~/config/navigation'

describe('onglet actif', () => {
  it('allume l’onglet correspondant au chemin exact', () => {
    expect(resolveActiveNavId('/')).toBe('home')
    expect(resolveActiveNavId('/messages')).toBe('messages')
    expect(resolveActiveNavId('/mon-projet')).toBe('project')
    expect(resolveActiveNavId('/compte')).toBe('account')
  })

  it('reste allumé sur les sous-chemins', () => {
    expect(resolveActiveNavId('/messages/42')).toBe('messages')
    expect(resolveActiveNavId('/mon-projet/services/premium')).toBe('project')
  })

  it('rattache les écrans satellites à leur onglet', () => {
    // La fiche école appartient au parcours d’orientation.
    expect(resolveActiveNavId('/ecoles/hec-paris')).toBe('orientation')
    expect(resolveActiveNavId('/destinations/france')).toBe('orientation')
    expect(resolveActiveNavId('/offres/mba')).toBe('orientation')
    // L’authentification appartient à l’onglet Compte.
    expect(resolveActiveNavId('/connexion')).toBe('account')
    expect(resolveActiveNavId('/inscription')).toBe('account')
    expect(resolveActiveNavId('/paiement/reussi')).toBe('project')
  })

  it('n’allume pas l’accueil sur toutes les pages', () => {
    // `/` est préfixe de tout : sans la règle « correspondance la plus longue »,
    // l’onglet Accueil resterait allumé partout.
    expect(resolveActiveNavId('/messages')).not.toBe('home')
    expect(resolveActiveNavId('/ecoles/hec-paris')).not.toBe('home')
  })

  it('ignore la barre oblique finale', () => {
    expect(resolveActiveNavId('/messages/')).toBe('messages')
    expect(resolveActiveNavId('')).toBe('home')
  })

  it('ne renvoie rien sur une route hors navigation', () => {
    expect(resolveActiveNavId('/dev/ui')).toBeUndefined()
    expect(resolveActiveNavId('/cgu')).toBeUndefined()
  })

  it('ne se laisse pas piéger par un préfixe partiel', () => {
    // `/messagerie` n’est pas un sous-chemin de `/messages`.
    expect(resolveActiveNavId('/messagerie')).toBeUndefined()
    expect(resolveActiveNavId('/comptes-rendus')).toBeUndefined()
  })
})

describe('configuration', () => {
  it('n’expose que des identifiants uniques', () => {
    const ids = bottomNavEntries.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('n’expose que des chemins non localisés', () => {
    for (const entry of bottomNavEntries) {
      expect(entry.to.startsWith('/')).toBe(true)
      expect(entry.to).not.toMatch(/^\/(fr|en)(\/|$)/)
    }
  })

  it('passe par des clés i18n, jamais par du texte en dur', () => {
    for (const entry of bottomNavEntries) {
      expect(entry.labelKey).toMatch(/^nav\.[a-z]+$/)
    }
  })
})
