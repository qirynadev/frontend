/**
 * Lien de l'e-mail de double opt-in de la newsletter.
 *
 * Le back-office l'écrit en dur (`NewsletterConfirmationNotification` :
 * `FRONT_URL/newsletter-confirmation?token=…[&lang=en]`). Aucune page ici : la
 * route valide le jeton auprès de l'API puis renvoie à l'accueil, dans la
 * langue de l'inscription, avec `?newsletter=confirmed|invalid`, que
 * `NewsletterNotice` affiche sur les deux shells.
 *
 * Le chemin reste sans préfixe de langue quelle que soit la locale : c'est
 * `lang` qui la porte (directives-backend §31).
 */
const LOCALES = new Set(['fr', 'en'])

export default defineEventHandler(async (event) => {
  const { token, lang } = getQuery(event)
  const locale = typeof lang === 'string' && LOCALES.has(lang) ? lang : 'fr'
  let status: 'confirmed' | 'invalid' = 'invalid'

  if (typeof token === 'string' && token !== '') {
    try {
      await publicClient(event).request('/newsletter-confirmation', { query: { token } })
      status = 'confirmed'
    }
    catch {
      // Jeton inconnu ou déjà utilisé (422), ou API injoignable : même issue.
    }
  }

  const home = locale === 'fr' ? '/' : `/${locale}`
  return sendRedirect(event, `${home}?newsletter=${status}`, 302)
})
