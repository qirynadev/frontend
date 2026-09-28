/**
 * Lien de l'e-mail de double opt-in de la newsletter.
 *
 * Le back-office l'écrit en dur (`NewsletterConfirmationNotification` :
 * `FRONT_URL/newsletter-confirmation?token=…`). Aucune page ici : la route
 * valide le jeton auprès de l'API puis renvoie à l'accueil avec
 * `?newsletter=confirmed|invalid`, que `NewsletterNotice` affiche sur les deux
 * shells.
 */
export default defineEventHandler(async (event) => {
  const token = getQuery(event).token
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

  return sendRedirect(event, `/?newsletter=${status}`, 302)
})
