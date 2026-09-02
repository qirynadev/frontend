<script setup lang="ts">
/**
 * Réglages — Centre d’aide (hub) ← Figma `1586:1194`.
 *
 * | Bloc | Spéc |
 * |---|---|
 * | sections | `gap-22` topbar → intro → bandeau → Contactez-nous |
 * | options | `gap-12` entre cartes contact |
 * | Envoyer un message | → `/reglages/contact` |
 * | WhatsApp | `wa.me` mock (`centre-aide-mock`) |
 * | Être rappelé | pas d’écran Figma branché — inerte |
 *
 * Doc : `docs/reglages-contact-mocks.md`.
 */
import { centreAideMock } from '~/config/centre-aide-mock'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const localePath = useLocalePath()

const ICON = '/img/icons/centre-aide'

const whatsappHref = computed(
  () => `https://wa.me/${centreAideMock.whatsappPhone}`,
)

usePageSeo(() => ({
  title: t('settingsHelp.seoTitle'),
  description: t('settingsHelp.seoDescription'),
  noindex: true,
}))
</script>

<template>
  <div class="page-ca flex flex-1 flex-col">
    <div class="ca-main flex w-full max-w-full flex-col gap-22 box-border">
      <AppTopBar :back="true" back-to="/reglages" :notifications="3" :gap="0" />

      <section class="w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text">
          {{ $t('settingsHelp.title') }}
        </h1>
        <p class="m-0 text-xl leading-21 font-normal text-ca-muted">
          {{ $t('settingsHelp.intro') }}
        </p>
      </section>

      <!-- Bandeau support -->
      <aside class="box-border flex w-full items-start rounded-[10px] border border-ca-banner-border bg-ca-banner p-20">
        <img
          :src="`${ICON}/ic-ca-headset.svg`"
          alt=""
          width="56"
          height="56"
          class="mr-16 mt-4 block size-56 shrink-0"
        >
        <div class="min-w-0 flex-1">
          <p class="m-0 text-xl leading-[22.5px] font-bold text-ca-heading">
            {{ $t('settingsHelp.bannerTitle') }}
          </p>
          <ul class="m-0 mt-8 list-none space-y-0 p-0">
            <li class="flex items-start">
              <img :src="`${ICON}/ic-ca-check.svg`" alt="" width="16" height="16" class="mt-2 mr-8 block size-16 shrink-0">
              <span class="text-lg leading-[20.25px] font-normal text-ca-item">{{ $t('settingsHelp.bannerItem1') }}</span>
            </li>
            <li class="flex items-start">
              <img :src="`${ICON}/ic-ca-check.svg`" alt="" width="16" height="16" class="mt-2 mr-8 block size-16 shrink-0">
              <span class="text-lg leading-[20.25px] font-normal text-ca-item">{{ $t('settingsHelp.bannerItem2') }}</span>
            </li>
          </ul>
        </div>
      </aside>

      <section class="flex w-full flex-col gap-16">
        <h2 class="m-0 pl-4 text-xl leading-24 font-semibold text-ca-heading">
          {{ $t('settingsHelp.contactTitle') }}
        </h2>

        <div class="flex w-full flex-col gap-12">
          <!-- Envoyer un message -->
          <NuxtLink
            :to="localePath('/reglages/contact')"
            class="box-border flex w-full items-center rounded-[10px] border border-ca-row-border bg-white p-16 text-inherit no-underline"
          >
            <img :src="`${ICON}/ic-ca-message.svg`" alt="" width="48" height="48" class="mr-16 block size-48 shrink-0">
            <span class="min-w-0 flex-1 pr-8">
              <span class="block text-2xl leading-[22.5px] font-bold text-ca-heading">{{ $t('settingsHelp.messageTitle') }}</span>
              <span class="mt-4 block text-lg leading-[17.875px] font-normal text-ca-muted">{{ $t('settingsHelp.messageDesc') }}</span>
            </span>
            <img :src="`${ICON}/ic-ca-chevron.svg`" alt="" width="20" height="20" class="block size-20 shrink-0">
          </NuxtLink>

          <!-- WhatsApp -->
          <a
            :href="whatsappHref"
            target="_blank"
            rel="noopener noreferrer"
            class="box-border flex w-full items-center rounded-[10px] border border-ca-row-border bg-white p-16 text-inherit no-underline"
          >
            <img :src="`${ICON}/ic-ca-whatsapp.svg`" alt="" width="48" height="48" class="mr-16 block size-48 shrink-0">
            <span class="min-w-0 flex-1 pr-8">
              <span class="block text-2xl leading-[22.5px] font-bold text-ca-heading">{{ $t('settingsHelp.whatsappTitle') }}</span>
              <span class="mt-4 block text-lg leading-[17.875px] font-normal text-ca-muted">{{ $t('settingsHelp.whatsappDesc') }}</span>
            </span>
            <span class="mr-12 shrink-0 rounded-full bg-ca-online-bg px-10 py-4 text-md leading-[16.5px] font-semibold text-ca-online">
              {{ $t('settingsHelp.whatsappOnline') }}
            </span>
            <img :src="`${ICON}/ic-ca-chevron.svg`" alt="" width="20" height="20" class="block size-20 shrink-0">
          </a>

          <!-- Être rappelé (pas d’écran encore) -->
          <button
            type="button"
            class="box-border flex w-full cursor-pointer items-center rounded-[10px] border border-ca-row-border bg-white p-16 text-left"
          >
            <img :src="`${ICON}/ic-ca-phone.svg`" alt="" width="48" height="48" class="mr-16 block size-48 shrink-0">
            <span class="min-w-0 flex-1 pr-8">
              <span class="block text-2xl leading-[22.5px] font-bold text-ca-heading">{{ $t('settingsHelp.callbackTitle') }}</span>
              <span class="mt-4 block text-lg leading-[17.875px] font-normal text-ca-muted">{{ $t('settingsHelp.callbackDesc') }}</span>
            </span>
            <img :src="`${ICON}/ic-ca-chevron.svg`" alt="" width="20" height="20" class="block size-20 shrink-0">
          </button>
        </div>
      </section>

      <!-- Sécurité -->
      <aside class="box-border flex w-full items-center rounded-[10px] bg-ca-secure p-20">
        <img :src="`${ICON}/ic-ca-shield.svg`" alt="" width="40" height="40" class="mr-12 block size-40 shrink-0">
        <div class="min-w-0 flex-1 pr-16">
          <p class="m-0 text-xl leading-21 font-bold text-ca-heading">{{ $t('settingsHelp.secureTitle') }}</p>
          <p class="m-0 mt-4 text-base leading-[16.5px] font-normal text-ca-muted">{{ $t('settingsHelp.secureDesc') }}</p>
        </div>
        <img
          :src="`${ICON}/illu-lock.png`"
          alt=""
          width="52"
          height="38"
          class="block h-38 w-52 shrink-0 object-contain"
        >
      </aside>
    </div>
  </div>
</template>
