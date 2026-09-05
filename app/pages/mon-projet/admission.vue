<script setup lang="ts">
/**
 * Mon projet — Admission école ← `maquette/pwa/pages/mon-projet-admission.html`.
 *
 * Écran de suivi du dossier d'admission école (ESA Paris),
 * protégé par le middleware `auth`.
 *
 * Onglets : Aperçu + Document (Suivi & échanges retiré).
 */
import MpaDocsCard from '~/components/admission/MpaDocsCard.vue'
import MpaStepsCard from '~/components/admission/MpaStepsCard.vue'

definePageMeta({
  middleware: 'auth',
})

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const { data: admission, apiError, isInitialLoading, refresh } = await useAdmissionData(locale)

type TabId = 'apercu' | 'document'
const activeTab = ref<TabId>('apercu')

onMounted(() => {
  const tabFromQuery = route.query.tab as string
  if (tabFromQuery === 'document') {
    activeTab.value = 'document'
  } else {
    activeTab.value = 'apercu'
    if (tabFromQuery) {
      router.replace({ query: { ...route.query, tab: undefined } })
    }
  }
})

function setTab(tab: TabId) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab: tab === 'apercu' ? undefined : tab } })
}

usePageSeo(() => ({
  title: t('admission.seoTitle'),
  description: t('admission.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-mpa flex flex-1 flex-col bg-white">
    <div class="mpa-main flex flex-col gap-22 box-border">
      <!-- Topbar : Retour + Logo + Cloche de notifications -->
      <AppTopBar :back="true" back-to="/mon-projet" :gap="0" />

      <PageState
        :loading="isInitialLoading"
        :error="apiError"
        :empty="!admission?.order"
        :empty-title="$t('admission.emptyTitle')"
        :empty-description="$t('admission.emptyDescription')"
        :on-retry="() => refresh()"
      >
        <template #loading>
          <div class="flex flex-col gap-16">
            <QSkeleton variant="rect" :height="52" />
            <QSkeleton variant="rect" :height="320" />
          </div>
        </template>

        <template v-if="admission?.order">
          <div class="mpa-tabs flex w-full rounded-[14px] border border-[#f8f8fc] bg-[#fdfdfd] p-1 box-border" role="tablist" :aria-label="$t('admission.tabsLabel')">
            <button
              type="button"
              :class="[
                'mpa-tab flex-1 flex flex-row items-center justify-center gap-8 border rounded-xl px-12 py-12 text-md font-medium leading-[19.5px] cursor-pointer box-border transition-colors duration-150',
                activeTab === 'apercu'
                  ? 'is-active bg-[#f8f7ff] border-[#e2dff5] text-[#2d00fc]'
                  : 'border-transparent bg-transparent text-black',
              ]"
              role="tab"
              :aria-selected="activeTab === 'apercu'"
              @click="setTab('apercu')"
            >
              <img class="mpa-tab-icon block size-16 shrink-0 object-contain" src="/img/icons/ic-mpa-tab-apercu.svg" alt="" width="15" height="14">
              <span>{{ $t('admission.tabApercu') }}</span>
            </button>

            <button
              type="button"
              :class="[
                'mpa-tab flex-1 flex flex-row items-center justify-center gap-8 border rounded-xl px-12 py-12 text-md font-medium leading-[19.5px] cursor-pointer box-border transition-colors duration-150',
                activeTab === 'document'
                  ? 'is-active bg-[#f8f7ff] border-[#e2dff5] text-[#2d00fc]'
                  : 'border-transparent bg-transparent text-black',
              ]"
              role="tab"
              :aria-selected="activeTab === 'document'"
              @click="setTab('document')"
            >
              <img class="mpa-tab-icon block size-16 shrink-0 object-contain" src="/img/icons/ic-mpa-tab-document.svg" alt="" width="13" height="17">
              <span>{{ $t('admission.tabDocument') }}</span>
            </button>
          </div>

          <div v-show="activeTab === 'apercu'" class="mpa-panel w-full">
            <MpaStepsCard v-if="admission.steps.length > 0" :steps="admission.steps" />
            <QEmptyState v-else icon="clock" :title="$t('admission.stepsEmptyTitle')" :description="$t('admission.stepsEmptyDescription')" />
          </div>

          <div v-show="activeTab === 'document'" class="mpa-panel w-full">
            <MpaDocsCard
              :documents="admission.documents"
              :order-id="admission.order.id"
              :locked="admission.documentsLocked"
              :finalized-at="admission.documentsFinalizedAt"
              @changed="refresh()"
            />
          </div>

          <section class="mpa-help flex w-full items-center justify-between gap-8 rounded-xl bg-[#f5f3ff] p-9 box-border">
            <div class="mpa-help-main flex min-w-0 flex-1 items-start gap-11">
              <span class="mpa-help-icon flex size-44 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e2fd]">
                <img src="/img/icons/ic-mpa-headset.svg" alt="" width="24" height="24" class="block size-24">
              </span>
              <div class="mpa-help-copy">
                <h3 class="m-0 text-base leading-20 font-bold text-[#191919]">{{ $t('admission.helpTitle') }}</h3>
                <p class="m-0 mt-4 text-xs leading-16 font-normal text-[#191919]">{{ $t('admission.helpDesc') }}</p>
              </div>
            </div>
            <a href="#" class="mpa-help-btn shrink-0 whitespace-nowrap rounded-xl border border-[#450ff2] bg-[#450ffd] px-11 py-9 text-center text-sm leading-16 font-medium text-white no-underline">
              {{ $t('admission.contactAdvisor') }}
            </a>
          </section>
        </template>
      </PageState>
    </div>
  </div>
</template>
