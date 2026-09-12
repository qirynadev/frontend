<script setup lang="ts">
/**
 * Réglages — Mentions légales ← Figma `1659:1287`.
 *
 * Fiche éditeur / hébergeur ouverte depuis le hub Informations légales.
 * Les valeurs « [au lancement] » / « [à ouvrir] » / « [à désigner] » sont
 * celles de la maquette — pas encore de contenu définitif.
 * Sections : `gap-22` entre topbar / intro / cartes.
 */
const { t } = useI18n()

const ICON = '/img/icons/legal-notice'

usePageSeo(() => ({
  title: t('settingsLegalNotice.seoTitle'),
  description: t('settingsLegalNotice.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rmn flex flex-1 flex-col">
    <div class="flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages/mentions" :gap="0" />

      <section class="w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsLegalNotice.title') }}
        </h1>
        <p class="m-0 mt-4 text-xl leading-21 font-normal text-rml-muted">
          {{ $t('settingsLegalNotice.intro') }}
        </p>
        <p class="m-0 text-xl leading-21 font-normal text-rml-updated">
          {{ $t('settingsLegalNotice.updated') }}
        </p>
      </section>

      <!-- Éditeur -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ $t('settingsLegalNotice.editorTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.editorDenominationLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ $t('settingsLegalNotice.editorDenomination') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.editorFormLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ $t('settingsLegalNotice.editorForm') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.editorCapitalLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ $t('settingsLegalNotice.editorCapital') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.editorSeatLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">
              <span class="block">{{ $t('settingsLegalNotice.editorSeat') }}</span>
              <span class="block">{{ $t('settingsLegalNotice.editorSeatLine2') }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.editorSirenLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ $t('settingsLegalNotice.editorSiren') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.editorRcsLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ $t('settingsLegalNotice.editorRcs') }}</dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.editorTvaLabel') }}</dt>
            <dd class="m-0 text-right text-xl leading-21 font-medium text-rml-value">{{ $t('settingsLegalNotice.editorTva') }}</dd>
          </div>
        </dl>
      </section>

      <!-- Direction -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ $t('settingsLegalNotice.publicationTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.publicationDirectorLabel') }}</dt>
            <dd class="m-0 text-right text-xl leading-21 font-medium text-rml-pending">{{ $t('settingsLegalNotice.publicationDirector') }}</dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.publicationQualityLabel') }}</dt>
            <dd class="m-0 text-right text-xl leading-21 font-medium text-rml-pending">{{ $t('settingsLegalNotice.publicationQuality') }}</dd>
          </div>
        </dl>
      </section>

      <!-- Contact -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ $t('settingsLegalNotice.contactTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.contactEmailLabel') }}</dt>
            <dd class="m-0 text-right">
              <a :href="`mailto:${$t('settingsLegalNotice.contactEmail')}`" class="text-lg leading-21 font-medium text-rml-link no-underline">
                {{ $t('settingsLegalNotice.contactEmail') }}
              </a>
            </dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.contactPrivacyLabel') }}</dt>
            <dd class="m-0 text-right">
              <a :href="`mailto:${$t('settingsLegalNotice.contactPrivacy')}`" class="text-lg leading-21 font-medium text-rml-link no-underline">
                {{ $t('settingsLegalNotice.contactPrivacy') }}
              </a>
            </dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.contactWhatsappLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-pending">{{ $t('settingsLegalNotice.contactWhatsapp') }}</dd>
          </div>
        </dl>
      </section>

      <!-- Hébergement -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ $t('settingsLegalNotice.hostTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.hostNameLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium uppercase text-rml-value">{{ $t('settingsLegalNotice.hostName') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.hostAddressLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">
              <span class="block">{{ $t('settingsLegalNotice.hostAddress') }}</span>
              <span class="block">{{ $t('settingsLegalNotice.hostAddressLine2') }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.hostRcsLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ $t('settingsLegalNotice.hostRcs') }}</dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.hostPhoneLabel') }}</dt>
            <dd class="m-0 text-right">
              <a href="tel:+33970808911" class="text-lg leading-21 font-medium text-rml-link no-underline">
                {{ $t('settingsLegalNotice.hostPhone') }}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Médiation -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ $t('settingsLegalNotice.mediationTitle') }}
        </h2>
        <div class="mt-12 w-full rounded-[10px] border border-rml-row-border bg-surface-card p-16 box-border">
          <p class="m-0 text-xl leading-[22.75px] font-normal text-rml-muted">
            {{ $t('settingsLegalNotice.mediationBody') }}
          </p>
          <div class="mt-16 flex items-center justify-between border-t border-rml-row-border pt-8">
            <span class="text-xl leading-21 font-normal text-rml-desc">{{ $t('settingsLegalNotice.mediationOrgLabel') }}</span>
            <span class="text-xl leading-21 font-medium text-rml-pending">{{ $t('settingsLegalNotice.mediationOrg') }}</span>
          </div>
        </div>
      </section>

      <!-- PI -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ $t('settingsLegalNotice.ipTitle') }}
        </h2>
        <div class="mt-12 w-full rounded-[10px] border border-rml-row-border bg-surface-card p-16 box-border">
          <p class="m-0 text-xl leading-[22.75px] font-normal text-rml-muted">
            {{ $t('settingsLegalNotice.ipBody') }}
          </p>
        </div>
      </section>

      <a
        class="flex w-full items-center justify-between rounded-[10px] bg-rml-usurp p-16 text-inherit no-underline box-border"
        :href="`mailto:${$t('settingsLegalNotice.usurpEmail')}`"
      >
        <span class="flex min-w-0 items-start">
          <span class="mt-4 flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rml-usurp-icon">
            <img :src="`${ICON}/ic-rmn-shield.svg`" alt="" width="20" height="20" class="block size-20">
          </span>
          <span class="flex min-w-0 flex-1 flex-col pl-12">
            <span class="text-2xl leading-[22.5px] font-semibold text-rml-heading">{{ $t('settingsLegalNotice.usurpTitle') }}</span>
            <span class="mt-2 text-lg leading-[17.875px] font-normal text-rml-desc">
              {{ $t('settingsLegalNotice.usurpDesc') }}
            </span>
            <span class="text-lg leading-[17.875px] font-normal text-rml-desc">
              {{ $t('settingsLegalNotice.usurpPrefix') }}
              <span class="text-rml-link">{{ $t('settingsLegalNotice.usurpEmail') }}</span>
            </span>
          </span>
        </span>
        <img :src="`${ICON}/ic-rmn-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
      </a>
    </div>
  </div>
</template>
