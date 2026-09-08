<script setup lang="ts">
import type { PageType } from "@/constants/constant.type";
import { useAppStore } from "@/stores";
import { type ComputedRef, computed } from "vue";
import { useRouter } from "vue-router";

const appStore = useAppStore();

const router = useRouter();
const slug = router.currentRoute.value.params.slug;

const page: ComputedRef<PageType | null | undefined> = computed(() =>
  appStore.getStaticPageList.find((item) => item.slug === slug),
);

if (!page.value) {
  router.push({ name: "404", params: { catchAll: slug } });
}
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
