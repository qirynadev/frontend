<script setup lang="ts">
/**
 * Offres d'accompagnement desktop ← Figma `341:3720`, 1728 px.
 * Sans fil d'Ariane. Copy et tarif suivent le domaine (`offer.slug`).
 */
import type { OfferPage } from '~/core/contracts'
import {
  DESKTOP_OFFER_ASSET,
  desktopOfferAccentKey,
  desktopOfferAdvantages,
  desktopOfferDefaultIncludes,
  desktopOfferIncludeIcons,
  desktopOfferMbaIncludes,
  desktopOfferSteps,
} from '~/config/desktop-offres-accompagnement'

const props = defineProps<{
  offer: OfferPage
}>()

const { t, n, te } = useI18n()
const ASSET = DESKTOP_OFFER_ASSET

const { pending: checkoutPending, errorKey: checkoutErrorKey, start: startCheckout } = useCheckout()

const slug = computed(() => props.offer.slug)
const domainLabel = computed(() => props.offer.title || slug.value)
const tier = computed(() => props.offer.tiers[0] ?? null)

const accent = computed(() => {
  const key = desktopOfferAccentKey(slug.value)
  if (key.endsWith('.default')) return t(key, { domain: domainLabel.value })
  if (te(key)) return t(key)
  return t('desktop.offer.accent.default', { domain: domainLabel.value })
})

const includeItems = computed(() => {
  const api = (tier.value?.features ?? []).filter(Boolean)
  if (api.length > 0) {
    const labels = api.slice(0, 7)
    const icons = desktopOfferIncludeIcons(labels.length)
    return labels.map((label, index) => ({ icon: icons[index]!, label }))
  }
  const defaults = slug.value === 'mba' ? desktopOfferMbaIncludes : desktopOfferDefaultIncludes
  return defaults.map(item => ({ icon: item.icon, label: t(item.labelKey) }))
})

const showIncludeNote = computed(() => includeItems.value.some(item => item.label.includes('*')))
</script>

