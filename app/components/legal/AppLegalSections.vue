<script setup lang="ts">
import type { LegalSection } from '~/utils/split-legal-html'

defineProps<{
  sections: LegalSection[]
}>()
</script>

<template>
  <section
    v-for="section in sections"
    :key="section.title"
    class="flex w-full flex-col gap-12"
  >
    <h2 class="m-0 px-4 text-xl leading-20 font-semibold text-rml-desc shell:px-0 shell:text-[14px] shell:leading-20">
      {{ section.title }}
    </h2>
    <div class="rounded-[16px] border border-rml-row-border bg-surface-card p-16 shadow-rp-card box-border shell:rounded-[16px] shell:border-[#f3f4f6] shell:p-24 shell:shadow-[0_0_3px_rgba(0,0,0,0.12)]">
      <RichText :content="section.html" class="legal-article-rich" />
    </div>
  </section>
</template>
