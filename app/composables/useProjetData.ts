import type { Order, OrientationEvaluation } from '~/core/contracts'
import type { ProjetAccompagnement, ProjetBadgeTone } from '~/core/contracts/projet'
import { orientationEvaluationProgress } from '~/utils/orientation-progress'
import { orientationEvaluationRepo, paymentRepo, planningRepo } from '~/core/repositories'

/**
 * Accompagnements suivis sur `mon-projet` — exactement 4 cartes, une par
 * rubrique (école, logement, langues, orientation), quel que soit le nombre
 * de commandes/langues/bilans achetés dans chacune. Consigne du responsable
 * (2026-08-23) : **une seule carte par type de service**, jamais une par
 * commande — un client qui achète deux cours de langues ou deux bilans
 * d'orientation voit une seule carte « Langues »/« Orientation », le détail
 * par commande n'apparaît qu'au clic, sur l'écran dédié à ce type.
 *
 * **Score = moyenne des avancements individuels.** Le nombre de produits
 * achetés dans la rubrique est le dénominateur de la fraction — exemple du
 * responsable : deux cours de langues différents (20h d'anglais + 30h de
 * français) donnent un dénominateur de 2, pas la somme des heures. Chaque
 * produit contribue son propre pourcentage (0 si non mesurable), la moyenne
 * de ces pourcentages est le score affiché sur la carte.
 */
interface AccompagnementTypeConfig {
  titleKey: string
  icon: string
  badgeTone: ProjetBadgeTone
  progressColor: string
  to: string
}

const TYPE_CONFIG: Record<string, AccompagnementTypeConfig> = {
  areaofstudy: {
    titleKey: 'myProject.accompaniementAdmissionTitle',
    icon: '/img/icons/ic-mp-admission.png',
    badgeTone: 'purple',
    progressColor: '#4615fd',
    to: '/mon-projet/admission',
  },
  costofliving: {
    titleKey: 'myProject.accompaniementLogementTitle',
    icon: '/img/icons/ic-mp-logement.png',
    badgeTone: 'green',
    progressColor: '#19b64c',
    to: '/mon-projet/logement',
  },
  course: {
    titleKey: 'myProject.accompaniementLanguesTitle',
    icon: '/img/icons/ic-mp-langues.svg',
    badgeTone: 'pink',
    progressColor: '#fc1f99',
    to: '/mon-projet/langues',
  },
  profilage: {
    titleKey: 'myProject.accompaniementOrientationTitle',
    icon: '/img/icons/ic-mp-orientation.png',
    badgeTone: 'orange',
    progressColor: '#f97316',
    to: '/mon-projet/orientation',
  },
}

/** Ordre d'affichage des rubriques — reprend celui de `mon-projet.html`. */
const TYPE_ORDER = ['areaofstudy', 'costofliving', 'course', 'profilage']

/**
 * Sous-titre d'une commande.
 *
 * École pour l'admission (`schoolName`, ou repli sur le domaine d'étude tant
 * qu'aucune école n'est assignée), pays pour le logement (`destinationCountry`
 * — pas de ville côté API, voir `Order.destinationCountry`). Le nom de la
 * formule achetée (`offer.title`) sert de repli pour les deux, et reste la
 * valeur pour tout autre type de commande.
 */
function toSub(order: Order): string {
  if (order.serviceType === 'areaofstudy') return order.schoolName ?? order.offer?.title ?? ''
  if (order.serviceType === 'costofliving') return order.destinationCountry ?? order.offer?.title ?? ''
  return order.offer?.title ?? ''
}

/**
 * Statut global d'une rubrique à commandes multiples (école, logement,
 * orientation) : `Échec` seulement si **toutes** les commandes ont échoué,
 * `En attente` tant qu'aucune n'est confirmée, sinon l'avancement pilote le
 * badge (`Terminé` à 100 %). Évite qu'un score à 0 % (commande confirmée
 * mais checklist pas encore alimentée) affiche « En cours » sur une commande
 * en réalité en échec ou pas encore payée.
 */
