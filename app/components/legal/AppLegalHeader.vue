<script setup lang="ts">
defineProps<{
  title: string
  intro?: string
  updated?: string | null
}>()
</script>

<template>
  <section class="w-full">
    <h1 class="m-0 text-4xl leading-normal font-semibold tracking-[-0.65px] text-text shell:text-[25px] shell:leading-32 shell:font-bold shell:tracking-[-0.6px] shell:text-black">
      {{ title }}
    </h1>
    <p v-if="intro" class="m-0 mt-4 text-xl leading-[22.75px] font-normal text-text shell:mt-8 shell:max-w-720 shell:text-[16px] shell:leading-[22px] shell:font-medium shell:text-[#6b7280]">
      {{ intro }}
    </p>
    <p v-if="updated" class="m-0 mt-4 text-[12px] leading-21 font-normal text-rml-updated">
      {{ $t('legalPage.updatedPrefix') }} {{ updated }}
    </p>
  </section>
</template>
