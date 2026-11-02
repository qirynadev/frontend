/**
 * `accepted` et `declined` restent valables pour les choix déjà enregistrés ;
 * `measure` et `marketing` : une seule des deux catégories acceptée (2026-11-02).
 */
export type CookieConsentChoice = 'accepted' | 'declined' | 'measure' | 'marketing'

const COOKIE_NAME = 'qiryna_cookie_consent'
/** 13 mois — durée maximale recommandée par la CNIL pour un consentement cookies. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 395

export function consentAllows(choice: CookieConsentChoice | null, category: 'measure' | 'marketing'): boolean {
  return choice === 'accepted' || choice === category
}

export function consentChoiceFor(measure: boolean, marketing: boolean): CookieConsentChoice {
  if (measure && marketing) return 'accepted'
  if (measure) return 'measure'
  return marketing ? 'marketing' : 'declined'
}

/**
 * Consentement cookies (bannière `CookieConsentBanner.vue`).
 *
 * Un cookie non-`httpOnly` (`useCookie`), volontairement **pas**
 * `localStorage` — seul stockage client autorisé dans ce projet
 * (`core/http/session.ts`), et le seul lisible aussi bien au rendu serveur
 * qu'au chargement du script analytics (`plugins/analytics.client.ts`), qui
 * a besoin de connaître le choix avant la première interaction utilisateur.
 */
export function useCookieConsent() {
  const choice = useCookie<CookieConsentChoice | null>(COOKIE_NAME, {
    default: () => null,
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
  })

  function accept() {
    choice.value = 'accepted'
  }

  function decline() {
    choice.value = 'declined'
  }

  /** Choix catégorie par catégorie : mesure d'audience, marketing. */
  function choose(measure: boolean, marketing: boolean) {
    choice.value = consentChoiceFor(measure, marketing)
  }

  /** Efface le choix pour rouvrir la bannière (« Gérer mes cookies »). */
  function reset() {
    choice.value = null
  }

  return { choice, accept, decline, choose, reset }
}
