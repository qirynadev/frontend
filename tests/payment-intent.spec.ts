import { describe, expect, it } from 'vitest'
import { parsePaymentIntent, toSafePath } from '~~/server/utils/payment-intent'

/**
 * `parsePaymentIntent` et `toSafePath` sont **purs** : ils ne touchent ni à
 * `event`, ni aux cookies. Ils se testent donc sans Nitro, comme les adapters.
 */

const valid = {
  offerId: 'f3',
  serviceId: 'c1',
  serviceType: 'course',
  stripeProductId: 'price_123',
  options: { language: 'Anglais', level: 'B2' },
  label: 'Everest — Anglais',
  returnPath: '/offres/anglais',
  expiresAt: '2026-08-12T18:00:00.000Z',
}

describe('réponse nominale', () => {
  it('conserve les champs utiles', () => {
    expect(parsePaymentIntent(valid)).toEqual(valid)
  })
})

describe('champ manquant', () => {
  it('refuse une intention sans identifiants', () => {
    // Sans le triplet offre / service / type, `POST /payment/init` ne peut rien faire.
    expect(parsePaymentIntent({ ...valid, offerId: '' })).toBeNull()
    expect(parsePaymentIntent({ ...valid, serviceId: '' })).toBeNull()
    expect(parsePaymentIntent({ ...valid, serviceType: '' })).toBeNull()
    expect(parsePaymentIntent(null)).toBeNull()
    expect(parsePaymentIntent('texte')).toBeNull()
  })

  it('accepte l’absence des champs facultatifs', () => {
    const intent = parsePaymentIntent({ offerId: 'f3', serviceId: 'c1', serviceType: 'course' })

    expect(intent).toEqual({
      offerId: 'f3',
      serviceId: 'c1',
      serviceType: 'course',
      stripeProductId: null,
      options: {},
      label: '',
      returnPath: '/',
      expiresAt: '',
    })
  })
})

describe('cas dégradé', () => {
  it('ignore les champs non prévus — le cookie n’est pas un coffre', () => {
    const intent = parsePaymentIntent({ ...valid, amount: 400, role: 'admin' })

    expect(intent).not.toHaveProperty('amount')
    expect(intent).not.toHaveProperty('role')
  })

  it('n’accepte qu’un chemin interne comme retour', () => {
    // Sans ce contrôle, une intention forgée renverrait l’utilisateur vers un
    // domaine tiers après paiement.
    expect(toSafePath('/mon-projet')).toBe('/mon-projet')
    expect(toSafePath('//evil.example.com')).toBe('/')
    expect(toSafePath('https://evil.example.com')).toBe('/')
    expect(toSafePath('javascript:alert(1)')).toBe('/')
    expect(toSafePath('')).toBe('/')
    expect(parsePaymentIntent({ ...valid, returnPath: '//evil.example.com' })?.returnPath).toBe('/')
  })

  it('n’accepte que des options textuelles non vides', () => {
    const intent = parsePaymentIntent({ ...valid, options: { a: 'x', b: '', c: null, d: 7 } })

    expect(intent?.options).toEqual({ a: 'x' })
  })
})
