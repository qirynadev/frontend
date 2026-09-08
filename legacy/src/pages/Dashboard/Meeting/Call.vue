<script lang="ts" setup>
import ZoomVideo, { VideoQuality } from "@zoom/videosdk";
import dayjs from "dayjs";

import { storeToRefs } from "pinia";
import { useAppStore, useAuthStore, useSettingStore } from "@/stores";
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import {
  EraserIcon,
  LogOutIcon,
  MaximizeIcon,
  MessageCircleIcon,
  PencilIcon,
  ScreenShareIcon,
  ScreenShareOffIcon,
  SendIcon,
  Trash2Icon,
  VideoIcon,
  VideoOffIcon,
  Volume2Icon,
  VolumeXIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-vue-next";

const { user, meeting } = storeToRefs(useAuthStore());
const router = useRouter();
const { locale } = storeToRefs(useSettingStore());

const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
const canShare = typeof navigator.mediaDevices?.getDisplayMedia === "function";

// ── Refs vidéo ──────────────────────────────────────────────────────────────
const remoteContainer = ref();
const localContainer = ref();
const videoShareContainer = ref();
const canvasShareContainer = ref();
const inSession = ref(false);
const audioMuted = ref(false);
const videoMuted = ref(false);
const client = ZoomVideo.createClient();
const token = ref();
const sharing = ref(false);
let autoEndTimer: ReturnType<typeof setTimeout> | null = null;
let durationTimer: ReturnType<typeof setInterval> | null = null;

const connecting = ref(false);
const reconnecting = ref(false);
const callError = ref<string | null>(null);

// ── Qualité réseau ───────────────────────────────────────────────────────────
const networkUplink = ref(5);
const networkDownlink = ref(5);
const networkQuality = computed(() => Math.min(networkUplink.value, networkDownlink.value));
const networkLabel = computed(() => {
  if (networkQuality.value >= 4) return "Bonne connexion";
  if (networkQuality.value >= 2) return "Connexion moyenne";
  return "Connexion faible";
});
const networkColor = computed(() => {
  if (networkQuality.value >= 4) return "text-green-400";
  if (networkQuality.value >= 2) return "text-yellow-400";
  return "text-red-400";
});

// ── Durée de session ─────────────────────────────────────────────────────────
const sessionSeconds = ref(0);
const sessionDuration = computed(() => {
  const h = Math.floor(sessionSeconds.value / 3600);
  const m = Math.floor((sessionSeconds.value % 3600) / 60);
  const s = sessionSeconds.value % 60;
  return [h > 0 ? String(h).padStart(2, "0") : null, String(m).padStart(2, "0"), String(s).padStart(2, "0")]
    .filter(Boolean)
    .join(":");
});

// ── Participants ─────────────────────────────────────────────────────────────
const participants = reactive<Record<number, string>>({});
const activeSpeakerId = ref<number | null>(null);
const currentUserId = computed(() => (inSession.value ? (client.getCurrentUserInfo()?.userId ?? null) : null));
const remoteParticipantName = computed(() => {
  const entry = Object.entries(participants).find(([id]) => Number(id) !== currentUserId.value);
  return entry?.[1] ?? "";
});

// ── Chat ─────────────────────────────────────────────────────────────────────
const showChat = ref(false);
const unreadCount = ref(0);
const chatInput = ref("");
const chatMessages = ref<{ sender: string; text: string; self: boolean; time: string }[]>([]);
const chatContainer = ref<HTMLElement>();
let chatClient: any = null;

const toggleChat = () => {
  showChat.value = !showChat.value;
  if (showChat.value) unreadCount.value = 0;
};

const sendChatMessage = async () => {
  const text = chatInput.value.trim();
  if (!text || !chatClient) return;
  try {
    await chatClient.sendToAll(text);
    chatMessages.value.push({ sender: config.userName, text, self: true, time: dayjs().format("HH:mm") });
    chatInput.value = "";
    nextTick(() => {
      if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    });
  } catch (e) {
    console.error("[Chat] Échec de l'envoi du message :", e);
  }
};

// ── Tableau blanc ────────────────────────────────────────────────────────────
const showWhiteboard = ref(false);
const whiteboardCanvas = ref<HTMLCanvasElement>();
const isDrawing = ref(false);
const lastPos = ref({ x: 0, y: 0 });
const drawColor = ref("#000000");
const drawSize = ref(3);
const drawMode = ref<"pen" | "eraser">("pen");
let cmdClient: any = null;

const getCanvasPos = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
};

