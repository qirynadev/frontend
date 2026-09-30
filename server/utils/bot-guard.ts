/**
 * Anti-robots invisible des formulaires publics (2026-09-30), sans captcha.
 *
 * Le formulaire envoie deux champs en plus de ses données (voir
 * `useBotGuard` et `BotTrap.vue`) :
 * - `_hp` : un champ piège, caché aux humains, que les robots remplissent ;
 * - `_elapsed` : le temps passé sur le formulaire, en millisecondes, mesuré
 *   dans le navigateur (pas d'horloge à synchroniser avec le serveur).
 *
 * Un robot qui remplit le piège reçoit une réponse de succès, sans que rien
 * ne parte : il n'apprend pas qu'il a été repéré. Un envoi trop rapide (ou
 * sans mesure : appel direct à la route) est refusé par un 429 qui invite à
 * réessayer ; un humain qui a tout rempli par l'autocomplétion passe au
 * deuxième essai. 429 et non 422 : les écrans lisent un 422 comme une erreur
 * de saisie sur un champ.
 */
export const BOT_GUARD_MIN_MS = 1500

export type BotVerdict = 'human' | 'honeypot' | 'too-fast'

export function botVerdict(body: Record<string, unknown>, minMs = BOT_GUARD_MIN_MS): BotVerdict {
  const trap = body._hp
  if (typeof trap === 'string' && trap.trim() !== '') return 'honeypot'

  const elapsed = typeof body._elapsed === 'number' ? body._elapsed : Number(body._elapsed)
  if (!Number.isFinite(elapsed) || elapsed < minMs) return 'too-fast'

  return 'human'
}

/**
 * `true` si le formulaire doit être traité ; `false` pour un robot pris au
 * piège (l'appelant renvoie alors un faux succès) ; 429 si l'envoi est trop
 * rapide.
 */
export function passBotGuard(body: Record<string, unknown>): boolean {
  const verdict = botVerdict(body)
  if (verdict === 'honeypot') return false
  if (verdict === 'too-fast') {
    throw createError({
      statusCode: 429,
      statusMessage: 'Envoi trop rapide',
      data: { message: 'Envoi trop rapide. Vérifiez le formulaire puis réessayez.', errors: {} },
    })
  }
  return true
}
