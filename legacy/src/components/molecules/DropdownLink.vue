<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps({
  to: {
    type: Object as any,
    required: true,
  },
});
</script>

<template>
  <RouterLink
    :to="to"
    class="flex items-center w-full px-4 py-2 text-start leading-5 text-gray-700 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out"
  >
    <slot />
  </RouterLink>
</template>