const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string, size: number, eraser: boolean) => {
  const ctx = whiteboardCanvas.value?.getContext("2d");
  if (!ctx) return;
  ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const clearCanvas = () => {
  const canvas = whiteboardCanvas.value;
  if (!canvas) return;
  canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
};

const onWbMouseDown = (e: MouseEvent) => {
  const canvas = whiteboardCanvas.value;
  if (!canvas) return;
  isDrawing.value = true;
  lastPos.value = getCanvasPos(e, canvas);
};

const onWbMouseMove = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  const canvas = whiteboardCanvas.value;
  if (!canvas) return;
  const pos = getCanvasPos(e, canvas);
  const { x: x1, y: y1 } = lastPos.value;
  const { x: x2, y: y2 } = pos;
  const eraser = drawMode.value === "eraser";
  const size = eraser ? drawSize.value * 5 : drawSize.value;
  drawLine(x1, y1, x2, y2, drawColor.value, size, eraser);
  try {
    cmdClient?.send(JSON.stringify({ type: "draw", x1, y1, x2, y2, color: drawColor.value, size, eraser }));
  } catch (_) {}
  lastPos.value = pos;
};

const onWbMouseUp = () => {
  isDrawing.value = false;
};

const onWbTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  const canvas = whiteboardCanvas.value;
  if (!canvas || !e.touches[0]) return;
  isDrawing.value = true;
  lastPos.value = getCanvasPos(e.touches[0], canvas);
};

const onWbTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  if (!isDrawing.value) return;
  const canvas = whiteboardCanvas.value;
  if (!canvas || !e.touches[0]) return;
  const pos = getCanvasPos(e.touches[0], canvas);
  const { x: x1, y: y1 } = lastPos.value;
  const { x: x2, y: y2 } = pos;
  const eraser = drawMode.value === "eraser";
  const size = eraser ? drawSize.value * 5 : drawSize.value;
  drawLine(x1, y1, x2, y2, drawColor.value, size, eraser);
  try {
    cmdClient?.send(JSON.stringify({ type: "draw", x1, y1, x2, y2, color: drawColor.value, size, eraser }));
  } catch (_) {}
  lastPos.value = pos;
};

const onWbTouchEnd = () => {
  isDrawing.value = false;
};

const onWbClear = () => {
  clearCanvas();
  try {
    cmdClient?.send(JSON.stringify({ type: "clear" }));
  } catch (_) {}
};

