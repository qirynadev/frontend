interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptLoading: Promise<void> | null = null

function loadScript(): Promise<void> {
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptLoading = null
      reject(new Error('Turnstile indisponible'))
    }
    document.head.appendChild(script)
  })
  return scriptLoading
}

/**
 * Widget Cloudflare Turnstile, si `NUXT_PUBLIC_TURNSTILE_SITE_KEY` est renseignée.
 *
 * Le widget reste invisible et ne se montre, dans un coin de l'écran, que si
 * Cloudflare a besoin d'une action du visiteur : aucune place à réserver dans les
 * formulaires. Un jeton ne sert qu'une fois : `consume()` en redemande aussitôt un,
 * pour qu'un nouvel envoi après une erreur de saisie reste possible.
 */
export function useTurnstile() {
  const siteKey = String(useRuntimeConfig().public.turnstileSiteKey ?? '')
  let token = ''
  let widgetId: string | null = null
  let container: HTMLElement | null = null

  onMounted(async () => {
    if (siteKey === '') return
    try {
      await loadScript()
      if (!window.turnstile) return
      container = document.createElement('div')
      container.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:60'
      document.body.appendChild(container)
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: (value: string) => { token = value },
        'expired-callback': () => { token = '' },
        'error-callback': () => { token = '' },
      })
    }
    catch {
      // Script bloqué : le serveur décidera, le formulaire reste affiché.
    }
  })

  onBeforeUnmount(() => {
    if (widgetId !== null) window.turnstile?.remove(widgetId)
    container?.remove()
  })

  function consume(): string {
    const current = token
    token = ''
    if (widgetId !== null) window.turnstile?.reset(widgetId)
    return current
  }

  return { consume }
}
