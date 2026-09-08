<script setup lang="ts">
import { i18nRoute } from "@/utils";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { computed, onBeforeMount, onMounted, reactive, ref, unref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import Loader from "@/components/molecules/Loader.vue";
import type { Calendar, CalendarOptions } from "@fullcalendar/core";
import { storeToRefs } from "pinia";
import { ElNotification } from "element-plus";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import i18n from "@/i18n";
import frLocale from "@fullcalendar/core/locales/fr";

dayjs.extend(utc);
dayjs.extend(timezone);

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const id = ref<string>(router.currentRoute.value.params.id as string);

const { calendarPlanned, selectedPlanning, user } = storeToRefs(authStore);

const isFetching = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const showModal = ref<boolean>(false);
const eventForm = reactive<any>({});
const rescheduleModal = ref<boolean>(false);
const rescheduleEvent = ref<any>(null);
const rescheduleStep = ref<number>(1);
const selectedNewSlot = ref<any>(null);
const isRescheduling = ref<boolean>(false);

const freeSlots = computed(() =>
  (calendarPlanned.value as any[]).filter((e: any) => e.status === "free" && e.future === true),
);

// ─── Mobile calendar state ───────────────────────────────────────────────────
const tz = dayjs.tz.guess();
const selectedDate = ref(dayjs().tz(tz));

const monthNames: Record<string, string[]> = {
  fr: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};
const dayLabels: Record<string, string[]> = {
  fr: ["D", "L", "M", "M", "J", "V", "S"],
  en: ["S", "M", "T", "W", "T", "F", "S"],
};

const currentMonthLabel = computed(() => {
  const locale = i18n.global.locale.value as string;
  const names = monthNames[locale] ?? monthNames.fr;
  return names[selectedDate.value.month()];
});

const weekDays = computed(() => {
  const start = selectedDate.value.startOf("week");
  const labels = dayLabels[i18n.global.locale.value as string] ?? dayLabels.fr;
  return Array.from({ length: 7 }, (_, i) => {
    const day = start.add(i, "day");
    return {
      date: day,
      shortLabel: labels[i],
      dayNum: day.format("D"),
      isoDate: day.format("YYYY-MM-DD"),
    };
  });
});

const selectedDayEvents = computed(() => {
  const dateStr = selectedDate.value.format("YYYY-MM-DD");
  return displayEvents.value
    .filter((e: any) => dayjs(e.start).tz(tz).format("YYYY-MM-DD") === dateStr)
    .sort((a: any, b: any) => dayjs(a.start).diff(dayjs(b.start)));
});

const prevWeek = () => {
  selectedDate.value = selectedDate.value.subtract(1, "week");
};
const nextWeek = () => {
  selectedDate.value = selectedDate.value.add(1, "week");
};

const getEventCardClass = (event: any): string => {
  const status = event.status;
  const future = event.future;
  const passed = event.passed;
  if (passed || !future) return "bg-gray-100 text-gray-400";
  if (status === "busy") return "bg-red-500 text-white";
  if (status === "used") return "bg-orange-400 text-white";
  if (status === "free") return "bg-surface border border-border-default text-gray-800 shadow-sm";
  return "bg-gray-100 text-gray-600";
};

const handleMobileEventClick = (event: any) => {
  if (id.value === "") return;

  const status = event.status;
  const future = event.future;

  if (status === "used" && event.user_id === user.value?.id && future) {
    if (dayjs(event.start).diff(dayjs(), "h") < 3) {
      ElNotification({ type: "error", message: t("planning.reschedule-blocked") });
      return;
    }
    rescheduleModal.value = true;
    rescheduleStep.value = 1;
    rescheduleEvent.value = {
      id: event.id,
      title: event.title,
      startStr: event.start,
      endStr: event.end,
    };
    selectedNewSlot.value = null;
    return;
  }

  if (dayjs(event.start).isBefore(dayjs())) return;
  if (status !== "free") return;

  if (dayjs(event.start).diff(dayjs(), "h") < 2) {
    ElNotification({ type: "error", message: t("planning.min-2h-required") });
    return;
  }

  const orderCreatedAt = selectedPlanning.value?.created_at;
  if (orderCreatedAt) {
    const maxDate = dayjs(orderCreatedAt).add(3, "month");
    if (dayjs(event.start).isAfter(maxDate)) {
      ElNotification({ type: "error", message: t("planning.max-3-months") });
      return;
    }
  }

  eventForm.start_at = event.start;
  eventForm.end_at = event.end;
  eventForm.planning_id = event.planning_id ?? event.id;
  eventForm.order_id = selectedPlanning.value?.id;
  eventForm.title = selectedPlanning.value?.title;
  showModal.value = true;
};

// Découpe les créneaux "free" de plus d'1h en sous-slots d'1h exactement
const displayEvents = computed(() => {
  const result: any[] = [];
  for (const event of calendarPlanned.value as any[]) {
    if (event.status !== "free" || !event.future) {
      result.push(event);
      continue;
    }
    const start = dayjs(event.start).tz(tz);
    const end = dayjs(event.end).tz(tz);
    const durationHours = end.diff(start, "hour");
    if (durationHours <= 1) {
      result.push(event);
    } else {
      for (let i = 0; i < durationHours; i++) {
        const slotStart = start.add(i, "hour");
        const slotEnd = start.add(i + 1, "hour");
        result.push({
          ...event,
          id: `${event.id}_${i}`,
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          planning_id: event.id, // ID original pour la réservation
        });
      }
    }
  }
  return result;
});

const isMobile = window.innerWidth < 768;

const calendarOptions = reactive<CalendarOptions>({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: isMobile ? "listWeek" : "timeGridWeek",
  now: dayjs().tz(dayjs.tz.guess()).format(),
  timeZone: "local",
  nowIndicator: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: displayEvents.value,
  firstDay: 0,
  locales: [frLocale],
  locale: i18n.global.locale.value,
  headerToolbar: {
    left: "today",
    center: "prev title next",
    right: isMobile ? "listWeek timeGridDay" : "dayGridYear,dayGridMonth,timeGridWeek,timeGridDay listWeek",
  },
  buttonText: {
    today: t("calendar.today"),
    day: t("calendar.day"),
    month: t("calendar.month"),
    week: t("calendar.week"),
    year: t("calendar.year"),
    list: t("calendar.list"),
  },
  dayHeaderFormat: {
    weekday: "long",
    day: "numeric",
  },
  slotDuration: "01:00",
  slotLabelInterval: "01:00",
  slotLabelFormat: {
    hour: "numeric",
  },
  allDaySlot: false,
  slotEventOverlap: false,
  viewDidMount: (arg: any) => {
    const axis = document.querySelector(".fc-timegrid-axis");
    if (!axis) return;

    axis.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99 0C4.47 0 0 4.48 0 10C0 15.52 4.47 20 9.99 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 9.99 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18ZM9.78 5H9.72C9.32 5 9 5.32 9 5.72V10.44C9 10.79 9.18 11.12 9.49 11.3L13.64 13.79C13.98 13.99 14.42 13.89 14.62 13.55C14.83 13.21 14.72 12.76 14.37 12.56L10.5 10.26V5.72C10.5 5.32 10.18 5 9.78 5Z" fill="#C3CAD9"/>
      </svg>`;
  },
  /* dateClick: (arg: any) => {
    if (id.value == "") return;

    if (alreadyPlanned.value) {
      ElNotification({
        type: "error",
        message: "Ce cours a déjà été planifié",
      });

      return;
    }

    if (dayjs(arg.dateStr).isBefore(dayjs().format("YYYY-MM-DD HH:mm:ss"))) {
      return;
    }

    if (dayjs(arg.dateStr).isBefore(dayjs().add(1, "hour"))) {
      ElNotification({
        type: "error",
        message:
          "La date de début doit être supérieure à +1H de l'heure actuelle",
      });

      return;
    }

    //showModal.value = true;
    //eventForm.value = arg;
  }, */
  eventClick: function (info: any) {
    info.jsEvent.preventDefault();

    if (id.value == "") return;

    if (
      info.event.extendedProps.status == "used" &&
      info.event.extendedProps.user_id == user.value?.id &&
      info.event.extendedProps.future
    ) {
      // Block reschedule if < 3h before start
      if (dayjs(info.event.startStr).diff(dayjs(), "h") < 3) {
        ElNotification({
          type: "error",
          message: t("planning.reschedule-blocked"),
        });
        return;
      }

      rescheduleModal.value = true;
      rescheduleStep.value = 1;
      rescheduleEvent.value = info.event;
      selectedNewSlot.value = null;
      return;
    }

    // Date is past
    if (dayjs(info.event.startStr).isBefore(dayjs())) {
      return;
    }

    if (info.event.extendedProps.status !== "free") {
      return;
    }

    if (dayjs(info.event.startStr).diff(dayjs(), "h") < 2) {
      ElNotification({
        type: "error",
        message: t("planning.min-2h-required"),
      });
      return;
    }

    // Vérifier que le créneau est dans les 3 mois suivant la date d'achat
    const orderCreatedAt = selectedPlanning.value?.created_at;
    if (orderCreatedAt) {
      const maxDate = dayjs(orderCreatedAt).add(3, "month");
      if (dayjs(info.event.startStr).isAfter(maxDate)) {
        ElNotification({
          type: "error",
          message: t("planning.max-3-months"),
        });
        return;
      }
    }

    eventForm.start_at = info.event.startStr;
    eventForm.end_at = info.event.endStr;
    eventForm.planning_id = info.event.extendedProps.planning_id ?? info.event.id;
    eventForm.order_id = selectedPlanning.value?.id;
    eventForm.title = selectedPlanning.value?.title;

    showModal.value = true;
  },
});

const createEvent = async () => {
  const event = unref(eventForm);

  isLoading.value = true;
  const res = await authStore.planCourse(event);
  isLoading.value = false;

  if (res) {
    closeModal();
    calendarOptions.events = displayEvents.value;
  }
};

const confirmReschedule = async () => {
  if (!selectedNewSlot.value) return;
  isRescheduling.value = true;
  const res = await authStore.reschedulePlanning({
    old_planning_id: rescheduleEvent.value.id,
    new_planning_id: selectedNewSlot.value.id,
  });
  isRescheduling.value = false;

  if (res) {
    rescheduleModal.value = false;
    calendarOptions.events = displayEvents.value;
  }
};

const closeModal = () => {
  eventForm.value = null;
  showModal.value = false;
};

watch(
  () => i18n.global.locale.value,
  (newLocale) => {
    calendarOptions.locale = newLocale;
  },
);

onBeforeMount(async () => {
  const hasCache = calendarPlanned.value.length > 0;

  if (hasCache) {
    // Affiche les données en cache immédiatement
    calendarOptions.events = displayEvents.value;
    // Rafraîchit en arrière-plan sans bloquer l'UI
    authStore.fetchCalendarEventsByTeacher().then(() => {
      calendarOptions.events = displayEvents.value;
    });
  } else {
    isFetching.value = true;
    await authStore.fetchCalendarEventsByTeacher();
    isFetching.value = false;
    calendarOptions.events = displayEvents.value;
  }
});
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="w-full">
        <div class="flex items-center justify-between w-full mb-3">
          <div class="flex items-center justify-between gap-3">
            <router-link
              :to="i18nRoute({ name: 'user-courses-unplanned' })"
              class="bg-surface-alt hover:opacity-80 text-gray-700 border p-2 rounded-full shadow-md flex items-center justify-center gap-2"
            >
              <ChevronLeftIcon class="size-5 text-ink-muted" />
            </router-link>
            <div class="lg:text-[45px] font-bold">
              {{ $t("planning.subtitle") }}
            </div>
          </div>
          <!-- :disabled="authStore.planned?.total >= 0"
            :class="{
              'opacity-50 pointer-events-none': authStore.planned?.total >= 0,
            }" -->
          <router-link
            v-if="id != ''"
            :to="i18nRoute({ name: 'user-courses-teachers' })"
            class="hidden md:flex bg-gray-950 hover:opacity-80 text-white px-2 py-1 lg:px-3 lg:py-2 rounded-md items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>

            <div class="text-[10px] lg:text-[15px] font-medium">
              {{ $t("planning.change-teacher") }}
            </div>
          </router-link>
        </div>

        <div class="border-b flex items-center justify-between pb-3 mb-5">
          <div class="text-[13px] lg:text-[30px] font-medium">
            {{ $t("planning.teacher-time-spent") }}
            {{ selectedPlanning?.teacher?.full_name }}
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             VUE MOBILE — Calendrier semaine custom
             ═══════════════════════════════════════════════ -->
        <div class="md:hidden pb-40">
          <!-- Navigation mois -->
          <div class="flex items-center justify-between px-1 mb-4">
            <button @click="prevWeek" class="p-2 rounded-full hover:bg-surface-alt">
              <ChevronLeftIcon class="size-5 text-ink-muted" />
            </button>
            <span class="font-semibold text-[15px] capitalize">
              {{ currentMonthLabel }}
              <svg class="inline size-4 text-ink-muted ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            <button @click="nextWeek" class="p-2 rounded-full hover:bg-surface-alt">
              <svg class="size-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Bande de jours -->
          <div class="grid grid-cols-7 gap-1 mb-4 px-1">
            <div
              v-for="day in weekDays"
              :key="day.isoDate"
              @click="selectedDate = day.date"
              class="flex flex-col items-center cursor-pointer py-1"
            >
              <span class="text-[10px] text-ink-muted mb-1 uppercase">{{ day.shortLabel }}</span>
              <div
                class="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-colors"
                :class="
                  day.isoDate === selectedDate.format('YYYY-MM-DD')
                    ? 'bg-red-500 text-white'
                    : 'text-ink-muted hover:bg-surface-alt'
                "
              >
                {{ day.dayNum }}
              </div>
            </div>
          </div>

          <!-- En-tête colonnes -->
          <div class="flex items-center gap-3 px-1 pb-2 border-b mb-3">
            <span class="text-[11px] text-ink-muted w-12 shrink-0">{{ $t("planning.time-spent") }}</span>
            <span class="text-[11px] text-ink-muted flex-1">{{ $t("planning.course-column") }}</span>
            <svg class="size-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>

          <!-- Liste des événements du jour -->
          <div v-if="isFetching" class="flex flex-col gap-3 px-1">
            <div v-for="n in 3" :key="n" class="flex gap-3 animate-pulse">
              <div class="w-12 space-y-1 shrink-0">
                <div class="h-3 bg-surface-alt rounded" />
                <div class="h-3 bg-surface-alt rounded w-3/4" />
              </div>
              <div class="flex-1 h-20 bg-surface-alt rounded-xl" />
            </div>
          </div>

          <div
            v-else-if="selectedDayEvents.length === 0"
            class="flex flex-col items-center justify-center py-12 text-ink-muted"
          >
            <svg class="size-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"
              />
            </svg>
            <p class="text-sm">{{ $t("planning.no-events-today") }}</p>
          </div>

          <div v-else class="flex flex-col gap-3 px-1">
            <div
              v-for="event in selectedDayEvents"
              :key="event.id || event.start"
              @click="handleMobileEventClick(event)"
              class="flex gap-3 cursor-pointer"
            >
              <!-- Colonne horaire -->
              <div class="w-12 shrink-0 flex flex-col items-end pt-3">
                <span class="text-[12px] font-semibold text-ink-muted">
                  {{ dayjs(event.start).tz(tz).format("HH:mm") }}
                </span>
                <span class="text-[11px] text-ink-muted mt-0.5">
                  {{ dayjs(event.end).tz(tz).format("HH:mm") }}
                </span>
              </div>

              <!-- Carte événement -->
              <div class="flex-1 rounded-xl p-3" :class="getEventCardClass(event)">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-[13px] leading-tight">{{ event.title }}</p>
                    <p v-if="event.chapter" class="text-[11px] mt-0.5 opacity-80">{{ event.chapter }}</p>
                    <div v-if="event.room_name" class="flex items-center gap-1 mt-1.5 text-[11px] opacity-75">
                      <svg class="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{{ event.room_name }}</span>
                    </div>
                    <div
                      v-if="event.teacher_name || event.status === 'free'"
                      class="flex items-center gap-1 mt-1 text-[11px] opacity-75"
                    >
                      <img
                        v-if="event.teacher_photo"
                        :src="event.teacher_photo"
                        class="w-4 h-4 rounded-full shrink-0 object-cover"
                      />
                      <svg v-else class="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{{ event.teacher_name ?? selectedPlanning?.teacher?.full_name }}</span>
                    </div>
                  </div>
                  <!-- Indicateur libre -->
                  <span
                    v-if="event.status === 'free' && event.future"
                    class="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-2"
                  >
                    Libre
                  </span>
                  <button class="opacity-40 ml-2 shrink-0">
                    <svg class="size-4" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons fixes bas de page (mobile) -->
          <div
            class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border-default px-4 py-3 flex flex-col gap-2 z-20 shadow-lg"
          >
            <button
              @click="
                freeSlots.length > 0
                  ? (showModal = true)
                  : ElNotification({ type: 'warning', message: $t('planning.no-slots-available') })
              "
              class="w-full py-3 rounded-xl border-2 border-border-default text-ink-muted text-[14px] font-medium hover:bg-surface-alt"
            >
              {{ $t("planning.create-appointment") }}
            </button>
            <router-link
              v-if="id != ''"
              :to="i18nRoute({ name: 'user-courses-teachers' })"
              class="w-full py-3 rounded-xl bg-black text-white text-[14px] font-medium text-center block hover:opacity-80"
            >
              {{ $t("planning.change-teacher") }}
            </router-link>
          </div>
        </div>
        <!-- ═══ FIN VUE MOBILE ═════════════════════════════════════════════ -->

        <!-- VUE DESKTOP — FullCalendar (caché sur mobile) -->
        <div class="hidden md:block w-full mb-3">
          <FullCalendar :options="calendarOptions">
            <template v-slot:eventContent="arg">
              <div
                class="border-2 bg-opacity-5 rounded-md py-2 px-3 h-full"
                :class="{
                  //used: arg.event.extendedProps.status == 'used',
                  busy: arg.event.extendedProps.status == 'busy',
                  'border-gray-500 bg-gray-500': arg.event.extendedProps.passed,
                  'border-red-500 bg-red-500':
                    arg.event.extendedProps.status == 'busy' && arg.event.extendedProps.future,
                  'border-green-500 bg-green-500':
                    arg.event.extendedProps.status == 'free' && arg.event.extendedProps.future,
                  'border-orange-500 bg-orange-500':
                    arg.event.extendedProps.status == 'used' && arg.event.extendedProps.future,
                }"
              >
                <div
                  class="text-white rounded px-2 w-max"
                  :class="{
                    'bg-gray-500': arg.event.extendedProps.passed,
                    'bg-red-500': arg.event.extendedProps.status == 'busy' && arg.event.extendedProps.future,
                    'bg-green-500': arg.event.extendedProps.status == 'free' && arg.event.extendedProps.future,
                    'bg-orange-500': arg.event.extendedProps.status == 'used' && arg.event.extendedProps.future,
                  }"
                >
                  {{ arg.timeText }}
                </div>
                <div class="text-[12px] font-medium mt-1">
                  {{
                    arg.event.extendedProps.passed && arg.event.title == "Disponible"
                      ? " Indisponible"
                      : arg.event.title
                  }}
                </div>
              </div>
            </template>
          </FullCalendar>
          <!--   <template v-slot:eventContent="arg">
              <div
                class="border-2 bg-opacity-5 rounded-md py-2 px-3 h-full"
                :class="{
                  'border-red-500 bg-red-500':
                    arg.event.extendedProps.status == 'busy',
                  'border-green-500 bg-green-500':
                    arg.event.extendedProps.status == 'free',
                  'border-orange-500 bg-orange-500':
                    arg.event.extendedProps.status == 'passed',
                }"
              >
                <div
                  class="text-white rounded px-2 w-max"
                  :class="{
                    'bg-red-500': arg.event.extendedProps.status == 'busy',
                    'bg-green-500': arg.event.extendedProps.status == 'free',
                    'bg-orange-500': arg.event.extendedProps.status == 'passed',
                  }"
                >
                  {{ arg.timeText }}
                </div>
                <div class="text-[12px] font-medium mt-1">
                  {{ arg.event.title }}
                </div>
              </div>
            </template>
          </FullCalendar> -->
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Créer un rendez-vous -->
  <TransitionRoot appear :show="showModal" as="template">
    <Dialog as="div" class="relative z-30" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-end md:items-center justify-center md:p-4">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0 translate-y-full md:translate-y-0 md:scale-95"
          enter-to="opacity-100 translate-y-0 md:scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 translate-y-0 md:scale-100"
          leave-to="opacity-0 translate-y-full md:translate-y-0 md:scale-95"
        >
          <DialogPanel class="w-full md:max-w-sm bg-surface rounded-t-3xl md:rounded-2xl shadow-xl overflow-hidden">
            <!-- Handle mobile -->
            <div class="flex justify-center pt-3 pb-1 md:hidden">
              <div class="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <!-- Titre -->
            <DialogTitle
              as="h3"
              class="text-center text-[17px] font-bold text-ink px-6 pt-4 pb-5 md:border-b md:flex md:items-center md:justify-between"
            >
              <span>{{ $t("planning.create-rdv-title") }}</span>
              <button type="button" @click="closeModal" class="flex bg-surface-alt hover:bg-gray-200 p-2 rounded-lg">
                <XMarkIcon class="size-5 text-ink-muted" />
              </button>
            </DialogTitle>

            <!-- Formulaire -->
            <form @submit.prevent="createEvent" class="px-6 pb-8 pt-2 flex flex-col gap-4">
              <!-- Date -->
              <div class="flex flex-col gap-1">
                <label class="text-[13px] text-ink-muted font-medium">{{ $t("planning.date-label") }}</label>
                <div class="bg-surface-alt rounded-xl px-4 py-3 text-[14px] text-gray-700">
                  {{ eventForm?.start_at ? dayjs(eventForm.start_at).tz(tz).format("DD/MM/YYYY") : "—" }}
                </div>
              </div>

              <!-- Heure de début -->
              <div class="flex flex-col gap-1">
                <label class="text-[13px] text-ink-muted font-medium">{{ $t("planning.start-time-label") }}</label>
                <div class="bg-surface-alt rounded-xl px-4 py-3 text-[14px] text-gray-700">
                  {{ eventForm?.start_at ? dayjs(eventForm.start_at).tz(tz).format("HH:mm") : "—" }}
                </div>
              </div>

              <!-- Heure de fin -->
              <div class="flex flex-col gap-1">
                <label class="text-[13px] text-ink-muted font-medium">{{ $t("planning.end-time-label") }}</label>
                <div class="bg-surface-alt rounded-xl px-4 py-3 text-[14px] text-gray-700">
                  {{ eventForm?.end_at ? dayjs(eventForm.end_at).tz(tz).format("HH:mm") : "—" }}
                </div>
              </div>

              <!-- Bouton valider -->
              <button
                type="submit"
                class="w-full bg-[#ff3942] text-white py-3.5 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 mt-2"
              >
                <Loader v-if="isLoading" class="size-5" />
                <span>{{ $t("send") }}</span>
              </button>
            </form>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Reschedule Modal -->
  <TransitionRoot appear :show="rescheduleModal" as="template">
    <Dialog as="div" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full mt-[80px] max-w-xl transform overflow-hidden rounded-2xl bg-surface text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-ink border-b pb-2 p-6 flex items-center justify-between"
              >
                {{ $t("planning.reschedule-title") }}
                <button
                  type="button"
                  @click="rescheduleModal = false"
                  class="bg-gray-200 hover:opacity-80 outline-none text-white px-3 py-2 rounded-md flex items-center justify-center gap-2"
                >
                  <XMarkIcon class="size-6 text-ink-muted" />
                </button>
              </DialogTitle>

              <!-- Step 1: Warning -->
              <div v-if="rescheduleStep === 1" class="p-6">
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <p class="text-orange-800 text-sm">{{ $t("planning.reschedule-warning") }}</p>
                </div>
                <div class="flex flex-col py-3 text-sm text-ink-muted gap-1">
                  <div class="font-medium text-ink">{{ rescheduleEvent?.title }}</div>
                  <div>Date: {{ rescheduleEvent ? dayjs(rescheduleEvent.startStr).format("DD/MM/YYYY") : "" }}</div>
                  <div>
                    {{ dayjs(rescheduleEvent?.startStr).format("HH:mm") }} —
                    {{ dayjs(rescheduleEvent?.endStr).format("HH:mm") }}
                  </div>
                </div>
                <button
                  type="button"
                  @click="rescheduleStep = 2"
                  class="w-full bg-[#ff3942] text-white py-3 outline-none rounded-xl flex items-center justify-center gap-2 mt-2"
                >
                  Choisir un nouveau créneau
                </button>
              </div>

              <!-- Step 2: Slot selection -->
              <div v-else class="p-6">
                <p class="text-sm text-ink-muted mb-3">{{ $t("planning.reschedule-select-slot") }}</p>
                <div class="max-h-64 overflow-y-auto flex flex-col gap-2 mb-4">
                  <button
                    v-for="slot in freeSlots"
                    :key="(slot as any).id"
                    type="button"
                    @click="selectedNewSlot = slot"
                    class="text-left p-3 rounded-lg border-2 transition-colors text-sm"
                    :class="
                      selectedNewSlot?.id === (slot as any).id
                        ? 'border-[#ff3942] bg-red-50'
                        : 'border-border-default hover:border-gray-400'
                    "
                  >
                    <div class="font-medium">{{ dayjs((slot as any).start).format("dddd DD/MM/YYYY") }}</div>
                    <div class="text-ink-muted">
                      {{ dayjs((slot as any).start).format("HH:mm") }} — {{ dayjs((slot as any).end).format("HH:mm") }}
                    </div>
                  </button>
                  <div v-if="freeSlots.length === 0" class="text-ink-muted text-sm py-4 text-center">
                    Aucun créneau disponible pour ce professeur
                  </div>
                </div>
                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="rescheduleStep = 1"
                    class="flex-1 bg-surface-alt text-gray-700 py-3 outline-none rounded-xl"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    @click="confirmReschedule"
                    :disabled="!selectedNewSlot || isRescheduling"
                    class="flex-1 bg-[#ff3942] text-white py-3 outline-none rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Loader v-if="isRescheduling" />
                    {{ $t("planning.reschedule-confirm") }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style lang="scss">
:root {
  --fc-small-font-size: 14px;
  --fc-page-bg-color: #fefefe;
  --fc-neutral-bg-color: rgba(208, 208, 208, 0.3);
  --fc-neutral-text-color: #6b7a99;
  --fc-border-color: rgba(245, 246, 247, 1);

  --fc-button-text-color: #fff;
  --fc-button-bg-color: transparent !important;
  --fc-button-border-color: #f5f6f7;
  --fc-button-hover-bg-color: #ffffff;
  --fc-button-hover-border-color: #f5f6f7;
  --fc-button-active-bg-color: #f5f6f7;
  --fc-button-active-border-color: #f5f6f7;

  --fc-event-bg-color: rgba(55, 136, 216, 0.05);
  --fc-event-border-color: transparent !important;
  --fc-event-text-color: #6b7a99;
  --fc-event-selected-overlay-color: rgba(0, 0, 0, 0.25);

  --fc-more-link-bg-color: #d0d0d0;
  --fc-more-link-text-color: inherit;

  --fc-event-resizer-thickness: 8px;
  --fc-event-resizer-dot-total-width: 8px;
  --fc-event-resizer-dot-border-width: 1px;

  --fc-non-business-color: rgba(215, 215, 215, 0.3);
  --fc-bg-event-color: transparent;
  --fc-bg-event-opacity: 0.3;
  --fc-highlight-color: rgba(188, 232, 241, 0.3);
  --fc-today-bg-color: rgba(249, 116, 21, 0.05);
  --fc-now-indicator-color: rgb(249, 115, 21);

  --fc-day-disabled-bg-color: rgba(152, 152, 152, 0.05);
}

.fc {
  border-radius: 20px !important;
  //background-color: var(--fc-page-bg-color);
  border: 1px solid var(--fc-border-color);
  box-shadow: 0px 60px 120px 0px #26334d0d !important;
  overflow: hidden;

  & .fc-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;

    & .fc-toolbar-chunk {
      display: flex;
      align-items: center;
      justify-content: center;

      & .fc-prev-button,
      .fc-next-button {
        width: 40px;
        height: 40px;
      }

      & .fc-toolbar-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--fc-neutral-text-color);
      }
    }
  }

  & .fc-button {
    display: inline-block;
    font-weight: 500;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    background-color: transparent;
    line-height: 1.5;
    font-size: 12px;
    box-shadow: 0px 2px 5px 0px #26334d08;
    border: 2px solid var(--fc-border-color);
    border-radius: 50px;
    color: var(--fc-neutral-text-color);
    text-transform: capitalize;

    &:not(:has(.fc-icon)) {
      padding: 10px 20px 10px 20px;
    }

    .fc-icon {
      color: #c3cad9 !important;
    }
  }

  & .fc-button:hover {
    background-color: var(--fc-neutral-bg-color) !important;
    color: var(--fc-neutral-text-color) !important;
    text-decoration: none;
  }

  & .fc-today-button,
  .fc-listWeek-button {
    background-color: transparent !important;
    color: var(--fc-neutral-text-color) !important;
    text-decoration: none !important;

    & .fc-button:active {
      background-color: var(--fc-neutral-bg-color) !important;
      color: var(--fc-neutral-text-color) !important;
    }
  }

  & .fc-button:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(44, 62, 80, 0.25);
    background-color: transparent !important;
  }

  & .fc-button:disabled {
    opacity: 0.65;
  }

  & .fc-button-group {
    position: relative;
    display: flex !important;
    vertical-align: middle;
    align-items: center;
    justify-items: center;
    column-gap: -2px !important;
  }

  & .fc-button-group > .fc-button {
    position: relative;
    flex: 1 1 auto;
  }

  & .fc-button-group > .fc-button:hover {
    z-index: 1;
  }

  & .fc-button-group > .fc-button:focus,
  & .fc-button-group > .fc-button:active,
  & .fc-button-group > .fc-button.fc-button-active {
    z-index: 1;
    background-color: var(--fc-neutral-bg-color) !important;
    color: var(--fc-neutral-text-color) !important;
  }

  & .fc-button-group > .fc-button:not(:first-child) {
    margin-left: -1px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  & .fc-button-group > .fc-button:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .fc-theme-standard {
    & .fc-scrollgrid {
      //border: 1px solid var(--fc-border-color); // bootstrap does this. match
      border-radius: 20px !important;
    }
  }

  & .fc-scrollgrid {
    //background-color: var(--fc-page-bg-color);
    border-collapse: separate;
    border-right-width: 0;
    border-bottom-width: 0;
    //border-radius: 20px !important;

    & table {
      // all tables (self included)
      width: 100%; // because tables don't normally do this
      table-layout: fixed;

      & th,
      & td {
        vertical-align: middle;

        &.fc-timegrid-slot {
          height: 60px !important;
          padding: 10px !important;
        }

        & .fc-timegrid-slot-label-cushion {
          font-size: 12px;
          font-weight: 700;
          color: #adb8cc;
        }
      }
    }

    & table {
      // inner tables
      border-top-style: hidden;
      border-left-style: hidden;
      border-right-style: hidden;
    }
  }

  & .fc-scrollgrid-liquid {
    height: 100%;
  }

  & .fc-scrollgrid-section {
    // a <tr>
    height: 1px; // better than 0, for firefox

    & > td {
      height: 1px; // needs a height so inner div within grow. better than 0, for firefox
    }

    /* & table {
      height: auto;
      // for most browsers, if a height isn't set on the table, can't do liquid-height within cells
      // serves as a min-height. harmless
    } */
  }

  & .fc-scrollgrid-section-liquid {
    & > td {
      height: 100%; // better than `auto`, for firefox
    }
  }

  & .fc-scrollgrid-section > * {
    border-top-width: 0;
    border-left-width: 0;
  }

  & .fc-scrollgrid-section-header > *,
  & .fc-scrollgrid-section-footer > * {
    border-bottom-width: 0;
  }

  & .fc-scrollgrid-section-header {
    height: 40px !important;
  }

  & .fc-scrollgrid-section-body table,
  & .fc-scrollgrid-section-footer table {
    border-bottom-style: hidden; // head keeps its bottom border tho
  }

  // stickiness

  & .fc-scrollgrid-section-sticky > * {
    background: var(--fc-page-bg-color);
    position: sticky;
    z-index: 3; // TODO: var
    // TODO: box-shadow when sticking
  }

  & .fc-scrollgrid-section-header.fc-scrollgrid-section-sticky > * {
    top: 0; // because border-sharing causes a gap at the top
    // TODO: give safari -1. has bug
  }

  & .fc-scrollgrid-section-footer.fc-scrollgrid-section-sticky > * {
    bottom: 0; // known bug: bottom-stickiness doesn't work in safari
  }

  & .fc-scrollgrid-sticky-shim {
    // for horizontal scrollbar
    height: 1px; // needs height to create scrollbars
    margin-bottom: -1px;
  }

  & .fc-col-header {
    & .fc-col-header-cell {
      padding: 10px 0 !important;

      & .fc-col-header-cell-cushion {
        display: inline-block; // x-browser for when sticky (when multi-tier header)
        padding: 2px 4px;
        color: var(--fc-neutral-text-color);
        font-size: 12px;
        font-weight: 700;
        text-transform: capitalize;
      }
    }

    & .fc-timegrid-axis {
      padding: 10px 0 !important;

      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .fc-timeGridWeek-view .fc-timegrid-now-indicator-arrow {
    display: none;
  }

  & .fc-event {
    //border-radius: 10px !important;
    color: #6b7a99 !important;
    //margin-top: 2px !important;
    //padding: 5px !important;
    height: 100% !important;
    width: 100% !important;
    box-shadow: none !important;

    /* &:not(.fc-event-past):not(.fc-event-future) {
            border: 2px solid #f97316 !important;
            background-color: #f9731620;

            & .fc-event-time {
                background-color: #f97316 !important;
                color: #ffffff;
                width: fit-content;
                border-radius: 5px;
                padding: 0 5px;
            }
        } */

    /* &.fc-event-past {
            border: 2px solid #ef4444 !important;
            background-color: #ef444420;

            & .fc-event-time {
                background-color: #ef4444 !important;
                color: #ffffff;
                width: fit-content;
                border-radius: 5px;
                padding: 0 5px;
            }
        } */

    //&:has(.used),
    &:has(.busy) {
      cursor: default !important;
      pointer-events: none !important;
    }

    &.fc-event-future {
      cursor: pointer;

      /* border: 2px solid #22c55e !important;
            background-color: #22c55e20;

            & .fc-event-time {
                background-color: #22c55e !important;
                color: #ffffff;
                width: fit-content;
                border-radius: 5px;
                padding: 0 5px;
            } */
    }
  }

  & .fc-day-past {
    background-color: var(--fc-day-disabled-bg-color) !important;
  }

  .fc-timeGridWeek-view,
  .fc-timeGridDay-view {
    .fc-timegrid-now-indicator-container {
      overflow: visible !important;

      .fc-timegrid-now-indicator-line {
        content: "";
        width: 100%;
        border-style: solid;
        border-width: 2px 0 0px !important;
        border-color: #f97315;
        position: absolute;
        left: 0 !important;

        &::before,
        &::after {
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          background-color: #f97315;
          border-radius: 50%;
          z-index: 9 !important;
        }

        &::before {
          top: -6px;
          left: 0;
        }

        &::after {
          top: -6px;
          right: 0;
        }
      }
    }
  }
}

@media only screen and (max-width: 480px) {
  .fc-toolbar {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
}
</style>
