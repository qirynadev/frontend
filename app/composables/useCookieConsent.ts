export type CookieConsentChoice = 'accepted' | 'declined'

const COOKIE_NAME = 'qiryna_cookie_consent'
/** 13 mois — durée maximale recommandée par la CNIL pour un consentement cookies. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 395

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

  return { choice, accept, decline }
}
