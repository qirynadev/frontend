<script setup lang="ts">
/**
 * Informations légales desktop — mêmes lignes que le hub mobile.
 */
import { NuxtLink } from '#components'

const localePath = useLocalePath()
const { reset: resetCookieConsent } = useCookieConsent()
const ICON = '/img/icons/legal-hub'

interface LegalRow {
  id: string
  icon: string
  titleKey: string
  descKey: string
  to?: string | null
  action?: 'cookies'
  tile?: boolean
}

const sections: { titleKey: string, rows: LegalRow[] }[] = [
  {
    titleKey: 'settingsLegal.sectionService',
    rows: [
      { id: 'cgu', icon: 'ic-ril-cgu', titleKey: 'settingsLegal.cguTitle', descKey: 'settingsLegal.cguDesc', to: '/pages/cgu', tile: true },
      { id: 'cgv', icon: 'ic-ril-cgv', titleKey: 'settingsLegal.cgvTitle', descKey: 'settingsLegal.cgvDesc', to: null, tile: true },
    ],
  },
  {
    titleKey: 'settingsLegal.sectionData',
    rows: [
      { id: 'privacy', icon: 'ic-ril-privacy', titleKey: 'settingsLegal.privacyTitle', descKey: 'settingsLegal.privacyDesc', to: '/pages/privacy' },
      { id: 'cookies', icon: 'ic-ril-cookies', titleKey: 'settingsLegal.cookiesTitle', descKey: 'settingsLegal.cookiesDesc', to: '/pages/cookies' },
      { id: 'cookies-manage', icon: 'ic-ril-toggle', titleKey: 'settingsLegal.cookiesManageTitle', descKey: 'settingsLegal.cookiesManageDesc', action: 'cookies' },
      { id: 'rights', icon: 'ic-ril-rights', titleKey: 'settingsLegal.rightsTitle', descKey: 'settingsLegal.rightsDesc', to: '/reglages/exercer-mes-droits' },
    ],
  },
  {
    titleKey: 'settingsLegal.sectionEditor',
    rows: [
      { id: 'legal', icon: 'ic-ril-info', titleKey: 'settingsLegal.legalTitle', descKey: 'settingsLegal.legalDesc', to: '/reglages/mentions-legales' },
    ],
  },
]

function rowTag(row: LegalRow) {
  if (row.action === 'cookies') return 'button'
  if (row.to) return NuxtLink
  return 'div'
}
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsLegal.title')" :intro="$t('settingsLegal.intro')">
    <aside class="flex items-start rounded-[16px] bg-[#f8f8fc] p-24">
      <span class="flex size-48 shrink-0 items-center justify-center rounded-full bg-white">
        <img :src="`${ICON}/ic-ril-trust.svg`" alt="" width="24" height="24" class="block size-24">
      </span>
      <div class="min-w-0 flex-1 pl-16">
        <p class="m-0 text-[16px] leading-24 font-semibold text-[#040c3d]">{{ $t('settingsLegal.trustTitle') }}</p>
        <p class="m-0 mt-4 text-[14px] leading-20 text-[#6b7280]">{{ $t('settingsLegal.trustDesc') }}</p>
      </div>
    </aside>

    <section v-for="section in sections" :key="section.titleKey" class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-medium text-[#6b7280]">{{ $t(section.titleKey) }}</h2>
      <div class="overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white">
        <component
          :is="rowTag(row)"
          v-for="(row, index) in section.rows"
          :key="row.id"
          :to="row.to ? localePath(row.to) : undefined"
          :type="row.action === 'cookies' ? 'button' : undefined"
          class="flex w-full items-center justify-between p-20 text-left text-inherit no-underline"
          :class="[
            row.action === 'cookies' ? 'cursor-pointer border-0 bg-transparent' : '',
            index > 0 ? 'border-t border-[#f3f4f6]' : '',
          ]"
          @click="row.action === 'cookies' ? resetCookieConsent() : undefined"
        >
          <span class="flex min-w-0 flex-1 items-start">
            <span v-if="row.tile" class="size-40 shrink-0 overflow-hidden">
              <img :src="`${ICON}/${row.icon}.svg`" alt="" width="40" height="40" class="block size-40">
            </span>
            <span v-else class="flex size-40 shrink-0 items-center justify-center rounded-[12px] bg-[#f8f8fc]">
              <img :src="`${ICON}/${row.icon}.svg`" alt="" width="20" height="20" class="block size-20">
            </span>
            <span class="flex min-w-0 flex-1 flex-col pl-16">
              <span class="text-[15px] leading-22 font-medium text-[#151515]">{{ $t(row.titleKey) }}</span>
              <span class="mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t(row.descKey) }}</span>
            </span>
          </span>
          <img :src="`${ICON}/ic-ril-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
        </component>
      </div>
    </section>

    <a
      class="flex w-full items-center justify-between rounded-[16px] bg-[#fff5f6] p-24 text-inherit no-underline"
      :href="`mailto:${$t('settingsLegal.helpEmail')}`"
    >
      <span class="flex min-w-0 items-start">
        <span class="size-40 shrink-0 overflow-hidden">
          <img :src="`${ICON}/ic-ril-mail.svg`" alt="" width="40" height="40" class="block size-40">
        </span>
        <span class="flex min-w-0 flex-1 flex-col pl-16">
          <span class="text-[16px] leading-22 font-semibold text-[#040c3d]">{{ $t('settingsLegal.helpTitle') }}</span>
          <span class="mt-4 text-[14px] leading-20 text-[#6b7280]">
            {{ $t('settingsLegal.helpDesc') }} {{ $t('settingsLegal.helpEmail') }}
          </span>
        </span>
      </span>
      <img :src="`${ICON}/ic-ril-mail-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
    </a>
  </AppDesktopReglagesShell>
</template>
