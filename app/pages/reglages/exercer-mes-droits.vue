<script setup lang="ts">
/**
 * Réglages — Exercer mes droits ← Figma `1588:1722`.
 *
 * Actions immédiates branchées sur ce qui existe déjà :
 * - Corriger / Supprimer → `/reglages/informations-personnelles`
 * - Retirer mon consentement → rouvre la bannière cookies
 * - Télécharger / demandes équipe → mailto privacy@
 * - CNIL → site public de l’autorité
 * Sections : `gap-22` entre topbar / intro / cartes.
 */
import { NuxtLink } from '#components'

const { t } = useI18n()
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
  tile?: boolean
  tileClass?: string
}

const immediateRows: RightsRow[] = [
  {
    id: 'download',
    icon: 'ic-rrd-download',
    chevron: 'ic-rrd-chevron',
    titleKey: 'settingsRights.downloadTitle',
    descKey: 'settingsRights.downloadDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Télécharger mes données')}`,
    tile: true,
  },
  {
    id: 'correct',
    icon: 'ic-rrd-edit',
    chevron: 'ic-rrd-chevron-2',
    titleKey: 'settingsRights.correctTitle',
    descKey: 'settingsRights.correctDesc',
    to: '/reglages/informations-personnelles',
    tile: true,
  },
  {
    id: 'withdraw',
    icon: 'ic-rrd-consent',
    chevron: 'ic-rrd-chevron-2',
    titleKey: 'settingsRights.withdrawTitle',
    descKey: 'settingsRights.withdrawDesc',
    action: 'cookies',
    tile: true,
  },
  {
    id: 'delete',
    icon: 'ic-rrd-trash',
    chevron: 'ic-rrd-chevron-danger',
    titleKey: 'settingsRights.deleteTitle',
    descKey: 'settingsRights.deleteDesc',
    to: '/reglages/informations-personnelles',
    danger: true,
    tileClass: 'bg-rml-danger-bg',
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
    tileClass: 'bg-rml-team-tile',
  },
  {
    id: 'limit',
    icon: 'ic-rrd-limit',
    chevron: 'ic-rrd-chevron-team',
    titleKey: 'settingsRights.limitTitle',
    descKey: 'settingsRights.limitDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Limitation d’un traitement')}`,
    tileClass: 'bg-rml-team-tile',
  },
  {
    id: 'rep',
    icon: 'ic-rrd-rep',
    chevron: 'ic-rrd-chevron-team',
    titleKey: 'settingsRights.legalRepTitle',
    descKey: 'settingsRights.legalRepDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Demande d’un représentant légal')}`,
    tileClass: 'bg-rml-team-tile',
  },
  {
    id: 'post-death',
    icon: 'ic-rrd-directives',
    chevron: 'ic-rrd-chevron-team',
    titleKey: 'settingsRights.postDeathTitle',
    descKey: 'settingsRights.postDeathDesc',
    href: `${PRIVACY_MAIL}?subject=${encodeURIComponent('Directives après mon décès')}`,
    tileClass: 'bg-rml-team-tile',
  },
]

function rowTag(row: RightsRow) {
  if (row.action === 'cookies') return 'button'
  if (row.to) return NuxtLink
  if (row.href) return 'a'
  return 'div'
}

usePageSeo(() => ({
  title: t('settingsRights.seoTitle'),
  description: t('settingsRights.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rrd flex flex-1 flex-col">
    <div class="flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages/mentions" :gap="0" />

      <section class="w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsRights.title') }}
        </h1>
        <p class="m-0 mt-4 text-xl leading-21 font-normal text-rml-muted">
          {{ $t('settingsRights.intro') }}
        </p>
      </section>

      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-[22.5px] font-medium text-rml-muted">
          {{ $t('settingsRights.immediate') }}
        </h2>
        <div class="mt-12 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card box-border">
          <component
            :is="rowTag(row)"
            v-for="(row, index) in immediateRows"
            :key="row.id"
            :to="row.to ? localePath(row.to) : undefined"
            :href="row.href"
            :type="row.action === 'cookies' ? 'button' : undefined"
            :class="[
              'flex w-full items-center p-16 text-left text-inherit no-underline box-border',
              row.action === 'cookies' ? 'cursor-pointer border-0 bg-transparent' : '',
              index === 0 ? 'border-t-0' : 'border-t border-t-rml-row-border',
            ]"
            @click="row.action === 'cookies' ? resetCookieConsent() : undefined"
          >
            <span
              v-if="row.tile"
              class="mr-16 size-48 shrink-0 overflow-hidden"
            >
              <img :src="`${ICON}/${row.icon}.svg`" alt="" width="48" height="48" class="block size-48">
            </span>
            <span
              v-else
              :class="['mr-16 flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-[12px]', row.tileClass]"
            >
              <img :src="`${ICON}/${row.icon}.svg`" alt="" width="24" height="24" class="block size-24">
            </span>
            <span class="flex min-w-0 flex-1 flex-col pr-8">
              <span :class="['text-lg leading-[22.5px] font-medium', row.danger ? 'text-rml-danger' : 'text-rml-row-title']">
                {{ $t(row.titleKey) }}
              </span>
              <span class="mt-2 text-lg leading-[16.25px] font-normal text-rml-desc">{{ $t(row.descKey) }}</span>
            </span>
            <img :src="`${ICON}/${row.chevron}.svg`" alt="" width="20" height="20" class="block size-20 shrink-0">
          </component>
        </div>
      </section>

      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-[22.5px] font-medium text-rml-muted">
          {{ $t('settingsRights.team') }}
        </h2>
        <div class="mt-12 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card box-border">
          <a
            v-for="(row, index) in teamRows"
            :key="row.id"
            :href="row.href"
            :class="[
              'flex w-full items-center p-16 text-inherit no-underline box-border',
              index === 0 ? 'border-t-0' : 'border-t border-t-rml-row-border',
            ]"
          >
            <span :class="['mr-16 flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-[12px]', row.tileClass]">
              <img :src="`${ICON}/${row.icon}.svg`" alt="" width="24" height="24" class="block size-24">
            </span>
            <span class="flex min-w-0 flex-1 flex-col pr-8">
              <span class="text-lg leading-[22.5px] font-medium text-rml-row-title">{{ $t(row.titleKey) }}</span>
              <span class="mt-2 text-base leading-[16.25px] font-normal text-text">{{ $t(row.descKey) }}</span>
            </span>
            <img :src="`${ICON}/${row.chevron}.svg`" alt="" width="20" height="20" class="block size-20 shrink-0">
          </a>
        </div>
      </section>

      <section class="flex w-full flex-col gap-22">
        <div class="w-full">
          <h2 class="m-0 px-4 text-xl leading-[22.5px] font-medium text-rml-muted">
            {{ $t('settingsRights.requests') }}
          </h2>
          <div class="mt-12 flex w-full items-center justify-between rounded-[10px] border border-rml-row-border bg-surface-card p-16 box-border">
            <div class="min-w-0">
              <p class="m-0 text-2xl leading-[22.5px] font-bold text-rml-heading">{{ $t('settingsRights.requestTitle') }}</p>
              <p class="m-0 mt-2 text-lg leading-[19.5px] font-normal text-rml-desc">{{ $t('settingsRights.requestDate') }}</p>
            </div>
            <span class="shrink-0 rounded-full border border-rml-badge-border bg-rml-badge-bg px-12 py-6 text-lg leading-[19.5px] font-semibold text-rml-badge">
              {{ $t('settingsRights.requestStatus') }}
            </span>
          </div>
        </div>

        <p class="m-0 rounded-[10px] bg-rml-rights-info p-16 text-lg leading-[21.938px] font-medium text-rml-heading">
          {{ $t('settingsRights.deadline') }}
        </p>

        <a
          :href="CNIL_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="flex w-full items-center rounded-[10px] border border-rml-row-border bg-surface-card p-16 text-inherit no-underline box-border"
        >
          <span class="mr-16 flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-rml-cnil-tile">
            <img :src="`${ICON}/ic-rrd-cnil.svg`" alt="" width="24" height="24" class="block size-24">
          </span>
          <span class="flex min-w-0 flex-1 flex-col pr-8">
            <span class="text-2xl leading-[22.5px] font-bold text-rml-heading">{{ $t('settingsRights.cnilTitle') }}</span>
            <span class="mt-2 text-lg leading-[16.25px] font-normal text-rml-desc">{{ $t('settingsRights.cnilDesc') }}</span>
          </span>
          <img :src="`${ICON}/ic-rrd-external.svg`" alt="" width="20" height="20" class="block size-20 shrink-0">
        </a>
      </section>
    </div>
  </div>
</template>
