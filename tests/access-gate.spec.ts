import { afterEach, describe, expect, it } from 'vitest'
import {
  accessLocale,
  accessToken,
  hasAccess,
  isInternalRequest,
  isOpenRoute,
  renderAccessPage,
  safeNextPath,
  siteAccessCode,
} from '~~/server/utils/access-gate'
import { isAppApiHost, isAppApiPath } from '~~/server/utils/app-host'

/**
 * Accès au site réservé par un code (`NUXT_ACCESS_CODE`). Le parcours complet
 * (middleware, cookie, rendu des pages) se vérifie sur le site compilé.
 */
describe('siteAccessCode', () => {
  afterEach(() => {
    delete process.env.NUXT_ACCESS_CODE
  })

  it('sans la variable, ou vide, le site est ouvert', () => {
    expect(siteAccessCode()).toBe('')
    process.env.NUXT_ACCESS_CODE = '   '
    expect(siteAccessCode()).toBe('')
  })

  it('garde le code tel quel, même composé de chiffres', () => {
    process.env.NUXT_ACCESS_CODE = ' 00123 '
    expect(siteAccessCode()).toBe('00123')
  })
})

describe('hasAccess', () => {
  it('accepte le cookie dérivé du code, sans que celui-ci y figure', () => {
    const token = accessToken('code-secret')
    expect(token).not.toContain('code-secret')
    expect(hasAccess(token, 'code-secret')).toBe(true)
  })

  it('refuse un cookie absent, inventé ou issu d\'un ancien code', () => {
    expect(hasAccess(undefined, 'code-secret')).toBe(false)
    expect(hasAccess('code-secret', 'code-secret')).toBe(false)
    expect(hasAccess(accessToken('ancien-code'), 'code-secret')).toBe(false)
  })
})

describe('isInternalRequest', () => {
  it('reconnaît seulement l\'objet requête simulé par Nitro', () => {
    expect(isInternalRequest({ __unenv__: undefined, headers: {} })).toBe(true)
    expect(isInternalRequest({ headers: { __unenv__: '1' } })).toBe(false)
  })
})

describe('domaine de l\'application mobile', () => {
  it('reconnaît ce seul domaine, quels que soient la casse et le port', () => {
    expect(isAppApiHost('mobile.qiryna.com')).toBe(true)
    expect(isAppApiHost('MOBILE.qiryna.com:443')).toBe(true)
    expect(isAppApiHost('qiryna.com')).toBe(false)
    expect(isAppApiHost('danube.qiryna.com')).toBe(false)
    expect(isAppApiHost('mobile.qiryna.com.exemple.net')).toBe(false)
  })

  it('n\'ouvre que le BFF', () => {
    expect(isAppApiPath('/api/bff/session')).toBe(true)
    expect(isAppApiPath('/')).toBe(false)
    expect(isAppApiPath('/connexion')).toBe(false)
    expect(isAppApiPath('/api/cache/revalidate')).toBe(false)
    expect(isAppApiPath('/api/bff/../cache/revalidate')).toBe(false)
  })
})

describe('isOpenRoute', () => {
  it('laisse passer l\'envoi du code et le signal du back-office, en POST seulement', () => {
    expect(isOpenRoute('POST', '/site-access')).toBe(true)
    expect(isOpenRoute('POST', '/api/cache/revalidate')).toBe(true)
    expect(isOpenRoute('GET', '/site-access')).toBe(false)
    expect(isOpenRoute('GET', '/api/cache/revalidate')).toBe(false)
  })

  it('n\'ouvre aucune autre adresse, même proche', () => {
    expect(isOpenRoute('POST', '/api/cache/revalidate/../bff/session')).toBe(false)
    expect(isOpenRoute('POST', '/api/bff/session')).toBe(false)
  })
})

describe('safeNextPath', () => {
  it('garde une adresse du site, avec ses paramètres', () => {
    expect(safeNextPath('/destinations/france?domaine=mba')).toBe('/destinations/france?domaine=mba')
  })

  it('refuse toute sortie vers un autre site', () => {
    for (const next of ['https://exemple.com', '//exemple.com', '/\\exemple.com', '', undefined, 12]) {
      expect(safeNextPath(next)).toBe('/')
    }
  })
})

describe('accessLocale', () => {
  it('suit l\'adresse, puis la langue du navigateur, et le français par défaut', () => {
    expect(accessLocale('/en/destinations', 'fr-FR')).toBe('en')
    expect(accessLocale('/en', undefined)).toBe('en')
    expect(accessLocale('/?x=1', 'en-US,en;q=0.9')).toBe('en')
    expect(accessLocale('/energie', 'fr-FR')).toBe('fr')
    expect(accessLocale('/', undefined)).toBe('fr')
  })
})

describe('renderAccessPage', () => {
  it('échappe l\'adresse reprise dans le formulaire', () => {
    const html = renderAccessPage('fr', '/"><script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&quot;&gt;&lt;script&gt;')
  })

  it('n\'affiche une erreur que si besoin, et dans la bonne langue', () => {
    expect(renderAccessPage('fr', '/')).not.toContain('role="alert"')
    expect(renderAccessPage('fr', '/', 'invalid')).toContain('Ce code est incorrect.')
    expect(renderAccessPage('en', '/', 'rate-limited')).toContain('Too many attempts')
  })

  it('ne contient jamais le code', () => {
    process.env.NUXT_ACCESS_CODE = 'code-secret'
    expect(renderAccessPage('fr', '/', 'invalid')).not.toContain('code-secret')
    delete process.env.NUXT_ACCESS_CODE
  })
})
