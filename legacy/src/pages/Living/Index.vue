<script lang="ts" setup>
import defaultImage from "@/assets/images/france.jpeg";
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import ExpenseItem from "@/components/atoms/ExpenseItem.vue";
import { GlobalLoaderVue } from "@/components/atoms/loaders";
import type { LivingType } from "@/constants/constant.type";
import { useLivingStore } from "@/stores";
import { type ComputedRef, type Ref, computed, onMounted, ref } from "vue";
import { type RouteLocationNormalizedLoaded, useRouter } from "vue-router";
import { i18nRoute } from "@/utils";

const router = useRouter();
const livingStore = useLivingStore();

const isFetching: Ref<boolean> = ref(false);

const currentRoute: ComputedRef<RouteLocationNormalizedLoaded> = computed(() => router.currentRoute.value);
const selectedLiving: ComputedRef<LivingType | null> = computed(() =>
  livingStore.getLivingBySlug(currentRoute.value.params.slug as string),
);
const expenses: ComputedRef = computed(() => selectedLiving?.value?.expenses);

onMounted(async () => {
  isFetching.value = true;
  await livingStore.fetchLivings();
  isFetching.value = false;
});

const handleExpenseClick = (expense: { title: string; description: string }) => {
  livingStore.setSelectedLiving(selectedLiving.value as LivingType);

  router.push(
    i18nRoute({
      name: "living-detail",
      params: {
        slug: selectedLiving.value?.slug,
        expenseslug: String(expense?.title).toLowerCase(),
      },
    }),
  );
};
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="main-img">
          <img :src="selectedLiving?.picture ?? defaultImage" alt="" />
        </div>
        <div class="headline">
          <p>{{ selectedLiving?.title }}</p>
        </div>
        <div class="my-description" v-html="selectedLiving?.description"></div>

        <router-link
          :to="
            i18nRoute({
              name: 'living-formulas',
            })
          "
          @click="livingStore.setSelectedLiving(selectedLiving as LivingType)"
          class="z-40 rounded-full py-3 text-[14px] w-[95%] whitespace-nowrap text-center bg-black text-white flex justify-center md:hidden fixed left-[50%] bottom-2 translate-x-[-50%]"
        >
          {{ $t("living.see-packages") }}
        </router-link>
      </div>

      <div class="right-part hidden lg:block">
        <div class="areas-container">
          <div class="header">
            {{ $t("living.expenses") }}
          </div>

          <div v-if="isFetching">
            <div v-for="i in 5" :key="i" class="grid grid-cols-1 animate-pulse">
              <div class="bg-surface-alt h-[35px] mb-2 w-full rounded-lg"></div>
            </div>
          </div>
          <div v-else>
            <ExpenseItem
              v-for="(exp, index) in expenses"
              :key="index"
              :expense="exp"
              :isActive="false"
              @clicked="handleExpenseClick"
            />
          </div>
        </div>

        <BannerRotator class="pub" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  .container-inner {
    @media (max-width: 1023px) {
      padding-bottom: 70px;
    }
  }
}

.areas-container {
  height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  > div:not(.header) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

.main-img {
  width: 100%;
  height: 300px;
  margin-bottom: 10px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
}
.headline {
  border-bottom: 1px solid var(--color-border);
  margin: 0px 0 25px;

  p {
    font-size: 18px;
    font-weight: 700;
    display: inline-block;
    width: 100%;
    border-bottom: none !important;
    padding-bottom: 10px !important;
  }
}
</style>
