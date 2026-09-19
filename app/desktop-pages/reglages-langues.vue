<script setup lang="ts">
/**
 * Langue desktop — options FR/EN du mobile, sélection brand (pas le violet mobile).
 */
type LocaleCode = 'fr' | 'en'

defineProps<{
  options: { code: LocaleCode, labelKey: string, descKey: string, flag: string }[]
  chosen: LocaleCode
}>()

const emit = defineEmits<{
  'update:chosen': [code: LocaleCode]
  save: []
}>()
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsLanguage.title')" :intro="$t('settingsLanguage.intro')">
    <section class="flex w-full flex-col gap-16 rounded-[16px] border border-[#f9fafb] bg-white p-32 shadow-[0_0_3px_rgba(0,0,0,0.12)]">
      <h2 class="m-0 text-[16px] leading-24 font-semibold text-[#151515]">
        {{ $t('settingsLanguage.cardTitle') }}
      </h2>
      <div class="grid grid-cols-2 gap-16" role="radiogroup" :aria-label="$t('settingsLanguage.cardTitle')">
        <button
          v-for="option in options"
          :key="option.code"
          type="button"
          role="radio"
          :aria-checked="chosen === option.code"
          class="flex cursor-pointer items-center gap-16 rounded-[12px] border p-20 text-left"
          :class="chosen === option.code
            ? 'border-[#ff1b40] bg-[#fff5f6]'
            : 'border-[#f3f4f6] bg-white'"
          @click="emit('update:chosen', option.code)"
        >
          <span class="size-48 shrink-0 overflow-hidden rounded-full">
            <img :src="option.flag" alt="" width="48" height="48" class="block size-48 object-cover">
          </span>
          <span class="flex min-w-0 flex-1 flex-col gap-4">
            <span class="text-[16px] leading-20 font-semibold text-[#151515]">{{ $t(option.labelKey) }}</span>
            <span class="text-[13px] leading-18 text-[#6b7280]">
              {{ chosen === option.code ? $t('settingsLanguage.currentLanguage') : $t(option.descKey) }}
            </span>
          </span>
          <span
            class="flex size-20 shrink-0 items-center justify-center rounded-full border"
            :class="chosen === option.code ? 'border-[#ff1b40]' : 'border-[#d1d5db]'"
          >
            <span class="size-10 rounded-full" :class="chosen === option.code ? 'bg-[#ff1b40]' : ''" />
          </span>
        </button>
      </div>
    </section>

    <aside class="flex items-center gap-16 rounded-[16px] bg-[#f8f8fc] px-24 py-16">
      <img src="/img/rl-banner-globe.webp" alt="" width="90" height="78" class="block h-78 w-90 object-contain">
      <div class="min-w-0 flex-1">
        <p class="m-0 text-[14px] leading-20 font-bold text-[#151515]">{{ $t('settingsLanguage.bannerTitle') }}</p>
        <p class="m-0 mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsLanguage.bannerDesc') }}</p>
      </div>
    </aside>

    <button
      type="button"
      class="flex w-full cursor-pointer items-center justify-center rounded-[12px] border-0 bg-[#ff1b40] py-14 text-[14px] leading-20 font-semibold text-white"
      @click="emit('save')"
    >
      {{ $t('settingsLanguage.save') }}
    </button>
  </AppDesktopReglagesShell>
</template>
