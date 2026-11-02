<script setup lang="ts">
/**
 * Mentions légales desktop — mêmes fiches éditeur / hébergeur que le mobile.
 * Textes administrés : chargés une seule fois par la page, voir `useLegalNotice`.
 */
import type { LegalNoticeView } from '~/composables/useLegalNotice'

defineProps<{ legal: LegalNoticeView }>()

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
  <AppDesktopReglagesShell :title="legal.text('title')" :intro="legal.text('intro')">
    <p class="m-0 text-[13px] leading-18 text-[#9ca3af]">{{ legal.text('updated') }}</p>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ legal.text('editorTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div v-for="([label, value], index) in editorRows" :key="label" class="flex items-start justify-between py-14" :class="index > 0 ? 'border-t border-[#f3f4f6]' : ''">
          <dt class="m-0 pr-24 text-[14px] leading-20 text-[#6b7280]">{{ legal.text(label) }}</dt>
          <dd class="m-0 text-right text-[14px] leading-20 font-medium text-[#151515]">{{ legal.text(value) }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 pr-24 text-[14px] leading-20 text-[#6b7280]">{{ legal.text('editorSeatLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] leading-20 font-medium text-[#151515]">
            <span class="block">{{ legal.text('editorSeat') }}</span>
            <span class="block">{{ legal.text('editorSeatLine2') }}</span>
          </dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ legal.text('publicationTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div class="flex items-start justify-between py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('publicationDirectorLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium" :class="legal.pending('publicationDirector') ? 'text-[#9ca3af]' : 'text-[#151515]'">{{ legal.text('publicationDirector') }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('publicationQualityLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium" :class="legal.pending('publicationQuality') ? 'text-[#9ca3af]' : 'text-[#151515]'">{{ legal.text('publicationQuality') }}</dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ legal.text('contactTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div class="flex items-start justify-between py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('contactEmailLabel') }}</dt>
          <dd class="m-0 text-right">
            <a :href="`mailto:${legal.text('contactEmail')}`" class="text-[14px] font-medium text-[#ff1b40] no-underline">
              {{ legal.text('contactEmail') }}
            </a>
          </dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('contactPrivacyLabel') }}</dt>
          <dd class="m-0 text-right">
            <a :href="`mailto:${legal.text('contactPrivacy')}`" class="text-[14px] font-medium text-[#ff1b40] no-underline">
              {{ legal.text('contactPrivacy') }}
            </a>
          </dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('contactWhatsappLabel') }}</dt>
          <dd class="m-0 text-right">
            <a v-if="legal.whatsappHref()" :href="legal.whatsappHref() ?? undefined" target="_blank" rel="noopener" class="text-[14px] font-medium text-[#ff1b40] no-underline">
              {{ legal.whatsappNumber() }}
            </a>
            <span v-else class="text-[14px] font-medium text-[#9ca3af]">{{ legal.text('contactWhatsapp') }}</span>
          </dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ legal.text('hostTitle') }}</h2>
      <dl class="m-0 overflow-hidden rounded-[16px] border border-[#f3f4f6] bg-white px-24">
        <div class="flex items-start justify-between py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('hostNameLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium uppercase text-[#151515]">{{ legal.text('hostName') }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('hostAddressLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium text-[#151515]">
            <span class="block">{{ legal.text('hostAddress') }}</span>
            <span class="block">{{ legal.text('hostAddressLine2') }}</span>
          </dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('hostRcsLabel') }}</dt>
          <dd class="m-0 text-right text-[14px] font-medium text-[#151515]">{{ legal.text('hostRcs') }}</dd>
        </div>
        <div class="flex items-start justify-between border-t border-[#f3f4f6] py-14">
          <dt class="m-0 text-[14px] text-[#6b7280]">{{ legal.text('hostPhoneLabel') }}</dt>
          <dd class="m-0 text-right">
            <a :href="legal.hostPhoneHref()" class="text-[14px] font-medium text-[#ff1b40] no-underline">{{ legal.text('hostPhone') }}</a>
          </dd>
        </div>
      </dl>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ legal.text('mediationTitle') }}</h2>
      <div class="rounded-[16px] border border-[#f3f4f6] bg-white p-24">
        <p class="m-0 text-[14px] leading-[22px] text-[#6b7280]">{{ legal.text('mediationBody') }}</p>
        <div class="mt-16 flex items-center justify-between border-t border-[#f3f4f6] pt-12">
          <span class="text-[14px] text-[#6b7280]">{{ legal.text('mediationOrgLabel') }}</span>
          <span class="text-[14px] font-medium" :class="legal.pending('mediationOrg') ? 'text-[#9ca3af]' : 'text-[#151515]'">{{ legal.text('mediationOrg') }}</span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#6b7280]">{{ legal.text('ipTitle') }}</h2>
      <div class="rounded-[16px] border border-[#f3f4f6] bg-white p-24">
        <p class="m-0 text-[14px] leading-[22px] text-[#6b7280]">{{ legal.text('ipBody') }}</p>
      </div>
    </section>

    <a
      class="flex w-full items-center justify-between rounded-[16px] bg-[#fff5f6] p-24 text-inherit no-underline"
      :href="`mailto:${legal.text('usurpEmail')}`"
    >
      <span class="flex min-w-0 items-start">
        <span class="mt-4 flex size-40 shrink-0 items-center justify-center rounded-full bg-white">
          <img :src="`${ICON}/ic-rmn-shield.svg`" alt="" width="20" height="20" class="block size-20" loading="lazy" decoding="async">
        </span>
        <span class="flex min-w-0 flex-1 flex-col pl-12">
          <span class="text-[16px] leading-22 font-semibold text-[#040c3d]">{{ legal.text('usurpTitle') }}</span>
          <span class="mt-4 text-[13px] leading-18 text-[#6b7280]">{{ legal.text('usurpDesc') }}</span>
          <span class="text-[13px] leading-18 text-[#6b7280]">
            {{ legal.text('usurpPrefix') }}
            <span class="text-[#ff1b40]">{{ legal.text('usurpEmail') }}</span>
          </span>
        </span>
      </span>
      <img :src="`${ICON}/ic-rmn-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0" loading="lazy" decoding="async">
    </a>
  </AppDesktopReglagesShell>
</template>
