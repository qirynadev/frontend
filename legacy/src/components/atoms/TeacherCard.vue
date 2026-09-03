<script lang="ts" setup>
import defaultCoachIMG from "@/assets/images/talk/coach-2.1669457228.png";
import type { TeacherType } from "@/constants/constant.type";
import { computed, type PropType } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const props = defineProps({
  data: { type: Object as PropType<TeacherType>, default: () => ({}) },
  index: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
});

const emit = defineEmits(["clicked", "toggleFavorite"]);
const handleClick = () => emit("clicked", props.data);
const toggleFavorite = () => emit("toggleFavorite", props.data);

const blobPalette = ["#e7defb", "#d9efe2", "#fbdde2", "#fbeccd"];
const blob = computed(() => blobPalette[props.index % blobPalette.length]);
const tintClass = computed(() => (props.index % 2 === 0 ? "exp-purple" : "exp-green"));
const photo = computed(() => props.data?.photo ?? defaultCoachIMG);

const nationality = computed(() => {
  const c = props.data?.country as any;
  return c?.nationality ?? c?.demonym ?? c?.name ?? "";
});

const experienceLabel = computed(() => {
  const years = props.data?.experience_years;
  if (!years) return "";
  return t("course.years-of-experience", { count: years }, years);
});

const rating = computed(() => {
  const r = props.data?.rating;
  if (r === null || r === undefined) return null;
  const f = Number(r).toFixed(1);
  return String(locale.value).startsWith("fr") ? f.replace(".", ",") : f;
});
</script>

<template>
  <div class="t-card" @click="handleClick">
    <div class="t-card-top">
      <span class="flag-chip">
        <img v-if="data?.country_flag" :src="data.country_flag" :alt="nationality || data?.full_name" />
      </span>
      <button class="t-heart" :class="{ on: isFavorite }" type="button" aria-label="Favori" @click.stop="toggleFavorite">
        <svg width="19" height="19" viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M12 21s-7.5-4.6-10-9.3C.4 8.3 2 4.5 5.6 4.5c2 0 3.4 1.1 4.4 2.4 1-1.3 2.4-2.4 4.4-2.4 3.6 0 5.2 3.8 3.6 7.2C19.5 16.4 12 21 12 21z" />
        </svg>
      </button>
    </div>

    <div class="t-photo-wrap">
      <div class="t-blob" :style="{ background: blob }"></div>
      <img class="t-photo" :src="photo" :alt="data?.full_name ?? 'Professeur'" />
      <span v-if="rating" class="t-rating"><span class="star">★</span>{{ rating }}</span>
    </div>

    <p class="t-name">{{ data?.full_name ?? "—" }}</p>
    <p v-if="nationality" class="t-nat">{{ nationality }}</p>
    <span v-if="experienceLabel" class="t-exp" :class="tintClass">{{ experienceLabel }}</span>

    <button class="t-cta" type="button" @click.stop="handleClick">{{ $t("course.see-profile") }}</button>
  </div>
</template>

<style lang="scss" scoped>
$navy: #16213f;
$red: #ee1c2b;
$red-soft: #fdecec;
$muted: #8a93a8;
$line: var(--color-border);
$green-soft: #e6f4ec;
$green-600: #168a52;
$purple-soft: #efe8fd;
$purple: #7b3ff2;

.t-card { background: var(--color-surface); border: 1px solid $line; border-radius: 20px; padding: 18px 16px; box-shadow: 0 1px 2px rgba(20,30,60,.05); transition: box-shadow .18s, transform .18s, border-color .18s; position: relative; cursor: pointer; display: flex; flex-direction: column; height: 100%; }
.t-card:hover { box-shadow: 0 12px 38px rgba(20,30,60,.09); transform: translateY(-3px); border-color: var(--color-border); }
.t-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.flag-chip { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--color-surface); box-shadow: 0 2px 8px rgba(20,30,60,.12), inset 0 0 0 1px rgba(0,0,0,.05); overflow: hidden; }
.flag-chip img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.t-heart { width: 30px; height: 30px; border: none; background: transparent; color: #c2c7d4; display: grid; place-items: center; border-radius: 50%; transition: color .15s, background .15s; cursor: pointer; }
.t-heart:hover { color: $red; background: $red-soft; }
.t-heart.on { color: $red; }
.t-photo-wrap { position: relative; width: 132px; height: 124px; margin: 2px auto 12px; }
.t-blob { position: absolute; inset: 6px 14px 12px 14px; border-radius: 46% 54% 50% 50% / 52% 48% 52% 48%; }
.t-photo { position: absolute; left: 50%; top: 6px; transform: translateX(-50%); width: 104px; height: 104px; border-radius: 50%; object-fit: cover; }
.t-rating { position: absolute; right: -2px; bottom: 6px; background: var(--color-surface); box-shadow: 0 4px 12px rgba(20,30,60,.14); border-radius: 999px; padding: 4px 9px 4px 7px; font-size: 13px; font-weight: 700; color: $navy; display: flex; align-items: center; gap: 4px; }
.t-rating .star { color: #f5a623; }
.t-name { text-align: center; font-weight: 700; color: $navy; font-size: 17px; margin: 0; }
.t-nat { text-align: center; color: $muted; font-size: 14px; margin: 1px 0 11px; }
.t-exp { display: block; width: fit-content; margin: 0 auto 14px; font-size: 12.5px; font-weight: 600; padding: 5px 12px; border-radius: 999px; }
.exp-green { background: $green-soft; color: $green-600; }
.exp-purple { background: $purple-soft; color: $purple; }
.t-cta { display: block; width: 100%; text-align: center; border: 1.5px solid #f1c6c9; color: $red; background: var(--color-surface); border-radius: 10px; padding: 11px; font-weight: 600; font-size: 15px; transition: background .15s, border-color .15s, color .15s; cursor: pointer; margin-top: auto; }
.t-cta:hover { background: $red; color: #fff; border-color: $red; }
</style>
