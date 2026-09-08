<script lang="ts" setup>
import { useCourseStore } from "@/stores";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { TeacherType } from "@/constants/constant.type";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/fr";

dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps<{
  teacher: TeacherType | null;
  maxSlots: number;
  // Contexte d'affichage (funnel post-paiement vs repli dashboard). Hook consommateur
  // partagé avec CourseTeacherPicker : sert aux libellés/nuances décidés par la page hôte.
  mode: "funnel" | "dashboard";
}>();

const emit = defineEmits<{
  (e: "confirm", slots: { id: string; start: string; end: string }[]): void;
  (e: "later"): void;
}>();

const courseStore = useCourseStore();
const { locale } = useI18n();

const tz = dayjs.tz.guess();

const isFetching = ref(false);

// ---- Booking : créneaux libres futurs groupés par jour ----
const freeSlots = computed(() => {
  const now = dayjs();
  return ((courseStore.getSelectedTeacher as any)?.plannings ?? [])
    .filter((p: any) => p.status === "free")
    .map((p: any) => ({ ...p, _start: dayjs.utc(p.start_date).tz(tz), _end: dayjs.utc(p.end_date).tz(tz) }))
    .filter((p: any) => p._start.isAfter(now)); // exclure les créneaux déjà passés / commencés
});

