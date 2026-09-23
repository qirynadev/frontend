<script setup lang="ts">
/**
 * Salle de visio Qiryna — écran COMMUN à l'apprenant et au professeur.
 *
 * ⚠️ FICHIER IDENTIQUE DANS LES DEUX DÉPÔTS — toute modification se reporte
 * à l'identique dans l'autre :
 * - qiryna-front      : app/components/langues/VisioCallRoom.vue (apprenant)
 * - qiryna-backoffice : resources/js/Components/Visio/VisioCallRoom.vue (prof)
 * D'où son autonomie : imports `vue` explicites, styles propres (pas de
 * Tailwind : v4 côté front, v3 côté back-office, échelles différentes),
 * textes FR/EN intégrés, icônes SVG inline, aucun composant de l'un ou
 * l'autre projet. Tout ce qui dépend de l'hôte arrive par les props
 * (jeton via `getSignature`, nom, rôle, fin prévue, langue).
 *
 * Pourquoi un seul écran (2026-09-23) : l'UI Toolkit Zoom côté professeur et
 * un écran maison côté apprenant parlaient deux langages — réactions
 * invisibles chez le prof, tableaux blancs chacun de son côté, fichiers du
 * chat perdus chez l'apprenant, partage d'écran du prof jamais affiché. Le
 * même code des deux côtés supprime cette classe de bugs.
 *
 * Points de vigilance du SDK (`@zoom/videosdk` 2.5), tous vérifiés dans ses types :
 * - les lecteurs vidéo DOIVENT être dans un `<video-player-container>`, sinon
 *   la vidéo distante reste noire (la sienne s'affiche quand même) ;
 * - `peer-video-state-change`, `active-share-change`, `peer-whiteboard-state-change`
 *   ne signalent que les changements APRÈS notre arrivée : caméras, partage
 *   et tableau déjà actifs sont rendus à la jointure ;
 * - fichiers du chat chiffrés : téléchargement via `downloadFile` seulement ;
 *   destinataire « tout le monde » = 0 (même valeur que l'UI Toolkit) ;
 * - réactions : canal de commande (`{ type: 'reaction' }`), pas de client dédié.
 *
 * Le SDK n'est importé que dans `onMounted` : il touche `window`/WebRTC.
 */
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

type Role = 'host' | 'participant'
type Lang = 'fr' | 'en'

const props = withDefaults(defineProps<{
  sessionName: string
  /** Jeton Zoom Video SDK, obtenu par l'hôte (BFF côté front, Inertia côté back-office). */
  getSignature: () => Promise<string>
  /** Fin prévue, ISO UTC : rappel 5 min avant et, si `autoLeaveAtEnd`, sortie automatique. */
  endDate?: string | null
  locale?: string
  /** Nom affiché aux autres participants. Zoom rejette une valeur vide. */
  userName: string
  /** `host` : le professeur (jeton role_type 1) — ajoute l'enregistrement cloud. */
  role?: Role
  autoLeaveAtEnd?: boolean
}>(), { endDate: null, locale: 'fr', role: 'participant', autoLeaveAtEnd: false })

const emit = defineEmits<{ left: [] }>()

// ── Textes FR/EN (choisis par la langue du site, modifiables en séance) ────
const FR = {
  joining: 'Connexion à la séance…',
  reconnecting: 'Reconnexion en cours…',
  connectError: 'Impossible de rejoindre la séance. Réessayez dans quelques instants.',
  back: 'Retour',
  waiting: 'En attente des autres participants…',
  networkGood: 'Bonne connexion',
  networkMedium: 'Connexion moyenne',
  networkWeak: 'Connexion faible',
  cameraOn: 'Couper la caméra',
  cameraOff: 'Activer la caméra',
  micOn: 'Couper le micro',
  micOff: 'Activer le micro',
  share: 'Partager l\'écran',
  stopShare: 'Arrêter le partage',
  sharingSelf: 'Vous partagez votre écran',
  shareError: 'Le partage d\'écran n\'a pas pu démarrer.',
  whiteboard: 'Tableau blanc',
  whiteboardOf: 'Tableau blanc de {name}',
  whiteboardError: 'Le tableau blanc n\'a pas pu s\'ouvrir.',
  whiteboardUnviewable: 'Un tableau blanc est partagé, visible depuis un ordinateur.',
  reactions: 'Réactions',
  chat: 'Chat',
  chatEmpty: 'Aucun message pour l\'instant',
  chatPlaceholder: 'Message…',
  send: 'Envoyer',
  attach: 'Joindre un fichier',
  download: 'Télécharger',
  fileSending: 'Envoi…',
  fileFailed: 'Échec de l\'envoi',
  participants: 'Participants',
  you: 'vous',
  settings: 'Réglages',
  camera: 'Caméra',
  microphone: 'Micro',
  speaker: 'Haut-parleur',
  language: 'Langue',
  record: 'Enregistrer la séance',
  stopRecord: 'Arrêter l\'enregistrement',
  recording: 'Enregistrement',
  recordUnavailable: 'Enregistrement indisponible : à activer sur le compte Zoom Video SDK.',
  recordError: 'L\'enregistrement n\'a pas pu démarrer.',
  fullscreen: 'Plein écran',
  leave: 'Quitter',
  close: 'Fermer',
  endingSoon: 'La séance se termine dans 5 minutes.',
}
const EN: Record<keyof typeof FR, string> = {
  joining: 'Joining the session…',
  reconnecting: 'Reconnecting…',
  connectError: 'Unable to join the session. Please try again in a moment.',
  back: 'Back',
  waiting: 'Waiting for the other participants…',
  networkGood: 'Good connection',
  networkMedium: 'Average connection',
  networkWeak: 'Weak connection',
  cameraOn: 'Turn camera off',
  cameraOff: 'Turn camera on',
  micOn: 'Mute',
  micOff: 'Unmute',
  share: 'Share screen',
  stopShare: 'Stop sharing',
  sharingSelf: 'You are sharing your screen',
  shareError: 'Screen sharing could not start.',
  whiteboard: 'Whiteboard',
  whiteboardOf: '{name}\'s whiteboard',
  whiteboardError: 'The whiteboard could not be opened.',
  whiteboardUnviewable: 'A whiteboard is being shared, viewable from a computer.',
  reactions: 'Reactions',
  chat: 'Chat',
  chatEmpty: 'No messages yet',
  chatPlaceholder: 'Message…',
  send: 'Send',
  attach: 'Attach a file',
  download: 'Download',
  fileSending: 'Sending…',
  fileFailed: 'Sending failed',
  participants: 'Participants',
  you: 'you',
  settings: 'Settings',
  camera: 'Camera',
  microphone: 'Microphone',
  speaker: 'Speaker',
  language: 'Language',
  record: 'Record the session',
  stopRecord: 'Stop recording',
  recording: 'Recording',
  recordUnavailable: 'Recording unavailable: enable it on the Zoom Video SDK account.',
  recordError: 'Recording could not start.',
  fullscreen: 'Full screen',
  leave: 'Leave',
  close: 'Close',
  endingSoon: 'The session ends in 5 minutes.',
}
type MsgKey = keyof typeof FR

const lang = ref<Lang>(props.locale.startsWith('en') ? 'en' : 'fr')
function t(key: MsgKey, params?: Record<string, string | number>): string {
  let text = (lang.value === 'en' ? EN : FR)[key]
  for (const [name, value] of Object.entries(params ?? {})) text = text.replace(`{${name}}`, String(value))
  return text
}

