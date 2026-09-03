<script setup lang="ts">
import { isNumeric } from "@/utils/string";

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
  perPage: {
    type: Number,
    required: true,
  },
  current: {
    type: Number,
    required: true,
    default: 1,
  },
});

const emit = defineEmits<{
  (e: "goToPage", page: number): void;
}>();
</script>

<template>
  <div class="flex justify-center items-center mt-3 lg:mt-10">
    <template v-for="(page, index) in total" :key="index">
      <button
        v-if="isNumeric(page)"
        @click="() => emit('goToPage', page)"
        :class="[
          'rounded-full h-[32px] w-[32px]',
          {
            'bg-[#ff3942] text-white': page === current,
            'text-ink': page !== current,
          },
        ]"
      >
        {{ page }}
      </button>
    </template>
  </div>
</template>
