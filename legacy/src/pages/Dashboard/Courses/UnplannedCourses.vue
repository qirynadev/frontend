<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref } from "vue";
import { useAuthStore } from "@/stores";
import UnplannedItem from "@/components/molecules/UnplannedItem.vue";
import FrontPagination from "@/components/molecules/FrontPagination.vue";
import { storeToRefs } from "pinia";
import { i18nRoute } from "@/utils";
import { CalendarIcon } from "@heroicons/vue/24/outline";

const authStore = useAuthStore();

const { selectedCourse, unplannedCourses, plannedCourses } = storeToRefs(authStore);

const isFetching = ref<boolean>(false);
const currentPage = ref<number>(1);
const perPage = ref<number>(8);

const paginatedUnplanned = computed<any>(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return selectedCourse.value?.plannings?.slice(start, start + perPage.value);
});

const fetchData = async () => {
  isFetching.value = true;
  await authStore.fetchUnplannedCourses();
  await authStore.fetchPlannedCourses();
  isFetching.value = false;
};

onBeforeMount(() => {
  fetchData();
});

onBeforeUnmount(() => {
  authStore.selectedCourse = null;
  authStore.unplannedCourses = [];
});
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="w-full">
        <div class="flex items-center justify-between w-full mb-3">
          <div class="flex items-center justify-start gap-3">
            <div class="text-[17px] md:text-[32px] font-bold">
              {{ $t("planning.title") }}
            </div>

            <div class="flex items-center gap-3 mt-4">
              <div
                v-for="course in unplannedCourses"
                :key="course.title"
                class="pb-2"
                :class="{
                  'border-b-2 border-red-500': course.title == selectedCourse?.title,
                }"
              >
                <img
                  :src="course?.flag"
                  class="object-cover h-4 w-6 cursor-pointer"
                  alt=""
                  @click="
                    () => {
                      selectedCourse = course;
                      fetchData();
                    }
                  "
                />
              </div>
            </div>
          </div>

          <!-- v-if="selectedCourse.total_planned > 0" -->
          <router-link
            :to="i18nRoute({ name: 'user-time-spent' })"
            :class="{
              'pointer-events-none': Number(selectedCourse?.total_planned ?? 0) == 0,
            }"
            class="hidden whitespace-nowrap bg-red-500 hover:opacity-80 text-white px-3 py-2 rounded-md md:flex items-center justify-center gap-2"
          >
            <CalendarIcon class="size-6" />
            <div class="text-[15px] font-medium">
              {{ $t("planning.time-spent") }}
            </div>
          </router-link>
        </div>

        <div class="md:border-b flex items-center justify-between pb-3 md:mb-5">
          <div class="flex items-center gap-3 w-full">
            <router-link
              :to="i18nRoute({ name: 'user-courses-planned' })"
              :class="{
                'pointer-events-none': Number(selectedCourse?.total_planned ?? 0) == 0,
              }"
              class="w-full flex items-center justify-center gap-2 md:w-max bg-gray-200 md:bg-transparent py-1 rounded-md md:rounded-full"
            >
              <span>{{ $t("planning.planned") }}</span>
              <span
                class="hidden size-5 md:flex items-center justify-center rounded-full bg-red-500 text-white text-center text-[12px]"
              >
                {{ selectedCourse?.total_planned ?? 0 }}
              </span>
            </router-link>
            <router-link
              :to="i18nRoute({ name: 'user-courses-unplanned' })"
              :class="{
                'pointer-events-none': Number(selectedCourse?.plannings?.length ?? 0) == 0,
              }"
              class="w-full flex items-center justify-center gap-2 md:w-max bg-[#273C66] md:bg-red-500 text-white rounded-md md:rounded-full ps-3 pr-1 py-1"
            >
              <span>{{ $t("planning.unplanned") }}</span>
              <span
                class="hidden size-5 md:flex items-center justify-center rounded-md md:rounded-full bg-surface text-ink text-center text-[12px]"
              >
                {{ selectedCourse?.plannings?.length ?? 0 }}
              </span>
            </router-link>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <template v-if="isFetching" v-for="item in 8" :key="item">
            <div role="status" class="w-full border-gray-200 rounded-lg shadow-xl animate-pulse dark:border-gray-700">
              <div class="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded-t-lg dark:bg-gray-700">
                <svg
                  class="w-10 h-10 text-gray-200 dark:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 20"
                >
                  <path
                    d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"
                  />
                  <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
                </svg>
              </div>
              <div class="p-3">
                <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                <div class="flex items-center mt-4 h-12 rounded-md bg-gray-200"></div>
              </div>
            </div>
          </template>
          <template v-else>
            <template v-if="paginatedUnplanned?.length > 0">
              <template v-for="item in paginatedUnplanned" :key="item">
                <UnplannedItem :course="item" />
              </template>
            </template>
            <div v-else class="flex items-center justify-center h-full w-full col-span-4 py-20">
              <div class="text-[17px] md:text-[32px] font-bold text-center text-ink">
                {{ $t("planning.no-course") }}
              </div>
            </div>
          </template>
        </div>

        <!-- Pagination -->
        <FrontPagination
          v-if="!isFetching && selectedCourse?.plannings?.length > 0 && selectedCourse?.plannings?.length > perPage"
          :total="Math.ceil(selectedCourse?.plannings?.length / perPage)"
          :per-page="perPage"
          :current="currentPage"
          @goToPage="(p: number) => (currentPage = p)"
        />
        <!-- End Pagination -->
      </div>
    </div>
  </div>
</template>
