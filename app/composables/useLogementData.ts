import type { OrderChecklistItem } from '~/core/contracts'
import type { LogementStep } from '~/core/contracts/logement'
import { paymentRepo } from '~/core/repositories'

/**
 * Les 9 étapes de `CostOfLiving` (`OrderChecklistStepEnum::livingSteps()`,
 * back-office), dans l'ordre — `titleKey`/`icon` déjà écrits pour la donnée
 * d'essai correspondent un à un aux `step_key` réels (vérifié : « Paiement
 * reçu » ↔ `payment_received`, etc.), réutilisés par position plutôt que
 * dupliqués par clé.
 */
const STEP_PRESENTATION: { titleKey: string, icon: string }[] = [
  { titleKey: 'projectHousing.stepPayment', icon: '/img/icons/step1-payment-full.svg' },
  { titleKey: 'projectHousing.stepHousing', icon: '/img/icons/step2-house-full.svg' },
  { titleKey: 'projectHousing.stepHousingSheet', icon: '/img/icons/step3-doc-full.svg' },
  { titleKey: 'projectHousing.stepAreaSheet', icon: '/img/icons/step4-map-full.svg' },
  { titleKey: 'projectHousing.stepDeposit', icon: '/img/icons/step5-shield-full.svg' },
  { titleKey: 'projectHousing.stepContract', icon: '/img/icons/step6-contract-full.svg' },
  { titleKey: 'projectHousing.stepTaxi', icon: '/img/icons/step7-taxi-full.svg' },
  { titleKey: 'projectHousing.stepSim', icon: '/img/icons/step8-sim-full.svg' },
  { titleKey: 'projectHousing.stepAdmin', icon: '/img/icons/step9-admin-full.svg' },
]

function toChecklistStatus(status: OrderChecklistItem['status']): LogementStep['status'] {
  if (status === 'done') return 'done'
  // Pas de statut « en cours » distinct côté back-office : à la création,
  // plusieurs lignes peuvent recevoir `en attente` à la fois (5 sur 9, voir
  // `seedDefaultsForOrder`) — toutes affichées comme actives plutôt que d'en
  // choisir une arbitrairement.
  if (status === 'pending') return 'current'
  return 'upcoming'
}

/** `AAAA-MM-JJ` → « 18 mai 2024 », le format que la maquette affiche. */
function toFrenchLongDate(isoDate: string, locale: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

function toLogementSteps(checklist: OrderChecklistItem[], locale: string): LogementStep[] {
  return checklist.map((item) => {
    const presentation = STEP_PRESENTATION[item.position - 1] ?? STEP_PRESENTATION[STEP_PRESENTATION.length - 1]!
    return {
      id: item.id,
      stepNumber: item.position,
      titleKey: presentation.titleKey,
      icon: presentation.icon,
      status: toChecklistStatus(item.status),
      completedAt: item.completedAt ? toFrenchLongDate(item.completedAt, locale) : undefined,
    }
  })
}

/**
 * Suivi de l'accompagnement logement, pour `mon-projet/logement`.
 *
 * Branché sur `paymentRepo.orders()` — une commande de type `costofliving`,
 * la plus récente si le client en a plusieurs (même limitation que
 * `mon-projet/admission` : l'écran n'a pas de route par commande). Logement
 * est le premier type à avoir eu ce suivi par étapes côté back-office :
 * vérifié sur les commandes réelles du compte de test, les trois ont bien 9
 * lignes de checklist (contrairement à la commande école, plus ancienne que
 * le mécanisme).
 */
export async function useLogementData(locale: Ref<string>) {
  return usePageData(
    'mon-projet-logement',
    async () => {
      const orders = await paymentRepo.orders(locale.value)
      const order = orders
        .filter((candidate) => candidate.serviceType === 'costofliving')
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0] ?? null

      const steps = order ? toLogementSteps(order.checklist, locale.value) : []
      const done = steps.filter((step) => step.status === 'done').length
      const progressPercent = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0

      return { order, steps, progressPercent }
    },
    { watch: [locale] },
  )
}
