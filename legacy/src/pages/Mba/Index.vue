<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import type { MenuChildType, PaginatedData, SchoolType } from "@/constants/constant.type";
import { type Ref, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useMbaStore } from "@/stores/mba";
import SchoolCard from "@/components/molecules/SchoolCard.vue";
import { capitalize } from "@/utils";
import { useAppStore } from "@/stores";
import Pagination from "@/components/molecules/Pagination.vue";
import MbaRegionItem from "@/components/atoms/MbaRegionItem.vue";

const router = useRouter();
const mbaStore = useMbaStore();
const appStore = useAppStore();

const selectedMenuSlug = computed<string | null>(() => appStore.selectedMenuSlug);
const paginatedSchools = computed<PaginatedData>(() => mbaStore.paginatedSchools);

const isFetching: Ref<boolean> = ref(false);

const sub_menus = computed<MenuChildType>(() => appStore.menuData?.mba?.sub_menus as MenuChildType);

onMounted(async () => {
  isFetching.value = true;
  await mbaStore.fetchSchoolListByRegion();
  isFetching.value = false;
});

const handleClickSchool = (school: SchoolType) => {
  mbaStore.selectedSchool = school;

  router.push(
    i18nRoute({
      name: "mba-school-presentation",
      params: {
        slug: selectedMenuSlug.value,
        schoolslug: school?.slug,
      },
    }),
  );
};

const handleClickRegion = async (region: any) => {
  appStore.setSelectedMenuSlug(region.slug);

  router.push(
    i18nRoute({
      name: "mba",
      params: {
        slug: region.slug,
      },
    }),
  );
};

const fetchData = async (url: string) => {
  isFetching.value = true;
  await Promise.all([mbaStore.fetchSchoolListByRegion(url), mbaStore.fetchMbaArea()]);
  isFetching.value = false;
};
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="headline flex justify-between items-center">
          <p>MBA</p>
          <span class="whitespace-nowrap">
            {{
              $t("mba.headline", {
                count: paginatedSchools?.total,
                region: capitalize(selectedMenuSlug ?? ""),
              })
            }}
          </span>
        </div>
        <div class="-ms-1 -me-px mb-[20px] flex items-center gap-2">
          <MbaRegionItem v-for="(menu, index) in sub_menus" :key="index" :item="menu" @clicked="handleClickRegion" />
        </div>

        <template v-if="isFetching">
          <div class="grid grid-cols-1 animate-pulse">
            <div
              v-for="i in 4"
              :key="i"
              class="flex items-center gap-2 justify-end lg:py-[15px] px-[5px] mb-[10px] lg:mb-[20px] border rounded-lg"
            >
              <div class="w-1/4 flex justify-center items-center px-[15px]">
                <div class="flex justify-center items-center lg:h-[130px] bg-gray-200"></div>
              </div>
              <div class="w-3/4 px-[10px] lg:px-[15px] lg:mt-[-10px] lg:mb-[5px]">
                <div class="bg-gray-200 my-[10px] lg:my-[5px] text-[14px] lg:text-[18px] font-bold mb-3 leading-[1.1]">
                  &nbsp;
                </div>
                <div class="bg-gray-200 my-description text-[15px] mb-[10px] lg:mb-0">&nbsp;</div>
                <div class="bg-gray-200 my-description text-[15px] mb-[10px] lg:mb-0">&nbsp;</div>
                <div class="bg-gray-200 my-description text-[15px] mb-[10px] lg:mb-0">&nbsp;</div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="grid grid-cols-1" v-if="paginatedSchools?.data?.length > 0">
            <template v-for="school in paginatedSchools?.data" :key="school.id">
              <router-link
                :to="
                  i18nRoute({
                    name: 'mba-school-presentation',
                    params: { schoolslug: school?.slug },
                  })
                "
                @click="handleClickSchool(school)"
              >
                <SchoolCard :school="school" />
              </router-link>
            </template>
          </div>
        </template>

        <!-- Pagination -->
        <Pagination
          v-if="!isFetching && paginatedSchools.data?.length > 0 && paginatedSchools.total > 4"
          :links="paginatedSchools?.links"
          @goToPage="fetchData"
        />
        <!-- End Pagination -->
      </div>

      <div class="right-part hidden lg:block">
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
