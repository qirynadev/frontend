import { describe, expect, it, vi } from 'vitest'
import { toOffer, toOfferList, toOfferSummary } from '~/core/adapters/offer.adapter'
import { rawOffer } from './fixtures/all-data'

describe('réponse nominale', () => {
  it('traduit la formule', () => {
    const offer = toOffer(rawOffer)

    expect(offer.slug).toBe('ingenierie')
    expect(offer.price).toEqual({ amount: 490, currency: 'EUR', mode: 'once' })
    expect(offer.stripeProductId).toBe('price_1PfRbBGWy8fsTyFLMy2KPjNW')
  })

  it('retombe sur le titre quand hero_title est null', () => {
    // `hero_title` est `null` sur les huit formules de recette.
    expect(toOfferSummary(rawOffer).heroTitle).toBe('Ingénierie')
  })

  it('reconnaît un abonnement', () => {
    expect(toOffer({ ...rawOffer, payment_type: 'subscription' }).price.mode).toBe('subscription')
    expect(toOffer({ ...rawOffer, payment_type: 'inconnu' }).price.mode).toBe('once')
  })

  it('écarte les items entièrement vides', () => {
    const offer = toOffer(rawOffer)

    expect(offer.items).toHaveLength(2)
    expect(offer.items[0]).toEqual({
      title: 'Est molestias libero',
      description: '',
      icon: null,
      included: true,
    })
  })

  it('recompose le nom complet d’un mentor si besoin', () => {
    const offer = toOffer({
      ...rawOffer,
      mentors: [{ id: 'x', first_name: 'Awa', last_name: 'Diallo', full_name: null }],
    })

    expect(offer.mentors[0]?.fullName).toBe('Awa Diallo')
  })
})

describe('champs manquants', () => {
  it('ne lève sur aucune entrée dégradée', () => {
    for (const value of [null, undefined, {}, 42, []]) {
      expect(() => toOffer(value)).not.toThrow()
    }
  })

  it('produit des valeurs par défaut sûres', () => {
    const offer = toOffer({})

    expect(offer.price).toEqual({ amount: 0, currency: 'EUR', mode: 'once' })
    expect(offer.items).toEqual([])
    expect(offer.mentors).toEqual([])
    expect(offer.trustBadges).toEqual([])
    expect(offer.badgeLabel).toBeNull()
    expect(offer.stripeProductId).toBeNull()
  })

  it('écarte les badges de confiance sans libellé', () => {
    const offer = toOffer({ ...rawOffer, trust_badges: [{ label: '', icon: null }, { label: 'Garanti', icon: null }] })

    expect(offer.trustBadges).toEqual([{ label: 'Garanti', icon: null }])
  })
})

describe('slugs dupliqués', () => {
  it('ne retient qu’une formule par slug, par id croissant', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const offers = toOfferList([
      { ...rawOffer, id: 'zzz' },
      { ...rawOffer, id: 'aaa' },
      { ...rawOffer, id: 'bbb', slug: 'mba' },
    ])
    warn.mockRestore()

    expect(offers).toHaveLength(2)
    expect(offers.find((offer) => offer.slug === 'ingenierie')?.id).toBe('aaa')
  })
})
