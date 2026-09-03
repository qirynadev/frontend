<script setup lang="ts">
import Accordion from "@/components/molecules/Accordion.vue";
import type { PageType } from "@/constants/constant.type";
import { useAppStore } from "@/stores";
import { type ComputedRef, computed, ref } from "vue";
import { useSeo } from "@/composables/useSeo";

const appStore = useAppStore();
const page: ComputedRef<PageType> = computed(() => appStore.getPageList.filter((item) => item.slug === "faq")[0]);
const content: ComputedRef<Array<{ question: string; answer: string }>> = computed(() =>
  JSON.parse(page.value?.content ?? "[]"),
);

const activeAccordion = ref<number>(0);
const setActiveAccordion = (index: number) => {
  activeAccordion.value = index;
};

useSeo({
  title: () => page.value?.seo_title || page.value?.title,
  description: () => page.value?.seo_description,
  image: () => page.value?.og_image,
});
</script>

<template>
  <div class="global-container py-[30px] lg:py-[100px]">
    <h1 class="mt-20 lg:mt-10 text-[40px] font-bold text-[#ff3942] text-center">
      {{ page.title }}
    </h1>
    <p class="text-[20px] text-center">
      {{ $t("faqTitle") }}
    </p>

    <div class="mb-5">
      <div class="divide-yx divide-border-default">
        <template v-for="(faq, index) in content">
          <Accordion
            :title="faq.question"
            :id="`faqs-${index}`"
            :index="index"
            :accordion-open="index === activeAccordion"
            @opened="setActiveAccordion"
            class="cursor-pointer"
          >
            <div v-html="faq?.answer" class="text-justify"></div>
          </Accordion>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  padding-top: 80px;
  @media (max-width: 1023px) {
    padding-bottom: 70px;
  }
}
.accordion-item {
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid var(--color-border) !important;

  .accordion-header {
    .accordion-button {
      background-color: var(--color-surface-alt);

      &.collapsed {
        background-color: var(--color-surface-alt) !important;
      }

      &:focus {
        box-shadow: none;
      }
    }
    &::not(.collapsed) {
      background-color: var(--color-surface-alt) !important;
    }
  }

  .accordion-body {
    background-color: var(--color-surface);
  }
}
</style>
