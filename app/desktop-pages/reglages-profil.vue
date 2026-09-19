<script setup lang="ts">
/**
 * Informations personnelles desktop — même logique que le mobile, cadre 1728.
 */
import type { Ref } from 'vue'

type FieldIcon = 'person' | 'email' | 'phone' | 'calendar' | 'pin' | 'city'

defineProps<{
  fields: {
    id: string
    labelKey: string
    model: Ref<string>
    icon: FieldIcon
    flag?: boolean
    autocomplete?: string
    inputType?: string
  }[]
  displayPhoto: string | null
}>()

const emit = defineEmits<{
  'pick-photo': []
}>()

const ICON = '/img/icons/reglages-profil'
</script>

<template>
  <AppDesktopReglagesShell :title="$t('settingsPersonal.title')" :intro="$t('settingsPersonal.intro')">
    <section class="flex w-full flex-col rounded-[16px] border border-[#f9fafb] bg-white px-32 py-24 shadow-[0_0_3px_rgba(0,0,0,0.12)]">
      <h2 class="m-0 text-[16px] leading-24 font-semibold text-[#151515]">
        {{ $t('settingsPersonal.photoTitle') }}
      </h2>
      <div class="mt-20 flex items-center gap-20">
        <div class="relative size-88 shrink-0">
          <div class="flex size-88 items-center justify-center overflow-hidden rounded-full bg-[#f8f8fc]">
            <img
              v-if="displayPhoto"
              :src="displayPhoto"
              alt=""
              width="88"
              height="88"
              class="size-full object-cover"
            >
            <img
              v-else
              :src="`${ICON}/ic-rp-avatar-user.svg`"
              alt=""
              width="36"
              height="36"
              class="block size-36"
            >
          </div>
          <button
            type="button"
            class="absolute right-0 bottom-0 flex size-28 cursor-pointer items-center justify-center rounded-full border border-[#f3f4f6] bg-white p-0"
            :aria-label="$t('settingsPersonal.photoCta')"
            @click="emit('pick-photo')"
          >
            <img :src="`${ICON}/ic-rp-camera.svg`" alt="" width="16" height="16" class="block size-16">
          </button>
        </div>
        <div class="flex min-w-0 flex-col items-start gap-10">
          <p class="m-0 text-[13px] leading-18 text-[#6b7280]">
            {{ $t('settingsPersonal.photoHint') }}
          </p>
          <button
            type="button"
            class="flex h-40 cursor-pointer items-center justify-center rounded-[10px] border border-[#ff1b40] bg-transparent px-20 text-[14px] leading-20 font-medium text-[#ff1b40]"
            @click="emit('pick-photo')"
          >
            {{ $t('settingsPersonal.photoCta') }}
          </button>
        </div>
      </div>
    </section>

    <section class="flex w-full flex-col gap-20 rounded-[16px] border border-[#f9fafb] bg-white p-32 shadow-[0_0_3px_rgba(0,0,0,0.12)]">
      <h2 class="m-0 text-[16px] leading-24 font-semibold text-[#151515]">
        {{ $t('settingsPersonal.infoTitle') }}
      </h2>
      <div class="grid grid-cols-2 gap-x-20 gap-y-16">
        <label
          v-for="field in fields"
          :key="field.id"
          class="flex items-end gap-12"
          :class="field.id === 'email' || field.id === 'city' ? 'col-span-2' : ''"
          :for="`desk-rp-${field.id}`"
        >
          <span
            v-if="field.icon === 'person'"
            class="flex size-46 shrink-0 items-center justify-center rounded-[12px] bg-[#f8f8fc]"
            aria-hidden="true"
          >
            <img :src="`${ICON}/ic-rp-person.svg`" alt="" width="20" height="19" class="block">
          </span>
          <img
            v-else
            :src="`${ICON}/ic-rp-${field.icon}-tile.svg`"
            alt=""
            width="46"
            height="46"
            class="block size-46 shrink-0"
          >
          <span class="flex min-w-0 flex-1 flex-col items-start">
            <span class="text-[11px] leading-[16.5px] font-medium text-[#6b7280]">
              {{ $t(field.labelKey) }}
            </span>
            <span class="mt-4 box-border flex h-46 w-full items-center overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white py-12 pr-16 pl-12">
              <img
                v-if="field.flag"
                :src="`${ICON}/ic-rp-flag.svg`"
                alt=""
                width="20"
                height="14"
                class="mr-8 block h-14 w-20 shrink-0"
              >
              <input
                :id="`desk-rp-${field.id}`"
                v-model="field.model.value"
                :type="field.inputType || 'text'"
                :autocomplete="field.autocomplete"
                class="min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-20 font-medium text-[#151515] outline-0"
              >
            </span>
          </span>
        </label>
      </div>
    </section>

    <button
      type="button"
      class="flex w-full cursor-pointer items-center rounded-[16px] border border-[#f9fafb] bg-white p-24 text-left shadow-[0_0_3px_rgba(0,0,0,0.12)]"
    >
      <span class="mr-16 flex size-48 shrink-0 items-center justify-center rounded-[12px] bg-[#fef2f2]">
        <img :src="`${ICON}/ic-rp-trash.svg`" alt="" width="24" height="24" class="block size-24">
      </span>
      <span class="min-w-0 flex-1">
        <span class="block text-[14px] leading-20 font-semibold text-[#151515]">
          {{ $t('settingsPersonal.deleteTitle') }}
        </span>
        <span class="mt-4 block text-[12px] leading-16 text-[#6b7280]">
          {{ $t('settingsPersonal.deleteDesc') }}
        </span>
      </span>
      <img :src="`${ICON}/ic-rp-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0">
    </button>
  </AppDesktopReglagesShell>
</template>
