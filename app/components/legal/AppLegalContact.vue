<script setup lang="ts">
defineProps<{
  title: string
  description: string
  email: string
}>()

const ICON = '/img/icons/legal-hub'
</script>

<template>
  <a
    class="flex w-full items-center justify-between rounded-[16px] bg-rml-help p-16 text-inherit no-underline box-border shell:p-24"
    :href="`mailto:${email}`"
  >
    <span class="flex min-w-0 items-start">
      <span class="mt-2 size-40 shrink-0 overflow-hidden">
        <img :src="`${ICON}/ic-ril-mail.svg`" alt="" width="40" height="40" class="block size-40" loading="lazy" decoding="async">
      </span>
      <span class="flex min-w-0 flex-1 flex-col pl-16">
        <span class="text-2xl leading-[22.5px] font-semibold text-rml-heading shell:text-[16px] shell:leading-22">
          {{ title }}
        </span>
        <span class="mt-2 text-lg leading-[19.5px] font-normal text-rml-help-text shell:text-[13px] shell:leading-18">
          {{ description }}
          <span class="text-rml-link">{{ email }}</span>
        </span>
      </span>
    </span>
    <img :src="`${ICON}/ic-ril-mail-chevron.svg`" alt="" width="20" height="20" class="ml-8 block size-20 shrink-0" loading="lazy" decoding="async">
  </a>
</template>
