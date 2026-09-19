<script setup lang="ts">
/**
 * Politique de confidentialité desktop — même chrome que cookies, texte CMS.
 */
import type { LegalDocument } from '~/utils/split-legal-html'

defineProps<{
  title: string
  intro: string
  document: LegalDocument | null
}>()

const localePath = useLocalePath()
</script>

<template>
  <div class="desktop-boxed flex flex-col gap-23 pt-32 pb-32">
    <AppLegalHeader :title="title" :intro="intro" :updated="document?.updated" />

    <div class="rounded-[16px] bg-rml-rights-info p-24">
      <p class="m-0 text-[14px] leading-[22px] font-medium text-[#1e1b4b]">
        {{ $t('legalPage.privacyLead') }}
      </p>
    </div>

    <AppLegalSections v-if="document" :sections="document.sections" />

    <NuxtLink
      :to="localePath('/reglages/exercer-mes-droits')"
      class="flex w-full items-center justify-between rounded-[16px] border border-[#f3f4f6] bg-white p-24 text-inherit no-underline shadow-[0_0_3px_rgba(0,0,0,0.12)]"
    >
      <span>
        <span class="block text-[16px] leading-22 font-semibold text-[#151515]">
          {{ $t('legalPage.rightsTitle') }}
        </span>
        <span class="mt-4 block text-[13px] leading-18 text-[#6b7280]">
          {{ $t('legalPage.rightsCta') }}
        </span>
      </span>
      <img src="/img/icons/legal-hub/ic-ril-chevron.svg" alt="" width="20" height="20" class="ml-8 block size-20">
    </NuxtLink>

    <AppLegalContact
      :title="$t('settingsLegal.helpTitle')"
      :description="$t('settingsLegal.helpDesc')"
      :email="$t('legalPage.contactEmail')"
    />
  </div>
</template>
