<script lang="ts" setup>
import { type PropType, computed, onBeforeUnmount, ref } from "vue";
import { compareDates, tzFormatDate } from "@/utils";
import { useAuthStore } from "@/stores";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

import { CalendarIcon, ClockIcon, VideoCameraIcon } from "@heroicons/vue/24/outline";
import Call from "@/pages/Dashboard/Meeting/Call.vue";
import Loader from "./Loader.vue";

dayjs.extend(timezone);

const props = defineProps({
  item: {
    type: Object as PropType<any>,
    required: true,
  },
  isPlanned: {
    type: Boolean,
    default: true,
  },
});

const authStore = useAuthStore();
const showCall = ref<boolean>(false);

// Heure courante réactive — se met à jour toutes les 30s
const now = ref(dayjs());
const timer = setInterval(() => {
  now.value = dayjs();
}, 30000);
onBeforeUnmount(() => clearInterval(timer));

/**
 * "upcoming" : trop tôt (> 1 min avant le début)
 * "active"   : fenêtre valide (-1 min avant début → fin)
 * "expired"  : session terminée (maintenant > end_date)
 */
const sessionState = computed(() => {
  const inWindow =
    compareDates(now.value, props.item.start_date, "isAfter", -1, "m") &&
    compareDates(now.value, props.item.end_date, "isBefore");

  if (inWindow) return "active";
  if (compareDates(now.value, props.item.end_date, "isAfter")) return "expired";
  return "upcoming";
});

const startMeeting = () => {
  if (sessionState.value !== "active") return;
  authStore.selectedPlanning = props.item;
  authStore.meeting = props.item.meeting;
  showCall.value = true;
};
</script>

<template>
  <div
    class="w-full bg-surface border border-border-default rounded-xl shadow-sm relative flex gap-3 p-3 md:p-0 md:flex-col md:rounded-lg md:shadow-md"
  >
    <!-- Image -->
    <img
      :alt="item.language"
      :src="item.order?.associated_service?.picture || item.picture"
      class="w-20 h-20 shrink-0 rounded-lg object-cover md:w-full md:h-auto md:rounded-none md:rounded-t-lg"
    />

    <!-- Content -->
    <div class="flex-1 min-w-0 flex flex-col justify-between md:p-3">
      <div>
        <h5 class="text-[14px] md:text-2xl font-semibold tracking-tight text-gray-900 leading-tight mb-1">
          {{ item.title }}
        </h5>
        <div class="flex items-center gap-1 mb-2">
          <img :src="item.teacher?.photo" alt="team" class="w-5 h-5 rounded-full shrink-0" />
          <span class="text-[12px] text-ink-muted truncate">
            {{ item.teacher?.full_name }}
          </span>
        </div>
      </div>

      <!-- Date/time -->
      <div v-if="isPlanned" class="flex items-center gap-3 text-gray-400 mb-2 md:border-t md:pt-2 md:mb-0">
        <div class="flex items-center gap-1">
          <CalendarIcon class="size-3.5 md:size-5" />
          <span class="text-[11px] md:text-[13px]">{{ tzFormatDate(item.start_date, "DD/MM/YYYY") }}</span>
        </div>
        <div class="flex items-center gap-1">
          <ClockIcon class="size-3.5 md:size-5" />
          <span class="text-[11px] md:text-[13px]">
            {{ tzFormatDate(item.start_date, "HH:mm") }} - {{ tzFormatDate(item.end_date, "HH:mm") }}
          </span>
        </div>
      </div>

      <!-- Action button / status -->
      <div class="flex items-center md:justify-between md:mb-4" :class="isPlanned ? '' : 'mt-1'">
        <!-- Fenêtre active -->
        <button
          v-if="isPlanned && sessionState === 'active'"
          class="bg-blue-500 hover:opacity-80 text-white font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 text-[12px] w-full md:w-auto"
          @click="startMeeting"
        >
          <Loader v-if="showCall" class="size-4" />
          <VideoCameraIcon v-else class="size-4" />
          <span class="whitespace-nowrap">{{ $t("planning.start_meeting") }}</span>
        </button>

        <!-- Trop tôt -->
        <div
          v-else-if="isPlanned && sessionState === 'upcoming'"
          class="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-[11px] font-medium px-2 py-1 rounded-md"
        >
          <ClockIcon class="size-3.5 shrink-0" />
          <span class="leading-tight">
            {{
              $t("planning.session-upcoming", {
                date: tzFormatDate(item.start_date, "DD/MM/YYYY"),
                time: tzFormatDate(item.start_date, "HH:mm"),
              })
            }}
          </span>
        </div>

        <!-- Expirée -->
        <div
          v-else-if="isPlanned && sessionState === 'expired'"
          class="flex items-center gap-1 bg-gray-100 border border-border-default text-ink-muted text-[11px] font-medium px-2 py-1 rounded-md"
        >
          <span>{{ $t("planning.session-expired") }}</span>
        </div>
      </div>
    </div>

    <Call v-if="showCall" v-model="showCall" />
  </div>
</template>
