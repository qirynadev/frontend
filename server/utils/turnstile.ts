import type { H3Event } from 'h3'
import { isAppApiHost } from './app-host'
import { clientIp } from './client-ip'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Cloudflare Turnstile sur les formulaires publics (inscription, connexion, mot de
 * passe oublié, contact). Sans `NUXT_TURNSTILE_SECRET_KEY`, le contrôle est éteint.
 * Le domaine de l'application mobile en est dispensé : voir `app-host.ts`.
 *
 * Si Cloudflare ne répond pas, le formulaire passe : une panne chez eux ne doit pas
 * fermer la connexion à nos clients, et les limites de fréquence restent actives.
 * Refus en 429, comme un envoi trop rapide (`bot-guard.ts`) : un 422 serait lu comme
 * une erreur de saisie sur un champ.
 */
export async function enforceTurnstile(event: H3Event, body: Record<string, unknown>): Promise<void> {
  const secret = String(useRuntimeConfig(event).turnstileSecretKey ?? '')
  if (secret === '') return
  if (isAppApiHost(getRequestHost(event))) return

  const token = typeof body._turnstile === 'string' ? body._turnstile : ''
  const passed = token !== '' && await verify(secret, token, clientIp(event))

  if (!passed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Vérification anti-robot',
      data: { message: 'Vérification en cours. Patientez un instant puis réessayez.', errors: {} },
    })
  }
}

async function verify(secret: string, token: string, ip: string | null): Promise<boolean> {
  try {
    const outcome = await $fetch<{ success?: boolean }>(SITEVERIFY_URL, {
      method: 'POST',
      body: { secret, response: token, ...(ip ? { remoteip: ip } : {}) },
      timeout: 5000,
    })
    return outcome.success === true
  }
  catch (error) {
    console.error('[turnstile] vérification impossible, formulaire laissé passer', error)
    return true
  }
}
