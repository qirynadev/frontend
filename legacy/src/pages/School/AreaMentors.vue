<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { useAppStore, useSchoolStore } from "@/stores";
import { computed, onBeforeMount, ref, type ComputedRef } from "vue";
import type { MentorType, OfferType } from "@/constants/constant.type";
import router from "@/router";
import { i18nRoute } from "@/utils";
import MentorCard from "@/components/atoms/MentorCard.vue";
import SingleOfferItem from "@/components/atoms/SingleOfferItem.vue";
import Pagination from "@/components/molecules/Pagination.vue?inline";
import { storeToRefs } from "pinia";

const schoolStore = useSchoolStore();

const { selectedOffer, selectedMentor, paginatedMentors } = storeToRefs(schoolStore);

const isFetching = ref<boolean>(false);

const fetchData = async (url: string) => {
  isFetching.value = true;
  await schoolStore.fetchPaginatedMentorsByArea(url);
  isFetching.value = false;
};

const handleClickMentor = (mentor: MentorType) => {
  selectedMentor.value = mentor;

  router.push(
    i18nRoute({
      name: "mentor-presentation",
      params: {
        mentorslug: mentor?.slug,
        areaslug: selectedOffer?.value?.area?.slug,
      },
    }),
  );
};

onBeforeMount(async () => {
  isFetching.value = true;
  await schoolStore.fetchPaginatedMentorsByArea();
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
            <h6 class="font-bold pb-3 border-b mb-3 text-[18px]">
              {{ $t("mentors-list-headline") }}
            </h6>

            <p v-if="selectedOffer?.description" class="text-[13px] text-ink-muted mb-[25px]">
              {{ selectedOffer?.description }}
            </p>

            <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
              <div class="flex flex-col gap-2" v-for="mentor in paginatedMentors.data" :key="mentor.id">
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
            v-if="!isFetching && paginatedMentors.data?.length > 0 && paginatedMentors.total > 9"
            :links="paginatedMentors.links"
            @goToPage="fetchData"
          />
          <!-- End Pagination -->
        </div>
      </div>

      <div class="right-part hidden lg:block">
        <div class="">
          <SingleOfferItem
            :offer="selectedOffer as OfferType"
            :withGlobalBgColor="true"
            :withPrice="false"
            :btnText="String(selectedOffer?.amount) + ' €'"
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

.main {
  margin-top: 90px;
  margin-bottom: 80px;
}

.area {
  border: 1px solid #000000;

  .area-name {
    color: var(--color-ink);
  }

  .area-logo {
    width: 28px;
    height: 28px;
    margin-right: 15px;
  }

  &.selected-area {
    background-color: #273c66;

    .area-logo {
      filter: invert(1);
    }

    .area-name {
      color: #ffffff;
    }
  }
}

.titre_main {
  border-bottom: 1px solid #c0c0c091;
}

.item_domain {
  flex: 1;
  font-weight: bold;
  border-radius: 5px;
  color: var(--color-ink);
  border: 1px solid #c0c0c0a8;
  margin-bottom: 0 !important;

  img {
    width: 26px;
  }

  &.active {
    background-color: #273c66;
    color: white;

    img {
      filter: invert(1);
    }
  }

  &:not(:last-child) {
    margin-right: 8px;
  }
}

@media only screen and (max-width: 768px) {
  .main {
    margin-top: 85px;
    height: calc(100vh - 165px);
  }

  .super-cont {
    margin: 13px 10px 10px;
  }
  .right-part {
    display: none;
  }
  .titre_main {
    display: none !important;
  }
}

@media only screen and (max-width: 425px) {
  .main {
    margin-top: 75px;
    height: calc(100vh - 155px);
  }

  .mobile-logo {
    display: none;
  }

  .mobile-logo-2 {
    display: block !important;
  }

  .custom_navbar {
    position: relative !important;
  }

  .c-button {
    margin-left: 90% !important;
  }
}
</style>
