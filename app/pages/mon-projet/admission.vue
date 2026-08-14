<script setup lang="ts">
/**
 * Mon projet — Admission école ← `maquette/pwa/pages/mon-projet-admission.html`.
 *
 * Écran de suivi du dossier d'admission école (ESA Paris),
 * protégé par le middleware `auth`.
 */
import MpaDocsCard from '~/components/admission/MpaDocsCard.vue'
import MpaStepsCard from '~/components/admission/MpaStepsCard.vue'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const { data: admissionData } = useAdmissionData()

type TabId = 'apercu' | 'document' | 'suivi'
const activeTab = ref<TabId>('apercu')

// Initialiser l'onglet depuis le paramètre de requête `?tab=`, défaut sur 'apercu'
onMounted(() => {
  const tabFromQuery = route.query.tab as string
  if (tabFromQuery && ['apercu', 'document', 'suivi'].includes(tabFromQuery)) {
    activeTab.value = tabFromQuery as TabId
  } else {
    activeTab.value = 'apercu'
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
  <div class="page-mpa flex min-h-screen flex-1 flex-col bg-white">
    <!-- Les gouttières (16px latéraux) et le retrait supérieur viennent du
         layout mobile ; ne pas les doubler ici (cf. `mon-projet/index.vue`). -->
    <div class="mpa-main flex flex-col pb-[var(--spacing-content-bottom)] box-border">
      <!-- Topbar : Retour + Logo + Cloche de notifications -->
      <AppTopBar :back="true" back-to="/mon-projet" :notifications="3" />

      <!-- Carte d'en-tête de l'école -->
      <section class="mpa-school mt-25 w-full rounded-xl border border-[rgba(226,232,240,0.8)] bg-white p-17 box-border shadow-xs" :aria-label="$t('admission.schoolFolder')">
        <div class="mpa-school-top flex items-start gap-14">
          <span class="mpa-school-icon flex size-56 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3efff]">
            <img src="/img/icons/ic-mp-admission.png" alt="" width="30" height="30" class="block size-30 object-contain">
          </span>
          <div class="mpa-school-copy min-w-0 flex-1">
            <div class="mpa-school-title-row flex flex-wrap items-center gap-8">
              <h1 class="m-0 text-4xl leading-[25px] font-bold text-[#0f1011]">{{ admissionData.school.name }}</h1>
              <span class="mpa-school-badge rounded-md bg-[#f0ebfe] px-10 py-2 text-md leading-[16.5px] font-semibold text-[#2400fd]">
                {{ $t(admissionData.school.statusKey) }}
              </span>
            </div>
            <p class="mpa-school-program m-0 mt-4 text-exact-13-5 font-normal text-[#0f1011]">
              {{ admissionData.school.program }}
            </p>
            <p class="mpa-school-date mt-6 flex items-center gap-6 text-base leading-18 text-black">
              <img src="/img/icons/ic-mpa-calendar.svg" alt="" width="9" height="10" class="block h-10 w-9 shrink-0">
              <span>{{ $t('admission.entry', { date: admissionData.school.entryDate }) }}</span>
            </p>
            <div class="mpa-school-progress mt-12 flex items-center gap-12">
              <span class="mpa-school-track h-4 max-w-185 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                <span class="mpa-school-fill block h-full rounded-full bg-[#3909fd]" :style="{ width: `${admissionData.school.progressPercent}%` }" />
              </span>
              <span class="mpa-school-pct text-exact-13-5 leading-[20.25px] font-bold text-black">{{ admissionData.school.progressPercent }}%</span>
            </div>
            <div class="mpa-school-meta mt-5 flex items-center justify-between gap-8 border-t border-[rgba(241,245,249,0.8)] pt-5">
              <span class="mpa-school-advisor flex items-center gap-6 text-exact-11-5 font-medium text-[#64748b]">
                <img src="/img/icons/ic-user.svg" alt="" width="11" height="11" class="block size-11">
                <span>{{ $t('admission.advisor') }}<strong class="font-medium text-[#1b1b1b]">{{ admissionData.school.advisorName }}</strong></span>
              </span>
              <span class="mpa-school-updated whitespace-nowrap text-sm leading-[17.25px] font-medium text-[#2c2c2c]">
                {{ $t(admissionData.school.lastUpdateKey) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Onglets de section -->
      <div class="mpa-tabs mt-16 flex min-h-66 w-full rounded-[14px] border border-[#f8f8fc] bg-[#fdfdfd] p-1 box-border" role="tablist" :aria-label="$t('admission.tabsLabel')">
        <button
          type="button"
          :class="[
            'mpa-tab flex-1 flex flex-col items-center justify-center gap-8 border rounded-xl px-12 pt-10 pb-11 text-md font-medium leading-[19.5px] cursor-pointer box-border transition-colors duration-150',
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
            'mpa-tab flex-1 flex flex-col items-center justify-center gap-8 border rounded-xl px-12 pt-10 pb-11 text-md font-medium leading-[19.5px] cursor-pointer box-border transition-colors duration-150',
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

        <button
          type="button"
          :class="[
            'mpa-tab flex-1 flex flex-col items-center justify-center gap-8 border rounded-xl px-12 pt-10 pb-11 text-md font-medium leading-[19.5px] cursor-pointer box-border transition-colors duration-150',
            activeTab === 'suivi'
              ? 'is-active bg-[#f8f7ff] border-[#e2dff5] text-[#2d00fc]'
              : 'border-transparent bg-transparent text-black',
          ]"
          role="tab"
          :aria-selected="activeTab === 'suivi'"
          @click="setTab('suivi')"
        >
          <img class="mpa-tab-icon block size-16 shrink-0 object-contain" src="/img/icons/ic-mpa-tab-suivi.svg" alt="" width="13" height="13">
          <span>{{ $t('admission.tabSuivi') }}</span>
        </button>
      </div>

      <!-- Panneau Aperçu (actif par défaut) -->
      <div v-show="activeTab === 'apercu'" class="mpa-panel mt-10 w-full">
        <MpaStepsCard :steps="admissionData.steps" />
      </div>

      <!-- Panneau Document -->
      <div v-show="activeTab === 'document'" class="mpa-panel mt-10 w-full">
        <MpaDocsCard :documents="admissionData.documents" />
      </div>

      <!-- Panneau Suivi & échanges -->
      <div v-show="activeTab === 'suivi'" class="mpa-panel mt-10 w-full">
        <div class="mpa-placeholder rounded-xl border border-[#e7e7f3] bg-[#fbfbfe] p-20 px-16">
          <!-- La maquette ne fixe pas d'interligne ici : `normal` (20,8px à
               14px de Jost), pas le barreau 20px. -->
          <p class="mpa-placeholder-title m-0 mb-6 text-xl leading-[normal] font-bold text-[#191919]">{{ $t('admission.suiviTitle') }}</p>
          <p class="mpa-placeholder-desc m-0 text-base leading-18 text-[#475569]">{{ $t('admission.suiviDesc') }}</p>
        </div>
      </div>

      <!-- Section Besoin d'aide -->
      <section class="mpa-help mt-20 flex w-full items-center justify-between gap-8 rounded-xl bg-[#f5f3ff] p-9 box-border">
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
    </div>
  </div>
</template>
