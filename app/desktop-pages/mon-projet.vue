<script setup lang="ts">
/**
 * Mon projet desktop ← Figma `Mon projet` (955:1230), 1728 px.
 *
 * Données : mêmes accompagnements que le hub mobile (`useProjetData` + mock).
 * Vue d’ensemble = moyenne réelle des cartes. Prochaines actions = cartes
 * encore en cours (pas les tâches Figma inventées). MBA 0 % du mock Figma omis.
 */
import type { ProjetAccompagnement } from '~/core/contracts/projet'
import type { ApiError } from '~/core/http/errors'
import {
  desktopMonProjetStyle,
  sortDesktopMonProjet,
} from '~/config/desktop-mon-projet'

const props = defineProps<{
  accompagnements: ProjetAccompagnement[]
  usingMockOnly: boolean
  loading: boolean
  error?: ApiError | null
  onRetry?: () => void
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const ASSET = '/img/desktop/mon-projet'
const DONE_STATUS = 'myProject.statusDone'

const cards = computed(() => sortDesktopMonProjet(props.accompagnements))

const legend = computed(() => {
  const byType = new Map<string, { sum: number; count: number }>()
  for (const item of cards.value) {
    const pct = item.progressPercent ?? 0
    const prev = byType.get(item.titleKey) ?? { sum: 0, count: 0 }
    byType.set(item.titleKey, { sum: prev.sum + pct, count: prev.count + 1 })
  }
  return [...byType.entries()].map(([titleKey, { sum, count }]) => {
    const chrome = desktopMonProjetStyle(titleKey)
    return {
      titleKey,
      legendKey: chrome.legendKey,
      dot: chrome.legendDot,
      percent: count > 0 ? Math.round(sum / count) : 0,
    }
  })
})

const globalPercent = computed(() => {
  if (legend.value.length === 0) return 0
  const sum = legend.value.reduce((acc, row) => acc + row.percent, 0)
  return Math.round(sum / legend.value.length)
})

const nextActions = computed(() =>
  cards.value.filter(item => (item.progressPercent ?? 0) < 100 && item.statusKey !== DONE_STATUS),
)

function chrome(item: ProjetAccompagnement) {
  return desktopMonProjetStyle(item.titleKey)
}

function isDone(item: ProjetAccompagnement) {
  return item.statusKey === DONE_STATUS || (item.progressPercent ?? 0) >= 100
}

function actionWhen(iso: string | null): string | null {
  if (!iso) return null
  const days = daysSince(iso)
  if (days <= 0) return t('desktop.monProjet.actionToday')
  if (days === 1) return t('desktop.monProjet.actionYesterday')
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' }).format(new Date(iso))
}
</script>

<template>
  <div class="desktop-boxed flex flex-col gap-18 pb-32 pt-11">
    <PageState
      :loading="loading"
      :error="error"
      :empty="false"
      :on-retry="onRetry"
    >
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="rect" :height="211" />
          <QSkeleton v-for="index in 3" :key="index" variant="rect" :height="140" />
        </div>
      </template>

      <p v-if="usingMockOnly" class="sr-only">
        {{ $t('myProject.mockNotice') }}
      </p>

      <div class="flex flex-wrap items-start gap-32">
        <!-- Colonne gauche -->
        <div class="flex min-w-0 flex-[1_1_560px] flex-col">
          <section class="relative h-211 w-full overflow-hidden rounded-[16px] border border-[#f5f7f9] bg-white">
            <div class="absolute top-66 left-32 z-1 flex max-w-576 flex-col">
              <div class="flex items-center gap-12">
                <span class="relative h-40 w-36 shrink-0 overflow-hidden">
                  <img
                    src="/img/desktop/logo-nav.png"
                    alt=""
                    width="36"
                    height="40"
                    class="absolute top-[-13%] left-0 block h-[125%] w-[372%] max-w-none object-cover"
                  >
                </span>
                <h1 class="m-0 text-[30px] leading-36 font-bold text-[#1a1d2b]">
                  {{ $t('myProject.title') }}
                </h1>
              </div>
              <p class="m-0 mt-16 max-w-[475px] text-[17px] leading-[27.625px] font-normal text-[#1a1d2b]">
                {{ $t('desktop.monProjet.introLine1') }}<br>
                {{ $t('desktop.monProjet.introLine2') }}
              </p>
            </div>
            <div class="pointer-events-none absolute top-[-20px] right-0 h-269 w-[min(345px,42%)] overflow-hidden" aria-hidden="true">
              <NuxtImg
                :src="`${ASSET}/hero.png`"
                alt=""
                width="345"
                height="269"
                format="webp"
                class="block size-full object-contain object-center"
              />
            </div>
          </section>

          <div class="mt-16 flex w-full flex-col overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <article
              v-for="(item, index) in cards"
              :key="item.id"
              class="flex items-center gap-24 border-[#f9fafb]"
              :class="[
                index === 0 ? 'p-24' : 'px-24 py-10',
                index < cards.length - 1 ? 'border-b border-solid' : '',
              ]"
            >
              <span
                class="flex size-64 shrink-0 items-center justify-center overflow-clip rounded-full"
                :style="chrome(item).iconKind === 'glyph' ? { background: chrome(item).iconBg } : undefined"
              >
                <span
                  class="overflow-clip"
                  :class="chrome(item).iconKind === 'badge' ? 'size-64' : 'size-32'"
                >
                  <img
                    :src="chrome(item).icon"
                    alt=""
                    :width="chrome(item).iconKind === 'badge' ? 64 : 32"
                    :height="chrome(item).iconKind === 'badge' ? 64 : 32"
                    class="block size-full"
                  >
                </span>
              </span>

              <div class="flex min-w-0 flex-1 flex-wrap items-center gap-16">
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex flex-wrap items-center gap-12">
                    <h2 class="m-0 text-[17px] leading-[25.5px] font-bold text-[#1a1d2b]">
                      {{ $t(chrome(item).titleKey) }}
                    </h2>
                    <span
                      v-if="isDone(item)"
                      class="rounded-[6px] bg-[#dcfce7] px-10 py-2 text-[11px] leading-[16.5px] font-semibold text-[#15803d]"
                    >
                      {{ $t('myProject.statusDone') }}
                    </span>
                    <span
                      v-else
                      class="rounded-[6px] px-10 py-2 text-[11px] leading-[16.5px] font-semibold"
                      :style="{
                        background: chrome(item).inProgressBadge.bg,
                        color: chrome(item).inProgressBadge.text,
                      }"
                    >
                      {{ $t(item.statusKey) }}
                    </span>
                  </div>
                  <p class="m-0 mt-6 max-w-[240px] text-[14px] leading-[17.5px] font-medium text-[rgba(26,29,43,0.8)] whitespace-pre-line">
                    {{ item.sub }}
                  </p>
                  <p v-if="item.advisorName" class="m-0 mt-12 flex items-center gap-6 text-[12px] leading-18 font-normal text-[#6b7280]">
                    <span class="size-14 shrink-0 overflow-clip">
                      <img :src="`${ASSET}/icon-advisor.svg`" alt="" width="14" height="14" class="block size-full">
                    </span>
                    {{ $t('desktop.monProjet.advisor', { name: item.advisorName }) }}
                  </p>
                </div>

                <div class="flex min-w-80 flex-1 items-center gap-16">
                  <span class="h-6 min-w-0 flex-1 overflow-hidden rounded-full bg-[#f3f4f6]">
                    <span
                      class="block h-6 rounded-full"
                      :style="{
                        width: `${item.progressPercent ?? 0}%`,
                        background: chrome(item).progress,
                      }"
                    />
                  </span>
                  <span class="w-36 shrink-0 text-right text-[14px] leading-20 font-bold text-[#1a1d2b]">
                    {{ item.progressPercent ?? 0 }}%
                  </span>
                </div>

                <div class="flex shrink-0 flex-col items-end">
                  <NuxtLink
                    :to="localePath(item.to)"
                    class="inline-flex items-center justify-center gap-8 rounded-[10px] border border-solid border-[#fc8994] px-20 py-10 text-[14px] leading-20 font-semibold text-[#fd001a] no-underline"
                  >
                    {{ $t('desktop.monProjet.seeDetails') }}
                    <span class="size-16 shrink-0 overflow-clip">
                      <img :src="`${ASSET}/icon-arrow.svg`" alt="" width="16" height="16" class="block size-full">
                    </span>
                  </NuxtLink>
                  <p v-if="item.updatedAt" class="m-0 mt-8 text-[12px] leading-18 font-medium text-[#303030]">
                    {{ $t('myProject.updatedDaysAgo', daysSince(item.updatedAt)) }}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="flex w-full min-w-0 flex-[1_1_320px] flex-col max-w-[429px]">
          <section class="rounded-[16px] border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h2 class="m-0 text-[17px] leading-[25.5px] font-bold text-[#1a1d2b]">
              {{ $t('desktop.monProjet.overview') }}
            </h2>
            <div class="mt-24 flex items-center gap-24">
              <div
                class="relative size-[110px] shrink-0 rounded-full"
                :style="{ background: `conic-gradient(#ef4444 ${globalPercent}%, #f3f4f6 0)` }"
                role="img"
                :aria-label="`${globalPercent}%`"
              >
                <div class="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-white">
                  <span class="text-[20px] leading-32 font-semibold text-[#1a1d2b]">{{ globalPercent }}%</span>
                  <span class="max-w-59 text-center text-[8px] leading-[13.75px] font-medium text-[#9ca3af]">
                    {{ $t('desktop.monProjet.globalProgress') }}
                  </span>
                </div>
              </div>
              <ul class="m-0 flex min-w-0 flex-1 list-none flex-col gap-8 p-0">
                <li
                  v-for="row in legend"
                  :key="row.titleKey"
                  class="flex items-center justify-between gap-10"
                >
                  <span class="flex min-w-0 items-center gap-10">
                    <span class="size-10 shrink-0 rounded-full" :style="{ background: row.dot }" />
                    <span class="truncate text-[13px] leading-[19.5px] font-medium text-[#1a1d2b]">
                      {{ $t(row.legendKey) }}
                    </span>
                  </span>
                  <span class="shrink-0 text-[13px] leading-[19.5px] font-bold text-[#1a1d2b]">
                    {{ row.percent }}%
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section class="mt-24 flex flex-col rounded-[16px] border border-[#f3f4f6] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <h2 class="m-0 text-[17px] leading-[25.5px] font-bold text-[#1a1d2b]">
              {{ $t('desktop.monProjet.nextActions') }}
            </h2>
            <p v-if="nextActions.length === 0" class="m-0 mt-24 text-[13px] leading-[19.5px] text-[#6b7280]">
              {{ $t('desktop.monProjet.emptyActions') }}
            </p>
            <ul v-else class="m-0 mt-24 flex list-none flex-col p-0">
              <li
                v-for="(item, index) in nextActions"
                :key="item.id"
                class="border-[#eaeaf5]"
                :class="index > 0 ? 'mt-10 border-t border-solid pt-16' : ''"
              >
                <NuxtLink
                  :to="localePath(item.to)"
                  class="flex items-center gap-14 rounded-[12px] p-8 text-inherit no-underline"
                >
                  <span
                    class="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-full"
                    :style="{ background: chrome(item).actionIconBg }"
                  >
                    <span class="size-20 overflow-clip">
                      <img
                        :src="chrome(item).actionIcon"
                        alt=""
                        width="20"
                        height="20"
                        class="block size-full"
                      >
                    </span>
                  </span>
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="text-[13px] leading-[19.5px] font-bold text-[#1a1d2b]">
                      {{ $t(chrome(item).titleKey) }}
                    </span>
                    <span class="mt-2 truncate text-[12px] leading-18 font-normal text-[#2c2c2c]">
                      {{ item.sub }}
                    </span>
                  </span>
                  <span class="flex shrink-0 items-center gap-12">
                    <span v-if="actionWhen(item.updatedAt)" class="flex items-center gap-6 text-[11px] leading-[16.5px] font-medium text-[#2c2c2c]">
                      <span class="size-12 overflow-clip">
                        <img :src="`${ASSET}/icon-clock.svg`" alt="" width="12" height="12" class="block size-full">
                      </span>
                      {{ actionWhen(item.updatedAt) }}
                    </span>
                    <span class="size-16 overflow-clip">
                      <img :src="`${ASSET}/icon-chevron.svg`" alt="" width="16" height="16" class="block size-full">
                    </span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <aside class="relative mt-18 flex min-h-137 items-center justify-between gap-24 overflow-hidden rounded-[24px] border border-[#fef2f2] bg-gradient-to-r from-[#fdf0f1] to-[#fef5f5] py-32 pl-32 pr-180 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div class="flex min-w-0 items-center gap-20">
          <span class="shrink-0 text-[56px] leading-84" aria-hidden="true">🏆</span>
          <div class="min-w-0">
            <p class="m-0 text-[20px] leading-28 font-bold text-[#1a1d2b]">
              {{ $t('desktop.monProjet.ctaTitle') }}
            </p>
            <p class="m-0 mt-4 text-[15px] leading-[22.5px] font-normal text-[rgba(26,29,43,0.7)]">
              {{ $t('desktop.monProjet.ctaDesc') }}
            </p>
          </div>
        </div>
        <NuxtLink
          :to="localePath('/')"
          class="relative z-1 inline-flex shrink-0 items-center justify-center gap-8 rounded-[12px] bg-[#f8011f] px-24 py-12 text-[16px] leading-24 font-semibold text-white no-underline shadow-[0_1px_1px_rgba(239,68,68,0.2)]"
        >
          {{ $t('desktop.monProjet.ctaButton') }}
          <span class="size-20 overflow-clip">
            <img :src="`${ASSET}/icon-cta-arrow.svg`" alt="" width="20" height="20" class="block size-full">
          </span>
        </NuxtLink>
        <div class="pointer-events-none absolute top-25 right-32 flex opacity-80" aria-hidden="true">
          <span class="text-[112px] leading-[168px]">📚</span>
          <span class="absolute top-[-48px] left-[-16px] text-[80px] leading-[120px]">🎓</span>
        </div>
      </aside>
    </PageState>
  </div>
</template>