function toOverallStatus(orders: Order[], progressPercent: number): string {
  if (orders.every((order) => order.status === 'failed')) return 'myProject.statusFailed'
  if (!orders.some((order) => order.status === 'confirmed')) return 'myProject.statusPending'
  return progressPercent >= 100 ? 'myProject.statusDone' : 'myProject.statusInProgress'
}

/**
 * Avancement d'**une** commande (0-100), même formule que
 * `useAdmissionData`/`useLogementData` : `done/total` de sa checklist. 0 si
 * la commande a échoué, ou n'a pas de checklist (antérieure au mécanisme, ou
 * type qui n'en a jamais) — un vrai zéro plutôt qu'une valeur inconnue.
 *
 * Ne filtre plus sur `status === 'confirmed'` : la checklist est seedée dès
 * `/payment/init` (paiement réussi), avant même qu'un statut « vérifié »
 * n'arrive — une commande « en attente de vérification » (paiement confirmé,
 * dossier en cours d'examen) a une checklist bien réelle, ignorée à tort par
 * l'ancien filtre (repéré 2026-08-27 : une commande école réelle du compte de
 * test, checklist 1/7, contribuait 0 % au lieu de 14 %). Seul un `échoué`
 * reste exclu.
 */
function orderChecklistProgress(order: Order): number {
  if (order.status === 'failed' || order.checklist.length === 0) return 0
  const done = order.checklist.filter((item) => item.status === 'done').length
  return Math.round((done / order.checklist.length) * 100)
}

/**
 * Une seule carte pour toutes les commandes d'un type (école ou logement) —
 * le nombre de commandes est le dénominateur, la moyenne de leur avancement
 * individuel le score. `null` si le client n'a aucune commande de ce type.
 */
function toOrderAggregateAccompagnement(orders: Order[], type: 'areaofstudy' | 'costofliving'): ProjetAccompagnement | null {
  if (orders.length === 0) return null

  const config = TYPE_CONFIG[type]!
  const mostRecentOrder = [...orders].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0]!
  const progressPercent = Math.round(
    orders.reduce((sum, order) => sum + orderChecklistProgress(order), 0) / orders.length,
  )

  return {
    id: type,
    titleKey: config.titleKey,
    sub: toSub(mostRecentOrder),
    statusKey: toOverallStatus(orders, progressPercent),
    badgeTone: config.badgeTone,
    progressPercent,
    hasOrder: true,
    progressColor: config.progressColor,
    // Plusieurs commandes peuvent avoir des conseillers/dates différents —
    // rien plutôt qu'une valeur arbitraire (même choix que langues/orientation).
    advisorName: null,
    updatedAt: null,
    icon: config.icon,
    to: config.to,
  }
}

/**
 * Une seule carte pour **toutes** les commandes de langue, pas une par langue
 * (règle resserrée le 2026-08-23). Avancement basé sur les étapes de chaque
 * commande (`Order.checklist`, même mécanisme qu'admission/logement) plutôt
 * que sur les heures planifiées — décision du responsable, 2026-08-30, reprise
 * ici pour que la carte et le détail (`/mon-projet/langues`) affichent le même
 * principe de calcul. Le nombre de commandes est le dénominateur ; chacune
 * contribue son propre pourcentage, la moyenne de ces pourcentages est le
 * score affiché.
 */
export function toLanguageAccompagnement(orders: Order[]): ProjetAccompagnement | null {
  if (orders.length === 0) return null

  const config = TYPE_CONFIG.course!
  const progressPercent = Math.round(
    orders.reduce((sum, order) => sum + orderChecklistProgress(order), 0) / orders.length,
  )

  return {
    id: 'course',
    titleKey: config.titleKey,
    sub: '',
    statusKey: toOverallStatus(orders, progressPercent),
    badgeTone: config.badgeTone,
    progressPercent,
    hasOrder: true,
    progressColor: config.progressColor,
    advisorName: null,
    updatedAt: null,
    icon: config.icon,
    to: config.to,
  }
}

/**
 * Une seule carte pour tous les bilans d'orientation (E-Testing), même
 * principe que les langues. Le nombre de commandes orientation est le
 * dénominateur ; une commande sans évaluation correspondante (pas encore
 * payée, ou pas encore créée côté back-office) contribue 0.
 */
