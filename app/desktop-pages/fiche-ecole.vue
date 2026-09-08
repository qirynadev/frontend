<script setup lang="ts">
/**
 * Fiche école desktop ← Figma `Fiche ecole` (8:562), 1728 px.
 */
import type { School, SchoolFormation, SchoolSummary } from '~/core/contracts'

const props = defineProps<{
  school: School
  formations: SchoolFormation[]
  similarSchools: SchoolSummary[]
  destinationSlug: string
  domaine: string
  isFavourite: boolean
}>()

const emit = defineEmits<{
  favourite: []
  share: []
  'select-formation': [formation: SchoolFormation]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const ASSET = '/img/desktop/fiche-ecole'

const activeTab = ref<'presentation' | 'formations' | 'admissions'>('presentation')

const tabs = computed(() => [
  { value: 'presentation' as const, label: t('school.detail.tabPresentation') },
  { value: 'formations' as const, label: t('school.detail.tabFormations') },
  { value: 'admissions' as const, label: t('school.detail.tabAdmissions') },
])

const locationLabel = computed(() =>
  [props.school.city, props.school.country.name].filter(Boolean).join(' • '),
)

const ctaTo = computed(() => {
  if (props.domaine) return localePath(`/offres/${props.domaine}`)
  return localePath('/orientation')
})

function similarHref(item: SchoolSummary) {
  const base = `/destinations/${props.destinationSlug}/ecoles/${item.slug}`
  return localePath(props.domaine ? `${base}?domaine=${props.domaine}` : base)
}

function similarLocation(item: SchoolSummary) {
  return [item.city, item.country.name].filter(Boolean).join(', ')
}
</script>

<template>
  <div class="desktop-boxed flex items-start gap-23 pt-32 pb-32">
    <div class="flex min-w-0 flex-1 flex-col gap-23">
      <!-- Héros -->
      <div class="relative h-407 w-full overflow-hidden rounded-[16px] bg-[#0a1128] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <NuxtImg
          v-if="school.image"
          :src="school.image"
          :alt="school.title"
          width="1062"
          height="407"
          format="webp"
          sizes="1062px"
          class="pointer-events-none absolute inset-0 size-full object-cover"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(10,17,40,0.9)] via-[rgba(10,17,40,0.4)] to-transparent"
          aria-hidden="true"
        />

        <div class="absolute right-20 top-20 z-1 flex items-center gap-12">
          <button
            type="button"
            class="flex size-40 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            :aria-label="$t('school.detail.share')"
            @click="emit('share')"
          >
            <span class="size-16 overflow-clip">
              <img :src="`${ASSET}/share.svg`" alt="" width="16" height="16" class="block size-full">
            </span>
          </button>
          <button
            type="button"
            class="flex size-40 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
            :aria-label="$t('school.detail.favourite')"
            @click="emit('favourite')"
          >
            <span class="size-16 overflow-clip">
              <img
                v-if="!isFavourite"
                :src="`${ASSET}/heart.svg`"
                alt=""
                width="16"
                height="16"
                class="block size-full"
              >
              <QIcon v-else name="heart-filled" :size="16" class="text-[#ff1b40]" />
            </span>
          </button>
        </div>

        <div class="absolute inset-x-0 bottom-0 z-1 flex items-end gap-36 px-32 pb-24">
          <div class="flex h-198 w-189 shrink-0 items-center justify-center rounded-[16px] bg-white px-16 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
            <NuxtImg
              v-if="school.logo"
              :src="school.logo"
              :alt="school.title"
              width="150"
              height="52"
              format="webp"
              class="max-h-52 max-w-150 object-contain"
            />
            <QIcon v-else name="building" :size="40" class="text-muted" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-19 pb-20">
            <h1 class="m-0 text-[42px] leading-40 font-semibold tracking-[-0.9px] text-white">
              {{ school.title }}
            </h1>
            <p
              v-if="locationLabel"
              class="m-0 flex items-center gap-8 text-[16px] leading-20 font-medium tracking-[-0.154px] text-white/90"
            >
              <span class="size-16 shrink-0 overflow-clip">
                <img :src="`${ASSET}/pin.svg`" alt="" width="16" height="16" class="block size-full">
              </span>
              {{ locationLabel }}
            </p>
          </div>
        </div>
      </div>

      <!-- Onglets + contenu -->
      <div class="flex w-full flex-col gap-31 rounded-[16px] border border-[#f9fafb] bg-white p-33 shadow-[0_0_3px_rgba(0,0,0,0.12)]">
        <div
          class="flex gap-32 border-b border-[#efeff1]"
          role="tablist"
          :aria-label="$t('school.detail.tabsLabel')"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.value"
            class="cursor-pointer border-0 bg-transparent pb-16 text-[20px] leading-20 font-semibold tracking-[-0.154px]"
            :class="activeTab === tab.value
              ? 'border-b-2 border-[#ff1b40] pb-[18px] text-[#121212]'
              : 'text-[#6b7280]'"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-show="activeTab === 'presentation'" class="w-full">
          <RichText
            v-if="school.presentation"
            :content="school.presentation"
            class="text-[16px] leading-[22.75px] tracking-[-0.154px] text-[#252525] [&_p]:text-[16px] [&_p]:leading-[22.75px] [&_p]:text-[#252525]"
          />
          <p v-else class="m-0 text-[16px] leading-[22.75px] text-[#252525]">
            {{ $t('school.detail.emptyDescription') }}
          </p>
        </div>

        <div v-show="activeTab === 'formations'" class="flex w-full flex-col gap-16">
          <p v-if="formations.length === 0" class="m-0 text-[16px] leading-[22.75px] text-[#252525]">
            {{ $t('school.detail.emptyDescription') }}
          </p>
          <button
            v-for="formation in formations"
            :key="formation.title"
            type="button"
            class="flex w-full cursor-pointer items-start gap-16 rounded-[12px] border border-[#f3f4f6] bg-white p-20 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            @click="emit('select-formation', formation)"
          >
            <div class="min-w-0 flex-1">
              <h3 class="m-0 text-[16px] leading-20 font-semibold text-[#040c3d]">{{ formation.title }}</h3>
              <div class="flex flex-wrap items-center gap-12 pt-6 text-[13px] leading-[16.5px] font-medium text-[#65738f]">
                <span>{{ formation.grade }}</span>
                <span aria-hidden="true">|</span>
                <span>{{ formation.duration }}</span>
              </div>
              <p
                v-if="formation.summary"
                class="m-0 mt-6 line-clamp-3 text-[14px] leading-[19.5px] text-[#252525]"
              >
                {{ formation.summary }}
              </p>
            </div>
          </button>
        </div>

        <div v-show="activeTab === 'admissions'" class="w-full">
          <ul v-if="school.details.length > 0" class="m-0 flex list-none flex-col gap-16 p-0">
            <li v-for="item in school.details" :key="item.title" class="flex flex-col gap-6">
              <h3 class="m-0 text-[16px] leading-20 font-semibold text-[#040c3d]">{{ item.title }}</h3>
              <RichText
                v-if="item.description"
                :content="item.description"
                class="text-[16px] leading-[22.75px] text-[#252525] [&_p]:text-[16px] [&_p]:leading-[22.75px]"
              />
            </li>
          </ul>
          <p v-else class="m-0 text-[16px] leading-[22.75px] text-[#252525]">
            {{ $t('school.detail.emptyDescription') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Colonne droite 334 -->
    <aside class="flex w-334 shrink-0 flex-col gap-23">
      <div
        v-if="similarSchools.length > 0"
        class="flex w-full flex-col gap-12 rounded-[16px] border border-[#f9fafb] bg-white px-33 pt-30 pb-14 shadow-[0_0_3px_rgba(0,0,0,0.12)]"
      >
        <h2 class="m-0 text-[20px] leading-[25.5px] font-semibold tracking-[-0.442px] text-[#040c3d]">
          {{ $t('desktop.ficheEcole.similarTitle') }}
        </h2>
        <div class="flex w-full flex-col">
          <NuxtLink
            v-for="item in similarSchools"
            :key="item.id"
            :to="similarHref(item)"
            class="flex items-center gap-16 border-b border-[#efeff1] py-11 text-inherit no-underline last:border-b-0"
          >
            <div class="flex size-52 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#f3f4f6] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <NuxtImg
                v-if="item.logo"
                :src="item.logo"
                :alt="item.title"
                width="40"
                height="40"
                format="webp"
                class="max-h-40 max-w-40 object-contain"
              />
              <QIcon v-else name="building" :size="20" class="text-muted" />
            </div>
            <div class="flex min-w-0 flex-col gap-4">
              <p class="m-0 truncate text-[13px] leading-[16.25px] font-semibold tracking-[-0.078px] text-[#151515]">
                {{ item.title }}
              </p>
              <p
                v-if="similarLocation(item)"
                class="m-0 truncate text-[11px] leading-[16.5px] tracking-[0.066px] text-[#040c3d]"
              >
                {{ similarLocation(item) }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div class="flex w-full flex-col items-center gap-26 rounded-[16px] border border-[#fee2e2] bg-[#fff0f2] px-33 pt-33 pb-41">
        <div class="flex w-full items-start gap-16">
          <span class="flex size-56 shrink-0 items-center justify-center overflow-clip rounded-full bg-[#fbe7e9] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <span class="size-24 overflow-clip">
              <img :src="`${ASSET}/cta-headset.svg`" alt="" width="24" height="24" class="block size-full">
            </span>
          </span>
          <div class="flex min-w-0 flex-1 flex-col gap-8 pt-8">
            <p class="m-0 text-[13px] leading-28 font-semibold tracking-[-0.45px] text-[#040c3d]">
              {{ $t('desktop.ficheEcole.ctaTitle', { school: school.title }) }}
            </p>
            <p class="m-0 pb-16 text-[13px] leading-[19.5px] tracking-[-0.078px] text-[#040c3d]">
              {{ $t('desktop.ficheEcole.ctaDesc') }}
            </p>
          </div>
        </div>
        <NuxtLink
          :to="ctaTo"
          class="flex w-full items-center justify-center gap-8 rounded-[12px] bg-[#ff1b40] py-14 text-[14px] leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
        >
          {{ $t('desktop.ficheEcole.ctaButton') }}
          <span class="size-16 shrink-0 overflow-clip">
            <img :src="`${ASSET}/cta-arrow.svg`" alt="" width="16" height="16" class="block size-full">
          </span>
        </NuxtLink>
      </div>
    </aside>
  </div>
</template>
