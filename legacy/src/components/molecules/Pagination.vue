<script setup lang="ts">
import { isNumeric } from "@/utils/string";

const { links } = defineProps({
  links: {
    type: Array<{ active: boolean; label: string; url: string }>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "goToPage", page: string): void;
}>();
</script>

<template>
  <div class="flex justify-center items-center mt-3 lg:mt-10">
    <template v-for="page in links" :key="page.label">
      <button
        v-if="isNumeric(page.label)"
        @click="() => emit('goToPage', page.url)"
        :class="[
          'rounded-full h-[32px] w-[32px]',
          {
            'bg-[#ff3942] text-white': page.active,
            'text-ink': page.active === false,
          },
        ]"
      >
        {{ page.label }}
      </button>
    </template>
  </div>
</template>
