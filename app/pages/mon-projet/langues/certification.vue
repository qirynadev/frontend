<script setup lang="ts">
/**
 * Étape 5 — Certification ← Figma `863:1956` « Mon Projet - Langues 4 ».
 * Mise en page alignée sur l’écran orientation (mêmes blocs), textes langue.
 * Données hors API : `projet-langue-mock.ts` + `docs/mon-projet-langue-mocks.md`.
 */
import {
  langueCertificationPct,
  langueCertificationSteps,
} from '~/config/projet-langue-mock'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()

const infoKeys = [
  'languageProject.certInfo1',
  'languageProject.certInfo2',
  'languageProject.certInfo3',
]

usePageSeo(() => ({
  title: t('languageProject.certSeoTitle'),
  description: t('languageProject.certSeoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="flex w-full flex-col gap-22 pb-22">
    <AppTopBar back back-to="/mon-projet/langues" :gap="0" />

    <!-- Ma progression 100 % -->
    <section
      class="box-border flex w-full flex-col rounded-[10px] border border-[#f3f4f6] bg-[#fefefe] px-19 py-25 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
      aria-labelledby="lang-cert-progress-title"
    >
      <div class="flex w-full items-start justify-between gap-12">
        <div class="min-w-0 flex-1">
          <h1 id="lang-cert-progress-title" class="m-0 text-[18px] leading-28 font-bold text-[#0a142f]">
            {{ $t('languageProject.progressTitle') }}
          </h1>
          <p class="m-0 pt-4 text-[10px] leading-20 font-normal text-[rgba(10,20,47,0.7)]">
            {{ $t('languageProject.certProgressHint') }}
          </p>
        </div>
        <div class="flex shrink-0 flex-col items-end">
          <p class="m-0 text-[24px] leading-30 font-bold text-[#fc037f]">{{ langueCertificationPct }}%</p>
          <p class="m-0 text-[12px] leading-16 font-medium tracking-[0.3px] text-[#0a142f]">
            {{ $t('languageProject.progressDone') }}
          </p>
        </div>
      </div>

      <div class="w-full pt-16">
        <div class="h-6 w-full overflow-hidden rounded-full bg-[#e8e8ff]">
          <div class="h-6 w-full rounded-full bg-[#fc037f]" />
        </div>
      </div>

      <div class="relative flex w-full items-start justify-between pt-24">
        <div class="pointer-events-none absolute top-41 left-47 right-47 h-0 border-t border-[#e5e7eb]" aria-hidden="true" />
        <div
          v-for="step in langueCertificationSteps"
          :key="step.id"
          class="relative z-1 flex w-64 flex-col items-center gap-8"
        >
          <span class="flex size-32 items-center justify-center rounded-full bg-[#fb027d]">
            <img src="/img/icons/mpl-langue/check.svg" alt="" width="16" height="16" class="block size-16">
          </span>
          <p class="m-0 whitespace-pre-line text-center text-[10px] leading-[12.5px] font-normal text-black">
            {{ $t(step.labelKey) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Profil / rapport prêt -->
    <section class="box-border flex w-full flex-col gap-12 rounded-[10px] border border-[#ffe5ee] bg-[#fff6f9] p-17 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div class="flex items-center gap-10">
        <div class="h-102 w-109 shrink-0 overflow-hidden">
          <img src="/img/mpo-profile-ready.png" alt="" width="109" height="102" class="block h-102 w-109 object-cover">
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="m-0 text-[14px] leading-[18.75px] font-bold text-[#0a142f]">
            {{ $t('languageProject.certProfileTitle') }}
          </h2>
          <p class="m-0 pt-4 pr-4 text-[11.5px] leading-[15.525px] font-normal text-[#4b5563]">
            {{ $t('languageProject.certProfileDesc') }}
          </p>
        </div>
      </div>
      <div class="flex gap-12">
        <span class="inline-flex min-w-0 flex-1 items-center gap-6 rounded-lg border border-[#ffe5ee] bg-white px-11 py-7 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <img src="/img/icons/ic-mpo-report.svg" alt="" width="16" height="16" class="block size-16 shrink-0">
          <span class="text-[10px] leading-15 font-semibold text-[#0a142f]">{{ $t('languageProject.certReportBadge') }}</span>
        </span>
        <button
          type="button"
          class="inline-flex flex-1 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#f05] px-16 py-10 text-[11px] leading-[16.5px] font-semibold whitespace-nowrap text-white"
        >
          {{ $t('languageProject.certSeeReport') }}
        </button>
      </div>
    </section>

    <!-- Test de niveau -->
    <section class="box-border flex w-full flex-col rounded-[10px] border border-[#f6f7fb] bg-[#fbfbfe] px-11 py-17 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div class="flex items-start">
        <div class="size-85 shrink-0 overflow-hidden">
          <img src="/img/mpo-test-clipboard.png" alt="" width="85" height="85" class="block size-85 object-cover">
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-15 px-8 pt-4">
          <div>
            <h2 class="m-0 text-[14px] leading-[18.75px] font-bold text-[#0a142f]">
              {{ $t('languageProject.certTestTitle') }}
            </h2>
            <p class="m-0 pt-4 text-[11.5px] leading-[15.525px] font-normal text-[#4b5563]">
              {{ $t('languageProject.certTestDesc') }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex w-fit max-w-full cursor-pointer items-center gap-6 rounded-[5px] border border-[#4545f7] bg-white px-13 py-9 text-[11px] leading-[16.5px] font-medium text-[#4545f7]"
          >
            <img src="/img/icons/ic-mpo-external.svg" alt="" width="14" height="14" class="block size-14 shrink-0">
            <span>{{ $t('languageProject.certRetakeTest') }}</span>
          </button>
        </div>
        <div class="h-81 w-96 shrink-0 self-end overflow-hidden">
          <img src="/img/mpo-test-laptop.png" alt="" width="96" height="81" class="block h-81 w-96 object-cover">
        </div>
      </div>
    </section>

    <!-- À savoir -->
    <section class="box-border flex w-full flex-col rounded-[10px] border border-[#f3f4f6] bg-[#f4f7fb] p-21 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div class="flex items-center gap-8">
        <img src="/img/icons/ic-mpo-info.svg" alt="" width="17" height="17" class="block size-17 shrink-0">
        <h2 class="m-0 text-[15px] leading-[22.5px] font-medium text-[#0000f9]">{{ $t('languageProject.certInfoTitle') }}</h2>
      </div>
      <ul class="m-0 flex list-none flex-col gap-14 p-0 pt-16">
        <li v-for="key in infoKeys" :key="key" class="flex items-start gap-12">
          <span class="mt-2 flex size-16 shrink-0 items-center justify-center rounded-full border border-[#0805fe]">
            <img src="/img/icons/ic-mpo-list-check.svg" alt="" width="10" height="10" class="block size-10">
          </span>
          <span class="text-[12.5px] leading-[17.188px] font-normal text-[#121212]">{{ $t(key) }}</span>
        </li>
      </ul>
    </section>

    <!-- Aide -->
    <section class="box-border flex w-full items-center justify-between gap-8 rounded-[10px] bg-[#fff6f8] px-9 py-13">
      <div class="flex min-w-0 flex-1 items-center gap-10">
        <div class="h-56 w-60 shrink-0 overflow-hidden">
          <img src="/img/mpo-advisor.png" alt="" width="60" height="56" class="block h-56 w-60 object-cover">
        </div>
        <div class="min-w-0">
          <h3 class="m-0 text-[10px] leading-20 font-bold text-[#191919]">{{ $t('languageProject.certHelpTitle') }}</h3>
          <p class="m-0 text-[9px] leading-16 font-normal text-[#191919]">{{ $t('languageProject.certHelpDesc') }}</p>
        </div>
      </div>
      <NuxtLink
        :to="localePath('/messages')"
        class="shrink-0 rounded-[10px] border border-[#fe448b] bg-transparent px-8 py-9 text-[10px] leading-16 font-medium whitespace-nowrap text-[#fe448b] no-underline"
      >
        {{ $t('languageProject.certContact') }}
      </NuxtLink>
    </section>
  </div>
</template>
