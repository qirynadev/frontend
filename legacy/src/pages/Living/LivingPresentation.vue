<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { GlobalLoaderVue, MentorCardLoaderVue } from "@/components/atoms/loaders";
import type { LivingType, FormulaType } from "@/constants/constant.type";
import { useAuthStore, useLivingStore, usePaymentStore } from "@/stores";
import { type ComputedRef, type Ref, computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import FormulaItem from "@/components/molecules/FormulaItem.vue";
import { Carousel, Slide } from "vue3-carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useI18n } from "vue-i18n";
import ExpenseItem from "@/components/atoms/ExpenseItem.vue";

const router = useRouter();
const livingStore = useLivingStore();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();
const { t } = useI18n();

const isFetching: Ref<boolean> = ref(false);
const isLoading: Ref<boolean> = ref(false);

const selectedLiving: ComputedRef<LivingType | null> = computed(() => livingStore.getSelectedLiving);
const selectedFormula: ComputedRef<FormulaType | null> = computed(() => livingStore.getSelectedFormula);
const formulaList: ComputedRef = computed(() => livingStore.getFormulaList);
const expenses: ComputedRef = computed(() => selectedLiving?.value?.expenses);
const expense: ComputedRef = computed(() => livingStore.getSelectedExpense);

const userToken = computed(() => authStore.token);

onBeforeMount(async () => {
  isFetching.value = true;
  await livingStore.fetchFormulas();
  isFetching.value = false;
});

const handleExpenseClick = (expense: { title: string; description: string }) => {
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

const handleFormulaClick = async (formula: FormulaType) => {
  livingStore.setSelectedFormula(formula);

  const orderData = {
    offer_id: String(selectedFormula.value?.id),
    service_id: String(selectedLiving.value?.id),
    service_type: "living",
  };

  if (!userToken.value) {
    paymentStore.setOrderData(orderData);

    return router.push(
      i18nRoute({
        name: "signin",
      }),
    );
  }

  isLoading.value = true;
  const res = await paymentStore.iniPayment(orderData);
  isLoading.value = false;

  if (res) {
    window.location.replace(paymentStore.redirectUrl ?? "");
  }
};

const handleMobileFormulaClick = () => {
  router.push(
    i18nRoute({
      name: "living-formulas",
      params: {
        slug: selectedLiving.value?.slug,
      },
    }),
  );
};

const carousel: Ref<any | null> = ref(null);
const currentSlide = ref(0);

const next = () => carousel.value?.next();
const prev = () => carousel.value?.prev();

const breakPoints = {
  768: {
    itemsToShow: 3,
    snapAlign: "start",
    spaceBetween: 1,
  },
  320: {
    itemsToShow: 2,
    snapAlign: "start",
  },
};
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="headline">
          <p>
            {{
              $t("living.expense", {
                title: expense?.title,
                country: selectedLiving?.country.name,
              })
            }}
          </p>
        </div>
        <div class="my-description" v-html="expense?.description"></div>

        <div class="formulas-section mt-[20px]">
          <div class="headline flex justify-between items-center">
            <p>{{ $t("living.formulas") }}</p>
            <div class="flex items-center gap-2 justify-end">
              <button
                @click="prev"
                class="flex p-1 rounded-full h-7 w-7 relative items-center justify-center border border-[#9e9e9e] text-[#9e9e9e]"
              >
                <ChevronLeftIcon class="w-full h-full font-bold text-[#9e9e9e]" />
              </button>
              <button
                @click="next"
                class="flex p-1 rounded-full h-7 w-7 relative items-center justify-center border border-[#9e9e9e] text-[#9e9e9e]"
              >
                <ChevronRightIcon class="w-full h-full font-bold text-[#9e9e9e]" />
              </button>
            </div>
          </div>

          <div class="formulas-carousel mt-[-20px]">
            <Carousel
              :itemsToScroll="1"
              :mouseDrag="true"
              :itemsToShow="3"
              :wrapAround="true"
              :breakpoints="breakPoints"
              :autoplay="4000"
              :pauseAutoplayOnHover="true"
              v-model="currentSlide"
              class="formulas-carousel"
              ref="carousel"
            >
              <Slide v-if="!isFetching" v-for="(formula, index) in formulaList" :key="index" class="py-[20px]">
                <FormulaItem
                  :formula="formula"
                  :btnText="$t('choose')"
                  @onPressContainer="handleFormulaClick"
                  @onPressBtn="handleFormulaClick"
                  @onMobilePress="handleMobileFormulaClick"
                  class="w-[95%]"
                  btnClassName="rounded-md bg-[#ff3942] text-white text-[12px] text-center w-[105px] h-[34px]"
                />
              </Slide>
            </Carousel>
          </div>
        </div>
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
              :isActive="exp.title == expense.title"
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
