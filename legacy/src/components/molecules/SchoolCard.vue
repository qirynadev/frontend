<script lang="ts" setup>
import type { SchoolType } from "@/constants/constant.type";
import { stripHtml } from "@/utils/string";
import { computed, type PropType } from "vue";

const { school } = defineProps({
  school: {
    type: Object as PropType<SchoolType>,
    default: {},
  },
});

// L'API n'envoie plus de "description" à part (doublon de "presentation" sans HTML,
// cf. optimisation payload /all-data) — on la dérive côté client.
const description = computed(() => stripHtml(school?.presentation));
</script>

<template>
  <div
    class="flex justify-between py-[10px] lg:py-[15px] px-[5px] mb-[10px] lg:mb-[20px] items-center border border-[#d5d5d5] hover:border-transparent rounded-[6px] cursor-pointer hover:shadow-[0_.5rem_1rem_rgba(0,0,0,.15)]!"
  >
    <div class="w-1/4 flex justify-center items-start px-[8px] lg:px-[15px]">
      <div class="flex justify-center items-center h-[70px] lg:h-[130px]">
        <img :src="school?.logo" class="h-auto w-full lg:w-[85%] object-contain" />
      </div>
    </div>
    <div class="w-3/4 px-[8px] lg:px-[15px] lg:mt-[-10px] lg:mb-[5px]">
      <div class="my-[5px] lg:my-[5px] text-[13px] lg:text-[18px] font-bold mb-2 lg:mb-3 leading-[1.1]">
        {{ school?.title }}
      </div>
      <div class="my-description text-[13px] lg:text-[15px] mb-[5px] lg:mb-0 line-clamp-2 lg:line-clamp-4">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
