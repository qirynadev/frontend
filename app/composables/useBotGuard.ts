import type { InjectionKey, Ref } from 'vue'

/**
 * Anti-robots d'un formulaire public (2026-09-30).
 *
 * Deux indices envoyés avec le formulaire, vérifiés par le serveur du site
 * (`server/utils/bot-guard.ts`) :
 * - un champ piège (`<BotTrap />`), caché aux humains, que les robots
 *   remplissent ;
 * - le temps écoulé depuis l'affichage du formulaire : un robot l'envoie
 *   aussitôt.
 *
 * L'appel **fournit** l'état aux `<BotTrap />` de la page (mobile et desktop
 * comprise), qui n'ont donc aucune prop à recevoir.
 *
 * `{ turnstile: true }` ajoute le contrôle Cloudflare (2026-11-02, inscription,
 * connexion, mot de passe oublié, contact), s'il est configuré. Une seule fois par
 * page, hors du gabarit : les versions mobile et ordinateur sont montées ensemble.
 */
export interface BotGuard {
  trap: Ref<string>
  /** Champs à joindre au corps de la requête. */
  fields: () => { _hp: string; _elapsed: number; _turnstile?: string }
}

export const BOT_GUARD_KEY: InjectionKey<BotGuard> = Symbol('bot-guard')

export function useBotGuard(options: { turnstile?: boolean } = {}): BotGuard {
  const trap = ref('')
  // Mesuré dans le navigateur uniquement : le rendu serveur ne compte pas.
  let shownAt: number | null = null
  const turnstile = options.turnstile ? useTurnstile() : null
  onMounted(() => {
    shownAt = Date.now()
  })

  const guard: BotGuard = {
    trap,
    fields: () => ({
      _hp: trap.value,
      _elapsed: shownAt === null ? 0 : Date.now() - shownAt,
      ...(turnstile ? { _turnstile: turnstile.consume() } : {}),
    }),
  }

  provide(BOT_GUARD_KEY, guard)
  return guard
}