const openWhiteboard = async () => {
  showWhiteboard.value = true;
  await nextTick();
  const canvas = whiteboardCanvas.value;
  if (canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
};

// ── Config Zoom ──────────────────────────────────────────────────────────────
const config = reactive({
  videoSDKJWT: "",
  sessionName: meeting.value?.session_name,
  userName: user?.value?.name ?? "",
  sessionPasscode: "",
  features: ["video", "audio", "settings", "users", "chat", "share"],
  options: {
    init: { enforceMultipleVideos: true },
    audio: {},
    video: {},
    share: {},
  },
  virtualBackground: {
    allowVirtualBackground: true,
    allowVirtualBackgroundUpload: true,
    virtualBackgrounds: [],
  },
});
const role = ref(0);
const model = defineModel();

const runMeeting = async () => {
  connecting.value = true;
  callError.value = null;
  try {
    token.value = await useAppStore().getJWT({
      sessionName: config.sessionName,
      role: role.value,
    });
    if (token.value) {
      config.videoSDKJWT = token.value;
      await startCall();
    } else {
      callError.value = "Impossible de rejoindre la séance. Token invalide.";
    }
  } catch (_) {
    callError.value = "Une erreur est survenue lors de la connexion à la séance.";
  } finally {
    connecting.value = false;
  }
};

const startCall = async () => {
  client.on("peer-video-state-change", renderVideo);

  // Reconnexion automatique
  client.on("connection-change", async (payload: any) => {
    if (payload.state === "Reconnecting") {
      reconnecting.value = true;
    } else if (payload.state === "Connected") {
      reconnecting.value = false;
      if (inSession.value) {
        const mediaStream = client.getMediaStream();
        for (const u of client.getAllUser()) {
          if (!u.bVideoOn) continue;
          // Détacher proprement avant de re-attacher pour éviter les doublons
          try {
            const elements = await mediaStream.detachVideo(u.userId);
            if (Array.isArray(elements)) elements.forEach((el) => el?.remove());
            else elements?.remove();
          } catch (_) {}
          renderVideo({ action: "Start", userId: u.userId });
        }
      }
    } else if (payload.state === "Closed") {
      inSession.value = false;
      model.value = false;
      router.push(i18nRoute({ name: "user-time-spent" }));
    }
  });

  // Qualité réseau
  client.on("network-quality-change", (data: any) => {
    networkUplink.value = data.uplink ?? 5;
    networkDownlink.value = data.downlink ?? 5;
  });

  // Détection de parole active
  client.on("active-speaker", (users: any[]) => {
    activeSpeakerId.value = users?.[0]?.userId ?? null;
  });

  // Suivi des participants
  client.on("user-added", (users: any[]) => {
    users.forEach((u) => {
      participants[u.userId] = u.displayName;
    });
  });
  client.on("user-removed", (users: any[]) => {
    users.forEach((u) => {
      delete participants[u.userId];
    });
  });
  client.on("user-updated", (users: any[]) => {
    users.forEach((u) => {
      if (u.displayName) participants[u.userId] = u.displayName;
    });
  });

  await client.join(config.sessionName, token.value, config.userName);
  const mediaStream = client.getMediaStream();

  // Réduction de bruit
  try {
    await (mediaStream as any).enableAudioProcessor("denoise");
  } catch (_) {}

  await mediaStream.startAudio();
  await mediaStream.startVideo({ hd: !isMobile && mediaStream.isSupportHDVideo() });

  // Initialiser la liste des participants
  for (const u of client.getAllUser()) {
    participants[u.userId] = u.displayName;
  }

  // Canal de commande (tableau blanc)
  try {
    cmdClient = client.getCommandClient();
    cmdClient.on("message", (payload: any) => {
      const data = JSON.parse(payload.message);
      if (data.type === "draw") drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size, data.eraser);
      else if (data.type === "clear") clearCanvas();
    });
  } catch (e) {
    console.error("[Whiteboard] Impossible d'initialiser le canal de commande :", e);
  }

  // Chat
  try {
    chatClient = client.getChatClient();
    chatClient.on("message", (payload: any) => {
      chatMessages.value.push({
        sender: payload.sender.name,
        text: payload.message,
        self: false,
        time: dayjs().format("HH:mm"),
      });
      if (!showChat.value) unreadCount.value++;
      nextTick(() => {
        if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      });
    });
  } catch (e) {
    console.error("[Chat] Impossible d'initialiser le client de chat :", e);
  }

  await renderVideo({ action: "Start", userId: client.getCurrentUserInfo().userId });
  inSession.value = true;
  model.value = true;

  audioMuted.value = mediaStream.isAudioMuted();
  videoMuted.value = !mediaStream.isCapturingVideo();

  // Compteur de durée
  durationTimer = setInterval(() => {
    sessionSeconds.value++;
  }, 1000);

  // Auto-end
  const endDate = meeting.value?.end_date;
  const maxMs = 60 * 60 * 1000;
  const msUntilEnd = endDate ? dayjs(endDate).diff(dayjs()) : maxMs;
  autoEndTimer = setTimeout(() => leaveCall(), Math.min(Math.max(msUntilEnd, 0), maxMs));
};

const renderVideo = async (event: { action: string; userId: number }) => {
  const mediaStream = client.getMediaStream();
  const uid = client.getCurrentUserInfo().userId;
  if (event.action === "Stop") {
    const element = await mediaStream.detachVideo(event.userId);
    Array.isArray(element) ? element.forEach((el) => el.remove()) : element.remove();
  } else {
    const userVideo = await mediaStream.attachVideo(
      event.userId,
      isMobile ? VideoQuality.Video_360P : VideoQuality.Video_720P,
    );
    const container = event.userId === uid ? localContainer.value : remoteContainer.value;
    container?.appendChild(userVideo);
  }
};

