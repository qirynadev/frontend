<script setup lang="ts">
/**
 * Séance vidéo d'un cours de langue planifié.
 *
 * L'état vit dans l'URL (`planningId`), pas dans un store transitoire type
 * Pinia (contrairement à `legacy`, qui stockait le `meeting` avant de naviguer
 * vers `/meeting`) : un lien direct/partagé/rechargé retrouve la séance en
 * refaisant l'appel, cohérent avec le reste de l'app (voir `objectifs.vue`).
 *
 * Rejoignable seulement dans une fenêtre de 2 min avant le début jusqu'à la
 * fin de la séance (même principe que `legacy`, fenêtre resserrée à la
 * demande du responsable le 2026-08-30) — la vraie session Zoom Video SDK est
 * montée par `VisioCallRoom` seulement dans cette fenêtre.
 */
import { planningRepo } from '~/core/repositories'
import { useSessionStore } from '~/core/stores'

// `bottomNav: false` : la barre basse (position fixed) recouvrait la barre de
// contrôle de l'appel (caméra/micro/quitter), elle-même fixée en bas de
// l'écran — signalé en direct (2026-08-30) après un test réel sur stage.
definePageMeta({ middleware: 'auth', bottomNav: false })

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const sessionStore = useSessionStore()

const planningId = computed(() => String(route.params.planningId ?? ''))

const { data: sessions, isInitialLoading } = await usePageData(
  'langues-planned',
  () => planningRepo.planned(locale.value),
  { watch: [locale] },
)

const session = computed(() => (sessions.value ?? []).find((s) => s.id === planningId.value) ?? null)

const JOIN_WINDOW_MS = 2 * 60 * 1000

const nowTick = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  tickTimer = setInterval(() => { nowTick.value = Date.now() }, 1000)
})
onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
})

type Gate = 'loading' | 'not-found' | 'too-early' | 'ended' | 'joinable'
const gate = computed<Gate>(() => {
  if (isInitialLoading.value) return 'loading'
  const s = session.value
  if (!s || !s.startDate || !s.endDate || !s.meetingSessionName) return 'not-found'
  const start = new Date(s.startDate).getTime()
  const end = new Date(s.endDate).getTime()
  if (nowTick.value >= end) return 'ended'
  if (nowTick.value < start - JOIN_WINDOW_MS) return 'too-early'
  return 'joinable'
})

function backToSchedule() {
  void router.push(localePath('/mon-projet/langues'))
}

usePageSeo(() => ({
  title: t('videoCall.seoTitle'),
  noindex: true,
}))
</script>

<template>
  <div class="fixed inset-0 z-50 flex min-h-screen flex-col bg-black">
    <ClientOnly v-if="gate === 'joinable' && session">
      <VisioCallRoom
        :session-name="session.meetingSessionName!"
        :end-date="session.endDate!"
        :locale="locale"
        :user-name="sessionStore.user?.name ?? ''"
        @left="backToSchedule"
      />
      <template #fallback>
        <div class="flex flex-1 items-center justify-center">
          <QSpinner />
        </div>
      </template>
    </ClientOnly>

    <div v-else class="flex flex-1 flex-col items-center justify-center gap-16 p-24 text-center text-white">
      <QSpinner v-if="gate === 'loading'" />

      <template v-else-if="gate === 'not-found'">
        <p class="text-xl font-semibold">{{ t('videoCall.notFoundTitle') }}</p>
        <p class="text-white/70">{{ t('videoCall.notFoundDesc') }}</p>
      </template>

      <template v-else-if="gate === 'too-early'">
        <p class="text-xl font-semibold">{{ t('videoCall.tooEarlyTitle') }}</p>
        <p class="text-white/70">{{ t('videoCall.tooEarlyDesc') }}</p>
      </template>

      <template v-else-if="gate === 'ended'">
        <p class="text-xl font-semibold">{{ t('videoCall.endedTitle') }}</p>
        <p class="text-white/70">{{ t('videoCall.endedDesc') }}</p>
      </template>

      <button
        v-if="gate !== 'loading'"
        type="button"
        class="mt-8 rounded-xl bg-surface-card px-20 py-10 text-sm font-semibold text-text"
        @click="backToSchedule"
      >
        {{ t('videoCall.backToSchedule') }}
      </button>
    </div>
  </div>
</template>