export function toOrientationAccompagnement(
  orders: Order[],
  evaluations: OrientationEvaluation[],
): ProjetAccompagnement | null {
  if (orders.length === 0) return null

  const config = TYPE_CONFIG.profilage!
  const mostRecentOrder = [...orders].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0]!

  const perOrderPercent = orders.map((order) => {
    const evaluation = evaluations.find((item) => item.orderId === order.id)
    return evaluation ? orientationEvaluationProgress(evaluation) : 0
  })
  const progressPercent = Math.round(perOrderPercent.reduce((sum, pct) => sum + pct, 0) / orders.length)

  return {
    id: 'profilage',
    titleKey: config.titleKey,
    sub: toSub(mostRecentOrder),
    statusKey: toOverallStatus(orders, progressPercent),
    badgeTone: config.badgeTone,
    progressPercent,
    hasOrder: true,
    progressColor: config.progressColor,
    // Plusieurs bilans peuvent avoir des conseillers différents — même choix
    // que les langues : rien plutôt qu'un nom arbitraire.
    advisorName: null,
    updatedAt: null,
    icon: config.icon,
    to: config.to,
  }
}

function zeroAccompagnement(type: string): ProjetAccompagnement {
  const config = TYPE_CONFIG[type]!
  return {
    id: `empty-${type}`,
    titleKey: config.titleKey,
    sub: '',
    statusKey: 'myProject.statusPending',
    badgeTone: config.badgeTone,
    progressPercent: 0,
    hasOrder: false,
    progressColor: config.progressColor,
    advisorName: null,
    updatedAt: null,
    icon: config.icon,
    to: config.to,
  }
}

/**
 * Garantit une carte par rubrique (école/logement/langues/orientation), dans
 * l'ordre de la maquette — un client qui n'a encore rien acheté voit les 4
 * rubriques à 0 %, pas un contenu inventé (« ESA Paris », 80 %…).
 */
export function ensureAllTypes(accompagnements: ProjetAccompagnement[]): ProjetAccompagnement[] {
  const result = [...accompagnements]

  for (const type of TYPE_ORDER) {
    if (!result.some((item) => item.titleKey === TYPE_CONFIG[type]!.titleKey)) {
      result.push(zeroAccompagnement(type))
    }
  }

  const order = TYPE_ORDER.map((type) => TYPE_CONFIG[type]!.titleKey)
  return result.sort((a, b) => order.indexOf(a.titleKey) - order.indexOf(b.titleKey))
}

/**
 * Assemble les 4 cartes à partir des commandes/bilans réels.
 * Utilisé par `mon-projet/index.vue` ; extrait ici pour rester testable sans
 * monter le composant.
 */
export function toAccompagnements(
  orders: Order[],
  evaluations: OrientationEvaluation[],
): ProjetAccompagnement[] {
  const admission = toOrderAggregateAccompagnement(orders.filter((order) => order.serviceType === 'areaofstudy'), 'areaofstudy')
  const logement = toOrderAggregateAccompagnement(orders.filter((order) => order.serviceType === 'costofliving'), 'costofliving')
  const langues = toLanguageAccompagnement(orders.filter((order) => order.serviceType === 'course'))
  const orientation = toOrientationAccompagnement(orders.filter((order) => order.serviceType === 'profilage'), evaluations)

  const fromApi = [admission, logement, langues, orientation].filter((item): item is ProjetAccompagnement => item !== null)
  return ensureAllTypes(fromApi)
}

export async function useProjetData(locale: Ref<string>) {
  return usePageData(
    'mon-projet-accompagnements',
    async () => {
      const [orders, languages, sessions, evaluations] = await Promise.all([
        paymentRepo.orders(locale.value),
        planningRepo.unplanned(locale.value),
        planningRepo.planned(locale.value),
        orientationEvaluationRepo.list(locale.value),
      ])
      return { orders, languages, sessions, evaluations }
    },
    { watch: [locale] },
  )
}

/** Nombre de jours pleins écoulés depuis une date ISO `AAAA-MM-JJ`. Jamais négatif. */
export function daysSince(isoDate: string): number {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000)
  return Number.isFinite(days) ? Math.max(0, days) : 0
}
