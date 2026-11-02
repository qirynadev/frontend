import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { consentAllows, consentChoiceFor } from '~~/app/composables/useCookieConsent'
import { contactPath, contactPrefill } from '~~/app/utils/contact-links'
import { isIndexableHost } from '~~/server/utils/indexable'
import { isAllowedWrite } from '~~/server/utils/origin'
import { enforceTurnstile } from '~~/server/utils/turnstile'

/** Durcissements avant la mise en ligne (2026-11-02). */
describe('isIndexableHost', () => {
  it('n\'ouvre aux moteurs de recherche que la production', () => {
    expect(isIndexableHost('qiryna.com')).toBe(true)
    expect(isIndexableHost('www.qiryna.com')).toBe(true)
    expect(isIndexableHost('QIRYNA.com:443')).toBe(true)
    for (const host of ['danube.qiryna.com', 'my.qiryna.com', 'localhost:3000', 'qiryna.com.exemple.test']) {
      expect(isIndexableHost(host)).toBe(false)
    }
  })
})

describe('isAllowedWrite', () => {
  const write = (overrides: Partial<Parameters<typeof isAllowedWrite>[0]>) => isAllowedWrite({
    method: 'POST',
    path: '/api/bff/session',
    hosts: ['danube.qiryna.com', undefined, 'https://qiryna.com'],
    ...overrides,
  })

  it('accepte le site lui-même, quel que soit le protocole', () => {
    expect(write({ origin: 'https://danube.qiryna.com' })).toBe(true)
    expect(write({ origin: 'https://qiryna.com' })).toBe(true)
    expect(write({ referer: 'https://danube.qiryna.com/connexion?x=1' })).toBe(true)
  })

  it('refuse un autre site, y compris un nom qui imite le nôtre', () => {
    expect(write({ origin: 'https://exemple.test' })).toBe(false)
    expect(write({ origin: 'https://danube.qiryna.com.exemple.test' })).toBe(false)
    expect(write({ referer: 'https://exemple.test/danube.qiryna.com' })).toBe(false)
    expect(write({ origin: 'pas une adresse', hosts: [] })).toBe(false)
  })

  it('l\'en-tête Origin prime sur Referer', () => {
    expect(write({ origin: 'https://exemple.test', referer: 'https://danube.qiryna.com/' })).toBe(false)
  })

  it('refuse une origine opaque', () => {
    expect(write({ origin: 'null' })).toBe(false)
  })

  it('laisse passer l\'application mobile et les origines déclarées', () => {
    expect(write({ origin: 'capacitor://localhost' })).toBe(true)
    expect(write({ origin: 'https://localhost' })).toBe(true)
    expect(write({ origin: 'https://partenaire.test', extraOrigins: 'https://autre.test, https://partenaire.test' })).toBe(true)
  })

  it('sans Origin ni Referer, l\'appel ne vient pas d\'une page de navigateur', () => {
    expect(write({})).toBe(true)
  })

  it('ne contrôle ni les lectures ni les pages', () => {
    expect(write({ method: 'GET', origin: 'https://exemple.test' })).toBe(true)
    expect(write({ path: '/connexion', origin: 'https://exemple.test' })).toBe(true)
    expect(write({ path: '/site-access', origin: 'https://exemple.test' })).toBe(false)
  })
})

describe('consentement par catégorie', () => {
  it('sépare la mesure d\'audience et le marketing', () => {
    expect(consentChoiceFor(true, true)).toBe('accepted')
    expect(consentChoiceFor(true, false)).toBe('measure')
    expect(consentChoiceFor(false, true)).toBe('marketing')
    expect(consentChoiceFor(false, false)).toBe('declined')
  })

  it('n\'accorde que ce qui a été choisi', () => {
    expect(consentAllows('measure', 'measure')).toBe(true)
    expect(consentAllows('measure', 'marketing')).toBe(false)
    expect(consentAllows('marketing', 'measure')).toBe(false)
    expect(consentAllows('declined', 'measure')).toBe(false)
    expect(consentAllows(null, 'marketing')).toBe(false)
  })

  it('un choix déjà enregistré reste valable', () => {
    expect(consentAllows('accepted', 'measure')).toBe(true)
    expect(consentAllows('accepted', 'marketing')).toBe(true)
  })
})

describe('formulaire de contact prérempli', () => {
  it('fabrique et relit l\'adresse', () => {
    const path = contactPath({ subject: 'accompaniment', order: 'abc-123' })
    expect(path).toBe('/reglages/contact?objet=accompaniment&commande=abc-123')
    expect(contactPrefill({ objet: 'accompaniment', commande: 'abc-123' })).toEqual({ subject: 'accompaniment', order: 'abc-123' })
    expect(contactPath({})).toBe('/reglages/contact')
  })

  it('ignore ce qui n\'a pas la forme attendue', () => {
    expect(contactPrefill({ commande: '<script>', demande: 'inconnue', objet: 12 })).toEqual({})
    expect(contactPrefill({ demande: 'legalRep' })).toEqual({ request: 'legalRep' })
  })
})

describe('enforceTurnstile', () => {
  const event = { node: { req: { socket: {} } } } as never
  const stubConfig = (secret: string) => vi.stubGlobal('useRuntimeConfig', () => ({ turnstileSecretKey: secret }))

  beforeEach(() => {
    vi.stubGlobal('getRequestHeader', () => undefined)
    vi.stubGlobal('createError', (input: { statusCode: number }) => Object.assign(new Error('refus'), input))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('éteint sans clé secrète', async () => {
    stubConfig('')
    const fetcher = vi.fn()
    vi.stubGlobal('$fetch', fetcher)

    await expect(enforceTurnstile(event, {})).resolves.toBeUndefined()
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('refuse sans jeton, sans même interroger Cloudflare', async () => {
    stubConfig('secret')
    const fetcher = vi.fn()
    vi.stubGlobal('$fetch', fetcher)

    await expect(enforceTurnstile(event, {})).rejects.toMatchObject({ statusCode: 429 })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('suit la réponse de Cloudflare', async () => {
    stubConfig('secret')
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ success: false }))
    await expect(enforceTurnstile(event, { _turnstile: 'jeton' })).rejects.toMatchObject({ statusCode: 429 })

    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ success: true }))
    await expect(enforceTurnstile(event, { _turnstile: 'jeton' })).resolves.toBeUndefined()
  })

  it('laisse passer si Cloudflare est en panne', async () => {
    stubConfig('secret')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('panne')))

    await expect(enforceTurnstile(event, { _turnstile: 'jeton' })).resolves.toBeUndefined()
  })
})
