/**
 * Jeton Turnstile en attente : Cloudflare le délivre quelques secondes après
 * l'affichage (plus de 15 s observées), parfois après une action du visiteur, et un
 * visiteur rapide envoie le formulaire avant. `ready()` attend ce jeton, sans bloquer
 * au-delà de `waitMs` : le serveur tranche alors, et le formulaire dit de réessayer.
 */
export function createTokenSlot(waitMs: number, available: boolean) {
  let token = ''
  let active = available
  let waiters: Array<() => void> = []

  function release(): void {
    const pending = waiters
    waiters = []
    pending.forEach((resolve) => resolve())
  }

  return {
    set(value: string): void {
      token = value
      release()
    },
    clear(): void {
      token = ''
    },
    /** Rend le jeton, valable une seule fois. */
    take(): string {
      const current = token
      token = ''
      return current
    },
    /** Widget impossible à charger : plus rien à attendre. */
    disable(): void {
      active = false
      release()
    },
    ready(): Promise<void> {
      if (!active || token !== '') return Promise.resolve()
      return new Promise((resolve) => {
        const timer = setTimeout(resolve, waitMs)
        waiters.push(() => {
          clearTimeout(timer)
          resolve()
        })
      })
    },
  }
}
