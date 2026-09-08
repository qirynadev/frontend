<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import { i18nRoute } from "@/utils";
import { ElNotification } from "element-plus";
import { useI18n } from "vue-i18n";
import { useAuthStore, useCourseStore, usePaymentStore } from "@/stores";
import type { TeacherType } from "@/constants/constant.type";
import CourseTeacherPicker from "@/components/course/CourseTeacherPicker.vue";
import CourseSlotBooking from "@/components/course/CourseSlotBooking.vue";
import { CheckBadgeIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, ClockIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/fr";
import starIcon from "@/assets/images/teachers-mobile/star-icon.svg";
import certificationIcon from "@/assets/images/teachers-mobile/certification-icon.svg";
import experienceIcon from "@/assets/images/teachers-mobile/experience-icon.svg";
import defaultCoachIMG from "@/assets/images/talk/coach-2.1669457228.png";

dayjs.extend(utc);
dayjs.extend(timezone);

const { t, locale } = useI18n();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const paymentStore = usePaymentStore();
const route = useRoute();

const step = ref<"teacher" | "slots">("teacher");
const chosenTeacher = ref<TeacherType | null>(null);
const isSaving = ref(false);

// Route param present when arriving from the dashboard (teacher-less order).
const routeOrderId = computed(() => (route.params.orderId as string) || "");

const resolvedOrder = ref<any>(null);
const order = computed<any>(() => resolvedOrder.value ?? paymentStore.order);

// `associated_service` porte l'objet cours (CourseResource : id, slug, language…).
// `service` côté API n'est qu'un libellé texte ("Cours de langues"), inutilisable ici.
// Repli sur courseStore si le contexte dashboard ne l'a pas chargé.
const course = computed<any>(() => order.value?.associated_service ?? courseStore.getSelectedCourse);

// quota = heures achetées ; repli prudent à 99 si non résolu pour ne pas bloquer la sélection
const maxSlots = computed<number>(() => {
  const n = Number(order.value?.offer?.nbr_hours ?? 0);
  return n > 0 ? n : 99;
});

onBeforeMount(async () => {
  if (routeOrderId.value) {
    // Dashboard context: resolve order from the payment list.
    const findInList = () => (paymentStore.userPaymentList ?? []).find((o: any) => o.id === routeOrderId.value) ?? null;
    let found = findInList();
    // Refetch si introuvable dans le cache (liste persistée potentiellement périmée).
    if (!found) {
      await paymentStore.fetchUserPayment();
      found = findInList();
    }
    resolvedOrder.value = found;
  } else {
    // Funnel context: use the just-paid order.
    resolvedOrder.value = paymentStore.order;
  }

  // Sans commande résolue, on ne peut pas finaliser : retour accueil.
  if (!order.value?.id) {
    router.replace(i18nRoute({ name: "home" }));
    return;
  }

  // Permettre à CourseTeacherPicker de charger les profs du bon cours.
  const svc = order.value?.associated_service;
  if (svc?.id) courseStore.setSelectedCourse(svc);
});

const onTeacherSelected = async (teacher: TeacherType) => {
  isSaving.value = true;
  const ok = await authStore.setNewTeacher({ order_id: order.value.id, teacher_id: teacher.id }, t);
  isSaving.value = false;
  if (!ok) return;
  chosenTeacher.value = teacher;
  step.value = "slots";
};

const onConfirmSlots = async (slots: { id: string; start: string; end: string }[]) => {
  if (!slots.length) return;
  isSaving.value = true;
  let booked = 0;
  for (const s of slots) {
    const { success, message } = await authStore.bookSlot({
      planning_id: s.id,
      order_id: order.value.id,
      title: course.value?.language ?? "Cours",
      start_at: s.start,
      end_at: s.end,
    });
    if (success) booked++;
    else ElNotification({ type: "error", message });
  }
  isSaving.value = false;
  // Si rien n'a pu être réservé, rester sur la page pour laisser l'utilisateur réessayer.
  if (booked === 0) return;
  if (booked === slots.length) ElNotification({ type: "success", message: t("course.bookings-confirmed") });
  // `user-courses-unplanned` n'exige pas de param et recharge ses données au montage
  // (l'ancien `user-courses-planning` requiert un :id → navigation invalide).
  router.push(i18nRoute({ name: "user-courses-unplanned" }));
};

const goLater = () => router.push(i18nRoute({ name: "user-courses-unplanned" }));
const backToTeacher = () => { step.value = "teacher"; };

// ─── Bloc mobile "Choisir un créneau" (Figma node 858:3603) ───
// Réservation d'un seul créneau à la fois (contrairement au multi-select desktop
// de CourseSlotBooking) : correspond au design mobile qui n'a ni quota ni panier
// de créneaux, juste une sélection + confirmation immédiate via onConfirmSlots.
const mobileTz = dayjs.tz.guess();
const mobileLoc = computed(() => (String(locale.value).startsWith("fr") ? "fr" : "en"));

const mobileFreeSlots = computed(() => {
  const now = dayjs();
  return ((courseStore.getSelectedTeacher as any)?.plannings ?? [])
    .filter((p: any) => p.status === "free")
    .map((p: any) => ({ ...p, _start: dayjs.utc(p.start_date).tz(mobileTz), _end: dayjs.utc(p.end_date).tz(mobileTz) }))
    .filter((p: any) => p._start.isAfter(now));
});

const mobileSlotsByDay = computed<Map<string, any[]>>(() => {
  const map = new Map<string, any[]>();
  for (const s of mobileFreeSlots.value) {
    const key = s._start.format("YYYY-MM-DD");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  for (const arr of map.values()) arr.sort((a, b) => a._start.valueOf() - b._start.valueOf());
  return map;
});

const MOBILE_DAY_WINDOW = 5;
const mobileAvailableDays = computed(() => [...mobileSlotsByDay.value.keys()].sort());
const mobileSelectedDayKey = ref<string>("");
const mobileDayWindowStart = ref(0);
const mobileVisibleDays = computed(() =>
  mobileAvailableDays.value.slice(mobileDayWindowStart.value, mobileDayWindowStart.value + MOBILE_DAY_WINDOW),
);
const mobileDaySlots = computed(() => mobileSlotsByDay.value.get(mobileSelectedDayKey.value) ?? []);
const mobileSelectedSlotId = ref<string | null>(null);
const mobileSelectedSlot = computed(() => mobileFreeSlots.value.find((s: any) => s.id === mobileSelectedSlotId.value) ?? null);

const mobileDayLabel = (key: string) => dayjs(key).locale(mobileLoc.value);
const mobileShiftDays = (dir: number) => {
  const next = mobileDayWindowStart.value + dir * MOBILE_DAY_WINDOW;
  if (next >= 0 && next < mobileAvailableDays.value.length) mobileDayWindowStart.value = next;
};

watch(mobileAvailableDays, (days) => {
  if (days.length && !days.includes(mobileSelectedDayKey.value)) mobileSelectedDayKey.value = days[0];
});

const mobileNextAvailableLabel = computed(() => {
  const first = mobileAvailableDays.value[0];
  if (!first) return "";
  const d = dayjs(first);
  const now = dayjs();
  if (d.isSame(now, "day")) return t("course.available-today");
  if (d.isSame(now.add(1, "day"), "day")) return t("course.available-tomorrow");
  return t("course.available-on", { date: d.locale(mobileLoc.value).format("D MMM") });
});

const mobileNationality = computed(() => {
  const c = chosenTeacher.value?.country as any;
  return c?.nationality ?? c?.demonym ?? c?.name ?? "";
});
const mobileTeacherRating = computed(() => {
  const r = chosenTeacher.value?.rating;
  if (r === null || r === undefined) return null;
  const f = Number(r).toFixed(1);
  return mobileLoc.value === "fr" ? f.replace(".", ",") : f;
});
const mobileTeacherCertification = computed(
  () => chosenTeacher.value?.formations?.[0]?.diploma || chosenTeacher.value?.formations?.[0]?.title || "",
);
const mobileTeacherExperience = computed(() => {
  const years = chosenTeacher.value?.experience_years;
  if (!years) return "";
  return t("course.years-of-experience", { count: years }, years);
});
const mobileSessionTitle = computed(() => (course.value?.language ? t("course.session-title", { language: course.value.language }) : ""));

const mobileToggleSlot = (id: string) => {
  mobileSelectedSlotId.value = mobileSelectedSlotId.value === id ? null : id;
};

const mobileConfirm = async () => {
  if (!mobileSelectedSlot.value) return;
  await onConfirmSlots([
    { id: mobileSelectedSlot.value.id, start: mobileSelectedSlot.value._start.format(), end: mobileSelectedSlot.value._end.format() },
  ]);
};
</script>

<template>
  <main class="finalize-page">
    <div class="hidden lg:flex finalize-head">
      <span class="step-pill" :class="{ on: step === 'teacher' }">1. {{ $t("course.step-teacher-short") }}</span>
      <span class="step-sep">→</span>
      <span class="step-pill" :class="{ on: step === 'slots' }">2. {{ $t("course.step-slots-short") }}</span>
    </div>

    <CourseTeacherPicker
      v-if="step === 'teacher'"
      :course="course"
      mode="funnel"
      @select="onTeacherSelected"
    />

    <template v-else>
      <!-- ═══════ Bloc mobile "Choisir un créneau" (Figma node 858:3603) ═══════ -->
      <div class="mx-auto w-full max-w-[26.875rem] pb-10 lg:hidden">
        <p class="text-xl font-semibold text-ink">{{ $t("course.slot-picker-title") }}</p>
        <p class="pt-1 text-[0.8125rem] text-ink">{{ $t("course.slot-picker-subtitle") }}</p>

        <!-- Carte professeur -->
        <div class="mt-5 rounded-[0.625rem] border border-border-default bg-surface p-[1.0625rem]">
          <div class="flex items-start gap-3.5">
            <div class="size-[6.625rem] shrink-0 overflow-hidden rounded-[0.625rem] bg-surface-alt">
              <img :src="chosenTeacher?.photo ?? defaultCoachIMG" :alt="chosenTeacher?.full_name" class="size-full object-cover" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <p class="truncate text-[1.0625rem] font-bold text-ink">{{ chosenTeacher?.full_name }}</p>
                <CheckBadgeIcon class="size-3.5 shrink-0 text-[#4f18f6]" />
              </div>
              <div v-if="chosenTeacher?.country_flag" class="flex items-center gap-1.5 pt-1">
                <img :src="chosenTeacher.country_flag" class="h-[0.625rem] w-[0.8125rem] shrink-0 rounded-[1px] object-cover" alt="" />
                <span class="text-xs text-ink">{{ mobileNationality }}</span>
              </div>
              <div v-if="mobileTeacherCertification" class="flex items-center gap-1.5 pt-1">
                <img :src="certificationIcon" class="size-3 shrink-0" alt="" />
                <span class="truncate text-[0.71875rem] text-ink">{{ mobileTeacherCertification }}</span>
              </div>
              <div v-if="mobileTeacherRating" class="flex items-center gap-1.5 pt-1">
                <img :src="starIcon" class="size-3 shrink-0" alt="" />
                <span class="text-[0.71875rem] font-semibold text-ink">{{ mobileTeacherRating }}</span>
                <span class="text-[0.625rem] text-ink-muted">({{ chosenTeacher?.reviews_count }} {{ $t("course.reviews") }})</span>
              </div>
              <div v-if="mobileTeacherExperience" class="flex items-center gap-1.5 pt-1">
                <img :src="experienceIcon" class="size-3 shrink-0" alt="" />
                <span class="text-[0.625rem] text-ink">{{ mobileTeacherExperience }}</span>
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between border-t border-border-default pt-3">
            <span v-if="mobileNextAvailableLabel" class="flex items-center gap-1 rounded-[0.3125rem] bg-[#ebf4fd] px-2.5 py-1">
              <span class="size-1.5 shrink-0 rounded-full bg-[#0a7ff8]"></span>
              <span class="text-[0.6875rem] font-medium text-[#0a7ff8]">{{ mobileNextAvailableLabel }}</span>
            </span>
            <div v-if="mobileSessionTitle" class="text-right">
              <p class="text-[0.625rem] font-bold text-ink">{{ mobileSessionTitle }}</p>
              <p class="flex items-center justify-end gap-1 pt-0.5 text-[0.625rem] text-ink-muted">
                <ClockIcon class="size-3" /> 60 min
              </p>
            </div>
          </div>
        </div>

        <!-- 1. Choisir une date -->
        <div class="mt-5">
          <p class="text-[0.8125rem] font-semibold text-ink">{{ $t("course.choose-date-step") }}</p>
          <div v-if="!mobileAvailableDays.length" class="mt-3 rounded-[0.625rem] border border-border-default p-4 text-center text-xs text-ink-muted">
            {{ $t("course.no-slots") }}
          </div>
          <div v-else class="mt-3 flex items-center gap-2">
            <button
              type="button"
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)] disabled:opacity-30"
              :disabled="mobileDayWindowStart === 0"
              @click="mobileShiftDays(-1)"
            >
              <ChevronLeftIcon class="size-3.5" />
            </button>
            <div class="grid flex-1 grid-cols-5 gap-2">
              <button
                v-for="key in mobileVisibleDays"
                :key="key"
                type="button"
                class="flex flex-col items-center justify-center rounded-[0.625rem] border py-[0.6875rem]"
                :class="key === mobileSelectedDayKey ? 'border-[#3709fc] bg-surface-tint' : 'border-border-default bg-surface'"
                @click="mobileSelectedDayKey = key"
              >
                <span class="text-[0.6875rem] font-medium capitalize" :class="key === mobileSelectedDayKey ? 'text-[#4f18f6]' : 'text-ink-muted'">
                  {{ mobileDayLabel(key).format("ddd") }}
                </span>
                <span class="pt-0.5 text-lg font-semibold" :class="key === mobileSelectedDayKey ? 'text-[#4f18f6]' : 'text-ink'">
                  {{ mobileDayLabel(key).format("DD") }}
                </span>
                <span class="text-[0.6875rem] font-medium capitalize" :class="key === mobileSelectedDayKey ? 'text-[#4f18f6]' : 'text-ink-muted'">
                  {{ mobileDayLabel(key).format("MMM") }}
                </span>
              </button>
            </div>
            <button
              type="button"
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)] disabled:opacity-30"
              :disabled="mobileDayWindowStart + MOBILE_DAY_WINDOW >= mobileAvailableDays.length"
              @click="mobileShiftDays(1)"
            >
              <ChevronRightIcon class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- 2. Choisir un créneau disponible -->
        <div v-if="mobileAvailableDays.length" class="mt-5">
          <div class="flex items-center justify-between">
            <p class="text-[0.8125rem] font-semibold text-ink">{{ $t("course.choose-slot-step") }}</p>
            <span class="flex items-center gap-1 text-right text-[0.5625rem] text-ink">
              <ClockIcon class="size-2.5 shrink-0" />
              {{ $t("course.local-teacher-time", { tz: mobileTz }) }}
            </span>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2.5">
            <button
              v-for="s in mobileDaySlots"
              :key="s.id"
              type="button"
              class="rounded-[0.375rem] border py-2 text-center text-[0.5625rem] font-medium"
              :class="s.id === mobileSelectedSlotId ? 'border-[#4f18f6] bg-surface-tint text-[#4f18f6] font-semibold' : 'border-border-default bg-surface text-ink'"
              @click="mobileToggleSlot(s.id)"
            >
              {{ s._start.format("HH:mm") }} – {{ s._end.format("HH:mm") }}
            </button>
          </div>

          <div class="mt-5 flex items-center gap-2.5 rounded-[0.625rem] bg-surface-tint px-2.5 py-3">
            <InformationCircleIcon class="size-5 shrink-0 text-[#4f18f6]" />
            <p class="text-[0.5625rem] font-medium text-[#4f18f6]">{{ $t("course.session-duration-note") }}</p>
          </div>
        </div>

        <!-- 3. Confirmer votre choix -->
        <div v-if="mobileSelectedSlot" class="mt-5">
          <p class="text-[0.8125rem] font-semibold text-ink">{{ $t("course.confirm-choice-step") }}</p>
          <div class="mt-3 flex items-center gap-3 rounded-[0.625rem] border border-border-default px-3 py-4">
            <div class="size-6 shrink-0 overflow-hidden rounded-full bg-surface-alt">
              <img :src="chosenTeacher?.photo ?? defaultCoachIMG" :alt="chosenTeacher?.full_name" class="size-full object-cover" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-medium text-ink">{{ chosenTeacher?.full_name }}</p>
              <p class="truncate text-[0.5625rem] text-ink-muted">{{ mobileSessionTitle }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-1.5 border-l border-border-default pl-2.5">
              <CalendarDaysIcon class="size-3 shrink-0 text-[#4f18f6]" />
              <span class="whitespace-nowrap text-[0.5rem] font-medium text-ink">
                {{ mobileSelectedSlot._start.locale(mobileLoc).format("dddd D MMM YYYY") }}
              </span>
            </div>
            <div class="flex shrink-0 items-center gap-1.5 border-l border-border-default pl-2.5">
              <ClockIcon class="size-3 shrink-0 text-[#4f18f6]" />
              <span class="whitespace-nowrap text-[0.5rem] font-medium text-ink">
                {{ mobileSelectedSlot._start.format("HH:mm") }}–{{ mobileSelectedSlot._end.format("HH:mm") }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            class="rounded-[0.625rem] bg-[#4309fc] px-6 py-4 text-sm font-semibold text-white disabled:opacity-50"
            :disabled="!mobileSelectedSlot || isSaving"
            @click="mobileConfirm"
          >
            {{ $t("course.confirm-slot-cta") }}
          </button>
          <button type="button" class="rounded-[0.625rem] border border-[#8d70fa] px-6 py-3 text-sm font-semibold text-ink" @click="backToTeacher">
            {{ $t("course.cancel") }}
          </button>
        </div>
      </div>

      <div class="hidden lg:block">
        <button class="finalize-back" @click="backToTeacher">← {{ $t("course.change-teacher") }}</button>
        <CourseSlotBooking
          :teacher="chosenTeacher"
          :max-slots="maxSlots"
          mode="funnel"
          @confirm="onConfirmSlots"
          @later="goLater"
        />
      </div>
    </template>
  </main>
</template>

<style lang="scss" scoped>
$navy: #16213f;
$red: #ee1c2b;
$muted: #8a93a8;
$line: #ecedf2;

.finalize-page {
  max-width: 1536px;
  margin: 0 auto;
  padding: 100px 56px 40px;
}

.finalize-head {
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.step-sep {
  color: $muted;
  font-size: 18px;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  background: #f7f8fa;
  border: 1.5px solid $line;
  color: $muted;
  transition: all 0.15s;
}

.step-pill.on {
  background: #fdecec;
  border-color: $red;
  color: $red;
}

.finalize-back {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: $muted;
  padding: 0 0 20px;
  display: inline-block;
  transition: color 0.13s;
}

.finalize-back:hover {
  color: $navy;
}

@media (max-width: 768px) {
  .finalize-page {
    padding: 80px 16px 24px;
  }
}
</style>
