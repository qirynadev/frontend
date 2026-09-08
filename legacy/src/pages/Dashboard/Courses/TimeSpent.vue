<script setup lang="ts">
import { i18nRoute } from "@/utils";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import { computed, onBeforeMount, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import FrontPagination from "@/components/molecules/FrontPagination.vue";
import { TransitionRoot, TransitionChild, Dialog } from "@headlessui/vue";
import { CalendarIcon, CheckCircleIcon, ChevronLeftIcon, ClockIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import type { CalendarOptions } from "@fullcalendar/core";
import { storeToRefs } from "pinia";
import { formatDate } from "@/utils";
import i18n from "@/i18n";

dayjs.extend(utc);
dayjs.extend(timezone);

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const { userCalendarEvents } = storeToRefs(authStore);

const isFetching = ref<boolean>(false);
const showModal = ref<boolean>(false);
const eventForm = reactive<any>({
  title: "",
  picture: "",
  teacher: null,
  meeting: null,
  start_date: dayjs().format("YYYY-MM-DD HH:mm"),
  end_date: dayjs().add(1, "day").format("YYYY-MM-DD HH:mm"),
  status: "free",
  isPast: false,
  minutesUntilStart: 0,
});

const historyPage = ref<number>(1);
const historyPerPage = 6;

// Séances passées de l'utilisateur, triées du plus récent au plus ancien
const allPastSessions = computed(() =>
  userCalendarEvents.value
    .filter((e: any) => e.passed && e.status === "used")
    .sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime()),
);

const totalHistoryPages = computed(() => Math.ceil(allPastSessions.value.length / historyPerPage));

const pastSessions = computed(() => {
  const start = (historyPage.value - 1) * historyPerPage;
  return allPastSessions.value.slice(start, start + historyPerPage);
});

watch(allPastSessions, () => {
  historyPage.value = 1;
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
  events: userCalendarEvents.value,
  firstDay: 0,
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
  eventClassNames: (arg: any) => {
    if (arg.event.extendedProps.status === "used" && !arg.event.extendedProps.passed) {
      return ["session-joinable"];
    }
    return [];
  },
  viewDidMount: (arg: any) => {
    const axis = document.querySelector(".fc-timegrid-axis");
    if (!axis) return;

    axis.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99 0C4.47 0 0 4.48 0 10C0 15.52 4.47 20 9.99 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 9.99 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18ZM9.78 5H9.72C9.32 5 9 5.32 9 5.72V10.44C9 10.79 9.18 11.12 9.49 11.3L13.64 13.79C13.98 13.99 14.42 13.89 14.62 13.55C14.83 13.21 14.72 12.76 14.37 12.56L10.5 10.26V5.72C10.5 5.32 10.18 5 9.78 5Z" fill="#C3CAD9"/>
      </svg>`;
  },
  eventClick: function (info: any) {
    info.jsEvent.preventDefault();

    if (info.event.extendedProps.status !== "used") return;

    const isPast = info.event.extendedProps.passed;
    const startDate = dayjs(info.event.startStr);
    const endDate = dayjs(info.event.endStr);
    const now = dayjs();
    const minutesUntilStart = startDate.diff(now, "minute");

    // Dans la fenêtre 15 min avant → naviguer directement vers la session
    if (!isPast && minutesUntilStart <= 15 && now.isBefore(endDate)) {
      authStore.setMeeting({
        ...info.event.extendedProps.meeting,
        end_date: info.event.endStr,
      });
      const callRoute = router.resolve(i18nRoute({ name: "meeting-call" }));
      const callWindow = window.open(callRoute.href, "_blank");
      // Si le navigateur bloque la popup, rediriger dans le même onglet
      if (!callWindow) {
        router.push(i18nRoute({ name: "meeting-call" }));
      }
      return;
    }

    // Hors fenêtre ou passé : modal d'info
    Object.assign(eventForm, {
      title: info.event.title,
      picture: info.event.extendedProps.picture,
      teacher: info.event.extendedProps.teacher,
      meeting: null,
      start_date: dayjs(info.event.startStr).format("YYYY-MM-DD HH:mm"),
      end_date: dayjs(info.event.endStr).format("YYYY-MM-DD HH:mm"),
      status: info.event.extendedProps.status,
      isPast,
      minutesUntilStart,
    });

    showModal.value = true;
  },
});

onBeforeMount(async () => {
  const hasCache = userCalendarEvents.value.length > 0;

  if (hasCache) {
    // Affiche les données en cache, rafraîchit en arrière-plan
    calendarOptions.events = userCalendarEvents.value;
    authStore.fetchCalendarEvents().then((data) => {
      calendarOptions.events = data;
    });
  } else {
    isFetching.value = true;
    const data = await authStore.fetchCalendarEvents();
    calendarOptions.events = data;
    isFetching.value = false;
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
              {{ $t("planning.timetable") }}
            </div>
          </div>
        </div>

        <div class="w-full mb-8">
          <FullCalendar :options="calendarOptions">
            <template v-slot:eventContent="arg">
              <div
                class="border-2 bg-opacity-5 rounded-md py-2 px-3 h-full"
                :class="{
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
        </div>

        <!-- Historique des séances -->
        <div class="w-full mb-1">
          <div class="text-[25px] lg:text-[35px] font-bold mb-4">
            {{ $t("planning.history-title") }}
          </div>

          <div v-if="isFetching" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 3" :key="n" class="h-28 bg-gray-100 rounded-xl animate-pulse" />
          </div>

          <div v-else-if="pastSessions.length === 0" class="text-gray-400 text-center py-10">
            {{ $t("planning.history-empty") }}
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="session in pastSessions"
              :key="(session as any).id"
              class="bg-surface rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div class="p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="font-semibold text-gray-900 truncate text-sm leading-snug">
                    {{ (session as any).title }}
                  </div>
                  <span
                    class="ml-2 shrink-0 inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full"
                  >
                    <CheckCircleIcon class="size-3" />
                    Terminée
                  </span>
                </div>
                <div class="flex items-center gap-2 mb-3">
                  <img
                    :src="(session as any).teacher?.photo"
                    :alt="(session as any).teacher?.full_name"
                    class="w-7 h-7 rounded-full object-cover"
                  />
                  <span class="text-sm text-gray-600 truncate">{{ (session as any).teacher?.full_name }}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-400 border-t pt-2">
                  <div class="flex items-center gap-1">
                    <CalendarIcon class="size-4" />
                    {{ dayjs((session as any).start).format("DD/MM/YYYY") }}
                  </div>
                  <div class="flex items-center gap-1">
                    <ClockIcon class="size-4" />
                    {{ dayjs((session as any).start).format("HH:mm") }} —
                    {{ dayjs((session as any).end).format("HH:mm") }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FrontPagination
            v-if="totalHistoryPages > 1"
            :total="totalHistoryPages"
            :per-page="historyPerPage"
            :current="historyPage"
            @goToPage="(p: number) => (historyPage = p)"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <TransitionRoot appear :show="showModal" as="template">
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
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <div class="w-80 bg-surface rounded-2xl shadow-xl relative overflow-hidden">
              <!-- Header coloré selon état -->
              <div
                class="p-4 flex items-center justify-between"
                :class="eventForm.isPast ? 'bg-surface-alt border-b' : 'bg-blue-50 border-b border-blue-100'"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs font-semibold px-2 py-1 rounded-full"
                    :class="eventForm.isPast ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ eventForm.isPast ? "Séance terminée" : "À venir" }}
                  </span>
                </div>
                <XMarkIcon
                  @click="showModal = false"
                  class="size-6 bg-gray-200 rounded-full p-1 cursor-pointer hover:bg-gray-300 transition-colors"
                />
              </div>

              <div class="p-4">
                <!-- Titre + Prof -->
                <div class="font-semibold text-gray-900 text-base mb-1">{{ eventForm.title }}</div>
                <div class="flex items-center gap-2 mb-4">
                  <img
                    :src="eventForm.teacher?.photo"
                    :alt="eventForm.teacher?.full_name"
                    class="w-6 h-6 rounded-full object-cover"
                  />
                  <span class="text-sm text-ink-muted">{{ eventForm.teacher?.full_name }}</span>
                </div>

                <!-- Date + heure -->
                <div
                  class="flex items-center justify-between text-sm text-ink-muted bg-surface-alt rounded-lg px-3 py-2 mb-4"
                >
                  <div class="flex items-center gap-1">
                    <CalendarIcon class="size-4" />
                    {{ formatDate(eventForm.start_date, "DD/MM/YYYY") }}
                  </div>
                  <div class="flex items-center gap-1">
                    <ClockIcon class="size-4" />
                    {{ formatDate(eventForm.start_date, "HH:mm") }} — {{ formatDate(eventForm.end_date, "HH:mm") }}
                  </div>
                </div>

                <!-- Message état -->
                <div
                  v-if="eventForm.isPast"
                  class="flex items-center gap-2 bg-gray-100 rounded-lg p-3 text-sm text-gray-600"
                >
                  <CheckCircleIcon class="size-5 text-gray-400 shrink-0" />
                  Cette séance est terminée.
                </div>
                <div v-else class="flex items-center gap-2 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <ClockIcon class="size-5 text-blue-400 shrink-0" />
                  {{ $t("planning.session-available-in", { minutes: eventForm.minutesUntilStart }) }}
                </div>
              </div>
            </div>
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

    &.session-joinable,
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
