<script setup lang="ts">
/**
 * Salle d'appel Zoom Video SDK — reprend le flux de `legacy/src/pages/
 * Dashboard/Meeting/Call.vue` (même SDK `@zoom/videosdk`, même séquence
 * jointure). Chat et tableau blanc réutilisent le mécanisme de `legacy`
 * (canal de commande `getCommandClient()` pour synchroniser le dessin,
 * `getChatClient()` pour le texte) ; les réactions emoji sont nouvelles —
 * le SDK Video (contrairement à l'UI Toolkit) n'en a pas de client dédié,
 * diffusées par le même canal de commande avec un `type` distinct.
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

// ── Chat ─────────────────────────────────────────────────────────────────
const showChat = ref(false)
const unreadCount = ref(0)
const chatInput = ref('')
const chatMessages = ref<{ sender: string; text: string; self: boolean; time: string }[]>([])
const chatContainer = ref<HTMLElement | null>(null)

function timeLabel(): string {
  return new Intl.DateTimeFormat(props.locale, { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

function toggleChat() {
  showChat.value = !showChat.value
  if (showChat.value) unreadCount.value = 0
}

function scrollChatToEnd() {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

async function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text || !chatClient) return
  try {
    await chatClient.sendToAll(text)
    chatMessages.value.push({ sender: props.userName || 'Qiryna', text, self: true, time: timeLabel() })
    chatInput.value = ''
    scrollChatToEnd()
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('[VisioCallRoom] échec d\'envoi du message', error)
  }
}

// ── Tableau blanc ────────────────────────────────────────────────────────
const showWhiteboard = ref(false)
const whiteboardCanvas = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const lastPos = ref({ x: 0, y: 0 })
const drawColor = ref('#000000')
const drawSize = ref(3)
const drawMode = ref<'pen' | 'eraser'>('pen')

function getCanvasPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function drawLine(x1: number, y1: number, x2: number, y2: number, color: string, size: number, eraser: boolean) {
  const ctx = whiteboardCanvas.value?.getContext('2d')
  if (!ctx) return
  ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over'
  ctx.strokeStyle = color
  ctx.lineWidth = size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function clearCanvas() {
  const canvas = whiteboardCanvas.value
  if (!canvas) return
  canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
}

function sendCommand(payload: Record<string, unknown>) {
  cmdClient?.send(JSON.stringify(payload))?.catch(() => {
    // Canal de commande indisponible — le dessin/la réaction reste local, pas bloquant.
  })
}

function onWbMouseDown(e: MouseEvent) {
  const canvas = whiteboardCanvas.value
  if (!canvas) return
  isDrawing.value = true
  lastPos.value = getCanvasPos(e, canvas)
}

function onWbMouseMove(e: MouseEvent) {
  if (!isDrawing.value) return
  const canvas = whiteboardCanvas.value
  if (!canvas) return
  const pos = getCanvasPos(e, canvas)
  const { x: x1, y: y1 } = lastPos.value
  const { x: x2, y: y2 } = pos
  const eraser = drawMode.value === 'eraser'
  const size = eraser ? drawSize.value * 5 : drawSize.value
  drawLine(x1, y1, x2, y2, drawColor.value, size, eraser)
  sendCommand({ type: 'draw', x1, y1, x2, y2, color: drawColor.value, size, eraser })
  lastPos.value = pos
}

function onWbMouseUp() {
  isDrawing.value = false
}

function onWbTouchStart(e: TouchEvent) {
  e.preventDefault()
  const canvas = whiteboardCanvas.value
  if (!canvas || !e.touches[0]) return
  isDrawing.value = true
  lastPos.value = getCanvasPos(e.touches[0], canvas)
}

function onWbTouchMove(e: TouchEvent) {
  e.preventDefault()
  if (!isDrawing.value) return
  const canvas = whiteboardCanvas.value
  if (!canvas || !e.touches[0]) return
  const pos = getCanvasPos(e.touches[0], canvas)
  const { x: x1, y: y1 } = lastPos.value
  const { x: x2, y: y2 } = pos
  const eraser = drawMode.value === 'eraser'
  const size = eraser ? drawSize.value * 5 : drawSize.value
  drawLine(x1, y1, x2, y2, drawColor.value, size, eraser)
  sendCommand({ type: 'draw', x1, y1, x2, y2, color: drawColor.value, size, eraser })
  lastPos.value = pos
}

function onWbTouchEnd() {
  isDrawing.value = false
}

function onWbClear() {
  clearCanvas()
  sendCommand({ type: 'clear' })
}

async function openWhiteboard() {
  showWhiteboard.value = true
  await nextTick()
  const canvas = whiteboardCanvas.value
  if (canvas) {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }
}

// ── Réactions ────────────────────────────────────────────────────────────
/** Pas de client dédié côté SDK Video (contrairement à l'UI Toolkit) — diffusées par le canal de commande. */
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
  sendCommand({ type: 'reaction', emoji })
  showReactionPicker.value = false
}

