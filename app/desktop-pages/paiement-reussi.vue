<script setup lang="ts">
/**
 * Confirmation de paiement desktop ← Figma `330:2555`.
 * CTA Figma « Retour à l'accueil » → « Mon projet ».
 */
import type { DesktopPayVariant } from '~/config/desktop-paiement-reussi'
import { DESKTOP_PAY_ASSET, desktopPaySteps } from '~/config/desktop-paiement-reussi'

const props = withDefaults(
  defineProps<{
    confirmed: boolean
    failed: boolean
    variant?: DesktopPayVariant
  }>(),
  { variant: 'default' },
)

const { t, te } = useI18n()
const localePath = useLocalePath()
const ASSET = DESKTOP_PAY_ASSET

function copy(key: string): string {
  const scoped = `desktop.paySuccess.${props.variant}.${key}`
  if (props.variant !== 'default' && te(scoped)) return t(scoped)
  return t(`desktop.paySuccess.${key}`)
}
</script>

<template>
  <div class="bg-[#fbfbfd]">
      <QAlert
        v-if="failed"
        class="desktop-boxed pt-32"
        tone="danger"
        :title="$t('confirmation.failedTitle')"
        :message="$t('confirmation.failedDescription')"
      />
      <QAlert
        v-else-if="!confirmed"
        class="desktop-boxed pt-32"
        tone="warning"
        :title="$t('confirmation.pendingTitle')"
        :message="$t('confirmation.pendingDescription')"
      />

      <template v-if="confirmed">
        <div class="desktop-boxed">
          <div class="grid h-[635.5px] grid-cols-2 gap-48">
            <div class="flex w-690 flex-col items-center self-center overflow-clip rounded-[12px] border border-[#f9fafb] bg-white px-58 py-48 shadow-[0_10px_21px_rgba(0,0,0,0.06)]">
              <div class="relative h-159 w-332 shrink-0 overflow-hidden">
                <img
                  :src="`${ASSET}/check-hero.png`"
                  alt=""
                  width="332"
                  height="159"
                  class="block size-full object-cover"
                >
              </div>
              <h1 class="m-0 pt-20 pb-12 text-center text-[32px] leading-36 font-semibold tracking-[-0.8px] text-[#1a1a1a]">
                {{ copy('title') }}
              </h1>
              <p class="m-0 pb-40 text-center text-[18px] leading-[22.5px] font-medium tracking-[-0.24px] text-[#4b5563]">
                {{ copy('subtitle') }}
              </p>
              <div class="flex w-full items-center gap-16 rounded-[6px] border border-[#d1e0ff] bg-[#f0f5ff] p-21">
                <img :src="`${ASSET}/email.svg`" alt="" width="28" height="28" class="mt-2 block size-28 shrink-0">
                <p class="m-0 text-[14px] leading-[21.13px] font-medium tracking-[-0.078px] whitespace-pre-line text-[#1e3a8a]">
                  {{ copy('email') }}
                </p>
              </div>
            </div>

            <div class="relative flex flex-col items-start self-center py-32 pl-32">
              <div class="pointer-events-none absolute top-[-98px] left-[-64px] h-541 w-753 overflow-hidden">
                <img
                  :src="`${ASSET}/illustration.png`"
                  alt=""
                  width="753"
                  height="541"
                  class="block h-full w-[107.7%] max-w-none object-cover object-left-top"
                >
              </div>
              <div class="relative z-1 flex w-full flex-col gap-16 pb-24">
                <img :src="`${ASSET}/next-icon.svg`" alt="" width="72" height="72" class="block size-72 shrink-0">
                <h2 class="m-0 pt-4 text-[24px] leading-30 font-bold tracking-[0.072px] text-[#111827]">
                  {{ copy('nextLine1') }}
                  <span class="block">{{ copy('nextLine2') }}</span>
                  <span class="block text-[#ff1b40]">{{ copy('nextAccent') }}</span>
                </h2>
                <p class="m-0 max-w-384 text-[14px] leading-[22.75px] font-medium tracking-[-0.154px] whitespace-pre-line text-[#151515]">
                  {{ copy('nextDesc') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-50 bg-white pt-20 pb-50">
          <div class="desktop-boxed flex flex-col gap-32">
            <h2 class="m-0 text-[20px] leading-28 font-bold tracking-[-0.46px] text-[#111827]">
              {{ copy('thenTitle') }}
            </h2>
            <div class="flex w-full items-center gap-20">
              <template v-for="(step, index) in desktopPaySteps" :key="step.icon">
                <div class="flex min-w-0 flex-1 items-center gap-16">
                  <span class="flex size-56 shrink-0 items-center justify-center rounded-full" :class="step.iconBg">
                    <img :src="`${ASSET}/${step.icon}`" alt="" width="24" height="24" class="block size-24">
                  </span>
                  <div class="flex min-w-0 flex-1 flex-col">
                    <p class="m-0 pb-4 text-[13px] leading-[16.25px] font-bold tracking-[-0.078px] text-[#111827]">
                      {{ index + 1 }}. {{ copy(step.titleKey) }}
                    </p>
                    <p class="m-0 max-w-150 text-[11px] leading-[13.75px] font-medium tracking-[0.066px] whitespace-pre-line text-[#6b7280]">
                      {{ copy(step.descKey) }}
                    </p>
                  </div>
                  <img
                    v-if="index < desktopPaySteps.length - 1"
                    :src="`${ASSET}/step-arrow.svg`"
                    alt=""
                    width="20"
                    height="20"
                    class="block size-20 shrink-0"
                  >
                </div>
              </template>
            </div>
          </div>

          <div class="desktop-boxed">
            <div class="flex w-full items-center justify-between rounded-[6px] border border-[#fee2e2] bg-[#fef4f3] px-33 py-26">
              <div class="flex items-center gap-20">
                <span class="flex size-56 shrink-0 items-center justify-center rounded-full bg-[#fee5e8]">
                  <img :src="`${ASSET}/headset.svg`" alt="" width="24" height="24" class="block size-24">
                </span>
                <div class="flex flex-col gap-4">
                  <p class="m-0 text-[17px] leading-[25.5px] font-bold tracking-[-0.442px] text-[#111827]">
                    {{ copy('helpTitle') }}
                  </p>
                  <p class="m-0 text-[13px] leading-[19.5px] tracking-[-0.078px] text-[#151515]">
                    {{ copy('helpDesc') }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-16">
                <SupportLink
                  class="inline-flex items-center justify-center rounded-[6px] border border-[#ff1b40] bg-white px-33 py-15 text-[13px] leading-[19.5px] font-bold tracking-[-0.078px] text-[#ff1b40] no-underline"
                >
                  {{ copy('contact') }}
                </SupportLink>
                <NuxtLink
                  :to="localePath('/mon-projet')"
                  class="inline-flex items-center justify-center rounded-[6px] border border-[#ff1b40] bg-[#ff1b40] px-33 py-15 text-[13px] leading-[19.5px] font-bold tracking-[-0.078px] text-white no-underline"
                >
                  {{ $t('nav.project') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </template>
  </div>
</template>
