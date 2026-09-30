import type { H3Event } from 'h3'
import { clientIp } from './client-ip'

/**
 * Limite de fréquence des formulaires publics, **avant** d'appeler l'API.
 *
 * Première barrière, peu coûteuse : un robot est arrêté ici sans toucher au
 * back-office, qui applique de toute façon ses propres limites (par visiteur
 * depuis le 2026-09-30, voir `ResolveBffClientIp` côté back-office).
 *
 * Compteurs en mémoire du processus, par fenêtre fixe : approximatifs si
 * plusieurs processus Node tournent, suffisants pour une première barrière.
 */
export interface RateLimitRule {
  /** Nom du compteur, propre au formulaire. */
  name: string
  max: number
  windowMs: number
}

interface Bucket { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
let lastSweep = 0

/**
 * Compte une tentative ; `false` si la limite est dépassée. Pure hors horloge,
 * `now` injectable pour les tests.
 */
export function hitRateLimit(rule: RateLimitRule, key: string, now = Date.now()): boolean {
  if (now - lastSweep > 60_000) {
    for (const [id, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(id)
    lastSweep = now
  }

  const id = `${rule.name}:${key}`
  const bucket = buckets.get(id)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + rule.windowMs })
    return true
  }
  bucket.count++
  return bucket.count <= rule.max
}

/** Vide les compteurs (tests). */
export function resetRateLimits(): void {
  buckets.clear()
  lastSweep = 0
}

/** Lève un 429 quand le visiteur dépasse la limite de ce formulaire. */
export function enforceRateLimit(event: H3Event, rule: RateLimitRule): void {
  const ip = clientIp(event) ?? 'inconnue'
  if (!hitRateLimit(rule, ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Trop de tentatives',
      data: { message: 'Trop de tentatives. Patientez une minute avant de réessayer.', errors: {} },
    })
  }
}

/** Limites par formulaire, alignées sur celles de l'API. */
export const RATE_LIMITS = {
  login: { name: 'login', max: 10, windowMs: 60_000 },
  social: { name: 'social', max: 10, windowMs: 60_000 },
  register: { name: 'register', max: 10, windowMs: 60_000 },
  confirm: { name: 'confirm', max: 5, windowMs: 60_000 },
  resendCode: { name: 'resend-code', max: 5, windowMs: 60_000 },
  forgotPassword: { name: 'forgot-password', max: 5, windowMs: 60_000 },
  resetPassword: { name: 'reset-password', max: 5, windowMs: 60_000 },
  newsletter: { name: 'newsletter', max: 5, windowMs: 60_000 },
  contact: { name: 'contact', max: 5, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>
