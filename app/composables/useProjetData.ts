import type { LanguageProgress, Order, OrientationEvaluation, PlannedSession } from '~/core/contracts'
import type { ProjetAccompagnement, ProjetBadgeTone } from '~/core/contracts/projet'
import { orientationEvaluationProgress } from '~/utils/orientation-progress'
import { orientationEvaluationRepo, paymentRepo, planningRepo } from '~/core/repositories'

/**
 * Accompagnements suivis sur `mon-projet`.
 *
 * `paymentRepo.orders()` — une commande par ligne — alimentait déjà `Order`,
 * mais rien ne l'appelait : cet écran tournait sur quatre cartes fixes, une
 * par type de service. Or un client peut acheter plusieurs formules de
 * langues, plusieurs bilans d'orientation… `mon-projet` doit lister les
 * commandes, pas les types.
 *
 * Un type de service sans configuration ci-dessous (MBA, par exemple) est
 * **écarté silencieusement** — signalé ici, pas une carte à moitié remplie.
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

/** Ordre d'affichage des groupes — reprend celui de `mon-projet.html`. */
const TYPE_ORDER = ['areaofstudy', 'costofliving', 'course', 'profilage']

/**
 * Sous-titre d'une commande. `course` n'arrive plus ici (voir
 * `toLanguageAccompagnements`) : les autres types n'ont pas d'équivalent réel
 * à « ESA Paris » (l'école) dans `Order` — le nom de la formule achetée sert
 * de repli.
 */
function toSub(order: Order): string {
  return order.offer?.title ?? ''
}

/**
 * Statut affiché et avancement.
 *
 * `Order.status` ne porte que l'état du **paiement**, pas celui du dossier.
 * `pending`/`failed` valent 0 %, légitimement (rien n'a commencé). Pour une
 * commande confirmée, `order.checklist` (école/logement — voir
 * `useAdmissionData`/`useLogementData`, même formule ici pour que la carte du
 * hub et l'écran de détail affichent le même pourcentage) donne un avancement
 * réel quand il existe ; une commande antérieure au mécanisme de checklist
 * (15/08/2026) ou d'un type qui n'en a jamais (`profilage`) a une liste vide —
 * la barre reste masquée (`null`) plutôt que remplie au hasard.
 */
function toStatus(order: Order): { statusKey: string; progressPercent: number | null } {
  if (order.status === 'failed') return { statusKey: 'myProject.statusFailed', progressPercent: 0 }
  if (order.status === 'pending') return { statusKey: 'myProject.statusPending', progressPercent: 0 }

  if (order.checklist.length === 0) {
    return { statusKey: 'myProject.statusInProgress', progressPercent: null }
  }

  const done = order.checklist.filter((item) => item.status === 'done').length
  const progressPercent = Math.round((done / order.checklist.length) * 100)
  return {
    statusKey: progressPercent >= 100 ? 'myProject.statusDone' : 'myProject.statusInProgress',
    progressPercent,
  }
}

function toAccompagnement(order: Order, config: AccompagnementTypeConfig): ProjetAccompagnement {
  const { statusKey, progressPercent } = toStatus(order)

  return {
    id: order.id,
    titleKey: config.titleKey,
    sub: toSub(order),
    statusKey,
    badgeTone: config.badgeTone,
    progressPercent,
    progressColor: config.progressColor,
    advisorName: order.advisorName,
    updatedAt: order.updatedAt ?? order.createdAt,
    icon: config.icon,
    to: config.to,
  }
}

/**
 * Une carte par commande — tous les types **sauf** `course` : les langues
 * suivent une règle différente (voir `toLanguageAccompagnements`), pas
 * traitée ici.
 */
export function toAccompagnements(orders: Order[]): ProjetAccompagnement[] {
  return [...orders]
    .filter((order) => order.serviceType !== 'course' && order.serviceType in TYPE_CONFIG)
    .sort((a, b) => {
      const typeDelta = TYPE_ORDER.indexOf(a.serviceType) - TYPE_ORDER.indexOf(b.serviceType)
      if (typeDelta !== 0) return typeDelta
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
    })
    .map((order) => toAccompagnement(order, TYPE_CONFIG[order.serviceType]!))
}

