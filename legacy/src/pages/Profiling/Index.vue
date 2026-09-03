<script lang="ts" setup>
import defaultImage from "@/assets/images/france.jpeg";
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import ProfilageCategoryItem from "@/components/atoms/ProfilageCategoryItem.vue";
import { useProfilageStore } from "@/stores";
import { type Ref, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";

const router = useRouter();
const profilageStore = useProfilageStore();

const isFetching: Ref<boolean> = ref(false);

onMounted(async () => {
  isFetching.value = true;
  await profilageStore.fetchProfilage();
  isFetching.value = false;
});

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
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="main-img">
          <img :src="profilageStore.selectedProfilage?.picture ?? defaultImage" alt="" />
        </div>
        <div class="headline">
          <p>{{ profilageStore.selectedProfilage?.title }}</p>
        </div>
        <div class="my-description" v-html="profilageStore.selectedProfilage?.description"></div>

        <router-link
          :to="
            i18nRoute({
              name: 'profilage-formulas',
            })
          "
          class="z-40 rounded-full py-3 text-[14px] w-[95%] whitespace-nowrap text-center bg-black text-white flex justify-center md:hidden fixed left-[50%] bottom-2 translate-x-[-50%]"
        >
          {{ $t("profilage.see-packages") }}
        </router-link>
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
              :isActive="false"
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
