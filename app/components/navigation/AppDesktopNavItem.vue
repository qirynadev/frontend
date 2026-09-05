<script setup lang="ts">
/**
 * Lien nav desktop — soulignement rouge 4px au hover (legacy Menu.vue).
 */
defineProps<{ to?: string }>()

const localePath = useLocalePath()
</script>

<template>
  <div class="group relative flex h-full items-center">
    <NuxtLink
      v-if="to"
      :to="localePath(to)"
      class="relative flex h-full items-center whitespace-nowrap px-10 pt-30 pb-26 text-[15px] font-medium text-[#3f4254] no-underline transition-colors duration-150 hover:text-[#fc1e3d]"
    >
      <slot />
    </NuxtLink>
    <span
      v-else
      class="relative flex h-full cursor-default items-center whitespace-nowrap px-10 pt-30 pb-26 text-[15px] font-medium text-[#3f4254]"
    >
      <slot />
    </span>
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-4 origin-center scale-x-0 rounded-[5px] bg-[#ff3942] transition-transform duration-500 group-hover:scale-x-100"
    />
  </div>
</template>
