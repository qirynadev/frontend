import { describe, expect, it } from 'vitest'
import {
  normalizeServiceType,
  toOrder,
  toOrderChecklist,
  toOrderList,
  toOrderOptions,
  toOrderReference,
  toOrderStatus,
  toPaymentInit,
  toPaymentValidation,
} from '~/core/adapters/order.adapter'

/** Forme d’une commande telle que `/payment/list` et `/payment/init` la renvoient. */
const rawOrder = {
  id: '0d549216-6a3c-4c8f-9e1a-2b7f5c4d8e90',
  amount: 400,
  status: 'pending',
  payment_type: 'subscription',
  created_at: '13/01/2026',
  updated_at: '14/01/2026',
  service_type: 'App\\Models\\Course',
  teacher_name: 'Amina Diallo',
  user: { id: 'u1', email: 'user@example.com' },
  associated_service: { id: 'c1', slug: 'anglais' },
  options: { language: 'Anglais', level: 'B2', vide: '', nul: null, nombre: 3 },
  offer: {
    id: 'f3',
    title: 'Everest',
    description: '',
    icon: 'https://admin.stage.qiryna.com/storage/formule-everest.png',
    nbr_hours: 8,
    items: [{ title: 'Cours en visio' }, { title: null, description: null }, { title: '' }],
  },
}

describe('réponse nominale', () => {
  it('traduit la commande', () => {
    const order = toOrder(rawOrder)

    expect(order?.id).toBe('0d549216-6a3c-4c8f-9e1a-2b7f5c4d8e90')
    expect(order?.status).toBe('pending')
    expect(order?.price).toEqual({ amount: 400, currency: 'EUR', mode: 'subscription' })
    expect(order?.createdAt).toBe('2026-01-13')
    expect(order?.updatedAt).toBe('2026-01-14')
    expect(order?.serviceType).toBe('course')
    expect(order?.customerEmail).toBe('user@example.com')
    expect(order?.serviceSlug).toBe('anglais')
    expect(order?.offer?.title).toBe('Everest')
    expect(order?.offer?.hours).toBe(8)
    expect(order?.advisorName).toBe('Amina Diallo')
  })

  it('donne `null` sans professeur ni conseiller assigné', () => {
    expect(toOrder({ ...rawOrder, teacher_name: undefined })?.advisorName).toBeNull()
  })

  it('préfère `mentor_name` à `teacher_name` quand les deux sont présents', () => {
    expect(toOrder({ ...rawOrder, mentor_name: 'Sarah Kouamé' })?.advisorName).toBe('Sarah Kouamé')
  })

  it('dérive une référence lisible faute de numéro en base', () => {
    expect(toOrderReference('0d549216-6a3c-4c8f')).toBe('QRY-0D549216')
    expect(toOrderReference('')).toBe('')
  })

  it('écarte les entrées fantômes des puces d’offre', () => {
    // `{ title: null, description: null }` est présent sur la plupart des offres.
    expect(toOrder(rawOrder)?.offer?.features).toEqual(['Cours en visio'])
  })

  it('ne garde que des options textuelles non vides', () => {
    expect(toOrderOptions(rawOrder.options)).toEqual({ language: 'Anglais', level: 'B2', nombre: '3' })
  })
})

describe('champ manquant', () => {
  it('ne lève sur aucune forme d’entrée', () => {
    for (const input of [null, undefined, 42, 'texte', [], {}]) {
      expect(() => toOrder(input)).not.toThrow()
      expect(() => toOrderList(input)).not.toThrow()
      expect(() => toPaymentInit(input)).not.toThrow()
      expect(() => toPaymentValidation(input)).not.toThrow()
    }
  })

  it('écarte une commande sans identifiant', () => {
    // Sans `id`, ni la validation ni la relance ne sont possibles.
    expect(toOrder({ amount: 400 })).toBeNull()
    expect(toOrderList({ orders: [rawOrder, { amount: 1 }] })).toHaveLength(1)
  })

  it('accepte une liste nue comme une enveloppe `{ orders }`', () => {
    expect(toOrderList([rawOrder])).toHaveLength(1)
    expect(toOrderList({ orders: [rawOrder] })).toHaveLength(1)
  })

  it('donne `null` sur une date illisible', () => {
    expect(toOrder({ ...rawOrder, created_at: '31/02/2024' })?.createdAt).toBeNull()
    expect(toOrder({ ...rawOrder, created_at: null })?.createdAt).toBeNull()
  })

  it('donne `null` sur une offre absente', () => {
    expect(toOrder({ ...rawOrder, offer: null })?.offer).toBeNull()
  })
})

