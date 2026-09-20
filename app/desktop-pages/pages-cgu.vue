<script setup lang="ts">
/**
 * CGU desktop — même chrome que privacy / cookies, texte CMS.
 */
import type { LegalDocument } from '~/utils/split-legal-html'

defineProps<{
  title: string
  intro: string
  document: LegalDocument | null
}>()
</script>

<template>
  <div class="desktop-boxed flex flex-col gap-23 pt-32 pb-32">
    <AppLegalHeader :title="title" :intro="intro" :updated="document?.updated" />

    <div class="rounded-[16px] bg-rml-rights-info p-24">
      <p class="m-0 text-[14px] leading-[22px] font-medium text-[#1e1b4b]">
        {{ $t('legalPage.cguLead') }}
      </p>
    </div>

    <AppLegalSections v-if="document" :sections="document.sections" />

    <AppLegalContact
      :title="$t('settingsLegal.helpTitle')"
      :description="$t('settingsLegal.helpDesc')"
      :email="$t('legalPage.contactEmail')"
    />
  </div>
</template>
