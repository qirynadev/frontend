/**
 * Lien de conversation WhatsApp, `null` sans numéro exploitable. `wa.me` attend
 * l'indicatif et le numéro, chiffres seuls : `+33 6 23…` et `0033 6 23…` donnent
 * tous deux `33623…`.
 */
export function whatsappLink(number: string | null | undefined): string | null {
  const digits = (number ?? '').replace(/\D/g, '').replace(/^00/, '')
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

/** Demandes liées aux données personnelles : mêmes noms que les clés `settingsRights.<nom>Title`. */
export const RIGHTS_REQUESTS = ['download', 'object', 'limit', 'legalRep', 'postDeath'] as const
export type RightsRequest = (typeof RIGHTS_REQUESTS)[number]

export interface ContactPrefill {
  subject?: string
  order?: string
  request?: RightsRequest
}

/** Adresse du formulaire de contact, prérempli. Le chemin reste à passer à `localePath`. */
export function contactPath(prefill: ContactPrefill): string {
  const query = new URLSearchParams()
  if (prefill.subject) query.set('objet', prefill.subject)
  if (prefill.order) query.set('commande', prefill.order)
  if (prefill.request) query.set('demande', prefill.request)
  const search = query.toString()
  return search === '' ? '/reglages/contact' : `/reglages/contact?${search}`
}

/** Lit le préremplissage de l'adresse. Tout ce qui n'a pas la forme attendue est ignoré. */
export function contactPrefill(query: Record<string, unknown>): ContactPrefill {
  const prefill: ContactPrefill = {}
  if (typeof query.objet === 'string') prefill.subject = query.objet
  if (typeof query.commande === 'string' && /^[\w-]{1,64}$/.test(query.commande)) prefill.order = query.commande
  if (RIGHTS_REQUESTS.includes(query.demande as RightsRequest)) prefill.request = query.demande as RightsRequest
  return prefill
}

/** Lien d'appel : chiffres, avec le « + » de l'indicatif s'il y en a un. */
export function phoneLink(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`
}
