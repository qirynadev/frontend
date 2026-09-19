<script setup lang="ts">
/**
 * Mentions légales desktop — mêmes fiches éditeur / hébergeur que le mobile.
 */
const ICON = '/img/icons/legal-notice'

const editorRows = [
  ['editorDenominationLabel', 'editorDenomination'],
  ['editorFormLabel', 'editorForm'],
  ['editorCapitalLabel', 'editorCapital'],
  ['editorSirenLabel', 'editorSiren'],
  ['editorRcsLabel', 'editorRcs'],
  ['editorTvaLabel', 'editorTva'],
] as const
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsLegalNotice.title')" :intro="$t('settingsLegalNotice.intro')">
    <p class="m-0 text-[13px] leading-18 text-[#9ca3af]">{{ $t('settingsLegalNotice.updated') }}</p>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ $t('settingsLegalNotice.editorTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div v-for="([label, value], index) in editorRows" :key="label" class="flex items-start justify-between py-14" :class="index > 0 ? 'border-t border-[#f3f4f6]' : ''">
          <dt class="m-0 pr-24 text-[14px] leading-20 text-[#6b7280]">{{ $t(`settingsLegalNotice.${label}`) }}</dt>
          <dd class="m-0 text-right text-[14px] leading-20 font-medium text-[#151515]">{{ $t(`settingsLegalNotice.${value}`) }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 pr-24 text-[14px] leading-20 text-[#6b7280]">{{ $t('settingsLegalNotice.editorSeatLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] leading-20 font-medium text-[#151515]">
            <span class="block">{{ $t('settingsLegalNotice.editorSeat') }}</span>
            <span class="block">{{ $t('settingsLegalNotice.editorSeatLine2') }}</span>
          </dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ $t('settingsLegalNotice.publicationTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div class="flex items-start justify-between py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.publicationDirectorLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium text-[#9ca3af]">{{ $t('settingsLegalNotice.publicationDirector') }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.publicationQualityLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium text-[#9ca3af]">{{ $t('settingsLegalNotice.publicationQuality') }}</dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ $t('settingsLegalNotice.contactTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div class="flex items-start justify-between py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.contactEmailLabel') }}</dt>
          <dd class="m-0 text-right">
            <a :href="`mailto:${$t('settingsLegalNotice.contactEmail')}`" class="text-[14px] font-medium text-[#ff1b40] no-underline">
              {{ $t('settingsLegalNotice.contactEmail') }}
            </a>
          </dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.contactPrivacyLabel') }}</dt>
          <dd class="m-0 text-right">
            <a :href="`mailto:${$t('settingsLegalNotice.contactPrivacy')}`" class="text-[14px] font-medium text-[#ff1b40] no-underline">
              {{ $t('settingsLegalNotice.contactPrivacy') }}
            </a>
          </dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.contactWhatsappLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium text-[#9ca3af]">{{ $t('settingsLegalNotice.contactWhatsapp') }}</dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ $t('settingsLegalNotice.hostTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div class="flex items-start justify-between py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.hostNameLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium uppercase text-[#151515]">{{ $t('settingsLegalNotice.hostName') }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.hostAddressLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium text-[#151515]">
            <span class="block">{{ $t('settingsLegalNotice.hostAddress') }}</span>
            <span class="block">{{ $t('settingsLegalNotice.hostAddressLine2') }}</span>
          </dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.hostRcsLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium text-[#151515]">{{ $t('settingsLegalNotice.hostRcs') }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.hostPhoneLabel') }}</dt>
          <dd class="m-0 text-right">
            <a href="tel:+33970808911" class="text-[14px] font-medium text-[#ff1b40] no-underline">{{ $t('settingsLegalNotice.hostPhone') }}</a>
          </dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ $t('settingsLegalNotice.mediationTitle') }}</h2>
      <div class="rounded-[16px] border border-[#f3f4f6] bg-white p-24">
        <p class="m-0 text-[14px] leading-[22px] text-[#6b7280]">{{ $t('settingsLegalNotice.mediationBody') }}</p>
        <div class="mt-16 flex items-center justify-between border-t border-[#f3f4f6] pt-12">
          <span class="text-[14px] text-[#6b7280]">{{ $t('settingsLegalNotice.mediationOrgLabel') }}</span>
          <span class="text-[14px] font-medium text-[#9ca3af]">{{ $t('settingsLegalNotice.mediationOrg') }}</span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ $t('settingsLegalNotice.ipTitle') }}</h2>
      <div class="rounded-[16px] border border-[#f3f4f6] bg-white p-24">
        <p class="m-0 text-[14px] leading-[22px] text-[#6b7280]">{{ $t('settingsLegalNotice.ipBody') }}</p>
      </div>
    </section>

    <a
      class="flex w-full items-center justify-between rounded-[16px] bg-[#fff5f6] p-24 text-inherit no-underline"
      :href="`mailto:${$t('settingsLegalNotice.usurpEmail')}`"
    >
      <span class="flex min-w-0 items-start">
        <span class="mt-4 flex size-40 shrink-0 items-center justify-center rounded-full bg-white">
          <img :src="`${ICON}/ic-rmn-shield.svg`" alt="" width="20" height="20" class="block size-20">
        </span>
        <span class="flex min-w-0 flex-1 flex-col pl-12">
          <span class="text-[16px] leading-22 font-semibold text-[#040c3d]">{{ $t('settingsLegalNotice.usurpTitle') }}</span>
          <span class="mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsLegalNotice.usurpDesc') }}</span>
          <span class="text-[13px] leading-18 text-[#6b7280]">
            {{ $t('settingsLegalNotice.usurpPrefix') }}
            <span class="text-[#ff1b40]">{{ $t('settingsLegalNotice.usurpEmail') }}</span>
          </span>
        </span>
      </span>
      <img :src="`${ICON}/ic-rmn-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
    </a>
  </AppDesktopReglagesShell>
</template>
