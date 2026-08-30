<script setup lang="ts">
/**
 * Salle d'appel Zoom Video SDK — reprend le flux de `legacy/src/pages/
 * Dashboard/Meeting/Call.vue` (même SDK `@zoom/videosdk`, même séquence
 * jointure), réduit au strict nécessaire pour une séance de cours 1:1
 * (caméra/micro/plein écran/quitter) — pas de tableau blanc/chat/partage
 * d'écran dans cette première version, à ajouter si besoin plus tard.
 *
 * Le SDK n'est importé qu'ici, jamais au niveau racine de la page qui monte
 * ce composant, et seulement dans `onMounted` : il touche `window`/WebRTC,
 * incompatible avec le rendu serveur.
 */
import { planningRepo } from '~/core/repositories'

const props = defineProps<{
  sessionName: string
  endDate: string
  locale: string
  /** Nom affiché aux autres participants. Zoom rejette une valeur vide. */
  userName: string
}>()

const emit = defineEmits<{ left: [] }>()

const { t } = useI18n()

const localContainer = ref<HTMLElement | null>(null)
const remoteContainer = ref<HTMLElement | null>(null)

const inSession = ref(false)
const connecting = ref(true)
const reconnecting = ref(false)
const callError = ref<string | null>(null)
const audioMuted = ref(false)
const videoMuted = ref(false)

const networkUplink = ref(5)
const networkDownlink = ref(5)
const networkQuality = computed(() => Math.min(networkUplink.value, networkDownlink.value))
const networkLabel = computed(() => {
  if (networkQuality.value >= 4) return t('videoCall.networkGood')
  if (networkQuality.value >= 2) return t('videoCall.networkMedium')
  return t('videoCall.networkWeak')
})

const sessionSeconds = ref(0)
const sessionDuration = computed(() => {
  const h = Math.floor(sessionSeconds.value / 3600)
  const m = Math.floor((sessionSeconds.value % 3600) / 60)
  const s = sessionSeconds.value % 60
  return [h > 0 ? String(h).padStart(2, '0') : null, String(m).padStart(2, '0'), String(s).padStart(2, '0')]
    .filter(Boolean)
    .join(':')
})

let client: any = null
let durationTimer: ReturnType<typeof setInterval> | null = null
let autoEndTimer: ReturnType<typeof setTimeout> | null = null

