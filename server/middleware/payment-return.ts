/**
 * Retour de paiement — rouvre la session avant tout rendu.
 *
 * ### Le défaut corrigé
 *
 * Le client est **obligatoirement connecté avant de payer** : aucune commande
 * n'existe sans session. Pourtant, sur iPhone, il retombait sur l'écran de
 * connexion en revenant de Stripe.
 *
 * La raison n'est pas dans notre code : le retour de Stripe est une navigation
 * **inter-site**, et le cookie de session ne fait pas toujours le voyage. Deux
 * causes connues, l'une comme l'autre hors de notre portée :
 *
 * - la prévention du pistage de Safari, plus stricte que le `SameSite=Lax` que
 *   porte déjà notre cookie ;
 * - un parcours démarré dans le navigateur intégré d'une application
 *   (Instagram, WhatsApp, Gmail) : sur iOS, il a son propre bocal à cookies,
 *   que le retour de Stripe peut quitter. Sur Android, les onglets
 *   personnalisés partagent celui de Chrome — d'où un défaut qui ne se voit
 *   que sur iPhone.
 *
 * Sans session, `middleware/auth.ts` renvoie vers `/connexion` — et
 * `bffFetch` va jusqu'à effacer la session sur un 401 : le client n'avait pas
 * l'illusion d'être déconnecté, il l'était vraiment.
 *
 * ### Le correctif
 *
 * Le back-office ajoute à l'URL de retour Stripe un jeton `rt` à usage unique,
 * valable une heure, propre à la commande (`Order::issuePaymentReturnToken()`).
 * Ici, avant le moindre rendu, on l'échange contre un jeton de session et on
 * repose le cookie. L'écran de confirmation s'affiche donc directement, et le
 * client reste connecté pour la suite de son parcours.
 *
 * ### Trois précautions
 *
 * **Le jeton ne survit pas à son arrivée.** Consommé côté back-office, puis
 * retiré de l'URL par une redirection : il ne reste ni dans la barre
 * d'adresse, ni dans l'historique, ni dans un `Referer`. Rejouer l'URL ne
 * redonne rien.
 *
 * **Une session déjà valide n'est jamais remplacée** — cas normal sur Android
 * et sur ordinateur, où le cookie est bien revenu. On se contente alors de
 * nettoyer l'URL ; le jeton non consommé expire de lui-même.
 *
 * **Un échec ne bloque rien** : jeton expiré, déjà utilisé, back-office
 * indisponible — on poursuit sans session, et le parcours retombe sur le
 * comportement d'avant ce correctif (écran de connexion, destination
 * conservée). Jamais d'erreur affichée à quelqu'un qui vient de payer.
 */

/** Nom du paramètre porté par l'URL de retour Stripe. Doit rester aligné sur le back-office. */
const RETURN_TOKEN_PARAM = 'rt'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const token = url.searchParams.get(RETURN_TOKEN_PARAM)
  if (token === null || token === '') return

  // Les routes BFF sont appelées par notre propre code, jamais par Stripe :
  // une redirection ici casserait l'appel au lieu de le servir.
  if (url.pathname.startsWith('/api/')) return

  if (readSessionToken(event) === null) {
    try {
      const outcome = await publicClient(event).request<{ token?: string }>('/payment/return-session', {
        method: 'POST',
        body: { token },
        // Un retour de paiement n'attend pas : mieux vaut l'écran de connexion
        // qu'une page blanche pendant vingt secondes.
        timeoutMs: 8000,
      })

      if (typeof outcome?.token === 'string' && outcome.token !== '') {
        setSessionCookie(event, outcome.token)
      }
    }
    catch {
      // Jeton refusé ou back-office muet : on continue sans session.
    }
  }

  url.searchParams.delete(RETURN_TOKEN_PARAM)
  const query = url.searchParams.toString()

  return sendRedirect(event, url.pathname + (query === '' ? '' : `?${query}`), 302)
})
