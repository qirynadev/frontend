import { ApiError } from '~/core/http/errors'
import type { LmsTarget } from '~/core/repositories'
import { lmsRepo } from '~/core/repositories'

/**
 * Tests de niveau ouverts depuis cet onglet, pour reconnaître un retour du
 * LMS : `{ [orderId]: horodatage }`. Le niveau arrive au back-office par un
 * message du LMS, sans garantie d'ordre avec le retour du navigateur ; la page
 * relit donc l'état de ces commandes pendant quelques secondes à l'arrivée.
 */
const STARTED_KEY = 'qiryna:lms-tests-started'
/** Au-delà, le retour n'est plus celui d'un test : la session du LMS a expiré depuis. */
const STARTED_TTL_MS = 2 * 60 * 60 * 1000

function readStarted(): Record<string, number> {
  if (!import.meta.client) return {}
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(STARTED_KEY) ?? '{}')
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const now = Date.now()
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && now - entry[1] < STARTED_TTL_MS),
    )
  }
  catch {
    return {}
  }
}

function writeStarted(started: Record<string, number>): void {
  if (!import.meta.client) return
  try {
    if (Object.keys(started).length === 0) window.sessionStorage.removeItem(STARTED_KEY)
    else window.sessionStorage.setItem(STARTED_KEY, JSON.stringify(started))
  }
  catch {
    // Stockage indisponible (navigation privée) : la relecture au retour est un confort.
  }
}

/** Commandes dont le test a été ouvert depuis cet onglet, il y a moins de deux heures. */
export function startedLevelTests(): string[] {
  return Object.keys(readStarted())
}

export function forgetStartedLevelTests(): void {
  writeStarted({})
}

/**
 * Entrée dans le LMS depuis un bouton.
 *
 * L'adresse de connexion unique ne vaut que 60 secondes et une seule fois :
 * elle est demandée **au clic**, et le navigateur y part aussitôt. Jamais au
 * chargement d'une page, jamais dans un `href`.
 *
 * `openingKey` désigne le bouton en cours (une page peut en porter plusieurs) ;
 * `failure` porte le message à afficher sous ce même bouton.
 */
export function useLmsEntry() {
  const { t, locale } = useI18n()

  const openingKey = ref<string | null>(null)
  const failure = ref<{ key: string; message: string } | null>(null)

  async function enter(input: { orderId?: string; target?: LmsTarget }): Promise<void> {
    if (openingKey.value !== null) return
    const key = input.orderId ?? 'courses'
    openingKey.value = key
    failure.value = null

    try {
      const { url } = await lmsRepo.entryUrl(input, locale.value)
      if (input.orderId) writeStarted({ ...readStarted(), [input.orderId]: Date.now() })
      // `openingKey` reste posé : la page s'en va.
      window.location.assign(url)
    }
    catch (error) {
      // Un refus du back-office porte un code et un message déjà traduit ;
      // une panne réseau n'a qu'un message technique, remplacé par le nôtre.
      const message = error instanceof ApiError && error.code ? error.message : t('languageProject.levelTestError')
      failure.value = { key, message }
      openingKey.value = null
    }
  }

  // Retour par le bouton « Précédent » : la page sort du cache du navigateur
  // dans l'état où elle est partie, bouton encore en chargement.
  function onPageShow(event: PageTransitionEvent) {
    if (event.persisted) openingKey.value = null
  }
  onMounted(() => window.addEventListener('pageshow', onPageShow))
  onBeforeUnmount(() => window.removeEventListener('pageshow', onPageShow))

  return { enter, openingKey, failure }
}
