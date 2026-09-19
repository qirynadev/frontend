<script setup lang="ts">
/**
 * Centre d’aide desktop — mêmes actions que le mobile, cartes en rangée de 3.
 */
import { centreAideMock } from '~/config/centre-aide-mock'

const localePath = useLocalePath()
const ICON = '/img/icons/centre-aide'
const whatsappHref = computed(() => `https://wa.me/${centreAideMock.whatsappPhone}`)
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsHelp.title')" :intro="$t('settingsHelp.intro')">
    <aside class="flex items-start rounded-[16px] border border-[#fee2e2] bg-[#fff5f6] p-24">
      <img :src="`${ICON}/ic-ca-headset.svg`" alt="" width="56" height="56" class="mr-16 mt-4 block size-56 shrink-0">
      <div class="min-w-0 flex-1">
        <p class="m-0 text-[16px] leading-24 font-bold text-[#040c3d]">{{ $t('settingsHelp.bannerTitle') }}</p>
        <ul class="m-0 mt-8 list-none p-0">
          <li class="flex items-start">
            <img :src="`${ICON}/ic-ca-check.svg`" alt="" width="16" height="16" class="mt-2 mr-8 block size-16 shrink-0">
            <span class="text-[14px] leading-20 text-[#151515]">{{ $t('settingsHelp.bannerItem1') }}</span>
          </li>
          <li class="mt-4 flex items-start">
            <img :src="`${ICON}/ic-ca-check.svg`" alt="" width="16" height="16" class="mt-2 mr-8 block size-16 shrink-0">
            <span class="text-[14px] leading-20 text-[#151515]">{{ $t('settingsHelp.bannerItem2') }}</span>
          </li>
        </ul>
      </div>
    </aside>

    <section class="flex flex-col gap-12">
      <h2 class="m-0 text-[14px] leading-20 font-semibold text-[#040c3d]">
        {{ $t('settingsHelp.contactTitle') }}
      </h2>
      <div class="grid grid-cols-3 gap-16">
        <NuxtLink
          :to="localePath('/reglages/contact')"
          class="flex flex-col items-start rounded-[16px] border border-[#f3f4f6] bg-white p-24 text-inherit no-underline shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <img :src="`${ICON}/ic-ca-message.svg`" alt="" width="48" height="48" class="mb-16 block size-48">
          <span class="text-[15px] leading-20 font-bold text-[#040c3d]">{{ $t('settingsHelp.messageTitle') }}</span>
          <span class="mt-8 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsHelp.messageDesc') }}</span>
        </NuxtLink>
        <a
          :href="whatsappHref"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col items-start rounded-[16px] border border-[#f3f4f6] bg-white p-24 text-inherit no-underline shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <img :src="`${ICON}/ic-ca-whatsapp.svg`" alt="" width="48" height="48" class="mb-16 block size-48">
          <span class="flex items-center gap-8">
            <span class="text-[15px] leading-20 font-bold text-[#040c3d]">{{ $t('settingsHelp.whatsappTitle') }}</span>
            <span class="rounded-full bg-[#ecfdf5] px-8 py-2 text-[11px] font-semibold text-[#279848]">
              {{ $t('settingsHelp.whatsappOnline') }}
            </span>
          </span>
          <span class="mt-8 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsHelp.whatsappDesc') }}</span>
        </a>
        <button
          type="button"
          class="flex cursor-pointer flex-col items-start rounded-[16px] border border-[#f3f4f6] bg-white p-24 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
          <img :src="`${ICON}/ic-ca-phone.svg`" alt="" width="48" height="48" class="mb-16 block size-48">
          <span class="text-[15px] leading-20 font-bold text-[#040c3d]">{{ $t('settingsHelp.callbackTitle') }}</span>
          <span class="mt-8 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsHelp.callbackDesc') }}</span>
        </button>
      </div>
    </section>

    <aside class="flex items-center gap-16 rounded-[16px] bg-[#f8f8fc] px-24 py-20">
      <img :src="`${ICON}/ic-ca-shield.svg`" alt="" width="44" height="44" class="block size-44 shrink-0">
      <div class="min-w-0 flex-1">
        <p class="m-0 text-[14px] leading-20 font-bold text-[#040c3d]">{{ $t('settingsHelp.secureTitle') }}</p>
        <p class="m-0 mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsHelp.secureDesc') }}</p>
      </div>
      <img :src="`${ICON}/illu-lock.png`" alt="" width="52" height="38" class="block h-38 w-52 shrink-0 object-contain">
    </aside>
  </AppDesktopReglagesShell>
</template>
