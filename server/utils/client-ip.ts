import { BlockList, isIP } from 'node:net'
import type { H3Event } from 'h3'

/**
 * Plages de Cloudflare, relevées le 2026-11-04 sur cloudflare.com/ips. Une plage
 * absente d'ici ferait seulement retomber ses visiteurs sur l'adresse de Cloudflare.
 */
const CLOUDFLARE_IPV4 = [
  '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
  '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
  '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
]
const CLOUDFLARE_IPV6 = [
  '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
  '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32',
]
/** Relais entre Cloudflare et Node sur le serveur : boucle locale et réseaux privés. */
const LOCAL_IPV4 = ['127.0.0.0/8', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']
const LOCAL_IPV6 = ['::1/128', 'fc00::/7']

const trustedRelays = new BlockList()
for (const range of [...CLOUDFLARE_IPV4, ...LOCAL_IPV4]) {
  const [network, prefix] = range.split('/') as [string, string]
  trustedRelays.addSubnet(network, Number(prefix), 'ipv4')
}
for (const range of [...CLOUDFLARE_IPV6, ...LOCAL_IPV6]) {
  const [network, prefix] = range.split('/') as [string, string]
  trustedRelays.addSubnet(network, Number(prefix), 'ipv6')
}

function normalize(address: string): string {
  // `::ffff:1.2.3.4` (IPv4 vue par une socket IPv6) → `1.2.3.4`.
  return address.trim().replace(/^::ffff:/i, '')
}

function isTrustedRelay(address: string): boolean {
  const family = isIP(address)
  return family !== 0 && trustedRelays.check(address, family === 6 ? 'ipv6' : 'ipv4')
}

/**
 * IP du visiteur, pour les limites de fréquence (ici et dans l'API) et Turnstile.
 *
 * Le trajet est Cloudflare, puis nginx (Plesk), puis Node. Chaque relais ajoute
 * à la fin de `X-Forwarded-For` l'adresse qui l'a appelé, et tout ce qui précède
 * peut avoir été inventé par le visiteur. On remonte donc la liste depuis la fin
 * en sautant les seuls relais connus : la première autre adresse est le visiteur.
 *
 * `CF-Connecting-IP` n'est pas lu : quiconque joint le serveur sans passer par
 * Cloudflare pourrait l'écrire. Ici, la même personne reste vue sous sa vraie
 * adresse, ajoutée par nginx en fin de liste.
 */
export function pickClientIp(forwardedFor: string | null | undefined, remoteAddress: string | null | undefined): string | null {
  const chain = (forwardedFor ?? '')
    .split(',')
    .map(normalize)
    .filter((part) => part !== '')
  const remote = normalize(remoteAddress ?? '')
  if (remote !== '') chain.push(remote)

  const visitor = chain.findLast((address) => !isTrustedRelay(address))
  // Uniquement des relais (appel interne au serveur) : le plus proche de Node.
  return visitor ?? chain.at(-1) ?? null
}

export function clientIp(event: H3Event): string | null {
  return pickClientIp(getRequestHeader(event, 'x-forwarded-for'), event.node.req.socket?.remoteAddress)
}
