<script setup lang="ts">
/**
 * Mot de passe desktop — jauge et règles du mobile, CTA brand desktop.
 */
defineProps<{
  current: string
  next: string
  confirm: string
  shown: Record<string, boolean>
  rules: { id: string, labelKey: string, ok: boolean }[]
  score: number
  level: 'weak' | 'medium' | 'strong'
  match: boolean | null
}>()

const emit = defineEmits<{
  toggle: [id: string]
  'update:current': [value: string]
  'update:next': [value: string]
  'update:confirm': [value: string]
}>()

const levelClass = { weak: 'text-[#e71816]', medium: 'text-[#d97706]', strong: 'text-[#279848]' }
const barClass = { weak: 'bg-[#e71816]', medium: 'bg-[#d97706]', strong: 'bg-[#279848]' }
const levelKey = {
  weak: 'settingsPassword.levelWeak',
  medium: 'settingsPassword.levelMedium',
  strong: 'settingsPassword.levelStrong',
}
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsPassword.title')" :intro="$t('settingsPassword.intro')">
    <aside class="flex items-start gap-16 rounded-[16px] border border-[#eef2ff] bg-[#f8f8fc] px-24 py-20">
      <QIcon name="ic-rm-shield" :size="44" class="shrink-0" />
      <div class="min-w-0 flex-1">
        <p class="m-0 text-[14px] leading-20 font-bold text-[#151515]">{{ $t('settingsPassword.protectTitle') }}</p>
        <p class="m-0 mt-4 text-[13px] leading-18 text-[#6b7280]">{{ $t('settingsPassword.protectDesc') }}</p>
      </div>
    </aside>

    <form class="flex w-full flex-col gap-20 rounded-[16px] border border-[#f9fafb] bg-white p-32 shadow-[0_0_3px_rgba(0,0,0,0.12)]" @submit.prevent>
      <label class="flex w-full flex-col">
        <span class="text-[14px] leading-20 font-medium text-[#040c3d]">{{ $t('settingsPassword.currentLabel') }}</span>
        <span class="relative mt-6 flex w-full items-center rounded-[12px] border border-[#e2e8f0] bg-white p-8">
          <QIcon name="ic-rm-lock" :size="36" class="mr-10 shrink-0" />
          <input
            :value="current"
            :type="shown.current ? 'text' : 'password'"
            :placeholder="$t('settingsPassword.currentPlaceholder')"
            autocomplete="current-password"
            class="min-w-0 flex-1 border-0 bg-transparent pr-28 text-[13.5px] leading-20 outline-0"
            @input="emit('update:current', ($event.target as HTMLInputElement).value)"
          >
          <button
            type="button"
            class="absolute top-1/2 right-10 flex size-24 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            :aria-label="$t('settingsPassword.togglePassword')"
            @click="emit('toggle', 'current')"
          >
            <img src="/img/icons/ic-eye.svg" alt="" width="20" height="20" class="block size-20 opacity-70">
          </button>
        </span>
      </label>

      <label class="flex w-full flex-col">
        <span class="text-[14px] leading-20 font-medium text-[#040c3d]">{{ $t('settingsPassword.newLabel') }}</span>
        <span class="relative mt-6 flex w-full items-center rounded-[12px] border border-[#e2e8f0] bg-white p-8">
          <QIcon name="ic-rm-lock" :size="36" class="mr-10 shrink-0" />
          <input
            :value="next"
            :type="shown.next ? 'text' : 'password'"
            :placeholder="$t('settingsPassword.newPlaceholder')"
            autocomplete="new-password"
            class="min-w-0 flex-1 border-0 bg-transparent pr-28 text-[13.5px] leading-20 outline-0"
            @input="emit('update:next', ($event.target as HTMLInputElement).value)"
          >
          <button
            type="button"
            class="absolute top-1/2 right-10 flex size-24 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            :aria-label="$t('settingsPassword.togglePassword')"
            @click="emit('toggle', 'next')"
          >
            <img src="/img/icons/ic-eye.svg" alt="" width="20" height="20" class="block size-20 opacity-70">
          </button>
        </span>
      </label>

      <div class="w-full">
        <p class="m-0 text-[12px] leading-18 font-medium text-[#65738f]">
          {{ $t('settingsPassword.strengthLabel') }}
          <strong :class="['font-bold', levelClass[level]]">{{ $t(levelKey[level]) }}</strong>
        </p>
        <div class="mt-8 grid w-full grid-cols-6 gap-6" aria-hidden="true">
          <span
            v-for="bar in 6"
            :key="bar"
            :class="['h-6 rounded-full', bar <= score ? barClass[level] : 'bg-[#eef0f4]']"
          />
        </div>
        <ul class="mt-16 mb-0 ml-0 grid list-none grid-cols-2 gap-x-16 gap-y-8 p-0">
          <li
            v-for="rule in rules"
            :key="rule.id"
            :class="['flex items-start gap-8 text-[12px] font-medium', rule.ok ? 'text-[#279848]' : 'text-[#65738f]']"
          >
            <span
              :class="[
                'mt-2 size-14 shrink-0 rounded-full border',
                rule.ok ? 'border-[#279848] bg-[#279848]' : 'border-[#d1d5db] bg-white',
              ]"
            />
            {{ $t(rule.labelKey) }}
          </li>
        </ul>
      </div>

      <label class="flex w-full flex-col">
        <span class="text-[14px] leading-20 font-medium text-[#040c3d]">{{ $t('settingsPassword.confirmLabel') }}</span>
        <span class="relative mt-6 flex w-full items-center rounded-[12px] border border-[#e2e8f0] bg-white p-8">
          <QIcon name="ic-rm-lock" :size="36" class="mr-10 shrink-0" />
          <input
            :value="confirm"
            :type="shown.confirm ? 'text' : 'password'"
            :placeholder="$t('settingsPassword.confirmPlaceholder')"
            autocomplete="new-password"
            class="min-w-0 flex-1 border-0 bg-transparent pr-28 text-[13.5px] leading-20 outline-0"
            @input="emit('update:confirm', ($event.target as HTMLInputElement).value)"
          >
          <button
            type="button"
            class="absolute top-1/2 right-10 flex size-24 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            :aria-label="$t('settingsPassword.togglePassword')"
            @click="emit('toggle', 'confirm')"
          >
            <img src="/img/icons/ic-eye.svg" alt="" width="20" height="20" class="block size-20 opacity-70">
          </button>
        </span>
        <span
          :class="[
            'mt-8 block text-[12px] leading-18 font-medium',
            match === null ? '' : match ? 'text-[#279848]' : 'text-[#e71816]',
          ]"
        >{{ match === null ? '' : match ? $t('settingsPassword.matchOk') : $t('settingsPassword.matchError') }}</span>
      </label>

      <aside class="flex items-center gap-16 rounded-[12px] bg-[#f8f8fc] px-16 py-12">
        <QIcon name="ic-rm-tip" :size="44" class="shrink-0" />
        <p class="m-0 text-[12px] leading-16 text-[#151515]">{{ $t('settingsPassword.tipText') }}</p>
      </aside>

      <button
        type="submit"
        class="flex w-full cursor-pointer items-center justify-center rounded-[12px] border-0 bg-[#ff1b40] py-14 text-[14px] leading-20 font-semibold text-white"
      >
        {{ $t('settingsPassword.save') }}
      </button>
    </form>
  </AppDesktopReglagesShell>
</template>
