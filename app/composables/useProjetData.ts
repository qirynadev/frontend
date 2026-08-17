import type { Order } from '~/core/contracts'
import type { ProjetAccompagnement, ProjetBadgeTone } from '~/core/contracts/projet'
import { paymentRepo } from '~/core/repositories'

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
  /** `null` : pas encore d'écran de détail (langues — sélection du professeur à venir). */
  to: string | null
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
    to: null,
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
 * Sous-titre d'une commande.
 *
 * Langue : la langue apprise (`options.language`), pas la formule — c'est ce
 * que le client reconnaît, la formule est un détail tarifaire. Les autres
 * types n'ont pas d'équivalent réel à « ESA Paris » (l'école) dans `Order` :
 * le nom de la formule achetée sert de repli.
 */
function toSub(order: Order): string {
  if (order.serviceType === 'course') {
    const level = order.options.level
    const language = order.options.language ?? order.offer?.title ?? ''
    return level ? `${language} – ${level}` : language
  }
  return order.offer?.title ?? ''
}

/**
 * Statut affiché et avancement.
 *
 * `Order.status` ne porte que l'état du **paiement**, pas celui du dossier —
 * l'API n'expose aucun avancement générique. `pending`/`failed` valent 0 %,
 * légitimement (rien n'a commencé) ; `confirmed` ne dit rien de plus qu'« en
 * cours » : la barre est masquée plutôt que remplie au hasard.
 */
function toStatus(order: Order): { statusKey: string; progressPercent: number | null } {
  if (order.status === 'failed') return { statusKey: 'myProject.statusFailed', progressPercent: 0 }
  if (order.status === 'pending') return { statusKey: 'myProject.statusPending', progressPercent: 0 }
  return { statusKey: 'myProject.statusInProgress', progressPercent: null }
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

export function toAccompagnements(orders: Order[]): ProjetAccompagnement[] {
  return [...orders]
    .filter((order) => order.serviceType in TYPE_CONFIG)
    .sort((a, b) => {
      const typeDelta = TYPE_ORDER.indexOf(a.serviceType) - TYPE_ORDER.indexOf(b.serviceType)
      if (typeDelta !== 0) return typeDelta
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
    })
    .map((order) => toAccompagnement(order, TYPE_CONFIG[order.serviceType]!))
}

export async function useProjetData(locale: Ref<string>) {
  return usePageData('mon-projet-accompagnements', () => paymentRepo.orders(locale.value), { watch: [locale] })
}

/** Nombre de jours pleins écoulés depuis une date ISO `AAAA-MM-JJ`. Jamais négatif. */
export function daysSince(isoDate: string): number {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000)
  return Number.isFinite(days) ? Math.max(0, days) : 0
}
