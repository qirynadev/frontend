<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import type { ProfilageType, FormulaType } from "@/constants/constant.type";
import { useAuthStore, useProfilageStore, usePaymentStore } from "@/stores";
import { type ComputedRef, type Ref, computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import FormulaItem from "@/components/molecules/FormulaItem.vue";
import { Carousel, Slide } from "vue3-carousel";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useI18n } from "vue-i18n";
import ProfilageCategoryItem from "@/components/atoms/ProfilageCategoryItem.vue";
const router = useRouter();
const profilageStore = useProfilageStore();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();
const { t } = useI18n();

const isFetching: Ref<boolean> = ref(false);
const isLoading: Ref<boolean> = ref(false);

const formulaList: ComputedRef = computed(() => profilageStore.formulaList);

const category = ref<any>(null);

const userToken = computed(() => authStore.token);

onBeforeMount(async () => {
  isFetching.value = true;
  // selectedProfilage doit être chargé avant getProfilageItem (categories) ET avant que
  // handleFormulaClick puisse l'utiliser comme service_id — sans ça, un accès direct à
  // cette page (hors Profiling/Index.vue) envoie service_id="undefined" au paiement.
  await profilageStore.fetchProfilage();
  category.value = profilageStore.getProfilageItem(router.currentRoute.value.params.slug as string);
  await profilageStore.fetchFormulas();
  isFetching.value = false;
});

const handleFormulaClick = async (formula: FormulaType) => {
  profilageStore.selectedFormula = formula;

  const orderData = {
    offer_id: String(formula.id),
    service_id: String(profilageStore.selectedProfilage?.id),
    service_type: "profilage",
    options: {
      category: category.value,
    },
  };

  if (!userToken.value) {
    paymentStore.setOrderData(orderData);
    return router.push(i18nRoute({ name: "signin" }));
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
      name: "profilage-formulas",
    }),
  );
};

const handleItemClick = (category: { icon: string; slug: string; title: string; description: string }) => {
  router.push(
    i18nRoute({
      name: "profilage-detail",
      params: {
        slug: category.slug,
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
            {{ category?.title }}
          </p>
        </div>
        <div class="my-description" v-html="category?.description"></div>

        <div class="formulas-section mt-[20px]">
          <div class="headline flex justify-between items-center">
            <p>{{ $t("profilage.formulas") }}</p>
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
                  :btnText="$t('profilage.discover')"
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
        <div v-if="!isFetching" class="areas-container">
          <div class="header">
            {{ $t("profilage.categories") }}
          </div>

          <div class="" v-if="profilageStore.selectedProfilage?.categories?.length != 0">
            <ProfilageCategoryItem
              v-for="(expense, index) in profilageStore.selectedProfilage?.categories"
              :key="index"
              :expense="expense"
              :isActive="expense.slug == category.slug"
              @clicked="handleItemClick"
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
  border-bottom: 1px solid #c0c0c091;
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
