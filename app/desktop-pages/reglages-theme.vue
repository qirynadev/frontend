<script setup lang="ts">
/**
 * Thème desktop — trois choix en rangée fixe (pas de wrap).
 */
type ThemeId = 'clair' | 'sombre' | 'systeme'

defineProps<{
  options: { id: ThemeId, titleKey: string, descKey: string, preview: string, icon: string }[]
  chosen: ThemeId
}>()

const emit = defineEmits<{
  'update:chosen': [id: ThemeId]
  save: []
}>()
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsTheme.title')" :intro="$t('settingsTheme.intro')">
    <p class="m-0 text-[14px] leading-20 font-semibold text-[#151515]">
      {{ $t('settingsTheme.pickLabel') }}
    </p>
    <div class="grid grid-cols-3 gap-16" role="radiogroup" :aria-label="$t('settingsTheme.pickLabel')">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        role="radio"
        :aria-checked="chosen === option.id"
        class="flex cursor-pointer flex-col items-start gap-16 rounded-[16px] border p-20 text-left"
        :class="chosen === option.id
          ? 'border-[#ff1b40] bg-[#fff5f6]'
          : 'border-[#f3f4f6] bg-white'"
        @click="emit('update:chosen', option.id)"
      >
        <span class="h-120 w-full overflow-hidden rounded-[10px]">
          <img :src="option.preview" alt="" width="280" height="120" class="block size-full object-cover" loading="lazy" decoding="async">
        </span>
        <span class="flex w-full items-start gap-12">
          <QIcon :name="option.icon" :size="28" class="mt-2 shrink-0" />
          <span class="flex min-w-0 flex-1 flex-col gap-6">
            <span class="text-[15px] leading-20 font-semibold text-[#151515]">{{ $t(option.titleKey) }}</span>
            <span class="text-[12px] leading-16 text-[#6b7280]">{{ $t(option.descKey) }}</span>
          </span>
          <span
            class="flex size-20 shrink-0 items-center justify-center rounded-full border"
            :class="chosen === option.id ? 'border-[#ff1b40]' : 'border-[#d1d5db]'"
          >
            <span class="size-10 rounded-full" :class="chosen === option.id ? 'bg-[#ff1b40]' : ''" />
          </span>
        </span>
      </button>
    </div>

    <aside class="flex items-center gap-16 rounded-[12px] bg-[#f8f8fc] px-16 py-12">
      <QIcon name="ic-rt-info" :size="44" class="shrink-0" />
      <p class="m-0 text-[13px] leading-18 text-[#151515]">{{ $t('settingsTheme.infoText') }}</p>
    </aside>

    <button
      type="button"
      class="flex w-full cursor-pointer items-center justify-center rounded-[12px] border-0 bg-[#ff1b40] py-14 text-[14px] leading-20 font-semibold text-white"
      @click="emit('save')"
    >
      {{ $t('settingsTheme.save') }}
    </button>
  </AppDesktopReglagesShell>
</template>
