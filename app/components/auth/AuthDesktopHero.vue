<script setup lang="ts">
/**
 * Panneau visuel auth desktop — largeur Figma fixe (748), pas de flex-grow.
 * Canevas 1728 : gutter 150 + form 680 + image 748 + gutter 150.
 */
defineProps<{
  src: string
}>()

const trustItems = [
  { icon: '/img/desktop/auth/trust-secure.svg', labelKey: 'desktop.auth.trust1' },
  { icon: '/img/desktop/auth/trust-support.svg', labelKey: 'desktop.auth.trust2' },
  { icon: '/img/desktop/auth/trust-studies.svg', labelKey: 'desktop.auth.trust3' },
] as const
</script>

<template>
  <aside class="relative h-full w-748 shrink-0 overflow-hidden bg-white">
    <img
      :src="src"
      alt=""
      width="748"
      height="877"
      class="absolute inset-0 size-full object-cover object-center opacity-85"
    >
    <div class="absolute inset-x-0 bottom-0 flex justify-center px-48 pb-48">
      <div
        class="box-border flex h-74 w-fit max-w-full items-center justify-center gap-26 rounded-[10px] border border-[#f1f5f9] bg-white px-32 py-11 shadow-[0_0_3.5px_rgba(0,0,0,0.15)]"
      >
        <template v-for="(item, index) in trustItems" :key="item.labelKey">
          <div
            v-if="index > 0"
            class="h-34 w-px shrink-0 bg-[#e6e5f5]"
            aria-hidden="true"
          />
          <div
            class="flex shrink-0 items-center gap-10"
            :class="index === 0 ? 'justify-center' : 'items-start'"
          >
            <img
              :src="item.icon"
              alt=""
              width="40"
              height="40"
              class="block size-40 shrink-0"
            >
            <p class="m-0 pt-6 text-md leading-[13.125px] font-semibold whitespace-pre-line text-black">
              {{ $t(item.labelKey) }}
            </p>
          </div>
        </template>
      </div>
    </div>
  </aside>
</template>