// ── Icônes (SVG inline, pas de dépendance au projet hôte) ────────────────
const ICONS = {
  video: 'M23 7l-7 5 7 5V7z M3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  videoOff: 'M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10 M1 1l22 22',
  mic: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8',
  micOff: 'M1 1l22 22 M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6 M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23 M12 19v4 M8 23h8',
  monitor: 'M2 3h20v14H2z M8 21h8 M12 17v4',
  pen: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  smile: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  settings: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
  record: 'M12 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12z',
  expand: 'M8 3H5a2 2 0 0 0-2 2v3 M21 8V5a2 2 0 0 0-2-2h-3 M3 16v3a2 2 0 0 0 2 2h3 M16 21h3a2 2 0 0 0 2-2v-3',
  hangup: 'M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91 M23 1L1 23',
  clip: 'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48',
  close: 'M18 6L6 18 M6 6l12 12',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  file: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7',
  clock: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20z M12 6v6l4 2',
}
type IconName = keyof typeof ICONS
function Icon(p: { name: IconName }) {
  return h('svg', { class: 'vcr-icon', viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [h('path', { d: ICONS[p.name] })])
}
Icon.props = ['name']

// ── État général ─────────────────────────────────────────────────────────
const rootEl = ref<HTMLElement | null>(null)
const localContainer = ref<HTMLElement | null>(null)
const remoteContainer = ref<HTMLElement | null>(null)
const shareContainer = ref<HTMLElement | null>(null)
const shareSendVideo = ref<HTMLVideoElement | null>(null)
const shareSendCanvas = ref<HTMLCanvasElement | null>(null)

const isHost = computed(() => props.role === 'host')
const isMobile = typeof navigator !== 'undefined'
  && (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth < 768))

const inSession = ref(false)
const connecting = ref(true)
const reconnecting = ref(false)
const callError = ref<string | null>(null)
const audioMuted = ref(false)
const videoMuted = ref(false)
const myUserId = ref<number | null>(null)

const networkUplink = ref(5)
const networkDownlink = ref(5)
const networkLabel = computed(() => {
  const quality = Math.min(networkUplink.value, networkDownlink.value)
  if (quality >= 4) return t('networkGood')
  if (quality >= 2) return t('networkMedium')
  return t('networkWeak')
})

const sessionSeconds = ref(0)
const sessionDuration = computed(() => {
  const hours = Math.floor(sessionSeconds.value / 3600)
  const minutes = Math.floor((sessionSeconds.value % 3600) / 60)
  const seconds = sessionSeconds.value % 60
  return [hours > 0 ? String(hours).padStart(2, '0') : null, String(minutes).padStart(2, '0'), String(seconds).padStart(2, '0')]
    .filter(Boolean)
    .join(':')
})

type Panel = 'none' | 'chat' | 'participants' | 'settings'
const activePanel = ref<Panel>('none')
function togglePanel(panel: Panel) {
  activePanel.value = activePanel.value === panel ? 'none' : panel
  if (activePanel.value === 'chat') unreadCount.value = 0
  if (activePanel.value === 'settings') refreshDevices()
}

let client: any = null
let chatClient: any = null
let cmdClient: any = null
let wbClient: any = null
let recClient: any = null
let durationTimer: ReturnType<typeof setInterval> | null = null
let autoEndTimer: ReturnType<typeof setTimeout> | null = null
let reminderTimer: ReturnType<typeof setTimeout> | null = null
let leaving = false

