<script lang="ts" setup>
import type { AccordionType } from "@/constants/constant.type";
import { type PropType, type Ref, ref } from "vue";

const { data } = defineProps({
  data: {
    type: Array as PropType<AccordionType[]>,
    required: false,
    default: () => [],
  },
});

const activeAccordion: Ref<string | number | null> = ref(1);
</script>

<template>
  <el-collapse v-model="activeAccordion" accordion class="accordion my-3">
    <el-collapse-item v-for="(item, index) in data" :key="index" :title="item?.title" :name="item?.id">
      <p class="my-description">
        {{ item?.description }}
      </p>
    </el-collapse-item>
  </el-collapse>
</template>