describe('cas dégradé', () => {
  it('normalise les deux vocabulaires de `service_type`', () => {
    // Le back-office renvoie `course` sur un endpoint, `App\Models\Course` sur
    // un autre : sans normalisation, un `=== 'course'` échoue une fois sur deux.
    expect(normalizeServiceType('App\\Models\\Course')).toBe('course')
    expect(normalizeServiceType('course')).toBe('course')
    expect(normalizeServiceType('App\\Models\\CostOfLiving')).toBe('costofliving')
    expect(normalizeServiceType(null)).toBe('')
  })

  it('retombe sur `offer.type` quand `service_type` manque', () => {
    expect(toOrder({ ...rawOrder, service_type: null, offer: { id: 'x', title: 'y', type: 'profilage' } })?.serviceType)
      .toBe('profilage')
  })

  it('lit l’état dans `status` comme dans `confirmed`/`failed`', () => {
    expect(toOrderStatus({ confirmed: true })).toBe('confirmed')
    expect(toOrderStatus({ failed: true })).toBe('failed')
    expect(toOrderStatus({ status: 'paid' })).toBe('confirmed')
    expect(toOrderStatus({ status: 'cancelled' })).toBe('failed')
    expect(toOrderStatus({ payment_status: 'succeeded' })).toBe('confirmed')
    expect(toOrderStatus({})).toBe('pending')
  })

  it('reconnaît les libellés français d’`OrderTrackingStatusEnum` (`/payment/list`)', () => {
    expect(toOrderStatus({ status: 'Vérifié' })).toBe('confirmed')
    expect(toOrderStatus({ status: 'Confirmée' })).toBe('confirmed')
    expect(toOrderStatus({ status: 'Terminé' })).toBe('confirmed')
    expect(toOrderStatus({ status: 'En attente de paiement' })).toBe('pending')
    expect(toOrderStatus({ status: 'En attente de vérification' })).toBe('pending')
    expect(toOrderStatus({ status: 'Échoué' })).toBe('failed')
    expect(toOrderStatus({ status: 'Annulé' })).toBe('failed')
  })

  it('ramène une URL de paiement vide à null', () => {
    // Une chaîne vide ferait naviguer vers la page courante ; `null` est un
    // échec que l’appelant sait traiter.
    expect(toPaymentInit({ order: rawOrder, redirectUrl: '' }).redirectUrl).toBeNull()
    expect(toPaymentInit({ order: rawOrder, redirectUrl: 'pas-une-url' }).redirectUrl).toBeNull()
    expect(toPaymentInit({ order: rawOrder, redirectUrl: 'https://checkout.stripe.com/c/pay/x' }).redirectUrl)
      .toBe('https://checkout.stripe.com/c/pay/x')
  })

  it('accepte `redirect_url` comme `redirectUrl`', () => {
    expect(toPaymentInit({ redirect_url: 'https://checkout.stripe.com/x' }).redirectUrl)
      .toBe('https://checkout.stripe.com/x')
  })

  it('traduit la checklist, triée par position', () => {
    const checklist = toOrderChecklist([
      { id: 'c2', step_key: 'documents_submitted', position: 2, status: 'en attente', completed_at: null },
      { id: 'c1', step_key: 'payment_confirmed', position: 1, status: 'terminé', completed_at: '2026-08-17T16:39:00.000000Z' },
      { id: 'c3', step_key: 'file_review', position: 3, status: 'à venir', completed_at: null },
    ])

    expect(checklist).toEqual([
      { id: 'c1', stepKey: 'payment_confirmed', position: 1, status: 'done', completedAt: '2026-08-17' },
      { id: 'c2', stepKey: 'documents_submitted', position: 2, status: 'pending', completedAt: null },
      { id: 'c3', stepKey: 'file_review', position: 3, status: 'upcoming', completedAt: null },
    ])
  })

  it('donne une checklist vide sans lever, sur une commande antérieure au suivi par étapes', () => {
    expect(toOrderChecklist(undefined)).toEqual([])
    expect(toOrder(rawOrder)?.checklist).toEqual([])
  })

  it('écarte une ligne de checklist sans identifiant ou sans clé d’étape', () => {
    expect(toOrderChecklist([{ step_key: 'x', position: 1, status: 'terminé' }])).toEqual([])
    expect(toOrderChecklist([{ id: 'c1', position: 1, status: 'terminé' }])).toEqual([])
  })

  it('déduit le verdict de la commande quand les drapeaux manquent', () => {
    expect(toPaymentValidation({ order: { ...rawOrder, status: 'paid' } })).toMatchObject({
      confirmed: true,
      failed: false,
    })
    expect(toPaymentValidation({ confirmed: false, failed: true, order: rawOrder })).toMatchObject({
      confirmed: false,
      failed: true,
    })
  })
})