function timeLabel(): string {
  return new Intl.DateTimeFormat(lang.value, { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

/** `detach*` renvoie un élément, une liste, ou un objet d'échec sans `remove`. */
function removeElements(result: unknown) {
  ;(Array.isArray(result) ? result : [result]).forEach((el) => {
    if (el && typeof (el as HTMLElement).remove === 'function') (el as HTMLElement).remove()
  })
}

// ── SDK ──────────────────────────────────────────────────────────────────
/**
 * `@zoom/videosdk` ne publie pas d'`exports` map : selon le bundler, l'export
 * par défaut d'un `import()` dynamique est parfois enveloppé une fois de plus.
 */
let zoomModulePromise: Promise<any> | null = null
function loadZoomModule(): Promise<any> {
  zoomModulePromise ??= import('@zoom/videosdk')
  return zoomModulePromise
}
async function resolveZoomVideo(): Promise<any> {
  const mod = await loadZoomModule()
  if (typeof mod.createClient === 'function') return mod
  if (mod.default && typeof mod.default.createClient === 'function') return mod.default
  if (mod.default?.default && typeof mod.default.default.createClient === 'function') return mod.default.default
  throw new Error('Zoom Video SDK : impossible de résoudre createClient')
}
async function videoQuality(): Promise<number> {
  const mod = await loadZoomModule()
  const quality = mod.VideoQuality ?? mod.default?.VideoQuality ?? {}
  return isMobile ? quality.Video_360P : quality.Video_720P
}

// ── Vidéo ────────────────────────────────────────────────────────────────
/** Utilisateurs dont la vidéo est attachée — évite d'empiler deux lecteurs pour la même personne. */
const renderedUsers = new Set<number>()

async function detachUser(userId: number) {
  renderedUsers.delete(userId)
  try {
    removeElements(await client.getMediaStream().detachVideo(userId))
  }
  catch {
    // Déjà détaché (ou participant parti) — rien à retirer.
  }
}

async function renderVideo(event: { action: string; userId: number }) {
  if (!client) return
  if (event.action === 'Stop') {
    await detachUser(event.userId)
    return
  }
  if (renderedUsers.has(event.userId)) return
  renderedUsers.add(event.userId)
  const player = await client.getMediaStream().attachVideo(event.userId, await videoQuality())
  if (!(player instanceof HTMLElement)) {
    renderedUsers.delete(event.userId)
    return
  }
  const container = event.userId === myUserId.value ? localContainer.value : remoteContainer.value
  container?.appendChild(player)
}

/** Vidéos déjà allumées à notre arrivée — aucun évènement ne les signale. */
async function renderExistingVideos() {
  if (!client) return
  for (const user of client.getAllUser()) {
    if (user.userId === myUserId.value || !user.bVideoOn) continue
    await renderVideo({ action: 'Start', userId: user.userId })
  }
}

async function toggleVideo() {
  if (!client) return
  const stream = client.getMediaStream()
  if (stream.isCapturingVideo()) {
    await stream.stopVideo()
    await renderVideo({ action: 'Stop', userId: myUserId.value! })
  }
  else {
    await stream.startVideo()
    await renderVideo({ action: 'Start', userId: myUserId.value! })
  }
  videoMuted.value = !stream.isCapturingVideo()
}

async function toggleAudio() {
  if (!client) return
  const stream = client.getMediaStream()
  if (client.getCurrentUserInfo().muted) await stream.unmuteAudio()
  else await stream.muteAudio()
  audioMuted.value = stream.isAudioMuted()
}

// ── Participants ─────────────────────────────────────────────────────────
const participants = ref<{ userId: number; name: string; isHost: boolean }[]>([])
const remoteCount = computed(() => participants.value.filter((p) => p.userId !== myUserId.value).length)
function refreshParticipants() {
  if (!client) return
  participants.value = client.getAllUser().map((user: any) => ({
    userId: user.userId,
    name: user.displayName ?? '',
    isHost: Boolean(user.isHost),
  }))
}

// ── Partage d'écran ──────────────────────────────────────────────────────
const canShareScreen = !isMobile && typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function'
const sharingSelf = ref(false)
const shareUsesVideo = ref(true)
const shareError = ref(false)
const activeShareUserId = ref<number | null>(null)
const activeShareName = computed(() => participants.value.find((p) => p.userId === activeShareUserId.value)?.name ?? '')

async function attachShare(userId: number) {
  if (!client || userId === myUserId.value) return
  if (activeShareUserId.value !== null && activeShareUserId.value !== userId) await detachShare(activeShareUserId.value)
  activeShareUserId.value = userId
  await nextTick()
  try {
    const player = await client.getMediaStream().attachShareView(userId)
    if (player instanceof HTMLElement) shareContainer.value?.appendChild(player)
  }
  catch (error) {
    console.error('[VisioCallRoom] affichage du partage impossible', error)
  }
}

async function detachShare(userId: number) {
  try {
    removeElements(await client?.getMediaStream().detachShareView(userId))
  }
  catch {
    // Déjà détaché.
  }
  if (activeShareUserId.value === userId) activeShareUserId.value = null
}

async function toggleShare() {
  if (!client) return
  const stream = client.getMediaStream()
  shareError.value = false
  if (sharingSelf.value) {
    try { await stream.stopShareScreen() }
    catch { /* partage déjà arrêté */ }
    sharingSelf.value = false
    return
  }
  if (whiteboardMode.value === 'presenting') await closeWhiteboard()
  shareUsesVideo.value = Boolean(stream.isStartShareScreenWithVideoElement?.())
  await nextTick()
  const target = shareUsesVideo.value ? shareSendVideo.value : shareSendCanvas.value
  try {
    const result = await stream.startShareScreen(target)
    if (result instanceof Error) throw result
    sharingSelf.value = true
  }
  catch (error) {
    // Annulation par l'utilisateur dans la fenêtre du navigateur : pas une vraie erreur.
    if (!/permission|denied|cancel/i.test(String((error as { reason?: string })?.reason ?? error))) shareError.value = true
    console.error('[VisioCallRoom] partage d\'écran impossible', error)
  }
}

// ── Tableau blanc natif Zoom ─────────────────────────────────────────────
/**
 * `presenting` : on a ouvert son propre tableau ; `viewing` : on regarde (et
 * annote selon les droits Zoom) celui d'un autre, ouvert automatiquement.
 * `isWhiteboardEnabled()` est faux si l'option n'est pas activée sur le
 * compte Zoom ou sur navigateur mobile : bouton masqué, bandeau d'info.
 */
const whiteboardContainer = ref<HTMLElement | null>(null)
const whiteboardAvailable = ref(false)
const canStartWhiteboard = ref(false)
const otherPresenterActive = ref(false)
const whiteboardMode = ref<'none' | 'presenting' | 'viewing'>('none')
const whiteboardPresenterName = ref('')
const whiteboardError = ref(false)
const whiteboardUnviewable = ref(false)

function refreshWhiteboardPermissions() {
  if (!wbClient || !client) return
  whiteboardAvailable.value = Boolean(wbClient.isWhiteboardEnabled?.())
  canStartWhiteboard.value = whiteboardAvailable.value && Boolean(wbClient.canStartWhiteboard?.())
  const presenter = wbClient.getWhiteboardPresenter?.()
  otherPresenterActive.value = Boolean(presenter && presenter.userId !== myUserId.value)
}

async function viewWhiteboard(presenterId: number) {
  if (!wbClient || !client || presenterId === myUserId.value) return
  if (!whiteboardAvailable.value) {
    whiteboardUnviewable.value = true
    return
  }
  whiteboardPresenterName.value = client.getUser?.(presenterId)?.displayName ?? ''
  whiteboardMode.value = 'viewing'
  whiteboardError.value = false
  await nextTick()
  try {
    await wbClient.startWhiteboardView(whiteboardContainer.value, presenterId)
  }
  catch (error) {
    console.error('[VisioCallRoom] affichage du tableau blanc impossible', error)
    whiteboardError.value = true
  }
}

async function onPeerWhiteboardChange(payload: { action: string; userId: number }) {
  if (payload.action === 'Start') {
    await viewWhiteboard(payload.userId)
  }
  else if (payload.action === 'Stop') {
    whiteboardUnviewable.value = false
    if (whiteboardMode.value === 'viewing') {
      try { await wbClient?.stopWhiteboardView() }
      catch { /* déjà fermé par le départ du présentateur */ }
      whiteboardMode.value = 'none'
    }
  }
  refreshWhiteboardPermissions()
}

/** Bouton : rejoint le tableau en cours d'un autre participant, sinon ouvre le sien. */
async function openWhiteboard() {
  if (!wbClient || !client || whiteboardMode.value !== 'none') return
  const presenter = wbClient.getWhiteboardPresenter?.()
  if (presenter && presenter.userId !== myUserId.value) {
    await viewWhiteboard(presenter.userId)
    return
  }
  if (!canStartWhiteboard.value) return
  if (sharingSelf.value) await toggleShare()
  whiteboardPresenterName.value = ''
  whiteboardMode.value = 'presenting'
  whiteboardError.value = false
  await nextTick()
  try {
    await wbClient.startWhiteboardScreen(whiteboardContainer.value)
  }
  catch (error) {
    console.error('[VisioCallRoom] ouverture du tableau blanc impossible', error)
    whiteboardError.value = true
  }
}

async function closeWhiteboard() {
  const mode = whiteboardMode.value
  whiteboardMode.value = 'none'
  whiteboardError.value = false
  try {
    if (mode === 'presenting') await wbClient?.stopWhiteboardScreen()
    else if (mode === 'viewing') await wbClient?.stopWhiteboardView()
  }
  catch {
    // Session déjà close côté Zoom.
  }
  refreshWhiteboardPermissions()
}

// ── Chat (texte, emoji, fichiers) ────────────────────────────────────────
interface ChatFile { name: string; size: number; type: string; url?: string; preview?: string; status: 'ready' | 'sending' | 'failed' | 'loading' }
interface ChatEntry { key: number; id?: string; sender: string; self: boolean; time: string; text?: string; file?: ChatFile }

const unreadCount = ref(0)
const chatInput = ref('')
const chatMessages = ref<ChatEntry[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const fileTransferEnabled = ref(false)
const objectUrls: string[] = []
let chatSeq = 0

function isImage(file: { name: string; type?: string }): boolean {
  return (file.type ?? '').startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function trackUrl(url: string): string {
  objectUrls.push(url)
  return url
}

function scrollChatToEnd() {
  void nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

function pushEntry(entry: Omit<ChatEntry, 'key'>): ChatEntry {
  chatMessages.value.push({ ...entry, key: chatSeq++ })
  if (!entry.self && activePanel.value !== 'chat') unreadCount.value++
  scrollChatToEnd()
  return chatMessages.value[chatMessages.value.length - 1]!
}

/** Message reçu (ou de l'historique) : texte, ou fichier dont on précharge l'aperçu si c'est une image. */
function addIncoming(payload: any, self: boolean) {
  const sender = payload.sender?.name ?? ''
  if (payload.file) {
    const file = payload.file
    const entry = pushEntry({
      id: payload.id,
      sender,
      self,
      time: timeLabel(),
      file: { name: file.name, size: file.size ?? 0, type: file.type ?? '', url: file.fileUrl, status: isImage(file) ? 'loading' : 'ready' },
    })
    if (isImage(file) && payload.id && file.fileUrl) {
      Promise.resolve(chatClient?.downloadFile(payload.id, file.fileUrl, true)).catch(() => {
        if (entry.file) entry.file.status = 'ready'
      })
    }
  }
  else if (payload.message) {
    pushEntry({ id: payload.id, sender, self, time: timeLabel(), text: payload.message })
  }
}

function onFileDownloadProgress(payload: { id: string; fileBlob?: Blob; status: number }) {
  const entry = chatMessages.value.find((m) => m.id === payload.id && m.file)
  if (!entry?.file) return
  if (payload.status === 2 && payload.fileBlob) {
    entry.file.preview = trackUrl(URL.createObjectURL(payload.fileBlob))
    entry.file.status = 'ready'
  }
  else if (payload.status === 3) {
    entry.file.status = 'ready'
  }
}

function onFileUploadProgress(payload: { fileName: string; status: number }) {
  const entry = [...chatMessages.value].reverse().find((m) => m.self && m.file?.name === payload.fileName && m.file.status === 'sending')
  if (!entry?.file) return
  if (payload.status === 2 || payload.status === 5) entry.file.status = 'ready'
  else if (payload.status === 3 || payload.status === 4) entry.file.status = 'failed'
}

async function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text || !chatClient) return
  try {
    await chatClient.sendToAll(text)
    pushEntry({ sender: props.userName, self: true, time: timeLabel(), text })
    chatInput.value = ''
  }
  catch (error) {
    console.error('[VisioCallRoom] échec d\'envoi du message', error)
  }
}

async function onPickFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !chatClient) return
  const entry = pushEntry({
    sender: props.userName,
    self: true,
    time: timeLabel(),
    file: { name: file.name, size: file.size, type: file.type, preview: isImage(file) ? trackUrl(URL.createObjectURL(file)) : undefined, status: 'sending' },
  })
  try {
    const result = await chatClient.sendFile(file, 0)
    if (result instanceof Error) throw result
  }
  catch (error) {
    console.error('[VisioCallRoom] échec d\'envoi du fichier', error)
    if (entry.file) entry.file.status = 'failed'
  }
}

/** Fichier reçu non-image : le SDK le déchiffre et déclenche le téléchargement du navigateur. */
function downloadEntry(entry: ChatEntry) {
  if (!entry.file) return
  if (entry.file.preview) {
    const link = document.createElement('a')
    link.href = entry.file.preview
    link.download = entry.file.name
    link.click()
    return
  }
  if (entry.id && entry.file.url) void Promise.resolve(chatClient?.downloadFile(entry.id, entry.file.url)).catch(() => {})
}

// ── Réactions (canal de commande) ────────────────────────────────────────
const REACTION_EMOJIS = ['👍', '❤️', '😂', '👏', '🎉']
const showReactionPicker = ref(false)
const floatingReactions = ref<{ id: number; emoji: string; left: number }[]>([])
let reactionSeq = 0

function spawnReaction(emoji: string) {
  const id = reactionSeq++
  floatingReactions.value.push({ id, emoji, left: 10 + Math.random() * 70 })
  setTimeout(() => {
    floatingReactions.value = floatingReactions.value.filter((r) => r.id !== id)
  }, 2200)
}

function sendReaction(emoji: string) {
  spawnReaction(emoji)
  Promise.resolve(cmdClient?.send(JSON.stringify({ type: 'reaction', emoji }))).catch(() => {
    // Canal de commande indisponible — la réaction reste locale.
  })
  showReactionPicker.value = false
}

// ── Réglages (périphériques) ─────────────────────────────────────────────
const cameras = ref<{ deviceId: string; label: string }[]>([])
const mics = ref<{ deviceId: string; label: string }[]>([])
const speakers = ref<{ deviceId: string; label: string }[]>([])
const activeCamera = ref('')
const activeMic = ref('')
const activeSpeaker = ref('')

function refreshDevices() {
  if (!client) return
  const stream = client.getMediaStream()
  cameras.value = stream.getCameraList?.() ?? []
  mics.value = stream.getMicList?.() ?? []
  speakers.value = stream.getSpeakerList?.() ?? []
  activeCamera.value = stream.getActiveCamera?.() ?? ''
  activeMic.value = stream.getActiveMicrophone?.() ?? ''
  activeSpeaker.value = stream.getActiveSpeaker?.() ?? ''
}

async function selectDevice(kind: 'camera' | 'mic' | 'speaker', deviceId: string) {
  if (!client || !deviceId) return
  const stream = client.getMediaStream()
  try {
    if (kind === 'camera') await stream.switchCamera(deviceId)
    else if (kind === 'mic') await stream.switchMicrophone(deviceId)
    else await stream.switchSpeaker(deviceId)
  }
  catch (error) {
    console.error('[VisioCallRoom] changement de périphérique impossible', error)
  }
  refreshDevices()
}

// ── Enregistrement cloud (professeur) ────────────────────────────────────
const recordingStatus = ref('Stopped')
const canRecord = ref(false)
const recordError = ref(false)
const isRecording = computed(() => recordingStatus.value === 'Recording')

async function toggleRecording() {
  if (!recClient || !isHost.value) return
  recordError.value = false
  try {
    const result = isRecording.value ? await recClient.stopCloudRecording() : await recClient.startCloudRecording()
    if (result instanceof Error) throw result
  }
  catch (error) {
    console.error('[VisioCallRoom] enregistrement impossible', error)
    recordError.value = true
  }
}

// ── Écran allumé (mobile) ────────────────────────────────────────────────
/**
 * Sans Wake Lock, un téléphone posé passe en veille au bout de quelques
 * minutes sans toucher l'écran — la séance continue mais l'image s'éteint.
 * Le verrou est relâché par le navigateur quand l'onglet passe en arrière-plan :
 * on le redemande à chaque retour au premier plan (`onVisibilityChange`).
 */
let wakeLock: { release: () => Promise<void> } | null = null
async function requestWakeLock() {
  try {
    const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } }
    wakeLock = (await nav.wakeLock?.request('screen')) ?? null
  }
  catch {
    // Non pris en charge ou refusé (batterie faible…) — pas bloquant.
  }
}
function releaseWakeLock() {
  void wakeLock?.release().catch(() => {})
  wakeLock = null
}

