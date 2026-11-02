<script setup lang="ts">
/**
 * Réglages — Mentions légales ← Figma `1659:1287`.
 *
 * Fiche éditeur / hébergeur ouverte depuis le hub Informations légales.
 * Tous les textes sont administrés dans le back-office (`useLegalNotice`). Les
 * valeurs d'attente « [au lancement] » / « [à ouvrir] » / « [à désigner] » restent
 * affichées tant que rien n'est saisi.
 * Sections : `gap-22` entre topbar / intro / cartes.
 */
import DesktopReglagesMentionsLegales from '~/desktop-pages/reglages-mentions-legales.vue'

const ICON = '/img/icons/legal-notice'

const legal = await useLegalNotice()

usePageSeo(() => ({
  title: legal.text('seoTitle'),
  description: legal.text('seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-rmn flex flex-1 flex-col shell:hidden">
    <div class="flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages/mentions" :gap="0" />

      <section class="w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ legal.text('title') }}
        </h1>
        <p class="m-0 mt-4 text-xl leading-21 font-normal text-rml-muted">
          {{ legal.text('intro') }}
        </p>
        <p class="m-0 text-xl leading-21 font-normal text-rml-updated">
          {{ legal.text('updated') }}
        </p>
      </section>

      <!-- Éditeur -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ legal.text('editorTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ legal.text('editorDenominationLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ legal.text('editorDenomination') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ legal.text('editorFormLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ legal.text('editorForm') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ legal.text('editorCapitalLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ legal.text('editorCapital') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ legal.text('editorSeatLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">
              <span class="block">{{ legal.text('editorSeat') }}</span>
              <span class="block">{{ legal.text('editorSeatLine2') }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ legal.text('editorSirenLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ legal.text('editorSiren') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ legal.text('editorRcsLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ legal.text('editorRcs') }}</dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-lg leading-21 font-normal text-rml-desc">{{ legal.text('editorTvaLabel') }}</dt>
            <dd class="m-0 text-right text-xl leading-21 font-medium text-rml-value">{{ legal.text('editorTva') }}</dd>
          </div>
        </dl>
      </section>

      <!-- Direction -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ legal.text('publicationTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('publicationDirectorLabel') }}</dt>
            <dd class="m-0 text-right text-xl leading-21 font-medium" :class="legal.pending('publicationDirector') ? 'text-rml-pending' : 'text-rml-value'">{{ legal.text('publicationDirector') }}</dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('publicationQualityLabel') }}</dt>
            <dd class="m-0 text-right text-xl leading-21 font-medium" :class="legal.pending('publicationQuality') ? 'text-rml-pending' : 'text-rml-value'">{{ legal.text('publicationQuality') }}</dd>
          </div>
        </dl>
      </section>

      <!-- Contact -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ legal.text('contactTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('contactEmailLabel') }}</dt>
            <dd class="m-0 text-right">
              <a :href="`mailto:${legal.text('contactEmail')}`" class="text-lg leading-21 font-medium text-rml-link no-underline">
                {{ legal.text('contactEmail') }}
              </a>
            </dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('contactPrivacyLabel') }}</dt>
            <dd class="m-0 text-right">
              <a :href="`mailto:${legal.text('contactPrivacy')}`" class="text-lg leading-21 font-medium text-rml-link no-underline">
                {{ legal.text('contactPrivacy') }}
              </a>
            </dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('contactWhatsappLabel') }}</dt>
            <dd class="m-0 text-right">
              <a v-if="legal.whatsappHref()" :href="legal.whatsappHref() ?? undefined" target="_blank" rel="noopener" class="text-lg leading-21 font-medium text-rml-link no-underline">
                {{ legal.whatsappNumber() }}
              </a>
              <span v-else class="text-lg leading-21 font-medium text-rml-pending">{{ legal.text('contactWhatsapp') }}</span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Hébergement -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ legal.text('hostTitle') }}
        </h2>
        <dl class="mt-12 m-0 w-full overflow-hidden rounded-[10px] border border-rml-row-border bg-surface-card px-16 py-4 box-border">
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('hostNameLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium uppercase text-rml-value">{{ legal.text('hostName') }}</dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('hostAddressLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">
              <span class="block">{{ legal.text('hostAddress') }}</span>
              <span class="block">{{ legal.text('hostAddressLine2') }}</span>
            </dd>
          </div>
          <div class="flex items-start justify-between border-b border-rml-row-border py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('hostRcsLabel') }}</dt>
            <dd class="m-0 text-right text-lg leading-21 font-medium text-rml-value">{{ legal.text('hostRcs') }}</dd>
          </div>
          <div class="flex items-start justify-between py-12">
            <dt class="m-0 pr-16 text-xl leading-21 font-normal text-rml-desc">{{ legal.text('hostPhoneLabel') }}</dt>
            <dd class="m-0 text-right">
              <a :href="legal.hostPhoneHref()" class="text-lg leading-21 font-medium text-rml-link no-underline">
                {{ legal.text('hostPhone') }}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Médiation -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ legal.text('mediationTitle') }}
        </h2>
        <div class="mt-12 w-full rounded-[10px] border border-rml-row-border bg-surface-card p-16 box-border">
          <p class="m-0 text-xl leading-[22.75px] font-normal text-rml-muted">
            {{ legal.text('mediationBody') }}
          </p>
          <div class="mt-16 flex items-center justify-between border-t border-rml-row-border pt-8">
            <span class="text-xl leading-21 font-normal text-rml-desc">{{ legal.text('mediationOrgLabel') }}</span>
            <span class="text-xl leading-21 font-medium" :class="legal.pending('mediationOrg') ? 'text-rml-pending' : 'text-rml-value'">{{ legal.text('mediationOrg') }}</span>
          </div>
        </div>
      </section>

      <!-- PI -->
      <section class="w-full">
        <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc">
          {{ legal.text('ipTitle') }}
        </h2>
        <div class="mt-12 w-full rounded-[10px] border border-rml-row-border bg-surface-card p-16 box-border">
          <p class="m-0 text-xl leading-[22.75px] font-normal text-rml-muted">
            {{ legal.text('ipBody') }}
          </p>
        </div>
      </section>

      <a
        class="flex w-full items-center justify-between rounded-[10px] bg-rml-usurp p-16 text-inherit no-underline box-border"
        :href="`mailto:${legal.text('usurpEmail')}`"
      >
        <span class="flex min-w-0 items-start">
          <span class="mt-4 flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rml-usurp-icon">
            <img :src="`${ICON}/ic-rmn-shield.svg`" alt="" width="20" height="20" class="block size-20">
          </span>
          <span class="flex min-w-0 flex-1 flex-col pl-12">
            <span class="text-2xl leading-[22.5px] font-semibold text-rml-heading">{{ legal.text('usurpTitle') }}</span>
            <span class="mt-2 text-lg leading-[17.875px] font-normal text-rml-desc">
              {{ legal.text('usurpDesc') }}
            </span>
            <span class="text-lg leading-[17.875px] font-normal text-rml-desc">
              {{ legal.text('usurpPrefix') }}
              <span class="text-rml-link">{{ legal.text('usurpEmail') }}</span>
            </span>
          </span>
        </span>
      <img :src="`${ICON}/ic-rmn-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
    </a>
    </div>
  </div>

  <div class="hidden shell:block">
    <DesktopReglagesMentionsLegales :legal="legal" />
  </div>
</template>