<template>
  <div class="desktop-boxed flex items-start gap-20 pt-32 pb-32">
    <div class="flex w-1004 shrink-0 flex-col gap-8">
      <div class="flex items-start gap-4">
        <div class="flex w-548 shrink-0 flex-col gap-14 self-stretch pt-2">
          <span class="rounded-[6px] bg-[#fef2f2] px-12 py-4 text-[11px] leading-[16.5px] font-semibold tracking-[0.55px] text-[#ff1b40]">
            {{ $t('desktop.offer.badge', { domain: domainLabel }) }}
          </span>
          <h1 class="m-0 text-[40px] leading-46 font-bold tracking-[-1px] text-[#151515]">
            {{ $t('desktop.offer.titleLine1') }}
            <span class="block">{{ $t('desktop.offer.titleLine2') }}</span>
            <span class="block text-[#ff1b40]">{{ accent }}</span>
          </h1>
          <p class="m-0 max-w-512 text-[14px] leading-[22.75px] font-medium tracking-[-0.154px] text-black">
            {{ $t('desktop.offer.subtitle', { domain: domainLabel }) }}
          </p>
          <div class="grid grid-cols-4 gap-16 pt-16">
            <div
              v-for="item in desktopOfferAdvantages"
              :key="item.titleKey"
              class="flex flex-col items-center gap-10"
            >
              <img :src="`${ASSET}/${item.icon}`" alt="" width="45" height="45" class="block size-45 shrink-0">
              <div class="flex w-full flex-col items-start">
                <p class="m-0 text-[11px] leading-[13.75px] font-semibold tracking-[0.066px] text-[#111827]">
                  {{ $t(item.titleKey) }}
                </p>
                <p class="m-0 text-[10px] leading-[12.5px] font-medium tracking-[0.12px] text-[#6b7280]">
                  {{ $t(item.descKey) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex min-w-0 flex-1 items-start justify-center self-stretch">
          <img
            :src="`${ASSET}/hero.png`"
            alt=""
            width="475"
            height="412"
            class="block h-412 w-475 shrink-0 object-cover"
          >
        </div>
      </div>

      <div class="flex w-full flex-col gap-12 pt-16">
        <h2 class="m-0 text-[17px] leading-[25.5px] font-bold tracking-[-0.442px] text-[#151515]">
          {{ $t('desktop.offer.includedTitle') }}
        </h2>
        <div
          class="grid gap-x-10 gap-y-10 pt-8"
          :style="{ gridTemplateColumns: `repeat(${Math.max(includeItems.length, 1)}, minmax(0, 1fr))` }"
        >
          <div
            v-for="item in includeItems"
            :key="item.label"
            class="flex h-60 min-h-60 items-center gap-8 rounded-[12px] border border-[#f3f4f6] bg-white p-11 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
          >
            <span class="flex shrink-0 rounded-[6px] bg-[#fef2f2] p-6">
              <img :src="`${ASSET}/${item.icon}`" alt="" width="16" height="16" class="block size-16">
            </span>
            <p class="m-0 min-w-0 text-[9px] leading-[10.8px] font-semibold tracking-[0.171px] whitespace-pre-line text-[#1f2937]">
              {{ item.label }}
            </p>
          </div>
        </div>
        <p v-if="showIncludeNote" class="m-0 text-[10px] leading-[15px] tracking-[0.12px] text-[#6b7280]">
          {{ $t('desktop.offer.includedNote') }}
        </p>
      </div>

      <div class="flex w-full flex-col gap-40 pt-24">
        <h2 class="m-0 text-[17px] leading-[25.5px] font-bold tracking-[-0.442px] text-[#151515]">
          {{ $t('desktop.offer.methodTitle') }}
        </h2>
        <div class="relative flex w-full items-start justify-between">
          <div
            class="pointer-events-none absolute top-26 right-53 left-47 h-2 border-t-2 border-dashed border-[#ff1b40] opacity-30"
            aria-hidden="true"
          />
          <div
            v-for="step in desktopOfferSteps"
            :key="step.titleKey"
            class="relative z-1 flex w-[142px] shrink-0 flex-col items-center"
          >
            <img :src="`${ASSET}/${step.icon}`" alt="" width="54" height="54" class="block size-54 shrink-0">
            <p class="m-0 pt-10 pb-5 text-center text-[12px] leading-18 font-bold text-[#151515]">
              {{ $t(step.titleKey) }}
            </p>
            <p class="m-0 px-8 text-center text-[10px] leading-[12.5px] font-medium tracking-[0.12px] whitespace-pre-line text-[#6b7280]">
              {{ $t(step.descKey) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <aside class="desktop-rail-md flex flex-col gap-24">
      <QAlert
        v-if="checkoutErrorKey"
        tone="danger"
        :title="$t('auth.error.title')"
        :message="$t(checkoutErrorKey)"
      />
      <div class="flex w-full flex-col overflow-clip rounded-[24px] border border-[#f9fafb] bg-white p-px shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        <div class="flex w-full items-center justify-center gap-7 bg-[#1a2035] px-24 py-13">
          <span class="flex size-32 shrink-0 items-center justify-center overflow-clip">
            <img :src="`${ASSET}/trophy.svg`" alt="" width="32" height="32" class="block size-32">
          </span>
          <h2 class="m-0 text-[22px] leading-33 font-semibold tracking-[0.55px] text-white">
            {{ domainLabel }}
          </h2>
        </div>
        <ul v-if="includeItems.length" class="m-0 flex list-none flex-col gap-10 p-0 px-32 pt-32 pb-16">
          <li v-for="item in includeItems" :key="`card-${item.label}`" class="flex items-center gap-12">
            <span class="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#ff1b40]">
              <img :src="`${ASSET}/check.svg`" alt="" width="12" height="12" class="block size-12">
            </span>
            <span class="text-[14px] leading-[19.5px] font-semibold tracking-[-0.078px] whitespace-pre-line text-[#151515]">
              {{ item.label.replace(/\n/g, ' ') }}
            </span>
          </li>
        </ul>
        <div class="px-32 py-16">
          <div class="h-px w-full bg-[#f3f4f6]" />
        </div>
        <div class="flex flex-col items-center px-32 pb-16">
          <p class="m-0 pb-11 text-[38px] leading-38 font-bold tracking-[-0.95px] text-[#151515]">
            <template v-if="tier">{{ n(tier.price.amount, 'currency') }}</template>
          </p>
          <button
            v-if="tier"
            type="button"
            class="mb-16 flex w-full cursor-pointer items-center justify-center rounded-[6px] bg-[#ff1b40] py-14 text-[14px] leading-[19.5px] font-bold tracking-[-0.078px] text-white disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="checkoutPending !== null"
            @click="startCheckout(offer, tier)"
          >
            <QSpinner v-if="checkoutPending === tier.id" size="sm" />
            <span v-else>{{ $t('desktop.offer.cta') }}</span>
          </button>
          <p class="m-0 flex items-center gap-8 text-[11px] leading-[16.5px] font-medium tracking-[0.066px] text-[#6b7280]">
            <img :src="`${ASSET}/lock.svg`" alt="" width="14" height="14" class="block size-14 shrink-0">
            {{ $t('desktop.offer.secure') }}
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col items-start pt-90">
        <div class="flex w-full items-start gap-20 rounded-[6px] border border-[#fef2f2] bg-[#fff5f6] px-21 py-31 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <span class="flex size-48 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <img :src="`${ASSET}/human.svg`" alt="" width="20" height="20" class="block size-20">
          </span>
          <div class="flex min-w-0 flex-col gap-[7.375px]">
            <p class="m-0 text-[13px] leading-[16.25px] font-bold tracking-[-0.078px] whitespace-pre-line text-[#151515]">
              {{ $t('desktop.offer.humanTitle') }}
            </p>
            <p class="m-0 text-[11px] leading-[17.88px] font-semibold tracking-[0.066px] text-[#151515]">
              {{ $t('desktop.offer.humanDesc') }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
