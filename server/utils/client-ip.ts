import type { H3Event } from 'h3'

/**
 * IP du visiteur, pour les limites de fréquence (ici et dans l'API).
 *
 * Le site tourne sous Plesk : Node (Passenger) est derrière nginx, qui ajoute
 * l'IP réelle **à la fin** de `X-Forwarded-For`. Tout ce qui précède a été
 * écrit par le visiteur lui-même et peut être inventé : on ne garde donc que
 * la dernière adresse, à défaut celle de la connexion. Un CDN placé un jour
 * devant le site (Cloudflare…) imposerait de revoir ce choix.
 */
export function pickClientIp(forwardedFor: string | null | undefined, remoteAddress: string | null | undefined): string | null {
  const last = (forwardedFor ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part !== '')
    .at(-1)

  const candidate = last ?? remoteAddress ?? ''
  // `::ffff:1.2.3.4` (IPv4 vue par une socket IPv6) → `1.2.3.4`.
  const normalized = candidate.replace(/^::ffff:/i, '')
  return normalized === '' ? null : normalized
}

export function clientIp(event: H3Event): string | null {
  return pickClientIp(getRequestHeader(event, 'x-forwarded-for'), event.node.req.socket?.remoteAddress)
}