// ── Rappel de fin et sortie automatique ──────────────────────────────────
const endingSoonVisible = ref(false)
function scheduleEndTimers() {
  const end = props.endDate ? new Date(props.endDate).getTime() : Number.NaN
  if (Number.isNaN(end)) return
  const msUntilEnd = end - Date.now()
  if (msUntilEnd <= 0) return
  const msUntilReminder = msUntilEnd - 5 * 60 * 1000
  const showReminder = () => {
    endingSoonVisible.value = true
    setTimeout(() => { endingSoonVisible.value = false }, 20000)
  }
  if (msUntilReminder <= 0) showReminder()
  else reminderTimer = setTimeout(showReminder, msUntilReminder)
  if (props.autoLeaveAtEnd) autoEndTimer = setTimeout(() => { void leave() }, msUntilEnd)
}

// ── Cycle de vie de la séance ────────────────────────────────────────────
/** Onglet revenu au premier plan : le navigateur a pu suspendre le rendu et relâcher le Wake Lock. */
async function onVisibilityChange() {
  if (document.visibilityState !== 'visible' || !inSession.value || !client) return
  void requestWakeLock()
  await new Promise((resolve) => setTimeout(resolve, 600))
  for (const user of client.getAllUser()) {
    if (!user.bVideoOn) continue
    await detachUser(user.userId)
    await renderVideo({ action: 'Start', userId: user.userId })
  }
}

