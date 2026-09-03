<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { useMbaStore } from "@/stores";
import { ref, onBeforeMount } from "vue";
import type { MentorType } from "@/constants/constant.type";
import router from "@/router";
import { i18nRoute } from "@/utils";
import MentorCard from "@/components/atoms/MentorCard.vue";
import SingleOfferItem from "@/components/atoms/SingleOfferItem.vue";
import Pagination from "@/components/molecules/Pagination.vue?inline";

const mbaStore = useMbaStore();

const isFetching = ref<boolean>(false);

const fetchData = async (url: string) => {
  isFetching.value = true;
  await mbaStore.fetchPaginatedMentorsByArea(url);
  isFetching.value = false;
};

const handleClickMentor = (mentor: MentorType) => {
  mbaStore.setSelectedMentor(mentor);

  router.push(
    i18nRoute({
      name: "mba-mentor-presentation",
      params: {
        mentorslug: mentor?.slug,
      },
    }),
  );
};

onBeforeMount(async () => {
  isFetching.value = true;
  await Promise.all([
    mbaStore.fetchPaginatedMentorsByArea(),
    mbaStore.fetchAreaById(mbaStore.selectedFormula?.area.id as string),
  ]);
  isFetching.value = false;
});
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="flex flex-col justify-between h-full relative">
          <!-- Head -->
          <div class="h-full flex-1">
            <h6 class="font-bold pb-3 border-b mb-[30px] text-[18px]">
              {{ $t("mentors-list-headline") }}
            </h6>

            <p v-if="mbaStore.selectedArea?.offer?.description" class="text-[13px] text-ink-muted mb-[25px]">
              {{ mbaStore.selectedArea?.offer?.description }}
            </p>

            <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
              <div class="flex flex-col gap-2" v-for="mentor in mbaStore.paginatedMentors.data" :key="mentor.id">
                <MentorCard :data="mentor as MentorType" @clicked="handleClickMentor" class="max-h-[383px]!" />
                <button
                  @click="handleClickMentor(mentor as MentorType)"
                  class="text-[11px] border border-border-default rounded-full py-[5px] px-2 text-center hover:bg-surface-alt"
                >
                  {{ $t("school.mentor-presentation-title") }}
                </button>
              </div>
            </div>
          </div>
          <!-- End Head -->

          <!-- Pagination -->
          <Pagination
            v-if="!isFetching && mbaStore.paginatedMentors.data.length > 0 && mbaStore.paginatedMentors.total > 9"
            :links="mbaStore.paginatedMentors?.links"
            @goToPage="fetchData"
          />
          <!-- End Pagination -->
        </div>
      </div>

      <div class="right-part hidden lg:block">
        <div class="">
          <SingleOfferItem
            :offer="mbaStore.selectedArea?.offer"
            :withGlobalBgColor="true"
            :withPrice="false"
            :btnText="String(mbaStore.selectedArea?.offer?.amount) + ' €'"
            class="h-max"
          />
        </div>

        <div class="mt-[30px]">
          <BannerRotator class="pub" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
