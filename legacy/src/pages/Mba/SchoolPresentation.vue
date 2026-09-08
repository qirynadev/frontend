<script lang="ts" setup>
import defaultImage from "@/assets/images/france.jpeg";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import OtherSchoolTag from "@/components/atoms/OtherSchoolTag.vue";
import router from "@/router";
import { useAppStore, useMbaStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from "vue";
import type { SchoolType } from "@/constants/constant.type";
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

const route = useRoute();
const mbaStore = useMbaStore();
const { getSelectedMenuSlug } = storeToRefs(useAppStore());

const isFetching = ref<boolean>(false);
const activeAccordion: Ref<string | number | null> = ref(0);
const activeSubAccordion: Ref<string | number | null> = ref(0);
const selectedSchool: ComputedRef<SchoolType | null> = computed(() => mbaStore.selectedSchool);
const otherSchoolList: ComputedRef<SchoolType[]> = computed(() => {
  const list = mbaStore.schoolList;
  return Array.isArray(list) ? list : [];
});

const handleClickBtn = () => {
  router.push(
    i18nRoute({
      name: "mba-formula",
    }),
  );
};

const handleClickOtherSchool = (school: SchoolType) => {
  mbaStore.selectedSchool = school;
  router.push(
    i18nRoute({
      name: "mba-school-presentation",
      params: {
        slug: getSelectedMenuSlug.value,
        schoolslug: school?.slug,
      },
    }),
  );
};

// Fetch school data based on route params
const fetchSchoolData = async () => {
  const schoolId = selectedSchool.value?.id;
  if (!schoolId || isFetching.value) return;

  isFetching.value = true;
  try {
    await Promise.all([mbaStore.fetchSchoolById(schoolId), mbaStore.fetchOtherSchools()]);
  } finally {
    isFetching.value = false;
  }
};

// Watch for route changes to reload data
watch(
  () => route.params.schoolslug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      fetchSchoolData();
    }
  },
);

onMounted(async () => {
  await fetchSchoolData();

  var accordionItems = document.querySelectorAll(".el-collapse-item__header");

  accordionItems.forEach((item) => {
    item.addEventListener("click", ({ target }) => {
      const top = (target as HTMLElement).offsetTop;
      window.scrollTo({
        top: top - 200,
        behavior: "smooth",
      });
    });
  });
});
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="pb-[80px] lg:pb-0 relative">
          <div
            class="relative mb-[15px] lg:mb-[25px] w-full border border-[#c0c0c0] h-[200px] lg:h-[300px] rounded-md overflow-hidden"
          >
            <img
              :src="selectedSchool?.image ?? defaultImage"
              alt=""
              class="absolute object-cover z-10 top-0 left-0 w-full h-full"
            />

            <div class="absolute bottom-0 left-0 w-full h-[80px] lg:h-[100px] z-30 bg-gradient">
              <div class="flex items-center justify-start h-full relative">
                <div
                  class="ms-[10px] lg:ms-[30px] h-[50px] w-[70px] lg:h-[77px] lg:w-[111px] p-[10px] lg:p-[20px] bg-surface rounded-[5px] mb-[10px]"
                >
                  <img :src="selectedSchool?.logo" class="w-full h-full object-contain" />
                </div>

                <div class="ms-[10px] lg:ms-[30px] flex flex-col text-white">
                  <p class="m-0 font-bold text-[14px] lg:text-[17px] line-clamp-1">
                    {{ selectedSchool?.title }}
                  </p>
                  <div class="localisation flex items-center gap-1 lg:gap-2">
                    <img
                      src="@/assets/images/pin-location.svg"
                      class="invert brightness-0 text-white w-[14px] lg:w-auto"
                    />
                    <p class="m-0 text-[13px] lg:text-[16px]">{{ selectedSchool?.city }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Accordion -->
          <el-collapse v-model="activeAccordion" accordion class="accordion mb-[20px]">
            <el-collapse-item
              v-if="String(selectedSchool?.presentation).length > 0"
              :title="$t('school.presentation')"
              :name="1"
            >
              <div class="h-[200px] overflow-y-auto lg:h-auto lg:overflow-visible">
                <div class="my-description" v-html="selectedSchool?.presentation"></div>
              </div>
            </el-collapse-item>

            <el-collapse-item
              v-if="(selectedSchool?.formations as any)?.length > 0"
              :title="$t('school.formations')"
              :name="2"
            >
              <!-- Sub Accordion -->
              <el-collapse v-model="activeSubAccordion" accordion class="accordion ms-5 me-2">
                <template v-for="(formation, index) in selectedSchool?.formations" :key="index">
                  <el-collapse-item :title="formation.title" :name="index + 1">
                    <div class="h-[200px] overflow-y-auto lg:h-auto lg:overflow-visible">
                      <div class="my-description" v-html="formation.description"></div>
                    </div>
                  </el-collapse-item>
                </template>
              </el-collapse>
              <!-- End Sub Accordion -->
            </el-collapse-item>

            <el-collapse-item v-for="(item, index) in selectedSchool?.details" :title="item?.title" :name="3 + index">
              <div class="h-[200px] overflow-y-auto lg:h-auto lg:overflow-visible">
                <div class="my-description" v-html="item?.description"></div>
              </div>
            </el-collapse-item>
          </el-collapse>

          <!-- Desktop inline CTA -->
          <div class="hidden lg:flex items-center justify-between gap-3 mt-[10px]">
            <p class="m-0 font-semibold text-[16px]">{{ $t("school.need-help") }}</p>
            <ButtonGeneral
              :title="$t('course.see-packages')"
              className="py-[10px] px-[30px] text-[14px] whitespace-nowrap"
              @pressed="handleClickBtn"
            />
          </div>
          <!-- End Desktop inline CTA -->
        </div>

        <!-- Mobile fixed bottom button -->
        <button
          @click.prevent="handleClickBtn"
          type="button"
          class="lg:hidden z-40 rounded-full py-3 text-[14px] w-[95%] flex justify-center whitespace-nowrap text-center bg-black text-white fixed left-[50%] bottom-5 translate-x-[-50%]"
        >
          {{ $t("school.need-coaching") }}
        </button>
      </div>

      <!-- Desktop right panel -->
      <div class="right-part hidden lg:block">
        <div class="areas-container flex flex-col h-[300px]">
          <div class="header">
            {{ $t("school.other-schools-label") }}
          </div>
          <div class="overflow-y-auto flex-1 py-[10px]">
            <OtherSchoolTag
              v-for="(item, index) in otherSchoolList"
              :key="index"
              :data="item"
              :isActive="false"
              @choosed="handleClickOtherSchool"
            />
            <p v-if="otherSchoolList.length === 0" class="text-ink-muted text-center m-0 mt-2">
              {{ $t("no-data") }}
            </p>
          </div>
        </div>

        <div class="mt-[30px]">
          <BannerRotator class="pub" />
        </div>
      </div>
      <!-- End Desktop right panel -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(#00000000, #000000cf);
}

:deep(.accordion > .el-collapse-item > .el-collapse-item__header) {
  font-size: 17px;
  font-weight: 600;
}

@media (min-width: 1024px) {
  .left-part {
    max-height: 700px;
    overflow-y: auto;
  }
}
</style>
