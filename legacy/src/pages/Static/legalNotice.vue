<script setup lang="ts">
import type { PageType } from "@/constants/constant.type";
import { useAppStore } from "@/stores";
import { type ComputedRef, computed } from "vue";
import { useSeo } from "@/composables/useSeo";

const appStore = useAppStore();
const page: ComputedRef<PageType> = computed(() => appStore.getPageList.filter((item) => item.slug === "legals")[0]);

useSeo({
  title: () => page.value?.seo_title || page.value?.title,
  description: () => page.value?.seo_description,
  image: () => page.value?.og_image,
});
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="py-[10px] lg:py-[50px]">
        <h1 class="lg:mb-[10px] text-[3em] font-light">
          {{ page?.title }}
        </h1>
        <div v-html="page?.content" class="text-justify"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