/**
 * `@zoom/videosdk` ne publie pas d'`exports` map (`main`/`module` seulement) —
 * selon la façon dont le bundler résout un `import()` dynamique de ce module,
 * l'export par défaut se retrouve parfois enveloppé une fois de plus
 * (`{ default: { default: ZoomVideo } }`) que sur un import statique classique
 * (ce que fait `legacy`, en SPA pure, sans ce problème). On tente les formes
 * plausibles plutôt que de supposer une seule forme.
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

async function resolveVideoQuality(): Promise<any> {
  const mod = await loadZoomModule()
  return mod.VideoQuality ?? mod.default?.VideoQuality ?? {}
}

async function renderVideo(mediaStream: any, event: { action: string; userId: number }) {
  if (!client) return
  const uid = client.getCurrentUserInfo().userId
  if (event.action === 'Stop') {
    const element = await mediaStream.detachVideo(event.userId)
    ;(Array.isArray(element) ? element : [element]).forEach((el) => el?.remove())
    return
  }
  const VideoQuality = await resolveVideoQuality()
  const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768
  const userVideo = await mediaStream.attachVideo(event.userId, isMobile ? VideoQuality.Video_360P : VideoQuality.Video_720P)
  const container = event.userId === uid ? localContainer.value : remoteContainer.value
  container?.appendChild(userVideo)
}

async function start() {
  connecting.value = true
  callError.value = null

  try {
    const signature = await planningRepo.zoomSignature(props.sessionName, props.locale)
    const ZoomVideo = await resolveZoomVideo()

    client = ZoomVideo.createClient()
    await client.init(props.locale === 'fr' ? 'fr-FR' : 'en-US', 'Global', { patchJsMedia: true })

    client.on('peer-video-state-change', (event: { action: string; userId: number }) => {
      const mediaStream = client.getMediaStream()
      void renderVideo(mediaStream, event)
    })

    client.on('connection-change', (payload: { state: string }) => {
      if (payload.state === 'Reconnecting') {
        reconnecting.value = true
      }
      else if (payload.state === 'Connected') {
        reconnecting.value = false
      }
      else if (payload.state === 'Closed') {
        inSession.value = false
        emit('left')
      }
    })

    client.on('network-quality-change', (data: { uplink?: number; downlink?: number }) => {
      networkUplink.value = data.uplink ?? 5
      networkDownlink.value = data.downlink ?? 5
    })

    await client.join(props.sessionName, signature, props.userName || 'Qiryna')
    const mediaStream = client.getMediaStream()

    try {
      await mediaStream.enableAudioProcessor?.('denoise')
    }
    catch {
      // Réduction de bruit indisponible sur ce navigateur — pas bloquant.
    }

    await mediaStream.startAudio()
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768
    await mediaStream.startVideo({ hd: !isMobile && mediaStream.isSupportHDVideo() })

    await renderVideo(mediaStream, { action: 'Start', userId: client.getCurrentUserInfo().userId })
    inSession.value = true
    audioMuted.value = mediaStream.isAudioMuted()
    videoMuted.value = !mediaStream.isCapturingVideo()

    durationTimer = setInterval(() => { sessionSeconds.value++ }, 1000)

    const maxMs = 60 * 60 * 1000
    const msUntilEnd = new Date(props.endDate).getTime() - Date.now()
    autoEndTimer = setTimeout(() => { void leave() }, Math.min(Math.max(msUntilEnd, 0), maxMs))
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('[VisioCallRoom] échec de connexion Zoom', error)
    callError.value = t('videoCall.connectError')
  }
  finally {
    connecting.value = false
  }
}

async function leave() {
  if (autoEndTimer) { clearTimeout(autoEndTimer); autoEndTimer = null }
  if (durationTimer) { clearInterval(durationTimer); durationTimer = null }
  if (client) {
    try {
      const mediaStream = client.getMediaStream()
      for (const u of client.getAllUser()) {
        const element = await mediaStream.detachVideo(u.userId)
        ;(Array.isArray(element) ? element : [element]).forEach((el: HTMLElement) => el?.remove())
      }
      await client.leave()
    }
    catch {
      // La session est peut-être déjà close côté serveur — rien à faire de plus.
    }
  }
  inSession.value = false
  emit('left')
}

async function toggleVideo() {
  if (!client) return
  const mediaStream = client.getMediaStream()
  if (mediaStream.isCapturingVideo()) {
    await mediaStream.stopVideo()
    await renderVideo(mediaStream, { action: 'Stop', userId: client.getCurrentUserInfo().userId })
  }
  else {
    await mediaStream.startVideo()
    await renderVideo(mediaStream, { action: 'Start', userId: client.getCurrentUserInfo().userId })
  }
  videoMuted.value = !mediaStream.isCapturingVideo()
}

async function toggleAudio() {
  if (!client) return
  const mediaStream = client.getMediaStream()
  if (client.getCurrentUserInfo().muted) {
    await mediaStream.unmuteAudio()
  }
  else {
    await mediaStream.muteAudio()
  }
  audioMuted.value = mediaStream.isAudioMuted()
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    void remoteContainer.value?.requestFullscreen?.()
  }
  else {
    void document.exitFullscreen?.()
  }
}

onMounted(() => {
  void start()
})

onBeforeUnmount(() => {
  if (durationTimer) clearInterval(durationTimer)
  if (autoEndTimer) clearTimeout(autoEndTimer)
})
</script>

<template>
  <div class="relative flex h-screen w-full items-center justify-center bg-black">
    <div v-if="connecting" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <QSpinner />
      <p class="mt-16 text-sm text-white">{{ t('videoCall.joining') }}</p>
    </div>

    <div v-if="reconnecting" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      <QSpinner />
      <p class="mt-16 text-sm font-medium text-yellow-400">{{ t('videoCall.reconnecting') }}</p>
    </div>

    <div v-if="callError" class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-16 bg-black px-24 text-center">
      <p class="text-white">{{ callError }}</p>
      <button type="button" class="rounded-xl bg-white px-20 py-10 text-sm font-semibold text-black" @click="emit('left')">
        {{ t('videoCall.backToSchedule') }}
      </button>
    </div>

    <div v-if="inSession" class="pointer-events-none absolute inset-x-0 top-12 z-40 flex items-center justify-between px-16">
      <div class="flex items-center gap-6 rounded-full bg-black/50 px-12 py-6 text-xs font-medium text-white">
        {{ networkLabel }}
      </div>
      <div class="rounded-full bg-black/50 px-12 py-6 font-mono text-sm text-white">
        {{ sessionDuration }}
      </div>
    </div>

    <div ref="remoteContainer" class="flex h-full w-full items-center justify-center" @dblclick="toggleFullscreen" />

    <div ref="localContainer" class="absolute bottom-80 right-8 z-30 h-80 w-112 overflow-hidden rounded-lg border-2 border-white shadow-lg md:h-128 md:w-192" />

    <div v-if="inSession" class="fixed bottom-8 z-50 flex w-full items-center justify-center">
      <div class="mx-auto flex items-center gap-8 rounded-xl bg-black/50 p-12">
        <button type="button" class="rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="toggleVideo">
          {{ videoMuted ? t('videoCall.cameraOff') : t('videoCall.cameraOn') }}
        </button>
        <button type="button" class="rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="toggleAudio">
          {{ audioMuted ? t('videoCall.micOff') : t('videoCall.micOn') }}
        </button>
        <button type="button" class="rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="toggleFullscreen">
          {{ t('videoCall.fullscreen') }}
        </button>
        <button type="button" class="rounded-full bg-red-500 px-14 py-10 text-xs font-semibold text-white shadow" @click="leave">
          {{ t('videoCall.leave') }}
        </button>
      </div>
    </div>
  </div>
</template>