const slotsByDay = computed<Map<string, any[]>>(() => {
  const map = new Map<string, any[]>();
  for (const s of freeSlots.value) {
    const key = s._start.format("YYYY-MM-DD");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  for (const arr of map.values()) arr.sort((a, b) => a._start.valueOf() - b._start.valueOf());
  return map;
});

const availableDays = computed(() => [...slotsByDay.value.keys()].sort());
const selectedDayKey = ref<string>("");
const dayWindowStart = ref(0);
const visibleDays = computed(() => availableDays.value.slice(dayWindowStart.value, dayWindowStart.value + 7));
const daySlots = computed(() => slotsByDay.value.get(selectedDayKey.value) ?? []);
const morning = computed(() => daySlots.value.filter((s) => s._start.hour() < 12));
const afternoon = computed(() => daySlots.value.filter((s) => s._start.hour() >= 12 && s._start.hour() < 18));
const evening = computed(() => daySlots.value.filter((s) => s._start.hour() >= 18));

const selectedSlotIds = ref<string[]>([]);
const selectedSlots = computed(() => freeSlots.value.filter((s: any) => selectedSlotIds.value.includes(s.id)));
const quotaReached = computed(() => selectedSlotIds.value.length >= props.maxSlots);

const toggleSlot = (id: string) => {
  const i = selectedSlotIds.value.indexOf(id);
  if (i === -1) {
    if (quotaReached.value) return; // do not add beyond maxSlots
    selectedSlotIds.value.push(id);
  } else {
    selectedSlotIds.value.splice(i, 1);
  }
};

const loc = computed(() => (String(locale.value).startsWith("fr") ? "fr" : "en"));
const dayLabel = (key: string) => dayjs(key).locale(loc.value);
const fullDayLabel = computed(() => (selectedDayKey.value ? dayLabel(selectedDayKey.value).format("dddd D MMMM YYYY") : ""));
const slotRange = (s: any) => `${s._start.format("HH:mm")} - ${s._end.format("HH:mm")}`;
const shiftDays = (dir: number) => {
  const next = dayWindowStart.value + dir * 7;
  if (next >= 0 && next < availableDays.value.length) dayWindowStart.value = next;
};

watch(availableDays, (days) => {
  if (days.length && !days.includes(selectedDayKey.value)) selectedDayKey.value = days[0];
});

const confirm = () => {
  const slots = selectedSlots.value.map((s: any) => ({ id: s.id, start: s._start.format(), end: s._end.format() }));
  emit("confirm", slots);
};
const later = () => emit("later");

onBeforeMount(async () => {
  if (props.teacher) {
    isFetching.value = true;
    await courseStore.fetchTeacherById(props.teacher.id);
    // Amorcer le jour sélectionné AVANT de retirer le voile de chargement,
    // sinon les colonnes de créneaux s'affichent vides le temps d'un tick.
    if (availableDays.value.length) selectedDayKey.value = availableDays.value[0];
    isFetching.value = false;
  }
});
</script>

<template>
  <div class="booking">
    <div class="bk-head">
      <div>
        <h2 class="bk-title">{{ $t("course.book-slots-title") }}</h2>
        <p class="bk-sub">{{ $t("course.book-slots-sub") }}</p>
      </div>
      <div class="bk-legend">
        <span><span class="lg-box lg-sel"></span> {{ $t("course.selected") }}</span>
        <span><span class="lg-box lg-av"></span> {{ $t("course.available") }}</span>
      </div>
    </div>

    <div v-if="isFetching" class="bk-empty">{{ $t("course.loading-slots") }}…</div>
    <div v-else-if="!availableDays.length" class="bk-empty">{{ $t("course.no-slots") }}</div>

    <template v-else>
      <div class="daystrip">
        <button class="day-arrow" :disabled="dayWindowStart === 0" @click="shiftDays(-1)">‹</button>
        <div v-for="key in visibleDays" :key="key" class="day" :class="{ sel: key === selectedDayKey }" @click="selectedDayKey = key">
          <div class="dow">{{ dayLabel(key).format("ddd") }}</div>
          <div class="dnum">{{ dayLabel(key).format("DD") }}</div>
          <div class="dmon">{{ dayLabel(key).format("MMM") }}</div>
        </div>
        <button class="day-arrow" :disabled="dayWindowStart + 7 >= availableDays.length" @click="shiftDays(1)">›</button>
      </div>

      <div class="day-label">
        <span class="dl">{{ fullDayLabel }}</span>
        <span class="tz">🌐 {{ $t("course.timezone") }} : {{ tz }}</span>
      </div>

      <div class="slots">
        <div>
          <div class="slot-col-head"><span class="ico">🌅</span><div><div class="sh-t">{{ $t("course.morning") }}</div><div class="sh-s">06h00 - 12h00</div></div></div>
          <div class="slot-list">
            <button v-for="s in morning" :key="s.id" class="slot" :class="{ sel: selectedSlotIds.includes(s.id) }" @click="toggleSlot(s.id)">{{ s._start.format("HH:mm") }} <span class="sck">✓</span></button>
          </div>
        </div>
        <div>
          <div class="slot-col-head"><span class="ico">☀️</span><div><div class="sh-t">{{ $t("course.afternoon") }}</div><div class="sh-s">12h00 - 18h00</div></div></div>
          <div class="slot-list">
            <button v-for="s in afternoon" :key="s.id" class="slot" :class="{ sel: selectedSlotIds.includes(s.id) }" @click="toggleSlot(s.id)">{{ s._start.format("HH:mm") }} <span class="sck">✓</span></button>
          </div>
        </div>
        <div>
          <div class="slot-col-head"><span class="ico">🌙</span><div><div class="sh-t">{{ $t("course.evening") }}</div><div class="sh-s">18h00 - 22h00</div></div></div>
          <div class="slot-list">
            <button v-for="s in evening" :key="s.id" class="slot" :class="{ sel: selectedSlotIds.includes(s.id) }" @click="toggleSlot(s.id)">{{ s._start.format("HH:mm") }} <span class="sck">✓</span></button>
          </div>
        </div>
      </div>

      <div class="selbox">
        <div class="selbox-title">{{ $t("course.your-selected-slots") }} ({{ selectedSlots.length }}/{{ maxSlots }})</div>
        <div v-if="!selectedSlots.length" class="sel-empty">{{ $t("course.no-slot-selected") }}</div>
        <div v-else class="sel-chips">
          <div v-for="s in selectedSlots" :key="s.id" class="sel-chip">
            <span class="ok">✓</span>
            <div><div class="d">{{ s._start.locale(loc).format("ddd D MMM") }}</div><div>{{ slotRange(s) }}</div></div>
            <span class="x" @click="toggleSlot(s.id)">✕</span>
          </div>
        </div>
      </div>

      <div class="bk-actions">
        <button class="btn btn-red" :disabled="!selectedSlots.length" @click="confirm">
          📅 {{ $t("course.confirm-bookings") }} ({{ selectedSlots.length }})
        </button>
        <button class="btn btn-outline" @click="later">📅 {{ $t("course.finalize-later") }}</button>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
$red: #ee1c2b;
$red-soft: #fdecec;
$red-tint: #fff5f5;
$navy: #16213f;
$text: #46506b;
$muted: #8a93a8;
$line: var(--color-border);
$green: #1fa463;
$green-600: #168a52;
$green-soft: #e6f4ec;
$green-tint: #f1f9f4;
$purple: #7b3ff2;
$purple-soft: #efe8fd;
$amber: #f5a623;
$amber-soft: #fdf1da;
$bg-alt: var(--color-surface-alt);

.booking { background: var(--color-surface); border: 1px solid $line; border-radius: 26px; box-shadow: 0 6px 24px rgba(20,30,60,.06); padding: 26px 26px 24px; }
.bk-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.bk-title { font-size: 23px; font-weight: 700; color: $navy; margin: 0 0 5px; }
.bk-sub { color: $text; font-size: 15px; margin: 0; }
.bk-legend { display: flex; gap: 16px; font-size: 13.5px; color: $text; }
.bk-legend span { display: inline-flex; align-items: center; gap: 7px; }
.lg-box { width: 16px; height: 16px; border-radius: 5px; }
.lg-sel { background: $green-soft; border: 1.5px solid $green; }
.lg-av { background: var(--color-surface); border: 1.5px solid $line; }
.bk-empty { padding: 40px 0; text-align: center; color: $muted; }

.daystrip { display: flex; align-items: stretch; gap: 8px; border: 1px solid $line; border-radius: 14px; padding: 10px; margin: 20px 0 22px; }
.day-arrow { width: 38px; border: none; background: var(--color-surface-alt); border-radius: 10px; color: $muted; display: grid; place-items: center; flex: 0 0 38px; cursor: pointer; font-size: 18px; }
.day-arrow:hover:not(:disabled) { background: #eef0f3; color: $navy; }
.day-arrow:disabled { opacity: .4; cursor: default; }
.day { flex: 1; text-align: center; padding: 10px 4px; border-radius: 12px; cursor: pointer; border: 1.5px solid transparent; }
.day .dow { font-size: 13px; color: $muted; text-transform: capitalize; }
.day .dnum { font-size: 22px; font-weight: 700; color: $navy; line-height: 1.15; }
.day .dmon { font-size: 12.5px; color: $muted; text-transform: capitalize; }
.day:hover { background: var(--color-surface-alt); }
.day.sel { border-color: $red; background: $red-tint; }
.day.sel .dow, .day.sel .dnum, .day.sel .dmon { color: $red; }

.day-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.day-label .dl { font-size: 18px; font-weight: 700; color: $navy; text-transform: capitalize; }
.day-label .tz { display: inline-flex; align-items: center; gap: 7px; color: $muted; font-size: 14px; }

.slots { border: 1px solid $line; border-radius: 14px; padding: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.slot-col-head { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }
.slot-col-head .ico { font-size: 18px; }
.slot-col-head .sh-t { font-weight: 700; color: $navy; font-size: 15px; }
.slot-col-head .sh-s { font-size: 11.5px; color: $muted; }
.slot-list { display: flex; flex-direction: column; gap: 9px; }
.slot { display: flex; align-items: center; justify-content: center; gap: 8px; border: 1.5px solid $line; background: var(--color-surface); border-radius: 9px; padding: 11px; font-size: 14.5px; font-weight: 500; color: $navy; transition: all .13s; cursor: pointer; }
.slot:hover { border-color: #c8ccd6; }
.slot.sel { background: $green-tint; border-color: #9ed3b4; color: $green-600; font-weight: 600; }
.slot .sck { display: none; color: #fff; background: $green; border-radius: 50%; width: 17px; height: 17px; place-items: center; font-size: 11px; }
.slot.sel .sck { display: grid; }

.selbox { border: 1px solid $line; border-radius: 14px; padding: 16px 18px; margin: 20px 0 18px; }
.selbox-title { font-weight: 600; color: $navy; font-size: 15px; margin-bottom: 12px; }
.sel-chips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.sel-chip { display: flex; align-items: center; gap: 8px; background: var(--color-surface-alt); border: 1px solid $line; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: $navy; }
.sel-chip .ok { color: #fff; background: $green; border-radius: 50%; width: 18px; height: 18px; display: grid; place-items: center; flex: 0 0 18px; font-size: 11px; }
.sel-chip .d { font-weight: 600; text-transform: capitalize; }
.sel-chip .x { margin-left: auto; color: $muted; cursor: pointer; }
.sel-chip .x:hover { color: $red; }
.sel-empty { color: $muted; font-size: 14px; }

.bk-actions { display: grid; grid-template-columns: 1.25fr 1fr; gap: 14px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; font-weight: 600; font-size: 16px; border-radius: 10px; padding: 14px 24px; border: 1.5px solid transparent; cursor: pointer; transition: all .15s; }
.btn-red { background: $red; color: #fff; box-shadow: 0 8px 20px rgba(238,28,43,.25); }
.btn-red:hover:not(:disabled) { background: #e2122a; }
.btn-red:disabled { opacity: .5; cursor: default; box-shadow: none; }
.btn-outline { background: var(--color-surface); color: $red; border-color: $red; }
.btn-outline:hover { background: $red-tint; }

@media (max-width: 768px) {
  .slots { grid-template-columns: 1fr; }
  .sel-chips { grid-template-columns: 1fr; }
  .bk-actions { grid-template-columns: 1fr; }
}
</style>