async function start() {
  connecting.value = true
  callError.value = null

  try {
    const signature = await props.getSignature()
    const ZoomVideo = await resolveZoomVideo()

    client = ZoomVideo.createClient()
    await client.init(lang.value === 'fr' ? 'fr-FR' : 'en-US', 'Global', { patchJsMedia: true })

    client.on('peer-video-state-change', (event: { action: string; userId: number }) => { void renderVideo(event) })
    client.on('user-added', () => refreshParticipants())
    client.on('user-updated', () => refreshParticipants())
    client.on('user-removed', (users: { userId: number }[]) => {
      for (const user of users ?? []) {
        void detachUser(user.userId)
        if (activeShareUserId.value === user.userId) void detachShare(user.userId)
      }
      refreshParticipants()
    })
    client.on('connection-change', (payload: { state: string }) => {
      if (payload.state === 'Reconnecting') {
        reconnecting.value = true
      }
      else if (payload.state === 'Connected') {
        reconnecting.value = false
        if (inSession.value) void renderExistingVideos()
      }
      else if (payload.state === 'Closed' && !leaving) {
        inSession.value = false
        emit('left')
      }
    })
    client.on('network-quality-change', (data: { uplink?: number; downlink?: number }) => {
      networkUplink.value = data.uplink ?? 5
      networkDownlink.value = data.downlink ?? 5
    })
    client.on('active-share-change', (payload: { state: string; userId: number }) => {
      if (payload.userId === myUserId.value) return
      if (payload.state === 'Active') void attachShare(payload.userId)
      else void detachShare(payload.userId)
    })
    client.on('passively-stop-share', () => { sharingSelf.value = false })
    client.on('device-change', () => refreshDevices())
    client.on('recording-change', (status: string) => { recordingStatus.value = status })
    client.on('chat-on-message', (payload: any) => {
      if (payload.sender?.userId === myUserId.value) return
      addIncoming(payload, false)
    })
    client.on('chat-file-download-progress', onFileDownloadProgress)
    client.on('chat-file-upload-progress', onFileUploadProgress)
    client.on('command-channel-message', (payload: { text: string }) => {
      try {
        const data = JSON.parse(payload.text)
        if (data.type === 'reaction') spawnReaction(data.emoji)
      }
      catch {
        // Message d'un autre format — ignoré.
      }
    })
    client.on('peer-whiteboard-state-change', (payload: { action: string; userId: number }) => { void onPeerWhiteboardChange(payload) })
    client.on('whiteboard-status-change', () => refreshWhiteboardPermissions())

    await client.join(props.sessionName, signature, props.userName || 'Qiryna')
    myUserId.value = client.getCurrentUserInfo().userId
    const stream = client.getMediaStream()

    try {
      await stream.enableAudioProcessor?.('denoise')
    }
    catch {
      // Réduction de bruit indisponible — pas bloquant.
    }
    // Micro ou caméra absents/refusés : on rejoint quand même (voir et entendre
    // l'autre reste possible) au lieu de faire échouer toute la séance.
    try {
      await stream.startAudio()
    }
    catch (error) {
      console.error('[VisioCallRoom] micro indisponible', error)
    }
    try {
      await stream.startVideo({ hd: !isMobile && stream.isSupportHDVideo() })
      await renderVideo({ action: 'Start', userId: myUserId.value! })
    }
    catch (error) {
      console.error('[VisioCallRoom] caméra indisponible', error)
    }
    await renderExistingVideos()
    refreshParticipants()
    inSession.value = true
    audioMuted.value = stream.isAudioMuted()
    videoMuted.value = !stream.isCapturingVideo()
    void requestWakeLock()

    // Partage déjà en cours à notre arrivée.
    const activeShareId = stream.getActiveShareUserId?.()
    if (activeShareId && activeShareId !== myUserId.value) void attachShare(activeShareId)

    try {
      cmdClient = client.getCommandClient()
    }
    catch (error) {
      console.error('[VisioCallRoom] canal de commande indisponible', error)
    }

    try {
      chatClient = client.getChatClient()
      fileTransferEnabled.value = Boolean(chatClient.isFileTransferEnabled?.())
      // Messages envoyés avant notre arrivée (ou avant un rechargement de page).
      for (const message of chatClient.getHistory?.() ?? []) addIncoming(message, message.sender?.userId === myUserId.value)
      unreadCount.value = 0
    }
    catch (error) {
      console.error('[VisioCallRoom] client de chat indisponible', error)
    }

    try {
      wbClient = client.getWhiteboardClient()
      refreshWhiteboardPermissions()
      const presenter = wbClient.getWhiteboardPresenter?.()
      if (presenter) await viewWhiteboard(presenter.userId)
    }
    catch (error) {
      console.error('[VisioCallRoom] tableau blanc indisponible', error)
    }

    if (isHost.value) {
      try {
        recClient = client.getRecordingClient()
        canRecord.value = Boolean(recClient.canStartRecording?.())
        recordingStatus.value = recClient.getCloudRecordingStatus?.() ?? 'Stopped'
      }
      catch (error) {
        console.error('[VisioCallRoom] enregistrement indisponible', error)
      }
    }

    durationTimer = setInterval(() => { sessionSeconds.value++ }, 1000)
    scheduleEndTimers()
  }
  catch (error) {
    console.error('[VisioCallRoom] échec de connexion Zoom', error)
    callError.value = t('connectError')
    // `join()` a pu réussir avant l'échec d'une étape suivante : sans ce
    // nettoyage, on reste « connecté » côté Zoom sans moyen d'en sortir.
    if (client) {
      try { await client.leave() }
      catch { /* session déjà close */ }
    }
  }
  finally {
    connecting.value = false
  }
}

function clearTimers() {
  if (autoEndTimer) { clearTimeout(autoEndTimer); autoEndTimer = null }
  if (reminderTimer) { clearTimeout(reminderTimer); reminderTimer = null }
  if (durationTimer) { clearInterval(durationTimer); durationTimer = null }
}

async function leave() {
  if (leaving) return
  leaving = true
  clearTimers()
  releaseWakeLock()
  if (whiteboardMode.value !== 'none') await closeWhiteboard()
  if (client) {
    try {
      const stream = client.getMediaStream()
      if (sharingSelf.value) await stream.stopShareScreen()
      if (activeShareUserId.value !== null) await detachShare(activeShareUserId.value)
      for (const user of client.getAllUser()) await detachUser(user.userId)
      await client.leave()
    }
    catch {
      // Session peut-être déjà close côté serveur.
    }
  }
  inSession.value = false
  emit('left')
}

