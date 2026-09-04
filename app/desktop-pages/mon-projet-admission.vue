<script setup lang="ts">
/**
 * Admission desktop ← Figma `Mon projet admission` (955:712)
 * + onglet Documents `Mon projet - Admission_Documents` (909:789).
 *
 * Onglet « Suivi & échanges » volontairement absent (comme le mobile).
 * Aperçu = étapes checklist API, pas les 4 services mock du Figma.
 * Documents = DEMO_DOCUMENTS (aucun endpoint par pièce).
 */
import type { AdmissionDocument, AdmissionStep } from '~/core/contracts/admission'
import type { Order } from '~/core/contracts'
import type { ApiError } from '~/core/http/errors'

const props = defineProps<{
  order: Order | null
  steps: AdmissionStep[]
  documents: AdmissionDocument[]
  activeTab: 'apercu' | 'document'
  loading: boolean
  error?: ApiError | null
  onRetry?: () => void
}>()

const emit = defineEmits<{
  tab: [tab: 'apercu' | 'document']
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const ASSET = '/img/desktop/mon-projet-admission'

const DOC_ICONS: Record<string, string> = {
  passport: `${ASSET}/doc-passport.svg`,
  diploma: `${ASSET}/doc-diploma.svg`,
  grades: `${ASSET}/doc-grades.svg`,
  language: `${ASSET}/doc-language.svg`,
  letter: `${ASSET}/doc-letter.svg`,
  recommendation: `${ASSET}/doc-recommendation.svg`,
}

const NEXT_STEPS: { id: string; titleKey: string; descKey: string; icon: string; iconKind: 'glyph' | 'badge' }[] = [
  { id: 'language', titleKey: 'desktop.admission.nextLanguageTitle', descKey: 'desktop.admission.nextLanguageDesc', icon: `${ASSET}/next-lang.svg`, iconKind: 'glyph' },
  { id: 'letter', titleKey: 'desktop.admission.nextLetterTitle', descKey: 'desktop.admission.nextLetterDesc', icon: `${ASSET}/next-letter.svg`, iconKind: 'badge' },
  { id: 'recommendation', titleKey: 'desktop.admission.nextRecoTitle', descKey: 'desktop.admission.nextRecoDesc', icon: `${ASSET}/next-reco.svg`, iconKind: 'badge' },
]

const heroAdvisor = computed(() => props.order?.advisorName?.trim() || t('desktop.admission.heroAdvisor'))
const heroUpdated = computed(() => {
  if (props.order?.updatedAt) return updatedLabel(props.order.updatedAt)
  return t('myProject.updatedDaysAgo', 1)
})

const progressPercent = computed(() => {
  if (props.steps.length === 0) return 0
  const done = props.steps.filter(step => step.status === 'done').length
  return Math.round((done / props.steps.length) * 100)
})

const isDone = computed(() => progressPercent.value >= 100)

const nextSteps = computed(() =>
  NEXT_STEPS.filter((item) => {
    const doc = props.documents.find(d => d.id === item.id)
    return doc && doc.status !== 'validated'
  }),
)

function updatedLabel(iso: string | null | undefined): string | null {
  if (!iso) return null
  return t('myProject.updatedDaysAgo', daysSince(iso))
}

function docIcon(doc: AdmissionDocument) {
  return DOC_ICONS[doc.id] ?? doc.icon
}
</script>

<template>
  <div class="desktop-boxed flex flex-col gap-18 pb-32 pt-11">
    <PageState
      :loading="loading"
      :error="error"
      :empty="!order"
      :empty-title="$t('admission.emptyTitle')"
      :empty-description="$t('admission.emptyDescription')"
      :on-retry="onRetry"
    >
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="rect" :height="226" />
          <QSkeleton variant="rect" :height="400" />
        </div>
      </template>

      <template v-if="order">
        <div class="flex flex-wrap items-start gap-47">
          <div class="flex min-w-0 flex-[1_1_560px] flex-col gap-28">
            <section class="flex items-center gap-24 rounded-[16px] border border-[#f3f4f6] bg-gradient-to-r from-[#fdfdfd] to-[#f8f7fe] p-32 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <span class="flex size-96 shrink-0 items-center justify-center overflow-clip rounded-full bg-[#f0ecfe]">
                <span class="size-48 overflow-clip">
                  <img :src="`${ASSET}/icon-hero.svg`" alt="" width="48" height="48" class="block size-full">
                </span>
              </span>
              <div class="flex min-w-0 flex-1 flex-col">
                <div class="flex items-center gap-12">
                  <h1 class="m-0 text-[30px] leading-36 font-bold whitespace-nowrap text-[#1a1d2b]">
                    {{ $t('desktop.admission.heroSchool') }}
                  </h1>
                  <span
                    v-if="isDone"
                    class="shrink-0 rounded-full bg-[#dcfce7] px-12 py-4 text-[12px] leading-16 font-semibold text-[#15803d]"
                  >
                    {{ $t('admission.statusDone') }}
                  </span>
                  <span
                    v-else
                    class="shrink-0 rounded-full bg-[#e0e7ff] px-12 py-4 text-[12px] leading-16 font-semibold text-[#4f46e5]"
                  >
                    {{ $t('admission.statusCurrent') }}
                  </span>
                </div>
                <p class="m-0 mt-4 text-[18px] leading-28 font-normal whitespace-nowrap text-[#1a1d2b]">
                  {{ $t('desktop.admission.heroProgram') }}
                </p>
                <div class="mt-0 flex h-32 items-center gap-8">
                  <span class="h-13 w-12 shrink-0 overflow-clip">
                    <img :src="`${ASSET}/icon-calendar.svg`" alt="" width="12" height="13" class="block size-full">
                  </span>
                  <span class="text-[14px] leading-20 text-[#343434]">{{ $t('desktop.admission.heroIntake') }}</span>
                </div>
                <div class="flex items-center gap-16">
                  <span class="h-8 min-w-0 flex-1 overflow-hidden rounded-full bg-[#f3f4f6]">
                    <span class="block h-8 rounded-full bg-[#4f46e5]" :style="{ width: `${progressPercent}%` }" />
                  </span>
                  <span class="shrink-0 text-[16px] leading-24 font-bold text-[#1a1d2b]">{{ progressPercent }}%</span>
                </div>
                <div class="flex items-center gap-16 pt-16 text-[14px] leading-20">
                  <span class="flex items-center gap-8">
                    <span class="size-16 overflow-clip">
                      <img :src="`${ASSET}/icon-advisor.svg`" alt="" width="16" height="16" class="block size-full">
                    </span>
                    <span class="text-[14px] leading-20">
                      <span class="text-[#1b1b1b]">{{ $t('desktop.admission.advisorLabel') }} </span>
                      <span class="font-medium text-[#1a1d2b]">{{ heroAdvisor }}</span>
                    </span>
                  </span>
                  <span v-if="heroUpdated" class="text-[#1b1b1b]">{{ heroUpdated }}</span>
                </div>
              </div>
            </section>

            <div
              class="flex h-60 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              role="tablist"
              :aria-label="$t('admission.tabsLabel')"
            >
              <button
                type="button"
                class="flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center gap-8 border-0 px-24 py-16"
                :class="activeTab === 'apercu'
                  ? 'bg-[#f8f7ff] text-[#2d00fc]'
                  : 'bg-transparent text-[#191919]'"
                role="tab"
                :aria-selected="activeTab === 'apercu'"
                @click="emit('tab', 'apercu')"
              >
                <span class="size-16 overflow-clip">
                  <img :src="`${ASSET}/tab-apercu.svg`" alt="" width="16" height="16" class="block size-full">
                </span>
                <span class="text-[16px] leading-24 font-semibold">{{ $t('admission.tabApercu') }}</span>
              </button>
              <button
                type="button"
                class="flex h-full min-w-0 flex-1 cursor-pointer items-center justify-center gap-8 border-0 px-24 py-16"
                :class="activeTab === 'document'
                  ? 'bg-[#f8f7ff] text-[#2d00fc]'
                  : 'bg-transparent text-[#191919]'"
                role="tab"
                :aria-selected="activeTab === 'document'"
                @click="emit('tab', 'document')"
              >
                <span class="h-16 w-13 overflow-clip">
                  <img :src="`${ASSET}/tab-documents.svg`" alt="" width="13" height="16" class="block size-full">
                </span>
                <span class="text-[16px] leading-24 font-semibold">{{ $t('desktop.admission.tabDocuments') }}</span>
              </button>
            </div>

            <!-- Aperçu : étapes réelles -->
            <section v-show="activeTab === 'apercu'" class="rounded-[24px] border border-[#f3f4f6] bg-white p-32 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <h2 class="m-0 text-[17px] leading-28 font-bold text-black">{{ $t('desktop.admission.overviewTitle') }}</h2>
              <QEmptyState
                v-if="steps.length === 0"
                icon="clock"
                :title="$t('admission.stepsEmptyTitle')"
                :description="$t('admission.stepsEmptyDescription')"
                class="mt-32"
              />
              <ol v-else class="m-0 mt-32 flex list-none flex-col gap-0 p-0">
                <li
                  v-for="(step, index) in steps"
                  :key="step.id"
                  class="flex items-start gap-16 py-24"
                  :class="index < steps.length - 1 ? 'border-b border-solid border-[#eaeaf5]' : ''"
                >
                  <span
                    class="mt-2 flex size-24 shrink-0 items-center justify-center rounded-full box-border text-sm leading-[16.5px] font-medium"
                    :class="{
                      'bg-[#4f18f6] text-white': step.status === 'done' || step.status === 'current',
                      'border border-[#e2e8f0] bg-white text-black': step.status === 'upcoming',
                    }"
                  >
                    <img
                      v-if="step.status === 'done'"
                      src="/img/icons/ic-mpa-step-check.svg"
                      alt=""
                      width="10"
                      height="10"
                      class="block size-10"
                    >
                    <template v-else>{{ step.stepNumber }}</template>
                  </span>
                  <div class="flex min-w-0 flex-1 flex-col">
                    <h3 class="m-0 text-[17px] leading-[26px] font-bold text-[#1a1d2b]">{{ $t(step.titleKey) }}</h3>
                    <p class="m-0 mt-4 text-[14px] leading-20 text-[#64748b]">{{ $t(step.descKey) }}</p>
                  </div>
                  <span
                    class="mt-4 shrink-0 rounded-md text-exact-10-5 leading-[15.75px] font-medium whitespace-nowrap"
                    :class="{
                      'bg-[#e2f4e5] px-13 py-1 text-[#079b12]': step.status === 'done',
                      'bg-[#f3efff] px-14 py-1 text-[#4f18f6]': step.status === 'current',
                      'bg-[#f1f5f9] px-12 py-1 text-[#64748b]': step.status === 'upcoming',
                    }"
                  >
                    <template v-if="step.status === 'done'">{{ $t('admission.statusDone') }}</template>
                    <template v-else-if="step.status === 'current'">{{ $t('admission.statusCurrent') }}</template>
                    <template v-else>{{ $t('admission.statusSoon') }}</template>
                  </span>
                </li>
              </ol>
            </section>

            <!-- Documents -->
            <section v-show="activeTab === 'document'" class="rounded-[16px] border border-[#f1effa] bg-white p-32 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <h2 class="m-0 text-[17px] leading-28 font-bold text-black">{{ $t('admission.docsTitle') }}</h2>
              <div class="mt-24 flex items-start gap-12 rounded-[12px] bg-[#f7f6fe] p-16">
                <span class="size-48 shrink-0 overflow-clip">
                  <img :src="`${ASSET}/banner-info.svg`" alt="" width="48" height="48" class="block size-full">
                </span>
                <div>
                  <p class="m-0 text-[14px] leading-20 font-semibold text-[#1a1d2b]">{{ $t('admission.docsBannerTitle') }}.</p>
                  <p class="m-0 text-[14px] leading-20 font-normal text-[#2f2f2f]">{{ $t('admission.docsBannerDesc') }}</p>
                </div>
              </div>
              <ul class="m-0 mt-24 flex list-none flex-col p-0">
                <li
                  v-for="(doc, index) in documents"
                  :key="doc.id"
                  class="flex items-center gap-16 p-16"
                  :class="index < documents.length - 1 ? 'border-b border-solid border-[#f7f6fd]' : ''"
                >
                  <span class="size-40 shrink-0 overflow-clip">
                    <img :src="docIcon(doc)" alt="" width="40" height="40" class="block size-full">
                  </span>
                  <div class="min-w-0 flex-1">
                    <h3 class="m-0 text-[16px] leading-24 font-medium text-black">
                      {{ $t(doc.titleKey) }}
                      <span v-if="doc.required" class="text-[#ed1c24]"> *</span>
                    </h3>
                    <p class="m-0 text-[12px] leading-16 text-[#111]">
                      <template v-if="doc.fileCount && doc.fileCount > 1">{{ $t('admission.fileTypePdfs', { count: doc.fileCount }) }}</template>
                      <template v-else>{{ $t('admission.fileTypePdf') }}</template>
                    </p>
                  </div>
                  <div class="flex shrink-0 items-center gap-16">
                    <span
                      v-if="doc.status === 'validated'"
                      class="inline-flex items-center gap-6 rounded-[5px] bg-[#e7f6e7] px-12 py-4 text-[14px] leading-20 font-semibold text-[#16a34a]"
                    >
                      {{ $t('admission.statusValidated') }}
                      <span class="size-16 overflow-clip">
                        <img :src="`${ASSET}/badge-check.svg`" alt="" width="16" height="16" class="block size-full">
                      </span>
                    </span>
                    <span
                      v-else-if="doc.status === 'pending'"
                      class="inline-flex items-center gap-6 rounded-[5px] bg-[#ffedd5] px-12 py-4 text-[14px] leading-20 font-semibold text-[#ea580c]"
                    >
                      {{ $t('admission.statusPending') }}
                      <span class="size-16 overflow-clip">
                        <img :src="`${ASSET}/badge-clock.svg`" alt="" width="16" height="16" class="block size-full">
                      </span>
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-6 rounded-[5px] bg-[#eef2ff] px-12 py-4 text-[14px] leading-20 font-semibold text-[#4f46e5]"
                    >
                      {{ $t('admission.statusUpload') }}
                      <span class="size-16 overflow-clip">
                        <img :src="`${ASSET}/badge-upload.svg`" alt="" width="16" height="16" class="block size-full">
                      </span>
                    </span>
                    <button
                      v-if="doc.status === 'validated'"
                      type="button"
                      class="flex size-38 cursor-pointer items-center justify-center rounded-[8px] border border-solid border-[#e8e8f1] bg-white p-8"
                      :aria-label="$t('admission.downloadDoc')"
                    >
                      <span class="size-20 overflow-clip">
                        <img :src="`${ASSET}/icon-download.svg`" alt="" width="20" height="20" class="block size-full">
                      </span>
                    </button>
                    <span v-else class="flex size-38 items-center justify-center rounded-[8px] border border-solid border-[#e8e8f1]" aria-hidden="true">
                      <span class="size-20 overflow-clip">
                        <img :src="`${ASSET}/icon-chevron.svg`" alt="" width="20" height="20" class="block size-full">
                      </span>
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <aside class="flex items-center justify-between gap-24 rounded-[16px] border border-[#f3f4f6] bg-[#f9f8fd] p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <div class="flex min-w-0 items-center gap-16">
                <span class="size-48 shrink-0 overflow-clip">
                  <img :src="`${ASSET}/icon-help.svg`" alt="" width="48" height="48" class="block size-full">
                </span>
                <div>
                  <p class="m-0 text-[16px] leading-24 font-bold text-[#1a1d2b]">{{ $t('desktop.admission.helpTitle') }}</p>
                  <p class="m-0 text-[14px] leading-20 text-[#393939]">{{ $t('desktop.admission.helpDesc') }}</p>
                </div>
              </div>
              <NuxtLink
                :to="localePath('/messages')"
                class="shrink-0 whitespace-nowrap rounded-[8px] border border-solid border-[#450ff2] bg-[#450ffd] px-24 py-10 text-center text-[16px] leading-24 font-medium text-white no-underline"
              >
                {{ $t('admission.contactAdvisor') }}
              </NuxtLink>
            </aside>
          </div>

          <div class="flex w-full min-w-0 flex-[1_1_280px] flex-col max-w-[414px]">
            <section class="rounded-[16px] border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <h2 class="m-0 text-[16px] leading-24 font-bold text-[#1a1d2b]">{{ $t('desktop.admission.progressTitle') }}</h2>
              <div class="mt-24 flex items-center gap-24">
                <div
                  class="relative size-[110px] shrink-0 rounded-full"
                  :style="{ background: `conic-gradient(#4f46e5 ${progressPercent}%, #f3f4f6 0)` }"
                  role="img"
                  :aria-label="`${progressPercent}%`"
                >
                  <div class="absolute inset-[12px] flex items-center justify-center rounded-full bg-white">
                    <span class="text-[20px] leading-32 font-semibold text-[#1a1d2b]">{{ progressPercent }}%</span>
                  </div>
                </div>
                <div class="min-w-0">
                  <p class="m-0 text-[14px] leading-20 font-bold text-[#1a1d2b]">
                    {{ isDone ? $t('desktop.admission.progressDone') : $t('desktop.admission.progressOpen') }}
                  </p>
                  <p class="m-0 mt-4 text-[12px] leading-[19.5px] text-[#64748b]">
                    {{ $t('desktop.admission.progressHint') }}
                  </p>
                </div>
              </div>
              <div v-if="order.updatedAt" class="mt-24 border-t border-solid border-[#eaeaf5] pt-16">
                <p class="m-0 text-[14px] leading-20 text-[#64748b]">{{ $t('desktop.admission.lastUpdate') }}</p>
                <p class="m-0 mt-2 text-[14px] leading-20 text-[#1a1d2b]">{{ updatedLabel(order.updatedAt) }}</p>
              </div>
            </section>

            <section class="mt-24 rounded-[16px] border border-[#f3f5fb] bg-white p-24 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <h2 class="m-0 text-[16px] leading-24 font-bold text-[#1a1d2b]">{{ $t('desktop.admission.nextSteps') }}</h2>
              <p v-if="nextSteps.length === 0" class="m-0 mt-24 text-[13px] leading-[19.5px] text-[#6b7280]">
                {{ $t('desktop.admission.emptyNext') }}
              </p>
              <ul v-else class="m-0 mt-24 flex list-none flex-col p-0">
                <li
                  v-for="(item, index) in nextSteps"
                  :key="item.id"
                  :class="index > 0 ? 'mt-10 border-t border-solid border-[#eaeaf5] pt-16' : ''"
                >
                  <button
                    type="button"
                    class="flex w-full cursor-pointer items-start gap-16 border-0 bg-transparent p-0 text-left"
                    @click="emit('tab', 'document')"
                  >
                    <span
                      class="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-full"
                      :class="item.iconKind === 'glyph' ? 'bg-[#fbf8f9]' : ''"
                    >
                      <span :class="item.iconKind === 'glyph' ? 'size-20' : 'size-40'" class="overflow-clip">
                        <img
                          :src="item.icon"
                          alt=""
                          :width="item.iconKind === 'glyph' ? 20 : 40"
                          :height="item.iconKind === 'glyph' ? 20 : 40"
                          class="block size-full"
                        >
                      </span>
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block text-[14px] leading-20 font-semibold text-[#1a1d2b]">{{ $t(item.titleKey) }}</span>
                      <span class="mt-2 block text-[12px] leading-16 text-[#64748b]">{{ $t(item.descKey) }}</span>
                    </span>
                    <span class="size-20 shrink-0 overflow-clip">
                      <img :src="`${ASSET}/icon-chevron.svg`" alt="" width="20" height="20" class="block size-full">
                    </span>
                  </button>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </template>
    </PageState>
  </div>
</template>
