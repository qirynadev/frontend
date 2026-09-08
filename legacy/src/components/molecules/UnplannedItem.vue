<script setup lang="ts">
import type { PropType } from "vue";
import { computed } from "vue";
import { i18nRoute } from "@/utils";
import { useAuthStore } from "@/stores";
import { useI18n } from "vue-i18n";

const props = defineProps({
  course: {
    type: Object as PropType<any>,
    required: true,
  },
});

const authStore = useAuthStore();
const { t } = useI18n();

const isExpired = computed(() => props.course?.expired === true);
const daysLeft = computed(() => props.course?.days_until_expiry ?? null);
const expiresSoon = computed(() => !isExpired.value && daysLeft.value !== null && daysLeft.value <= 7);
const needsTeacher = computed(() => props.course?.needs_teacher === true || !props.course?.teacher?.id);

const selectPlanning = (item: any) => {
  authStore.selectedPlanning = item;
};
</script>

<template>
  <div
    class="w-full bg-surface border border-border-default rounded-xl shadow-sm relative flex gap-3 p-3 md:p-0 md:flex-col md:rounded-lg md:shadow-xl md:border-none"
    :class="{ 'opacity-60 grayscale': isExpired }"
  >
    <!-- Badge expiré / expire bientôt (mobile: inline, desktop: absolute) -->
    <div class="absolute top-2 left-2 z-10 hidden md:flex flex-col gap-1">
      <span v-if="isExpired" class="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
        {{ $t("planning.expired") }}
      </span>
      <span
        v-else-if="expiresSoon"
        class="text-[10px] font-bold uppercase bg-orange-500 text-white px-2 py-0.5 rounded-full"
      >
        {{ $t("planning.expires-in", { days: daysLeft }) }}
      </span>
    </div>

    <!-- Image -->
    <div class="relative shrink-0 w-20 h-20 md:w-full md:h-auto">
      <img
        class="w-full h-full object-cover rounded-lg md:rounded-none md:rounded-t-lg"
        :src="course?.picture"
        :alt="course?.title"
      />
      <!-- Badge mobile (overlay sur l'image) -->
      <span
        v-if="isExpired"
        class="md:hidden absolute top-1 left-1 text-[9px] font-bold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded-full"
      >
        {{ $t("planning.expired") }}
      </span>
      <span
        v-else-if="expiresSoon"
        class="md:hidden absolute top-1 left-1 text-[9px] font-bold uppercase bg-orange-500 text-white px-1.5 py-0.5 rounded-full"
      >
        {{ $t("planning.expires-in", { days: daysLeft }) }}
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 flex flex-col justify-between md:p-3">
      <div>
        <h5 class="text-[14px] md:text-2xl font-semibold tracking-tight text-gray-900 leading-tight mb-1">
          {{ course?.title }}
        </h5>
        <div class="flex items-center gap-1 mb-2">
          <img :src="course?.teacher?.photo" alt="team" class="w-5 h-5 rounded-full shrink-0" />
          <span class="text-[12px] text-ink-muted truncate">{{ course?.teacher?.full_name }}</span>
        </div>
      </div>

      <!-- Message d'expiration -->
      <p v-if="isExpired" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1.5 mb-2">
        {{ $t("planning.expired-message") }}
      </p>

      <!-- Bouton planifier -->
      <router-link
        v-if="!isExpired"
        :to="needsTeacher
          ? i18nRoute({ name: 'user-course-finalize', params: { orderId: course?.id as string } })
          : i18nRoute({ name: 'user-courses-planning', params: { id: course?.id as string } })"
        @click="selectPlanning(course)"
        class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-center text-white text-[12px] md:text-[15px] font-medium rounded-lg hover:opacity-80"
        :class="expiresSoon ? 'bg-orange-500' : 'bg-red-500'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        <span>{{ expiresSoon ? $t("planning.expires-soon") : $t("planning.plan") }}</span>
      </router-link>

      <!-- Désactivé si expiré -->
      <div
        v-else
        class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-center text-gray-400 text-[12px] md:text-[15px] font-medium bg-gray-200 rounded-lg cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        <span>{{ $t("planning.expired") }}</span>
      </div>
    </div>
  </div>
</template>