/**
 * Une carte par **langue**, pas par commande — à la différence des trois
 * autres types : deux commandes de la même langue se regroupent en une seule
 * carte, leurs heures s'additionnent. Deux langues différentes restent deux
 * cartes. Confirmé par le responsable le 2026-08-17.
 *
 * L'avancement compte les séances **terminées** (date passée) et **expirées**
 * (non planifiées, commande vieille de plus de 90 jours — délai imposé par
 * `PlanningController::createPlanning`) sur le total d'heures achetées :
 * `sessions.filter(passée) + lessons.filter(expired) / totalHours`. Ni
 * `advisorName` ni `updatedAt` ne sont montrés : plusieurs commandes d'une
 * même langue peuvent avoir des professeurs différents, choisir lequel
 * afficher serait arbitraire.
 *
 * `languages`/`sessions` viennent de `GET /plannings/unplanned` et `/planned`,
 * qui ne portent que les commandes **payées** (`en attente de vérification`,
 * `vérifié`, legacy `confirmée`/`en cours`/`terminé`) — une commande encore
 * « en attente de paiement » n'apparaît dans aucun des deux et donc pas ici.
 * Signalé, pas résolu : rattacher une telle commande à sa langue sans donnée
 * fiable pour le faire serait plus fragile que l'omettre.
 */
export function toLanguageAccompagnements(languages: LanguageProgress[], sessions: PlannedSession[]): ProjetAccompagnement[] {
  const config = TYPE_CONFIG.course!
  const now = Date.now()

  return languages.map((language) => {
    const completed = sessions.filter(
      (session) => session.courseId === language.courseId && session.startDate !== null && new Date(session.startDate).getTime() < now,
    ).length
    const expired = language.lessons.filter((lesson) => lesson.expired).length

    const progressPercent = language.totalHours > 0
      ? Math.min(100, Math.round(((completed + expired) / language.totalHours) * 100))
      : null

    return {
      id: `course-${language.courseId ?? language.title}`,
      titleKey: config.titleKey,
      sub: language.title,
      statusKey: progressPercent !== null && progressPercent >= 100 ? 'myProject.statusDone' : 'myProject.statusInProgress',
      badgeTone: config.badgeTone,
      progressPercent,
      progressColor: config.progressColor,
      advisorName: null,
      updatedAt: null,
      icon: config.icon,
      to: config.to,
    }
  })
}

/**
 * Une seule carte pour **toute** l'orientation, quel que soit le nombre de
 * bilans (« tests E-Testing ») achetés — même principe que les langues (une
 * carte, pas une par commande), précisé par le responsable le 2026-08-23.
 * Clic → `/mon-projet/orientation`, qui liste chaque bilan en détail.
 *
 * L'avancement est la moyenne des jalons réels de chaque évaluation (même
 * calcul que `useOrientationData.ts`, voir `orientation-progress.ts`) — pas
 * `Order.checklist`, jamais alimenté pour `profilage`. `null` (donc `0`
 * affiché) si le client n'a encore aucune commande orientation.
 */
export function toOrientationAccompagnement(
  orders: Order[],
  evaluations: OrientationEvaluation[],
): ProjetAccompagnement | null {
  if (orders.length === 0) return null

  const config = TYPE_CONFIG.profilage!
  const mostRecentOrder = [...orders].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0]!

  const progressPercent = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, evaluation) => sum + orientationEvaluationProgress(evaluation), 0) / evaluations.length)
    : 0

  return {
    id: 'profilage',
    titleKey: config.titleKey,
    sub: toSub(mostRecentOrder),
    statusKey: progressPercent >= 100 ? 'myProject.statusDone' : 'myProject.statusInProgress',
    badgeTone: config.badgeTone,
    progressPercent,
    progressColor: config.progressColor,
    // Plusieurs bilans peuvent avoir des conseillers différents — même choix
    // que `toLanguageAccompagnements` : rien plutôt qu'un nom arbitraire.
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
 * rubriques à 0 %, pas un contenu inventé (« ESA Paris », 80 %…). Consigne du
 * responsable (2026-08-23) : un vrai zéro plutôt qu'une valeur d'exemple.
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