let client: any = null
let chatClient: any = null
let cmdClient: any = null
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

    // Canal de commande — tableau blanc et réactions partagent le même canal, distingués par `type`.
    // Évènement de réception sur le client principal (confirmé dans les types installés :
    // `event_command_channel_message`), pas sur `cmdClient` — legacy visait une version de SDK antérieure.
    try {
      cmdClient = client.getCommandClient()
      client.on('command-channel-message', (payload: { text: string }) => {
        const data = JSON.parse(payload.text)
        if (data.type === 'draw') drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size, data.eraser)
        else if (data.type === 'clear') clearCanvas()
        else if (data.type === 'reaction') spawnReaction(data.emoji)
      })
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error('[VisioCallRoom] canal de commande indisponible', error)
    }

    try {
      chatClient = client.getChatClient()
      // L'évènement de réception se déclenche sur le client principal, pas sur
      // `chatClient` (confirmé dans les types installés : `event_chat_received_message`).
      client.on('chat-on-message', (payload: { message?: string; sender: { name: string } }) => {
        if (!payload.message) return
        chatMessages.value.push({ sender: payload.sender.name, text: payload.message, self: false, time: timeLabel() })
        if (!showChat.value) unreadCount.value++
        scrollChatToEnd()
      })
    }
    catch (error) {
      // eslint-disable-next-line no-console
      console.error('[VisioCallRoom] client de chat indisponible', error)
    }

    durationTimer = setInterval(() => { sessionSeconds.value++ }, 1000)

    const maxMs = 60 * 60 * 1000
    const msUntilEnd = new Date(props.endDate).getTime() - Date.now()
    autoEndTimer = setTimeout(() => { void leave() }, Math.min(Math.max(msUntilEnd, 0), maxMs))
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('[VisioCallRoom] échec de connexion Zoom', error)
    callError.value = t('videoCall.connectError')

    // `client.join()` a pu réussir avant l'échec d'une étape suivante
    // (startAudio/startVideo/rendu) : sans ce nettoyage, l'apprenant reste
    // « connecté » côté Zoom (visible par le professeur) alors que son propre
    // écran affiche déjà l'erreur, sans moyen de sortir proprement de la session.
    if (client) {
      try {
        await client.leave()
      }
      catch {
        // Rien à faire de plus si la session est déjà close côté serveur.
      }
    }
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
  <div class="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
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
      <button type="button" class="rounded-xl bg-white px-20 py-10 text-sm font-semibold text-black" @click="leave">
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

    <!-- Réactions flottantes -->
    <div class="pointer-events-none absolute inset-x-0 bottom-96 z-40 h-192">
      <TransitionGroup name="reaction-float">
        <span
          v-for="reaction in floatingReactions"
          :key="reaction.id"
          class="absolute bottom-0 text-3xl"
          :style="{ left: `${reaction.left}%` }"
        >{{ reaction.emoji }}</span>
      </TransitionGroup>
    </div>

    <div ref="remoteContainer" class="flex h-full w-full items-center justify-center" @dblclick="toggleFullscreen" />

    <div ref="localContainer" class="absolute bottom-80 right-8 z-30 h-80 w-112 overflow-hidden rounded-lg border-2 border-white shadow-lg md:h-128 md:w-192" />

    <!-- Tableau blanc -->
    <div v-if="showWhiteboard" class="fixed inset-0 z-[60] flex flex-col bg-white">
      <div class="flex shrink-0 items-center gap-12 border-b bg-[#f3f4f6] px-16 py-8">
        <button
          type="button"
          :class="['rounded-full p-8 shadow', drawMode === 'pen' ? 'bg-blue-500 text-white' : 'bg-white text-black']"
          :title="t('videoCall.whiteboardPen')"
          @click="drawMode = 'pen'"
        >
          ✏️
        </button>
        <button
          type="button"
          :class="['rounded-full p-8 shadow', drawMode === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white text-black']"
          :title="t('videoCall.whiteboardEraser')"
          @click="drawMode = 'eraser'"
        >
          🧽
        </button>
        <input v-model="drawColor" type="color" class="size-36 cursor-pointer rounded border" :title="t('videoCall.whiteboardPen')">
        <input v-model.number="drawSize" type="range" min="1" max="20" class="w-96">
        <button type="button" class="rounded-full bg-white p-8 text-red-500 shadow" :title="t('videoCall.whiteboardClear')" @click="onWbClear">
          🗑️
        </button>
        <button type="button" class="ml-auto rounded-lg bg-gray-700 px-16 py-6 text-sm text-white" @click="showWhiteboard = false">
          {{ t('videoCall.whiteboardClose') }}
        </button>
      </div>
      <canvas
        ref="whiteboardCanvas"
        class="min-h-0 w-full flex-1"
        :style="{ cursor: drawMode === 'eraser' ? 'cell' : 'crosshair' }"
        @mousedown="onWbMouseDown"
        @mousemove="onWbMouseMove"
        @mouseup="onWbMouseUp"
        @mouseleave="onWbMouseUp"
        @touchstart="onWbTouchStart"
        @touchmove="onWbTouchMove"
        @touchend="onWbTouchEnd"
      />
    </div>

    <!-- Chat -->
    <div
      v-if="showChat && inSession"
      class="fixed inset-y-0 right-0 z-[60] flex w-full max-w-320 flex-col border-l border-gray-700 bg-gray-900"
    >
      <div class="flex shrink-0 items-center justify-between border-b border-gray-700 px-16 py-12">
        <span class="text-sm font-medium text-white">{{ t('videoCall.chat') }}</span>
        <button type="button" class="text-xl leading-none text-gray-400" @click="showChat = false">
          ×
        </button>
      </div>
      <div ref="chatContainer" class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto p-12">
        <p v-if="chatMessages.length === 0" class="mt-24 text-center text-xs text-gray-500">
          {{ t('videoCall.chatEmpty') }}
        </p>
        <div v-for="(msg, i) in chatMessages" :key="i" :class="['flex flex-col gap-2', msg.self ? 'items-end' : 'items-start']">
          <span class="text-xs text-gray-500">{{ msg.self ? userName : msg.sender }} · {{ msg.time }}</span>
          <div :class="['max-w-[90%] rounded-2xl px-12 py-8 text-sm break-words', msg.self ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white']">
            {{ msg.text }}
          </div>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-8 border-t border-gray-700 p-12">
        <input
          v-model="chatInput"
          type="text"
          :placeholder="t('videoCall.chatPlaceholder')"
          class="flex-1 rounded-full bg-gray-800 px-12 py-8 text-sm text-white outline-none placeholder:text-gray-500"
          @keydown.enter.prevent="sendChatMessage"
        >
        <button type="button" class="shrink-0 rounded-full bg-blue-500 p-8 text-white" @click="sendChatMessage">
          ➤
        </button>
      </div>
    </div>

    <!-- Sélecteur de réactions -->
    <div v-if="showReactionPicker" class="fixed bottom-72 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-8 rounded-full bg-black/70 p-8">
      <button
        v-for="emoji in REACTION_EMOJIS"
        :key="emoji"
        type="button"
        class="rounded-full p-6 text-2xl hover:bg-white/10"
        @click="sendReaction(emoji)"
      >
        {{ emoji }}
      </button>
    </div>

    <div v-if="inSession" class="fixed bottom-8 z-50 flex w-full items-center justify-center px-8">
      <div class="mx-auto flex flex-wrap items-center justify-center gap-8 rounded-xl bg-black/50 p-12">
        <button type="button" class="rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="toggleVideo">
          {{ videoMuted ? t('videoCall.cameraOff') : t('videoCall.cameraOn') }}
        </button>
        <button type="button" class="rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="toggleAudio">
          {{ audioMuted ? t('videoCall.micOff') : t('videoCall.micOn') }}
        </button>
        <button type="button" class="rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="showReactionPicker = !showReactionPicker">
          {{ t('videoCall.reactions') }}
        </button>
        <button type="button" class="rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="openWhiteboard">
          {{ t('videoCall.whiteboard') }}
        </button>
        <button type="button" class="relative rounded-full bg-white px-14 py-10 text-xs font-semibold text-black shadow" @click="toggleChat">
          {{ t('videoCall.chat') }}
          <span v-if="unreadCount > 0 && !showChat" class="absolute -top-4 -right-4 flex size-16 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
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

<style scoped>
.reaction-float-enter-active {
  transition: transform 2s ease-out, opacity 2s ease-out;
}
.reaction-float-enter-from {
  transform: translateY(0);
  opacity: 1;
}
.reaction-float-enter-to {
  transform: translateY(-180px);
  opacity: 0;
}
</style>
