<script setup lang="ts">
/**
 * Exercer mes droits desktop — mêmes actions que le mobile.
 */
import { NuxtLink } from '#components'

const localePath = useLocalePath()
const { reset: resetCookieConsent } = useCookieConsent()
const ICON = '/img/icons/legal-rights'
const PRIVACY_MAIL = 'mailto:privacy@qiryna.com'
const CNIL_URL = 'https://www.cnil.fr/fr/plaintes'

interface RightsRow {
  id: string
  icon: string
  chevron: string
  titleKey: string
  descKey: string
  to?: string
  href?: string
  action?: 'cookies'
  danger?: boolean
  tileClass?: string
}

const immediateRows: RightsRow[] = [
  {
    id: 'download',
    icon: 'ic-rrd-download-line',
    chevron: 'ic-rrd-chevron',
    titleKey: 'settingsRights.downloadTitle',
    descKey: 'settingsRights.downloadDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Télécharger mes données')}`,
    tileClass: 'bg-[#f3e8ff]',
  },
  {
    id: 'correct',
    icon: 'ic-rrd-edit-line',
    chevron: 'ic-rrd-chevron-2',
    titleKey: 'settingsRights.correctTitle',
    descKey: 'settingsRights.correctDesc',
    to: '/reglages/informations-personnelles',
    tileClass: 'bg-[#f3e8ff]',
  },
  {
    id: 'withdraw',
    icon: 'ic-rrd-consent-line',
    chevron: 'ic-rrd-chevron-2',
    titleKey: 'settingsRights.withdrawTitle',
    descKey: 'settingsRights.withdrawDesc',
    action: 'cookies',
    tileClass: 'bg-[#f3e8ff]',
  },
  {
    id: 'delete',
    icon: 'ic-rrd-trash',
    chevron: 'ic-rrd-chevron-danger',
    titleKey: 'settingsRights.deleteTitle',
    descKey: 'settingsRights.deleteDesc',
    to: '/reglages/informations-personnelles',
    danger: true,
    tileClass: 'bg-[#fef2f2]',
  },
]

const teamRows: RightsRow[] = [
  {
    id: 'object',
    icon: 'ic-rrd-hand',
    chevron: 'ic-rrd-chevron-team',
    titleKey: 'settingsRights.objectTitle',
    descKey: 'settingsRights.objectDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Opposition à un traitement')}`,
    tileClass: 'bg-[#f8f8fc]',
  },
  {
    id: 'limit',
    icon: 'ic-rrd-limit',
    chevron: 'ic-rrd-chevron-team',
    titleKey: 'settingsRights.limitTitle',
    descKey: 'settingsRights.limitDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Limitation d’un traitement')}`,
    tileClass: 'bg-[#f8f8fc]',
  },
  {
    id: 'rep',
    icon: 'ic-rrd-rep',
    chevron: 'ic-rrd-chevron-team',
    titleKey: 'settingsRights.legalRepTitle',
    descKey: 'settingsRights.legalRepDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Demande d’un représentant légal')}`,
    tileClass: 'bg-[#f8f8fc]',
  },
  {
    id: 'post-death',
    icon: 'ic-rrd-directives',
    chevron: 'ic-rrd-chevron-team',
    titleKey: 'settingsRights.postDeathTitle',
    descKey: 'settingsRights.postDeathDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Directives après mon décès')}`,
    tileClass: 'bg-[#f8f8fc]',
  },
]

function rowTag(row: RightsRow) {
  if (row.action === 'cookies') return 'button'
  if (row.to) return NuxtLink
  if (row.href) return 'a'
  return 'div'
}
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsRights.title')" :intro="$t('settingsRights.intro')">
    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-medium text-[#6b7280]">{{ $t('settingsRights.immediate') }}</h2>
      <div class="overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white">
        <component
          :is="rowTag(row)"
          v-for="(row, index) in immediateRows"
          :key="row.id"
          :to="row.to ? localePath(row.to) : undefined"
          :href="row.href"
          :type="row.action === 'cookies' ? 'button' : undefined"
          class="flex w-full items-center p-20 text-left text-inherit no-underline"
          :class="[
            row.action === 'cookies' ? 'cursor-pointer border-0 bg-transparent' : '',
            index > 0 ? 'border-t border-[#f3f4f6]' : '',
          ]"
          @click="row.action === 'cookies' ? resetCookieConsent() : undefined"
        >
          <span :class="['mr-16 flex size-48 shrink-0 items-center justify-center rounded-[12px]', row.tileClass]">
            <img :src="`${ICON}/${row.icon}.svg`" alt="" width="24" height="24" class="block size-24" loading="lazy" decoding="async">
          </span>
          <span class="flex min-w-0 flex-1 flex-col pr-8">
            <span :class="['text-[14px] leading-20 font-medium', row.danger ? 'text-[#e71816]' : 'text-[#151515]']">
              {{ $t(row.titleKey) }}
            </span>
            <span class="mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t(row.descKey) }}</span>
          </span>
          <img :src="`${ICON}/${row.chevron}.svg`" alt="" width="20" height="20" class="block size-20 shrink-0" loading="lazy" decoding="async">
        </component>
      </div>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-medium text-[#6b7280]">{{ $t('settingsRights.team') }}</h2>
      <div class="overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white">
        <a
          v-for="(row, index) in teamRows"
          :key="row.id"
          :href="row.href"
          class="flex w-full items-center p-20 text-inherit no-underline"
          :class="index > 0 ? 'border-t border-[#f3f4f6]' : ''"
        >
          <span :class="['mr-16 flex size-48 shrink-0 items-center justify-center rounded-[12px]', row.tileClass]">
            <img :src="`${ICON}/${row.icon}.svg`" alt="" width="24" height="24" class="block size-24" loading="lazy" decoding="async">
          </span>
          <span class="flex min-w-0 flex-1 flex-col pr-8">
            <span class="text-[14px] leading-20 font-medium text-[#151515]">{{ $t(row.titleKey) }}</span>
            <span class="mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t(row.descKey) }}</span>
          </span>
          <img :src="`${ICON}/${row.chevron}.svg`" alt="" width="20" height="20" class="block size-20 shrink-0" loading="lazy" decoding="async">
        </a>
      </div>
    </section>

    <section class="flex flex-col gap-16">
      <h2 class="m-0 text-[14px] leading-20 font-medium text-[#6b7280]">{{ $t('settingsRights.requests') }}</h2>
      <div class="flex items-center justify-between rounded-[16px] border border-[#f3f4f6] bg-white p-24">
        <div>
          <p class="m-0 text-[16px] leading-22 font-bold text-[#040c3d]">{{ $t('settingsRights.requestTitle') }}</p>
          <p class="m-0 mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsRights.requestDate') }}</p>
        </div>
        <span class="rounded-full border border-[#fde68a] bg-[#fffbeb] px-12 py-6 text-[13px] font-semibold text-[#d97706]">
          {{ $t('settingsRights.requestStatus') }}
        </span>
      </div>
      <p class="m-0 rounded-[16px] bg-[#f8f8fc] p-20 text-[14px] leading-22 font-medium text-[#040c3d]">
        {{ $t('settingsRights.deadline') }}
      </p>
      <a
        :href="CNIL_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="flex w-full items-center rounded-[16px] border border-[#f3f4f6] bg-white p-24 text-inherit no-underline"
      >
        <span class="mr-16 flex size-48 shrink-0 items-center justify-center rounded-[12px] bg-[#eef2ff]">
          <img :src="`${ICON}/ic-rrd-cnil.svg`" alt="" width="24" height="24" class="block size-24" loading="lazy" decoding="async">
        </span>
        <span class="flex min-w-0 flex-1 flex-col pr-8">
          <span class="text-[16px] leading-22 font-bold text-[#040c3d]">{{ $t('settingsRights.cnilTitle') }}</span>
          <span class="mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsRights.cnilDesc') }}</span>
        </span>
        <img :src="`${ICON}/ic-rrd-external.svg`" alt="" width="20" height="20" class="block size-20 shrink-0" loading="lazy" decoding="async">
      </a>
    </section>
  </AppDesktopReglagesShell>
</template>
