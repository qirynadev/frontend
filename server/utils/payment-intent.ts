import type { H3Event } from 'h3'
import type { PaymentIntent } from '~~/app/core/contracts'
import { asRecord, str } from '~~/app/core/adapters'
import {
  PAYMENT_INTENT_COOKIE,
  PAYMENT_INTENT_COOKIE_OPTIONS,
  PAYMENT_INTENT_MAX_AGE,
} from '~~/app/core/http/payment-intent.constants'

/**
 * Intention de paiement — ce qu'un visiteur **non connecté** voulait acheter.
 *
 * Le parcours qu'elle rend possible :
 *
 * ```
 * « Choisir cette formule »  →  intention mémorisée  →  /connexion?redirect=…
 *                                                            ↓
 *                          reprise du paiement  ←  session ouverte
 * ```
 *
 * ### Trois décisions
 *
 * **Cookie `httpOnly`, pas `localStorage`.** Même règle que la session : le
 * `localStorage` est lisible par n'importe quel script de la page, et
 * l'intention voyage justement pendant qu'un utilisateur s'authentifie.
 *
 * **Usage unique.** Elle est effacée au moment où le paiement démarre, avant
 * même de savoir s'il aboutit. Un échec renvoie vers la page de l'offre, pas
 * vers une seconde tentative silencieuse.
 *
 * **Expiration explicite, en plus du `maxAge` du cookie.** Le `maxAge` dépend
 * du navigateur ; `expiresAt` est vérifié à la lecture, côté serveur. Une
 * intention périmée est effacée et traitée comme absente.
 *
 * ### Ce qu'elle n'est pas
 *
 * Ce n'est **pas** une garantie d'intégrité : son contenu (offre, service,
 * options) n'est rien que l'utilisateur ne puisse déjà choisir dans l'interface,
 * et le montant est calculé par le back-office, jamais transmis d'ici. La
 * signer n'ajouterait donc rien. Ce qu'elle garantit, c'est qu'aucun paiement
 * ne démarre sans session — et cela, c'est `authClient(event)` qui l'impose.
 */

/** Champs acceptés. Tout le reste est ignoré : le cookie ne sert pas de coffre. */
export function parsePaymentIntent(raw: unknown): PaymentIntent | null {
  const source = asRecord(raw)
  const offerId = str(source, 'offerId')
  const serviceId = str(source, 'serviceId')
  const serviceType = str(source, 'serviceType')
  if (offerId === '' || serviceId === '' || serviceType === '') return null

  const options: Record<string, string> = {}
  for (const [key, value] of Object.entries(asRecord(source.options))) {
    if (typeof value === 'string' && value.trim() !== '') options[key] = value.trim()
  }

  return {
    offerId,
    serviceId,
    serviceType,
    stripeProductId: str(source, 'stripeProductId') || null,
    options,
    label: str(source, 'label'),
    // Un chemin, jamais une URL : sans ce contrôle, une intention forgée
    // pourrait renvoyer l'utilisateur vers un domaine tiers après paiement.
    returnPath: toSafePath(str(source, 'returnPath')),
    expiresAt: str(source, 'expiresAt'),
  }
}

/** N'accepte qu'un chemin interne. Toute URL absolue ou protocole-relative est refusé. */
export function toSafePath(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export function writePaymentIntent(event: H3Event, intent: PaymentIntent): PaymentIntent {
  const stored: PaymentIntent = {
    ...intent,
    expiresAt: new Date(Date.now() + PAYMENT_INTENT_MAX_AGE * 1000).toISOString(),
  }

  setCookie(event, PAYMENT_INTENT_COOKIE, JSON.stringify(stored), {
    ...PAYMENT_INTENT_COOKIE_OPTIONS,
    secure: !import.meta.dev,
  })

  return stored
}

/** Intention valide de la requête courante. Périmée ou illisible → effacée, `null`. */
export function readPaymentIntent(event: H3Event): PaymentIntent | null {
  const raw = getCookie(event, PAYMENT_INTENT_COOKIE)
  if (!raw) return null

  let parsed: PaymentIntent | null = null
  try {
    parsed = parsePaymentIntent(JSON.parse(raw))
  }
  catch {
    // Cookie tronqué ou modifié à la main : on le traite comme absent.
    parsed = null
  }

  if (parsed === null) {
    clearPaymentIntent(event)
    return null
  }

  const expiry = Date.parse(parsed.expiresAt)
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    clearPaymentIntent(event)
    return null
  }

  return parsed
}

export function clearPaymentIntent(event: H3Event): void {
  deleteCookie(event, PAYMENT_INTENT_COOKIE, { path: '/', sameSite: 'lax', secure: !import.meta.dev })
}
