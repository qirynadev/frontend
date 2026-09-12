<script setup lang="ts">
/**
 * Réglages — Informations légales ← Figma `1656:1204`.
 *
 * Hub mis à jour de l’ancien écran « Mentions légales ».
 * Liens de contenu déjà ouverts :
 * - CGU → `/pages/cgu`
 * - Confidentialité → `/pages/privacy`
 * - Cookies → `/pages/cookies`
 * - Gérer mes cookies → rouvre la bannière (`useCookieConsent.reset`)
 * - Exercer mes droits → `/reglages/exercer-mes-droits`
 * - Mentions légales → `/reglages/mentions-legales`
 * CGV : pas de page CMS — ligne inerte, pas un lien mort.
 * Sections : `gap-22` (norme produit) entre topbar / intro / bandeau / cartes.
 */
import { NuxtLink } from '#components'

const { t } = useI18n()
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
  /** Tuile Figma 40×40 complète (fond inclus). */
  tile?: boolean
}

const serviceRows: LegalRow[] = [
  { id: 'cgu', icon: 'ic-ril-cgu', titleKey: 'settingsLegal.cguTitle', descKey: 'settingsLegal.cguDesc', to: '/pages/cgu', tile: true },
  { id: 'cgv', icon: 'ic-ril-cgv', titleKey: 'settingsLegal.cgvTitle', descKey: 'settingsLegal.cgvDesc', to: null, tile: true },
]

const dataRows: LegalRow[] = [
  { id: 'privacy', icon: 'ic-ril-privacy', titleKey: 'settingsLegal.privacyTitle', descKey: 'settingsLegal.privacyDesc', to: '/pages/privacy' },
  { id: 'cookies', icon: 'ic-ril-cookies', titleKey: 'settingsLegal.cookiesTitle', descKey: 'settingsLegal.cookiesDesc', to: '/pages/cookies' },
  { id: 'cookies-manage', icon: 'ic-ril-toggle', titleKey: 'settingsLegal.cookiesManageTitle', descKey: 'settingsLegal.cookiesManageDesc', action: 'cookies' },
  { id: 'rights', icon: 'ic-ril-rights', titleKey: 'settingsLegal.rightsTitle', descKey: 'settingsLegal.rightsDesc', to: '/reglages/exercer-mes-droits' },
]

const editorRows: LegalRow[] = [
  { id: 'legal', icon: 'ic-ril-info', titleKey: 'settingsLegal.legalTitle', descKey: 'settingsLegal.legalDesc', to: '/reglages/mentions-legales' },
]

const sections: { titleKey: string, rows: LegalRow[] }[] = [
  { titleKey: 'settingsLegal.sectionService', rows: serviceRows },
  { titleKey: 'settingsLegal.sectionData', rows: dataRows },
  { titleKey: 'settingsLegal.sectionEditor', rows: editorRows },
]

function rowTag(row: LegalRow) {
  if (row.action === 'cookies') return 'button'
  if (row.to) return NuxtLink
  return 'div'
}

usePageSeo(() => ({
  title: t('settingsLegal.seoTitle'),
  description: t('settingsLegal.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rml flex flex-1 flex-col">
    <div class="rml-main flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages" :gap="0" />

      <section class="w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsLegal.title') }}
        </h1>
        <p class="m-0 mt-4 text-xl leading-21 font-normal text-rml-muted">
          {{ $t('settingsLegal.intro') }}
        </p>
      </section>

      <aside class="box-border flex w-full items-start rounded-[16px] bg-rml-banner p-16">
        <span class="flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rml-banner-icon">
          <img :src="`${ICON}/ic-ril-trust.svg`" alt="" width="24" height="24" class="block size-24">
        </span>
        <div class="min-w-0 flex-1 pl-16">
          <p class="m-0 text-xl leading-24 font-semibold text-rml-heading">{{ $t('settingsLegal.trustTitle') }}</p>
          <p class="m-0 mt-4 text-lg leading-[19.25px] font-normal text-rml-muted">{{ $t('settingsLegal.trustDesc') }}</p>
        </div>
      </aside>

      <section
        v-for="section in sections"
        :key="section.titleKey"
        class="w-full"
        :aria-label="$t(section.titleKey)"
      >
        <h2 class="m-0 px-4 pb-10 text-xl leading-[22.5px] font-medium text-rml-muted">
          {{ $t(section.titleKey) }}
        </h2>
        <div class="w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card box-border">
          <component
            :is="rowTag(row)"
            v-for="(row, index) in section.rows"
            :key="row.id"
            :to="row.to ? localePath(row.to) : undefined"
            :type="row.action === 'cookies' ? 'button' : undefined"
            :class="[
              'flex w-full items-center justify-between p-16 text-left text-inherit no-underline box-border',
              row.action === 'cookies' ? 'cursor-pointer border-0 bg-transparent' : '',
              index === 0 ? 'border-t-0' : 'border-t border-t-rml-row-border',
            ]"
            @click="row.action === 'cookies' ? resetCookieConsent() : undefined"
          >
            <span class="flex min-w-0 flex-1 items-start">
              <span
                v-if="row.tile"
                class="mt-2 size-40 shrink-0 overflow-hidden"
              >
                <img :src="`${ICON}/${row.icon}.svg`" alt="" width="40" height="40" class="block size-40">
              </span>
              <span
                v-else
                class="mt-2 flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-rml-tile"
              >
                <img :src="`${ICON}/${row.icon}.svg`" alt="" width="20" height="20" class="block size-20">
              </span>
              <span class="flex min-w-0 flex-1 flex-col pl-16">
                <span class="text-xl leading-[22.5px] font-medium text-text">{{ $t(row.titleKey) }}</span>
                <span class="mt-2 text-base leading-[16.25px] font-normal text-rml-desc">{{ $t(row.descKey) }}</span>
              </span>
            </span>
            <img :src="`${ICON}/ic-ril-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
          </component>
        </div>
      </section>

      <a
        class="flex w-full items-center justify-between rounded-[16px] bg-rml-help p-16 text-inherit no-underline box-border"
        :href="`mailto:${$t('settingsLegal.helpEmail')}`"
      >
        <span class="flex min-w-0 items-start">
          <span class="mt-2 size-40 shrink-0 overflow-hidden">
            <img :src="`${ICON}/ic-ril-mail.svg`" alt="" width="40" height="40" class="block size-40">
          </span>
          <span class="flex min-w-0 flex-1 flex-col pl-16">
            <span class="text-2xl leading-[22.5px] font-semibold text-rml-heading">{{ $t('settingsLegal.helpTitle') }}</span>
            <span class="mt-2 text-lg leading-[19.5px] font-normal text-rml-help-text">
              {{ $t('settingsLegal.helpDesc') }} {{ $t('settingsLegal.helpEmail') }}
            </span>
          </span>
        </span>
        <img :src="`${ICON}/ic-ril-mail-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
      </a>
    </div>
  </div>
</template>
