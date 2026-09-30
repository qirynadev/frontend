import { beforeEach, describe, expect, it } from 'vitest'
import { botVerdict } from '~~/server/utils/bot-guard'
import { pickClientIp } from '~~/server/utils/client-ip'
import { hitRateLimit, resetRateLimits } from '~~/server/utils/rate-limit'

/**
 * Sécurité des formulaires publics (2026-09-30) : IP du visiteur transmise à
 * l'API, limite de fréquence du serveur du site, anti-robots invisible.
 */
describe('pickClientIp', () => {
  it('garde l\'adresse ajoutée par nginx (la dernière), pas celles inventées avant', () => {
    expect(pickClientIp('127.0.0.1, 203.0.113.7', '127.0.0.1')).toBe('203.0.113.7')
    expect(pickClientIp('203.0.113.7', '127.0.0.1')).toBe('203.0.113.7')
  })

  it('sans X-Forwarded-For, prend l\'adresse de la connexion', () => {
    expect(pickClientIp(undefined, '::ffff:198.51.100.4')).toBe('198.51.100.4')
    expect(pickClientIp('', null)).toBeNull()
  })
})

describe('hitRateLimit', () => {
  const rule = { name: 'test', max: 2, windowMs: 60_000 }
  beforeEach(() => resetRateLimits())

  it('bloque au-delà de la limite, par visiteur', () => {
    expect(hitRateLimit(rule, 'a', 0)).toBe(true)
    expect(hitRateLimit(rule, 'a', 1)).toBe(true)
    expect(hitRateLimit(rule, 'a', 2)).toBe(false)
    expect(hitRateLimit(rule, 'b', 3)).toBe(true)
  })

  it('repart à zéro à la fenêtre suivante', () => {
    hitRateLimit(rule, 'a', 0)
    hitRateLimit(rule, 'a', 1)
    expect(hitRateLimit(rule, 'a', 2)).toBe(false)
    expect(hitRateLimit(rule, 'a', 60_001)).toBe(true)
  })

  it('compte séparément chaque formulaire', () => {
    hitRateLimit(rule, 'a', 0)
    hitRateLimit(rule, 'a', 1)
    expect(hitRateLimit({ ...rule, name: 'autre' }, 'a', 2)).toBe(true)
  })
})

describe('botVerdict', () => {
  it('humain : piège vide et formulaire affiché depuis assez longtemps', () => {
    expect(botVerdict({ _hp: '', _elapsed: 4200 })).toBe('human')
  })

  it('robot : champ piège rempli', () => {
    expect(botVerdict({ _hp: 'https://spam.example', _elapsed: 9000 })).toBe('honeypot')
  })

  it('envoi trop rapide, ou sans mesure (appel direct à la route)', () => {
    expect(botVerdict({ _hp: '', _elapsed: 300 })).toBe('too-fast')
    expect(botVerdict({ email: 'a@b.c' })).toBe('too-fast')
  })
})
