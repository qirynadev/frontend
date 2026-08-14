<script setup lang="ts">
import type { AdmissionDocument } from '~/core/contracts/admission'

defineProps<{
  documents: AdmissionDocument[]
}>()
</script>

<template>
  <!-- La maquette cumule ici la marge du panneau (10px) et celle de la carte
       (10px) : contrairement à `.mpa-steps-card`, celle-ci porte la sienne. -->
  <section class="mpa-docs-card mt-10 w-full rounded-xl border border-[rgba(226,232,240,0.8)] bg-white p-17 px-1 box-border" :aria-label="$t('admission.docsTitle')">
    <h2 class="mpa-docs-title m-0 px-15 text-sm leading-[25.5px] font-bold text-[#0b0b0b]">{{ $t('admission.docsTitle') }}</h2>

    <div class="mpa-docs-banner mx-15 mt-16 flex min-h-86 items-start gap-11 rounded-xl bg-[#f5f3ff] p-9 box-border">
      <span class="mpa-docs-banner-icon size-44 shrink-0 overflow-hidden">
        <img src="/img/icons/ic-mpa-doc-info.svg" alt="" width="44" height="44" class="block size-full">
      </span>
      <div class="mpa-docs-banner-copy">
        <h3 class="m-0 text-base leading-20 font-bold text-[#191919]">{{ $t('admission.docsBannerTitle') }}</h3>
        <p class="m-0 mt-4 text-xs leading-16 font-normal text-[#191919]">{{ $t('admission.docsBannerDesc') }}</p>
      </div>
    </div>

    <ul class="mpa-docs-list m-0 mt-16 list-none p-0 px-15">
      <li
        v-for="doc in documents"
        :key="doc.id"
        class="mpa-doc-row flex items-center justify-between gap-12 rounded-xl border border-[#f3f4fb] bg-white p-15 box-border [&+:not(:first-child)]:mt-10"
      >
        <div class="mpa-doc-main min-w-0 flex-1 flex items-center gap-12">
          <span class="mpa-doc-icon size-40 shrink-0 overflow-hidden rounded-2xl">
            <img :src="doc.icon" alt="" width="40" height="40" class="block size-full">
          </span>
          <div class="mpa-doc-copy min-w-0">
            <h4 class="m-0 text-sm leading-[17.5px] font-medium text-[#0d153e]">
              {{ $t(doc.titleKey) }}
              <span v-if="doc.required" class="mpa-doc-required text-mpa-required">*</span>
            </h4>
            <p class="m-0 mt-2 text-base leading-15 font-medium text-[#94a3b8]">
              <template v-if="doc.fileCount && doc.fileCount > 1">
                {{ $t('admission.fileTypePdfs', { count: doc.fileCount }) }}
              </template>
              <template v-else>
                {{ $t('admission.fileTypePdf') }}
              </template>
            </p>
          </div>
        </div>

        <div class="mpa-doc-status flex shrink-0 items-center gap-5">
          <!-- Status validated -->
          <template v-if="doc.status === 'validated'">
            <span class="mpa-doc-badge mpa-doc-badge--validated inline-flex items-center gap-4 rounded-lg bg-mpa-doc-validated-bg px-10 py-4 text-sm leading-[16.5px] font-medium text-mpa-doc-validated whitespace-nowrap">
              <span>{{ $t('admission.statusValidated') }}</span>
              <img src="/img/icons/ic-mpa-doc-badge-check.png" alt="" width="11" height="11" class="block shrink-0">
            </span>
            <button type="button" class="mpa-doc-action flex size-12 cursor-pointer items-center justify-center border-0 bg-transparent p-0" :aria-label="$t('admission.downloadDoc')">
              <img src="/img/icons/ic-mpa-doc-download.svg" alt="" width="12" height="12" class="block size-full">
            </button>
          </template>

          <!-- Status pending -->
          <template v-else-if="doc.status === 'pending'">
            <span class="mpa-doc-badge mpa-doc-badge--pending inline-flex items-center gap-4 rounded-lg bg-mpa-doc-pending-bg px-10 py-4 text-sm leading-[16.5px] font-medium text-mpa-doc-pending whitespace-nowrap">
              <span>{{ $t('admission.statusPending') }}</span>
              <img src="/img/icons/ic-mpa-doc-badge-clock.png" alt="" width="10" height="10" class="block shrink-0">
            </span>
            <span class="mpa-doc-chevron flex h-16 w-12 items-center justify-center overflow-hidden pl-4" aria-hidden="true">
              <img src="/img/icons/ic-mpa-doc-chevron.png" alt="" width="12" height="16" class="block size-full">
            </span>
          </template>

          <!-- Status upload -->
          <template v-else-if="doc.status === 'upload'">
            <span class="mpa-doc-badge mpa-doc-badge--upload inline-flex items-center gap-6 rounded-lg bg-mpa-doc-upload-bg px-10 py-4 text-sm leading-[16.5px] font-medium text-mpa-doc-upload whitespace-nowrap">
              <span>{{ $t('admission.statusUpload') }}</span>
              <img src="/img/icons/ic-mpa-doc-badge-upload.png" alt="" width="12" height="12" class="block shrink-0">
            </span>
            <span class="mpa-doc-chevron flex h-16 w-12 items-center justify-center overflow-hidden pl-4" aria-hidden="true">
              <img src="/img/icons/ic-mpa-doc-chevron.png" alt="" width="12" height="16" class="block size-full">
            </span>
          </template>
        </div>
      </li>
    </ul>
  </section>
</template>