function toggleFullscreen() {
  if (!document.fullscreenElement) void rootEl.value?.requestFullscreen?.()
  else void document.exitFullscreen?.()
}

onMounted(() => {
  void start()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  clearTimers()
  releaseWakeLock()
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
  // Sortie de page sans passer par « Quitter » (retour navigateur…) : quitter
  // la session, sinon on y reste affiché jusqu'au délai d'expiration Zoom.
  if (inSession.value && !leaving && client) void Promise.resolve(client.leave()).catch(() => {})
})
</script>

<template>
  <div ref="rootEl" class="vcr">
    <!-- Surfaces d'envoi du partage d'écran : requises par le SDK, invisibles. -->
    <video ref="shareSendVideo" class="vcr-share-send" playsinline muted />
    <canvas ref="shareSendCanvas" class="vcr-share-send" />

    <!--
      Le SDK pose `position: relative` EN LIGNE sur chaque `<video-player-container>` :
      le placement se fait donc sur une `<div>` parente, le conteneur se contente de la remplir.
    -->
    <div class="vcr-stage" :class="{ 'vcr-stage--share': activeShareUserId !== null }">
      <div v-show="activeShareUserId !== null" class="vcr-share">
        <video-player-container ref="shareContainer" class="vcr-vpc" />
      </div>
      <div class="vcr-remote" @dblclick="toggleFullscreen">
        <video-player-container ref="remoteContainer" class="vcr-vpc" />
      </div>
      <div class="vcr-local">
        <video-player-container ref="localContainer" class="vcr-vpc" />
      </div>
    </div>

    <p v-if="inSession && remoteCount === 0" class="vcr-waiting">{{ t('waiting') }}</p>

    <!-- Barre du haut -->
    <div v-if="inSession" class="vcr-topbar">
      <span class="vcr-pill">{{ networkLabel }}</span>
      <span v-if="isRecording" class="vcr-pill vcr-pill--rec"><span class="vcr-rec-dot" />{{ t('recording') }}</span>
      <span class="vcr-spacer" />
      <span class="vcr-pill vcr-pill--mono">{{ sessionDuration }}</span>
      <button type="button" class="vcr-pill vcr-pill--btn" :aria-label="t('language')" @click="lang = lang === 'fr' ? 'en' : 'fr'">
        {{ lang === 'fr' ? 'EN' : 'FR' }}
      </button>
    </div>

    <!-- Bandeaux -->
    <div v-if="inSession" class="vcr-banners">
      <div v-if="endingSoonVisible" class="vcr-banner vcr-banner--warn" role="status">
        <Icon name="clock" />
        <span>{{ t('endingSoon') }}</span>
        <button type="button" class="vcr-banner-close" :aria-label="t('close')" @click="endingSoonVisible = false">
          <Icon name="close" />
        </button>
      </div>
      <div v-if="sharingSelf" class="vcr-banner">{{ t('sharingSelf') }}</div>
      <div v-if="activeShareUserId !== null && activeShareName" class="vcr-banner">{{ activeShareName }}</div>
      <div v-if="shareError" class="vcr-banner vcr-banner--error">{{ t('shareError') }}</div>
      <div v-if="recordError" class="vcr-banner vcr-banner--error">{{ t('recordError') }}</div>
      <div v-if="whiteboardUnviewable && whiteboardMode === 'none'" class="vcr-banner">{{ t('whiteboardUnviewable') }}</div>
    </div>

    <!-- Réactions flottantes -->
    <div class="vcr-reactions">
      <TransitionGroup name="vcr-float">
        <span v-for="reaction in floatingReactions" :key="reaction.id" class="vcr-reaction" :style="{ left: `${reaction.left}%` }">{{ reaction.emoji }}</span>
      </TransitionGroup>
    </div>

    <!-- États -->
    <div v-if="connecting" class="vcr-overlay">
      <span class="vcr-spinner" />
      <p>{{ t('joining') }}</p>
    </div>
    <div v-if="reconnecting" class="vcr-overlay vcr-overlay--soft">
      <span class="vcr-spinner" />
      <p class="vcr-warn-text">{{ t('reconnecting') }}</p>
    </div>
    <div v-if="callError" class="vcr-overlay">
      <p>{{ callError }}</p>
      <button type="button" class="vcr-light-btn" @click="leave">{{ t('back') }}</button>
    </div>

    <!-- Tableau blanc natif : le SDK dessine tout (outils compris) dans le conteneur. -->
    <div v-show="whiteboardMode !== 'none'" class="vcr-whiteboard">
      <div class="vcr-whiteboard-bar">
        <span>{{ whiteboardPresenterName ? t('whiteboardOf', { name: whiteboardPresenterName }) : t('whiteboard') }}</span>
        <span v-if="whiteboardError" class="vcr-error-text">{{ t('whiteboardError') }}</span>
        <button type="button" class="vcr-dark-btn" @click="closeWhiteboard">{{ t('close') }}</button>
      </div>
      <div ref="whiteboardContainer" class="vcr-whiteboard-surface" />
    </div>

    <!-- Panneau latéral -->
    <aside v-if="inSession && activePanel !== 'none'" class="vcr-panel">
      <div class="vcr-panel-head">
        <span>{{ activePanel === 'chat' ? t('chat') : activePanel === 'participants' ? `${t('participants')} (${participants.length})` : t('settings') }}</span>
        <button type="button" class="vcr-icon-btn" :aria-label="t('close')" @click="activePanel = 'none'">
          <Icon name="close" />
        </button>
      </div>

      <template v-if="activePanel === 'chat'">
        <div ref="chatContainer" class="vcr-chat-list">
          <p v-if="chatMessages.length === 0" class="vcr-muted vcr-center">{{ t('chatEmpty') }}</p>
          <div v-for="msg in chatMessages" :key="msg.key" class="vcr-msg" :class="{ 'vcr-msg--self': msg.self }">
            <span class="vcr-msg-meta">{{ msg.self ? t('you') : msg.sender }} · {{ msg.time }}</span>
            <div v-if="msg.text" class="vcr-bubble">{{ msg.text }}</div>
            <div v-else-if="msg.file" class="vcr-bubble vcr-bubble--file">
              <a v-if="msg.file.preview" :href="msg.file.preview" target="_blank" rel="noopener" class="vcr-file-preview">
                <img :src="msg.file.preview" :alt="msg.file.name">
              </a>
              <div class="vcr-file-row">
                <Icon name="file" />
                <span class="vcr-file-name">{{ msg.file.name }}</span>
                <span class="vcr-muted">{{ formatSize(msg.file.size) }}</span>
                <button
                  v-if="msg.file.status === 'ready' && (!msg.self || msg.file.preview)"
                  type="button"
                  class="vcr-icon-btn"
                  :aria-label="t('download')"
                  @click="downloadEntry(msg)"
                >
                  <Icon name="download" />
                </button>
              </div>
              <span v-if="msg.file.status === 'sending' || msg.file.status === 'loading'" class="vcr-muted">{{ t('fileSending') }}</span>
              <span v-else-if="msg.file.status === 'failed'" class="vcr-error-text">{{ t('fileFailed') }}</span>
            </div>
          </div>
        </div>
        <div class="vcr-chat-input">
          <template v-if="fileTransferEnabled">
            <input ref="fileInput" type="file" class="vcr-hidden" @change="onPickFile">
            <button type="button" class="vcr-icon-btn" :aria-label="t('attach')" @click="fileInput?.click()">
              <Icon name="clip" />
            </button>
          </template>
          <input
            v-model="chatInput"
            type="text"
            class="vcr-text-input"
            :placeholder="t('chatPlaceholder')"
            @keydown.enter.prevent="sendChatMessage"
          >
          <button type="button" class="vcr-send-btn" :aria-label="t('send')" @click="sendChatMessage">
            <Icon name="send" />
          </button>
        </div>
      </template>

      <ul v-else-if="activePanel === 'participants'" class="vcr-people">
        <li v-for="person in participants" :key="person.userId">
          <span class="vcr-avatar">{{ (person.name || '?').charAt(0).toUpperCase() }}</span>
          <span>{{ person.name }}<template v-if="person.userId === myUserId"> ({{ t('you') }})</template></span>
        </li>
      </ul>

      <div v-else class="vcr-settings">
        <label v-if="cameras.length > 0">
          <span>{{ t('camera') }}</span>
          <select :value="activeCamera" @change="selectDevice('camera', ($event.target as HTMLSelectElement).value)">
            <option v-for="device in cameras" :key="device.deviceId" :value="device.deviceId">{{ device.label }}</option>
          </select>
        </label>
        <label v-if="mics.length > 0">
          <span>{{ t('microphone') }}</span>
          <select :value="activeMic" @change="selectDevice('mic', ($event.target as HTMLSelectElement).value)">
            <option v-for="device in mics" :key="device.deviceId" :value="device.deviceId">{{ device.label }}</option>
          </select>
        </label>
        <label v-if="speakers.length > 0">
          <span>{{ t('speaker') }}</span>
          <select :value="activeSpeaker" @change="selectDevice('speaker', ($event.target as HTMLSelectElement).value)">
            <option v-for="device in speakers" :key="device.deviceId" :value="device.deviceId">{{ device.label }}</option>
          </select>
        </label>
        <label>
          <span>{{ t('language') }}</span>
          <select v-model="lang">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
    </aside>

    <!-- Sélecteur de réactions -->
    <div v-if="showReactionPicker" class="vcr-picker">
      <button v-for="emoji in REACTION_EMOJIS" :key="emoji" type="button" @click="sendReaction(emoji)">{{ emoji }}</button>
    </div>

    <!-- Commandes -->
    <div v-if="inSession" class="vcr-controls">
      <button type="button" class="vcr-ctrl" :class="{ 'vcr-ctrl--off': videoMuted }" :aria-label="videoMuted ? t('cameraOff') : t('cameraOn')" :title="videoMuted ? t('cameraOff') : t('cameraOn')" @click="toggleVideo">
        <Icon :name="videoMuted ? 'videoOff' : 'video'" />
      </button>
      <button type="button" class="vcr-ctrl" :class="{ 'vcr-ctrl--off': audioMuted }" :aria-label="audioMuted ? t('micOff') : t('micOn')" :title="audioMuted ? t('micOff') : t('micOn')" @click="toggleAudio">
        <Icon :name="audioMuted ? 'micOff' : 'mic'" />
      </button>
      <button v-if="canShareScreen" type="button" class="vcr-ctrl" :class="{ 'vcr-ctrl--active': sharingSelf }" :aria-label="sharingSelf ? t('stopShare') : t('share')" :title="sharingSelf ? t('stopShare') : t('share')" @click="toggleShare">
        <Icon name="monitor" />
      </button>
      <button v-if="whiteboardAvailable" type="button" class="vcr-ctrl" :disabled="!canStartWhiteboard && !otherPresenterActive" :aria-label="t('whiteboard')" :title="t('whiteboard')" @click="openWhiteboard">
        <Icon name="pen" />
      </button>
      <button type="button" class="vcr-ctrl" :aria-label="t('reactions')" :title="t('reactions')" @click="showReactionPicker = !showReactionPicker">
        <Icon name="smile" />
      </button>
      <button type="button" class="vcr-ctrl" :class="{ 'vcr-ctrl--active': activePanel === 'chat' }" :aria-label="t('chat')" :title="t('chat')" @click="togglePanel('chat')">
        <Icon name="chat" />
        <span v-if="unreadCount > 0 && activePanel !== 'chat'" class="vcr-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </button>
      <button type="button" class="vcr-ctrl" :class="{ 'vcr-ctrl--active': activePanel === 'participants' }" :aria-label="t('participants')" :title="t('participants')" @click="togglePanel('participants')">
        <Icon name="users" />
        <span class="vcr-badge vcr-badge--count">{{ participants.length }}</span>
      </button>
      <button type="button" class="vcr-ctrl" :class="{ 'vcr-ctrl--active': activePanel === 'settings' }" :aria-label="t('settings')" :title="t('settings')" @click="togglePanel('settings')">
        <Icon name="settings" />
      </button>
      <button
        v-if="isHost"
        type="button"
        class="vcr-ctrl"
        :class="{ 'vcr-ctrl--rec': isRecording }"
        :disabled="!canRecord"
        :aria-label="isRecording ? t('stopRecord') : t('record')"
        :title="!canRecord ? t('recordUnavailable') : isRecording ? t('stopRecord') : t('record')"
        @click="toggleRecording"
      >
        <Icon name="record" />
      </button>
      <button v-if="!isMobile" type="button" class="vcr-ctrl" :aria-label="t('fullscreen')" :title="t('fullscreen')" @click="toggleFullscreen">
        <Icon name="expand" />
      </button>
      <button type="button" class="vcr-ctrl vcr-ctrl--leave" :aria-label="t('leave')" :title="t('leave')" @click="leave">
        <Icon name="hangup" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.vcr {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background: #000;
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
}
.vcr *, .vcr *::before, .vcr *::after { box-sizing: border-box; }
.vcr button { font: inherit; color: inherit; cursor: pointer; }
.vcr button:disabled { cursor: not-allowed; opacity: 0.45; }
.vcr p { margin: 0; }