const leaveCall = async () => {
  if (autoEndTimer) {
    clearTimeout(autoEndTimer);
    autoEndTimer = null;
  }
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
  const mediaStream = client.getMediaStream();
  for (const u of client.getAllUser()) {
    const element = await mediaStream.detachVideo(u.userId);
    Array.isArray(element) ? element?.forEach((el) => el?.remove()) : element?.remove();
  }
  client.off("peer-video-state-change", renderVideo);
  await client.leave();
  inSession.value = false;
  model.value = false;
  router.push(i18nRoute({ name: "user-time-spent" }));
};

const toggleVideo = async () => {
  const mediaStream = client.getMediaStream();
  if (mediaStream.isCapturingVideo()) {
    await mediaStream.stopVideo();
    await renderVideo({ action: "Stop", userId: client.getCurrentUserInfo().userId });
  } else {
    await mediaStream.startVideo();
    await renderVideo({ action: "Start", userId: client.getCurrentUserInfo().userId });
  }
  videoMuted.value = !mediaStream.isCapturingVideo();
};

const toggleAudio = async () => {
  const mediaStream = client.getMediaStream();
  if (client.getCurrentUserInfo().muted) {
    await mediaStream.unmuteAudio();
  } else {
    await mediaStream.muteAudio();
  }
  audioMuted.value = mediaStream.isAudioMuted();
};

const toggleShare = async () => {
  const stream = client.getMediaStream();
  if (sharing.value) {
    await stream.stopShareScreen();
    sharing.value = false;
  } else {
    if (stream.isStartShareScreenWithVideoElement()) {
      await stream.startShareScreen(videoShareContainer.value);
    } else {
      await stream.startShareScreen(canvasShareContainer.value);
    }
    sharing.value = true;
  }
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    remoteContainer.value?.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
};

// Fix: re-rendre les vidéos quand l'onglet/fenêtre redevient visible
const handleVisibilityChange = async () => {
  if (document.visibilityState !== "visible" || !inSession.value) return;

  // Laisser le navigateur restaurer ses ressources avant de re-rendre
  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const mediaStream = client.getMediaStream();
    for (const u of client.getAllUser()) {
      if (!u.bVideoOn) continue;
      // Détacher proprement — erreur ignorée si déjà détaché
      try {
        const elements = await mediaStream.detachVideo(u.userId);
        if (Array.isArray(elements)) elements.forEach((el) => el?.remove());
        else elements?.remove();
      } catch (_) {}
      // Re-attacher dans le bon conteneur
      try {
        const uid = client.getCurrentUserInfo().userId;
        const video = await mediaStream.attachVideo(u.userId, VideoQuality.Video_720P);
        const container = u.userId === uid ? localContainer.value : remoteContainer.value;
        container?.appendChild(video);
      } catch (_) {}
    }
  } catch (_) {}
};

onMounted(async () => {
  await client.init(locale.value === "fr" ? "fr-FR" : "en-US", "Global", { patchJsMedia: true });
  await runMeeting();
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (durationTimer) clearInterval(durationTimer);
});
</script>

