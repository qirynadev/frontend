import type { Order, OrderOffer, OrderStatus, PaymentInit, PaymentValidation } from '../contracts'
import { asArray, asRecord, bool, dig, num, optionalNum, optionalStr, str, toIsoDate, toUrl } from './primitives'

/**
 * Commandes et paiements — couche anti-corruption.
 *
 * Défauts constatés sur `/payment/init`, `/payment/validate` et `/payment/list` :
 *
 * | # | Constat | Traitement |
 * |---|---|---|
 * | 1 | Aucun numéro de commande lisible en base | `reference` **dérivée** de l'identifiant (`QRY-XXXXXXXX`) |
 * | 2 | `created_at` au format `JJ/MM/AAAA` | `toIsoDate` |
 * | 3 | L'état vit tantôt dans `status`, tantôt dans `confirmed`/`failed` | `toOrderStatus` lit les deux |
 * | 4 | `service_type` vaut `course` ici, `App\Models\Course` là | `normalizeServiceType` |
 * | 5 | `offer` porte `items: [{ title: null }]` — entrées fantômes | filtrées |
 * | 6 | `redirectUrl` est parfois une chaîne vide | `null` |
 * | 7 | `options` mélange chaînes, nombres et `null` | tout est ramené à des chaînes non vides |
 */

/**
 * Ramène `App\Models\Course` à `course`.
 *
 * Le back-office renvoie le nom de classe PHP sur certains endpoints et le
 * libellé court sur d'autres. Comparer `service_type` sans normaliser ferait
 * échouer un `=== 'course'` une fois sur deux — c'est ce qui obligeait l'ancien
 * front à tester les deux formes à chaque endroit.
 */
export function normalizeServiceType(raw: unknown): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (value === '') return ''
  const last = value.split('\\').pop() ?? value
  return last.toLowerCase()
}

/**
 * Référence affichable.
 *
 * La base ne stocke aucun numéro de commande : on en dérive un déterministe
 * depuis l'identifiant, comme le faisait l'ancien front, pour que le support et
 * le client désignent la même chose.
 */
export function toOrderReference(id: string): string {
  return id === '' ? '' : `QRY-${id.slice(0, 8).toUpperCase()}`
}

export function toOrderStatus(raw: unknown): OrderStatus {
  const source = asRecord(raw)

  if (bool(source, 'confirmed', false)) return 'confirmed'
  if (bool(source, 'failed', false)) return 'failed'

  const status = str(source, 'status').toLowerCase() || str(source, 'payment_status').toLowerCase()
  // `/payment/list` renvoie le libellé français d'`OrderTrackingStatusEnum`
  // (« Vérifié », « En attente de paiement »…), pas le vocabulaire anglais
  // qu'on pourrait attendre d'un statut de paiement générique — sans ces
  // valeurs, toute commande réelle retombait sur `pending`.
  if (['confirmed', 'success', 'succeeded', 'paid', 'completed', 'vérifié', 'confirmée', 'en cours', 'terminé'].includes(status)) return 'confirmed'
  if (['failed', 'error', 'canceled', 'cancelled', 'refused', 'échoué', 'annulé'].includes(status)) return 'failed'
  return 'pending'
}

/** Options de commande : chaînes non vides uniquement. */
export function toOrderOptions(raw: unknown): Record<string, string> {
  const source = asRecord(raw)
  const options: Record<string, string> = {}

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string' && value.trim() !== '') options[key] = value.trim()
    else if (typeof value === 'number' && Number.isFinite(value)) options[key] = String(value)
  }

  return options
}

export function toOrderOffer(raw: unknown): OrderOffer | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  const title = str(source, 'title')
  if (id === '' && title === '') return null

  return {
    id,
    title,
    description: str(source, 'description'),
    icon: toUrl(source.icon),
    hours: optionalNum(source, 'nbr_hours'),
    // Mêmes entrées fantômes que sur les fiches école : `{ title: null }`.
    features: asArray(source.items)
      .map((entry) => (typeof entry === 'string' ? entry : str(asRecord(entry), 'title')))
      .filter((label) => label !== ''),
  }
}

export function toOrder(raw: unknown): Order | null {
  const source = asRecord(raw)
  const id = str(source, 'id')
  if (id === '') return null

  return {
    id,
    reference: toOrderReference(id),
    status: toOrderStatus(source),
    price: {
      amount: num(source, 'amount', 0),
      // Le back-office ne renvoie pas de devise : tout le catalogue est en
      // euros, et le contrat l'énonce (`currency: 'EUR'`). Le jour où une
      // seconde devise apparaîtra, c'est le contrat qui devra changer d'abord.
      currency: 'EUR',
      mode: str(source, 'payment_type') === 'subscription' ? 'subscription' : 'once',
    },
    createdAt: toIsoDate(source.created_at),
    updatedAt: toIsoDate(source.updated_at),
    serviceType: normalizeServiceType(source.service_type) || normalizeServiceType(dig(source, 'offer.type')),
    offer: toOrderOffer(source.offer),
    customerEmail: optionalStr(source, 'user.email'),
    // `associated_service` est l'objet ; `service` n'est qu'un libellé texte.
    serviceSlug: optionalStr(source, 'associated_service.slug'),
    options: toOrderOptions(source.options),
    // Langue : `teacher_name`. École/logement/orientation : `mentor_name`.
    // Jamais les deux à la fois sur une même commande.
    advisorName: optionalStr(source, 'mentor_name') ?? optionalStr(source, 'teacher_name'),
  }
}

export function toOrderList(raw: unknown): Order[] {
  const source = asRecord(raw)
  const entries = Array.isArray(raw) ? raw : asArray(source.orders)
  return entries.map(toOrder).filter((order): order is Order => order !== null)
}

export function toPaymentInit(raw: unknown): PaymentInit {
  const source = asRecord(raw)
  return {
    order: toOrder(source.order),
    // Une chaîne vide provoquerait une navigation vers la page courante :
    // mieux vaut `null`, que l'appelant sait traiter comme un échec.
    redirectUrl: toUrl(source.redirectUrl) ?? toUrl(source.redirect_url),
  }
}

export function toPaymentValidation(raw: unknown): PaymentValidation {
  const source = asRecord(raw)
  const order = toOrder(source.order)

  return {
    // L'API porte le verdict à la racine ; la commande le confirme. Quand les
    // deux existent, le drapeau racine fait foi — c'est lui qui reflète l'appel
    // à Stripe qui vient d'avoir lieu.
    confirmed: bool(source, 'confirmed', order?.status === 'confirmed'),
    failed: bool(source, 'failed', order?.status === 'failed'),
    order,
  }
}
