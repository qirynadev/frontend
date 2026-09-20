<script setup lang="ts">
/**
 * Politique de cookies desktop — Figma mobile `1562:1890`, pas d’artboard 1728.
 * Boxed, pas de rail réglages : page publique (footer + mentions).
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
        {{ $t('legalCookies.introCard') }}
      </p>
    </div>

    <AppCookieExtras wide />

    <AppLegalSections v-if="document" :sections="document.sections" />

    <AppLegalContact
      :title="$t('legalCookies.questionTitle')"
      :description="$t('legalCookies.questionDesc')"
      :email="$t('legalPage.contactEmail')"
    />
  </div>
</template>