.vcr-icon { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.vcr-hidden { display: none; }
.vcr-share-send { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

/* Scène vidéo */
.vcr-stage { position: absolute; inset: 0; }
.vcr-remote, .vcr-share { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
/* Mobile d'abord : la barre de commandes y tient sur deux lignes (~120 px). */
.vcr-local {
  position: absolute; right: 8px; bottom: 140px; z-index: 30;
  width: 112px; height: 80px; overflow: hidden;
  border: 2px solid #fff; border-radius: 10px; box-shadow: 0 6px 20px rgb(0 0 0 / 0.4); background: #111;
}
/* Partage actif : il prend la scène, la vidéo distante passe en vignette. */
.vcr-stage--share .vcr-remote {
  inset: auto; right: 8px; bottom: 228px; z-index: 30;
  width: 112px; height: 80px; overflow: hidden;
  border: 2px solid #fff; border-radius: 10px; background: #111;
}
@media (min-width: 768px) {
  .vcr-local { width: 192px; height: 128px; bottom: 96px; right: 16px; }
  .vcr-stage--share .vcr-remote { width: 192px; height: 128px; bottom: 236px; right: 16px; }
}
.vcr-vpc { width: 100%; height: 100%; }
/* Les `<video-player>` sont insérés par le SDK, hors gabarit : `:deep` pour les atteindre. */
.vcr-vpc :deep(video-player) { display: block; width: 100%; height: 100%; }

.vcr-waiting { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; color: rgb(255 255 255 / 0.7); pointer-events: none; }

/* Barre du haut et bandeaux */
.vcr-topbar { position: absolute; top: 12px; left: 16px; right: 16px; z-index: 40; display: flex; align-items: center; gap: 8px; pointer-events: none; }
.vcr-spacer { flex: 1; }
.vcr-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: rgb(0 0 0 / 0.55); font-size: 12px; font-weight: 500; }
.vcr-pill--mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
.vcr-pill--btn { border: 1px solid rgb(255 255 255 / 0.3); pointer-events: auto; }
.vcr-pill--rec { background: rgb(220 38 38 / 0.85); }
.vcr-rec-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: vcr-blink 1.2s infinite; }
@keyframes vcr-blink { 50% { opacity: 0.3; } }

.vcr-banners { position: absolute; top: 52px; left: 50%; z-index: 45; display: flex; flex-direction: column; align-items: center; gap: 8px; width: min(92%, 520px); transform: translateX(-50%); }
.vcr-banner { display: flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 12px; background: rgb(0 0 0 / 0.7); font-size: 13px; text-align: center; }
.vcr-banner--warn { background: #f59e0b; color: #1f1300; font-weight: 600; box-shadow: 0 8px 24px rgb(0 0 0 / 0.35); }
.vcr-banner--error { background: rgb(185 28 28 / 0.9); }
.vcr-banner-close { display: inline-flex; padding: 2px; border: 0; background: transparent; }

/* Réactions */
.vcr-reactions { position: absolute; left: 0; right: 0; bottom: 140px; z-index: 40; height: 192px; pointer-events: none; }
.vcr-reaction { position: absolute; bottom: 0; font-size: 30px; }
.vcr-float-enter-active { transition: transform 2s ease-out, opacity 2s ease-out; }
.vcr-float-enter-from { transform: translateY(0); opacity: 1; }
.vcr-float-enter-to { transform: translateY(-180px); opacity: 0; }

/* États */
.vcr-overlay { position: absolute; inset: 0; z-index: 70; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 24px; text-align: center; background: #000; }
.vcr-overlay--soft { background: rgb(0 0 0 / 0.8); }
.vcr-warn-text { color: #facc15; font-weight: 500; }
.vcr-error-text { color: #f87171; font-size: 12px; }
.vcr-muted { color: #9ca3af; font-size: 12px; }
.vcr-center { margin-top: 24px; text-align: center; }
.vcr-spinner { width: 32px; height: 32px; border: 3px solid rgb(255 255 255 / 0.25); border-top-color: #fff; border-radius: 50%; animation: vcr-spin 0.8s linear infinite; }
@keyframes vcr-spin { to { transform: rotate(360deg); } }
.vcr-light-btn { padding: 10px 20px; border: 0; border-radius: 12px; background: #fff; color: #000 !important; font-weight: 600; }
.vcr-dark-btn { margin-left: auto; padding: 6px 16px; border: 0; border-radius: 8px; background: #374151; color: #fff; }

/* Tableau blanc */
.vcr-whiteboard { position: absolute; inset: 0; z-index: 60; display: flex; flex-direction: column; background: #fff; color: #1f2937; }
.vcr-whiteboard-bar { display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6; font-weight: 500; }
.vcr-whiteboard-surface { position: relative; flex: 1; min-height: 0; width: 100%; }

/* Panneau latéral */
.vcr-panel { position: absolute; top: 0; right: 0; bottom: 0; z-index: 65; display: flex; flex-direction: column; width: min(340px, 100%); border-left: 1px solid #374151; background: #111827; }
.vcr-panel-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #374151; font-weight: 600; }
.vcr-icon-btn { display: inline-flex; align-items: center; justify-content: center; padding: 6px; border: 0; border-radius: 8px; background: transparent; }
.vcr-icon-btn:hover { background: rgb(255 255 255 / 0.08); }
.vcr-chat-list { display: flex; flex: 1; flex-direction: column; gap: 10px; min-height: 0; overflow-y: auto; padding: 12px; }
.vcr-msg { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.vcr-msg--self { align-items: flex-end; }
.vcr-msg-meta { color: #9ca3af; font-size: 11px; }
.vcr-bubble { max-width: 90%; padding: 8px 12px; border-radius: 16px; background: #374151; overflow-wrap: anywhere; }
.vcr-msg--self .vcr-bubble { background: #3b82f6; }
.vcr-bubble--file { display: flex; flex-direction: column; gap: 6px; }
.vcr-file-preview img { display: block; max-width: 100%; max-height: 180px; border-radius: 8px; }
.vcr-file-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
.vcr-file-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vcr-chat-input { display: flex; align-items: center; gap: 8px; padding: 12px; border-top: 1px solid #374151; }
.vcr-text-input { flex: 1; min-width: 0; padding: 8px 12px; border: 0; border-radius: 999px; outline: none; background: #1f2937; color: #fff; font: inherit; }
.vcr-text-input::placeholder { color: #6b7280; }
.vcr-send-btn { display: inline-flex; padding: 8px; border: 0; border-radius: 999px; background: #3b82f6; }
.vcr-people { margin: 0; padding: 8px 16px; list-style: none; overflow-y: auto; }
.vcr-people li { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.vcr-avatar { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #4f46e5; font-weight: 600; }
.vcr-settings { display: flex; flex-direction: column; gap: 16px; padding: 16px; overflow-y: auto; }
.vcr-settings label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9ca3af; }
.vcr-settings select { padding: 8px 10px; border: 1px solid #374151; border-radius: 8px; background: #1f2937; color: #fff; font: inherit; font-size: 13px; }

/* Réactions : sélecteur */
.vcr-picker { position: absolute; bottom: 140px; left: 50%; z-index: 66; display: flex; gap: 6px; padding: 8px; border-radius: 999px; background: rgb(0 0 0 / 0.75); transform: translateX(-50%); }
.vcr-picker button { padding: 6px; border: 0; border-radius: 999px; background: transparent; font-size: 24px; line-height: 1; }
.vcr-picker button:hover { background: rgb(255 255 255 / 0.12); }

/* Commandes */
.vcr-controls { position: absolute; left: 50%; bottom: 12px; z-index: 50; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; width: max-content; max-width: calc(100% - 16px); padding: 10px; border-radius: 16px; background: rgb(0 0 0 / 0.55); transform: translateX(-50%); }
.vcr-ctrl { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: #fff; color: #111 !important; box-shadow: 0 2px 6px rgb(0 0 0 / 0.3); }
.vcr-ctrl--off { background: #e5e7eb; color: #b91c1c !important; }
.vcr-ctrl--active { background: #3b82f6; color: #fff !important; }
.vcr-ctrl--rec { background: #dc2626; color: #fff !important; }
.vcr-ctrl--rec .vcr-icon { fill: currentColor; }
.vcr-ctrl--leave { background: #ef4444; color: #fff !important; }
.vcr-badge { position: absolute; top: -4px; right: -4px; display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; }
.vcr-badge--count { background: #4f46e5; }

/* Desktop : commandes sur une ligne — réactions et sélecteur redescendent. */
@media (min-width: 768px) {
  .vcr-reactions { bottom: 96px; }
  .vcr-picker { bottom: 84px; }
}
</style>
