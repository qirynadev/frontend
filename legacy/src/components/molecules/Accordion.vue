<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  accordionOpen: {
    type: Boolean,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "opened", index: number): void;
}>();

const setOpenned = () => {
  emit("opened", props.index);
};
</script>

<template>
  <div class="py-2">
    <h2>
      <button
        :id="`accordion-title-${id}`"
        :class="`flex items-center ${
          accordionOpen ? 'rounded-t-[5px]' : 'rounded-[5px]'
        } bg-[#e9ebf1] py-3 px-3 borderx border-[#e9ebf1] justify-between w-full text-left font-semibold`"
        @click.prevent="setOpenned"
        :aria-expanded="accordionOpen"
        :aria-controls="`accordion-text-${id}`"
      >
        <div class="flex items-center gap-2">
          <slot name="icon" />
          <div class="lg:text-[18px]">{{ title }}</div>
        </div>
        <svg class="fill-ink shrink-0 ml-8" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            class="transform origin-center transition duration-200 ease-out"
            :class="{ 'rotate-180!': accordionOpen }"
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            class="transform origin-center rotate-90 transition duration-200 ease-out"
            :class="{ 'rotate-180!': accordionOpen }"
          />
        </svg>
      </button>
    </h2>
    <div
      :id="`accordion-text-${id}`"
      role="region"
      :aria-labelledby="`accordion-title-${id}`"
      class="grid text-sm text-slate-600 overflow-hidden transition-all duration-300 ease-in-out"
      :class="
        accordionOpen
          ? 'grid-rows-[1fr] opacity-100 p-[10px] -mt-px bg-surface border rounded-b-[5px]'
          : 'grid-rows-[0fr] opacity-0'
      "
    >
      <div class="overflow-hidden">
        <p class="pb-3">
          <slot />
        </p>
      </div>
    </div>
  </div>
</template>