<template>
  <div class="flex justify-center w-screen h-screen bg-black z-50 fixed! top-0 left-0">
    <!-- Connecting overlay -->
    <div v-if="connecting" class="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black">
      <div class="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
      <p class="text-white text-sm">Connexion à la séance...</p>
    </div>

    <!-- Reconnecting overlay -->
    <div v-if="reconnecting" class="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80">
      <div class="w-10 h-10 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
      <p class="text-yellow-400 text-sm font-medium">Reconnexion en cours...</p>
    </div>

    <!-- Error state -->
    <div v-if="callError" class="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black gap-4">
      <p class="text-red-400 text-center px-8">{{ callError }}</p>
      <button
        @click="router.push(i18nRoute({ name: 'user-time-spent' }))"
        class="px-6 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-100"
      >
        Retour à l'emploi du temps
      </button>
    </div>

    <!-- HUD : qualité réseau + durée -->
    <div
      v-if="inSession"
      class="absolute top-3 left-0 right-0 flex items-center justify-between px-4 z-40 pointer-events-none"
    >
      <div class="flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1.5">
        <WifiOffIcon v-if="networkQuality === 0" :class="networkColor" class="size-4" />
        <WifiIcon v-else :class="networkColor" class="size-4" />
        <span :class="networkColor" class="text-xs font-medium">{{ networkLabel }}</span>
      </div>
      <div class="bg-black/50 rounded-full px-3 py-1.5 text-white text-sm font-mono">
        {{ sessionDuration }}
      </div>
    </div>

    <!-- Tableau blanc -->
    <div v-if="showWhiteboard" class="fixed inset-0 z-50 bg-white flex flex-col">
      <div class="flex items-center gap-3 px-4 py-2 bg-gray-100 border-b shrink-0">
        <button
          @click="drawMode = 'pen'"
          :class="drawMode === 'pen' ? 'bg-blue-500 text-white' : 'bg-white text-black'"
          class="p-2 rounded-full shadow"
          title="Crayon"
        >
          <PencilIcon class="size-5" />
        </button>
        <button
          @click="drawMode = 'eraser'"
          :class="drawMode === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white text-black'"
          class="p-2 rounded-full shadow"
          title="Gomme"
        >
          <EraserIcon class="size-5" />
        </button>
        <input type="color" v-model="drawColor" class="w-9 h-9 rounded cursor-pointer border" title="Couleur" />
        <input type="range" v-model="drawSize" min="1" max="20" class="w-24" title="Épaisseur" />
        <button @click="onWbClear" class="p-2 bg-white rounded-full shadow text-red-500" title="Effacer tout">
          <Trash2Icon class="size-5" />
        </button>
        <button @click="showWhiteboard = false" class="ml-auto px-4 py-1 bg-gray-700 text-white rounded text-sm">
          Fermer
        </button>
      </div>
      <canvas
        ref="whiteboardCanvas"
        class="flex-1 w-full"
        :style="{ cursor: drawMode === 'eraser' ? 'cell' : 'crosshair' }"
        @mousedown="onWbMouseDown"
        @mousemove="onWbMouseMove"
        @mouseup="onWbMouseUp"
        @mouseleave="onWbMouseUp"
        @touchstart.prevent="onWbTouchStart"
        @touchmove.prevent="onWbTouchMove"
        @touchend="onWbTouchEnd"
      ></canvas>
    </div>

    <!-- Chat panel -->
    <Transition name="chat-slide">
      <div
        v-if="showChat && inSession"
        class="fixed right-0 top-0 h-full w-72 bg-gray-900 z-40 flex flex-col border-l border-gray-700"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
          <span class="text-white font-medium text-sm">Chat</span>
          <button @click="showChat = false" class="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <p v-if="chatMessages.length === 0" class="text-gray-500 text-xs text-center mt-6">
            Aucun message pour l'instant
          </p>
          <div
            v-for="(msg, i) in chatMessages"
            :key="i"
            :class="msg.self ? 'items-end' : 'items-start'"
            class="flex flex-col gap-0.5"
          >
            <span class="text-gray-500 text-xs">{{ msg.self ? "Vous" : msg.sender }} · {{ msg.time }}</span>
            <div
              :class="msg.self ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'"
              class="px-3 py-2 rounded-2xl text-sm max-w-[90%] wrap-break-word"
            >
              {{ msg.text }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 p-3 border-t border-gray-700 shrink-0">
          <input
            v-model="chatInput"
            @keydown.enter.prevent="sendChatMessage"
            placeholder="Message..."
            class="flex-1 bg-gray-800 text-white text-sm rounded-full px-3 py-2 outline-none placeholder-gray-500"
          />
          <button @click="sendChatMessage" class="p-2 bg-blue-500 rounded-full text-white shrink-0">
            <SendIcon class="size-4" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Screen share -->
    <div :class="{ hidden: !sharing }" class="w-2/3 h-full">
      <canvas ref="canvasShareContainer" class="w-full h-full aspect-video"></canvas>
      <video ref="videoShareContainer" class="w-full h-full aspect-video"></video>
    </div>

    <!-- Zone vidéo principale -->
    <div class="relative flex items-center justify-center h-full p-0" :class="{ 'w-1/3': sharing, 'w-full': !sharing }">
      <!-- Vidéo distante (fullscreen) + highlight si parole active -->
      <video-player-container
        v-show="inSession"
        ref="remoteContainer"
        :class="{ 'ring-4 ring-green-400 ring-inset': activeSpeakerId !== null && activeSpeakerId !== currentUserId }"
        class="flex items-center justify-center w-full h-full transition-shadow duration-300"
        @dblclick="toggleFullscreen"
      ></video-player-container>

      <!-- Nom du participant distant -->
      <div
        v-if="inSession && remoteParticipantName"
        class="absolute top-14 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full pointer-events-none z-30"
      >
        {{ remoteParticipantName }}
      </div>

      <!-- Vidéo locale (PiP) + highlight si parole active -->
      <video-player-container
        v-show="inSession"
        ref="localContainer"
        :class="{ 'ring-2 ring-green-400': activeSpeakerId === currentUserId }"
        class="absolute bottom-20 right-2 w-28 h-20 md:w-48 md:h-32 rounded-lg overflow-hidden border-2 border-white shadow-lg z-30 transition-shadow duration-300"
      ></video-player-container>

      <!-- Nom local -->
      <div
        v-if="inSession"
        class="absolute bottom-[88px] right-2 md:bottom-[136px] text-white text-xs bg-black/50 px-2 py-0.5 rounded-full pointer-events-none z-30"
      >
        Vous
      </div>

      <!-- Toolbar -->
      <div v-if="inSession" class="fixed z-50 flex items-center justify-center w-full bottom-2">
        <div
          :class="{ 'justify-end pr-10': sharing, 'justify-center': !sharing }"
          class="flex items-center gap-3 p-4 mx-auto bg-black/50 rounded-xl w-max"
        >
          <button @click="toggleVideo" class="p-3 bg-white rounded-full shadow" title="Caméra">
            <VideoOffIcon v-if="videoMuted" class="size-5" />
            <VideoIcon v-else class="size-5" />
          </button>
          <button @click="toggleAudio" class="p-3 bg-white rounded-full shadow" title="Micro">
            <VolumeXIcon v-if="audioMuted" class="size-5" />
            <Volume2Icon v-else class="size-5" />
          </button>
          <button v-if="canShare" @click="toggleShare" class="p-3 bg-white rounded-full shadow" title="Partage d'écran">
            <ScreenShareOffIcon v-if="sharing" class="size-5" />
            <ScreenShareIcon v-else class="size-5" />
          </button>
          <button @click="openWhiteboard" class="p-3 bg-white rounded-full shadow" title="Tableau blanc">
            <PencilIcon class="size-5" />
          </button>
          <button
            @click="toggleChat"
            :class="showChat ? 'bg-blue-500 text-white' : 'bg-white'"
            class="p-3 rounded-full shadow relative"
            title="Chat"
          >
            <MessageCircleIcon class="size-5" />
            <span
              v-if="unreadCount > 0 && !showChat"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
            >
              {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
          </button>
          <button @click="toggleFullscreen" class="p-3 bg-white rounded-full shadow" title="Plein écran">
            <MaximizeIcon class="size-5" />
          </button>
          <button @click="leaveCall" class="p-3 text-white bg-red-500 rounded-full shadow" title="Quitter">
            <LogOutIcon class="size-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: transform 0.25s ease;
}
.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translateX(100%);
}

.global-container {
  margin-bottom: 0 !important;
}

.input-field {
  width: 100%;
  position: relative;

  &:not(:first-child) {
    margin-top: 20px;
  }

  input {
    width: 100%;
    border-radius: 4px;
    font-size: 14px;
    padding: 6px 12px;
    border: 1.5px solid #c9c9c9;
    background: transparent;
    color: var(--color-ink);
    outline: none;
    height: 45px;
    margin-bottom: 10px;

    &:focus {
      border: 2px solid #ff3942;
    }

    &:focus ~ label {
      color: #ff3942;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 15px;
    font-size: 14px;
    padding: 0 2px;
    background: var(--color-surface);
    color: #555;
    pointer-events: none;
    transition: 0.3s;
  }
}

video-player-container {
  video-player {
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: 16/9;
  }
}
</style>
