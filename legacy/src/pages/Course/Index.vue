<script lang="ts" setup>
import type { CourseType } from "@/constants/constant.type";
import { useCourseStore } from "@/stores";
import { type ComputedRef, type Ref, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useSeo } from "@/composables/useSeo";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const router = useRouter();
const courseStore = useCourseStore();

const isFetching: Ref<boolean> = ref(false);

const currentRoute = computed(() => router.currentRoute.value);
const selectedCourse: ComputedRef<CourseType | null> = computed(() =>
  courseStore.getCourseBySlug(currentRoute.value.params.slug as string),
);

useSeo({ title: () => selectedCourse.value?.language });

const levels = computed(() => selectedCourse.value?.levels ?? []);

/* ─── Langue + accords FR (l'/le, d'/de) pour un titre naturel ─── */
const isFr = computed(() => locale.value.startsWith("fr"));
const rawLang = computed(() => (selectedCourse.value?.language ?? selectedCourse.value?.title ?? "").trim());
const startsWithVowel = (s: string) => /^[aeiouéèêëàâîïôûh]/i.test(s);
// FR : « l'anglais » / « le français »  •  EN : « English »
const langWithArticle = computed(() => {
  const l = rawLang.value;
  if (!l) return "";
  if (isFr.value) {
    const low = l.toLowerCase();
    return startsWithVowel(low) ? `l'${low}` : `le ${low}`;
  }
  return l.charAt(0).toUpperCase() + l.slice(1);
});
// FR : « d'anglais » / « de français »  •  EN : « English »
const langOf = computed(() => {
  const l = rawLang.value;
  if (!l) return "";
  if (isFr.value) {
    const low = l.toLowerCase();
    return startsWithVowel(low) ? `d'${low}` : `de ${low}`;
  }
  return l.charAt(0).toUpperCase() + l.slice(1);
});

/* ─── Niveaux : sélection radio + sous-titre localisé ─── */
const selectedLevelIndex = ref(0);
const levelBadgeColors = ["lvl-green", "lvl-amber", "lvl-red"];
const stripHtml = (html?: string) => (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const truncate = (s: string, n = 90) => (s.length > n ? s.slice(0, n).trim() + "…" : s);
const levelSubtitle = (index: number, level: { description?: string }) =>
  index < 3 ? t(`course.level-sub-${index + 1}`) : truncate(stripHtml(level?.description), 90);

/* ─── Bénéfices (colonne gauche) & étapes du parcours (bandeau bas) ─── */
const benefits = [
  { icon: "globe", color: "bf-purple", title: "course.benefit1-title", text: "course.benefit1-text" },
  { icon: "briefcase", color: "bf-green", title: "course.benefit2-title", text: "course.benefit2-text" },
  { icon: "plane", color: "bf-red", title: "course.benefit3-title", text: "course.benefit3-text" },
  { icon: "users", color: "bf-blue", title: "course.benefit4-title", text: "course.benefit4-text" },
];
const steps = [
  { icon: "user", color: "st-purple", title: "course.step1-title", text: "course.step1-text" },
  { icon: "users", color: "st-green", title: "course.step2-title", text: "course.step2-text" },
  { icon: "card", color: "st-red", title: "course.step3-title", text: "course.step3-text" },
  { icon: "calendar", color: "st-blue", title: "course.step4-title", text: "course.step4-text" },
];

const avatarGradients = [
  "linear-gradient(135deg,#f7b267,#f4845f)",
  "linear-gradient(135deg,#9a7cff,#6a5cff)",
  "linear-gradient(135deg,#8fd3a4,#4fb286)",
  "linear-gradient(135deg,#f49ac1,#ee6c9a)",
];

/* Icônes line (Lucide-style) injectées dans un <svg> partagé. */
const icons: Record<string, string> = {
  globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 2.6 15.2 0 18M12 3c-2.6 2.8-2.6 15.2 0 18"/>`,
  briefcase: `<rect x="3" y="7.5" width="18" height="12.5" rx="2.2"/><path d="M8.5 7.5V5.6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.9M3 13h18"/>`,
  plane: `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>`,
  users: `<circle cx="9" cy="8" r="3.2"/><path d="M2.8 20c.3-3.2 3-5 6.2-5s5.9 1.8 6.2 5"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M21.2 20c-.2-2.6-1.7-4.2-4.2-4.8"/>`,
  user: `<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>`,
  card: `<rect x="2.5" y="5" width="19" height="14" rx="2.4"/><path d="M2.5 9.5h19M6 15h4"/>`,
  calendar: `<rect x="3.5" y="5" width="17" height="15.5" rx="2.2"/><path d="M3.5 9.5h17M8 3.2v3.6M16 3.2v3.6M7.5 13h3M7.5 16.5h3"/>`,
  shield: `<path d="M12 3 5 6v5.2c0 4.4 3 7.4 7 8.8 4-1.4 7-4.4 7-8.8V6z"/><path d="m9 12 2 2 4-4"/>`,
  rosette: `<path d="M12 2.2l2.1 1.5 2.6-.3.9 2.4 2.4.9-.3 2.6L22 12l-1.6 2 .3 2.6-2.4.9-.9 2.4-2.6-.3L12 21.8l-2.1-1.5-2.6.3-.9-2.4-2.4-.9.3-2.6L2 12l1.6-2-.3-2.6 2.4-.9.9-2.4 2.6.3z"/><path d="m9 12 2 2 4-4"/>`,
};

onMounted(async () => {
  isFetching.value = true;
  await courseStore.fetchCourses();
  isFetching.value = false;
});

/* Le bouton enregistre le cours + le niveau choisi, puis passe à l'étape
   « Choix de la formule ». */
const goToFormulas = () => {
  const level = levels.value[selectedLevelIndex.value];
  if (!level) return;
  courseStore.setSelectedCourse(selectedCourse.value as CourseType);
  courseStore.setSelectedLevel(level);
  router.push(i18nRoute({ name: "courses-formulas", params: { slug: currentRoute.value.params.slug as string } }));
};
</script>

<template>
  <main class="lang-level">
    <div class="lw-grid">
      <!-- ───────── LEFT : argumentaire ───────── -->
      <section class="lw-left">
        <span class="hero-badge">
          <svg class="bdg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 4 2 9l10 5 10-5z" /><path d="M6 11v5c0 1 3 2.4 6 2.4s6-1.4 6-2.4v-5" /></svg>
          {{ $t("course.hero-badge") }}
        </span>

        <h1 class="hero-title">
          {{ $t("course.hero-title-pre") }} {{ langWithArticle }}, {{ $t("course.hero-title-mid") }}
          <span class="text-red">{{ $t("course.hero-title-accent") }}</span>
        </h1>

        <p class="hero-desc">{{ $t("course.hero-desc", { lang: langOf }) }}</p>

        <div class="benefits">
          <div v-for="b in benefits" :key="b.icon" class="benefit">
            <span class="bf-ic" :class="b.color">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="icons[b.icon]"></svg>
            </span>
            <div class="bf-t">{{ $t(b.title) }}</div>
            <div class="bf-s">{{ $t(b.text) }}</div>
          </div>
        </div>
      </section>

      <!-- ───────── MIDDLE : visuel ───────── -->
      <section class="lw-media">
        <div class="media-frame">
          <img
            v-if="selectedCourse?.picture"
            :src="selectedCourse.picture"
            :alt="rawLang"
            class="media-img"
          />
          <div v-else class="media-img media-fallback"></div>

          <div class="online-pill">
            <span class="op-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="icons.rosette"></svg>
            </span>
            <span class="op-txt">{{ $t("course.online-label") }}</span>
          </div>
        </div>

        <svg class="media-arrow" width="190" height="120" viewBox="0 0 190 120" fill="none">
          <path d="M8 18 C 20 86, 96 112, 168 70" stroke="#ee1c2b" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="2 9" />
          <path d="M150 58 L 170 70 L 156 86" stroke="#ee1c2b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </section>

      <!-- ───────── RIGHT : sélecteur de niveau ───────── -->
      <aside class="lw-right">
        <div class="level-card">
          <h2 class="lc-title">
            {{ $t("course.level-title-pre") }}<br />
            <span class="text-red">{{ $t("course.level-title-accent") }}</span>
          </h2>
          <p class="lc-desc">{{ $t("course.level-selector-desc") }}</p>

          <div v-if="isFetching" class="lvl-skeletons">
            <div v-for="i in 3" :key="i" class="lvl-skeleton"></div>
          </div>

          <div v-else class="lvl-list">
            <button
              v-for="(level, index) in levels"
              :key="level.name"
              type="button"
              class="lvl-opt"
              :class="{ selected: selectedLevelIndex === index }"
              @click="selectedLevelIndex = index"
            >
              <span class="lvl-badge" :class="levelBadgeColors[index % 3]">
                <svg v-for="s in Math.min(index + 1, 3)" :key="s" class="star" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.5l2.6 5.7 6.2.6-4.7 4.1 1.4 6.1L12 17.9 6.5 21.1l1.4-6.1L3.2 8.8l6.2-.6z" />
                </svg>
              </span>
              <span class="lvl-txt">
                <span class="lvl-name">{{ level.name }}</span>
                <span class="lvl-sub">{{ levelSubtitle(index, level) }}</span>
              </span>
              <span class="radio" :class="{ on: selectedLevelIndex === index }"></span>
            </button>
          </div>

          <button type="button" class="cta" :disabled="!levels.length" @click="goToFormulas">
            {{ $t("course.see-teachers") }}
          </button>
        </div>

        <div class="trust">
          <div class="trust-line">
            <svg class="tr-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" v-html="icons.shield"></svg>
            <span>{{ $t("course.trust-students") }}</span>
          </div>
          <div class="trust-rating">
            <span class="avatars">
              <span
                v-for="(g, i) in avatarGradients"
                :key="i"
                class="ava"
                :style="{ background: g, marginLeft: i ? '-10px' : '0', zIndex: 4 - i }"
              ></span>
            </span>
            <span class="score">4.9/5</span>
            <span class="stars">★★★★★</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- ───────── BOTTOM : parcours ───────── -->
    <section class="journey">
      <h3 class="jr-title">{{ $t("course.journey-title") }}</h3>
      <div class="jr-steps">
        <template v-for="(step, index) in steps" :key="step.icon">
          <div class="jr-step">
            <span class="jr-ic" :class="step.color">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="icons[step.icon]"></svg>
            </span>
            <div class="jr-txt">
              <div class="jr-t">{{ index + 1 }}. {{ $t(step.title) }}</div>
              <div class="jr-s">{{ $t(step.text) }}</div>
            </div>
          </div>
          <svg v-if="index < steps.length - 1" class="jr-arrow" width="26" height="16" viewBox="0 0 26 16" fill="none">
            <path d="M2 8h20M16 2l6 6-6 6" stroke="#c2c7d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </template>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
$red: #ee1c2b;
$red-soft: #fdecec;
$navy: #16213f;
$text: #46506b;
$muted: #8a93a8;
$line: #ecedf2;
$bg-alt: #f7f8fa;
$green: #1fa463;
$green-soft: #e6f4ec;
$purple: #7b3ff2;
$purple-soft: #efe8fd;
$amber: #f5a623;
$amber-soft: #fdf1da;
$blue: #3b82f6;
$blue-soft: #e7f0fe;

.lang-level { max-width: 1536px; margin: 0 auto; padding: 100px 56px 60px; }
.text-red { color: $red; }

.lw-grid { display: grid; grid-template-columns: 1fr 360px 360px; gap: 32px; align-items: start; }

/* ── LEFT ── */
.hero-badge { display: inline-flex; align-items: center; gap: 9px; background: $bg-alt; border: 1px solid $line; color: $navy; font-weight: 600; font-size: 14px; padding: 9px 16px; border-radius: 999px; }
.hero-badge .bdg-ic { width: 18px; height: 18px; color: $purple; }
.hero-title { font-size: 44px; line-height: 1.12; font-weight: 800; color: $navy; letter-spacing: -.02em; margin: 22px 0 18px; }
.hero-desc { font-size: 16.5px; line-height: 1.62; color: $text; max-width: 470px; margin: 0; }

.benefits { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 46px; }
.benefit { text-align: center; display: flex; flex-direction: column; align-items: center; }
.bf-ic { width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; margin-bottom: 14px; }
.bf-ic svg { width: 26px; height: 26px; }
.bf-t { font-weight: 700; color: $navy; font-size: 14.5px; line-height: 1.25; }
.bf-s { font-size: 12.5px; color: $muted; line-height: 1.4; margin-top: 6px; max-width: 160px; }
.bf-purple { background: $purple-soft; color: $purple; }
.bf-green { background: $green-soft; color: $green; }
.bf-red { background: $red-soft; color: $red; }
.bf-blue { background: $blue-soft; color: $blue; }

/* ── MIDDLE ── */
.lw-media { position: relative; }
.media-frame { position: relative; border-radius: 26px; }
.media-img { display: block; width: 100%; height: 560px; object-fit: cover; border-radius: 26px; box-shadow: 0 22px 50px rgba(20, 30, 60, .14); }
.media-fallback { background: linear-gradient(150deg, #fdeef0, #fff, #eef4fd); border: 1px solid $line; }
.online-pill { position: absolute; left: 50%; transform: translateX(-50%); bottom: 22px; width: calc(100% - 56px); background: #fff; border-radius: 16px; box-shadow: 0 12px 30px rgba(20, 30, 60, .16); padding: 14px 18px; display: flex; align-items: center; gap: 12px; }
.op-ic { width: 30px; height: 30px; flex: 0 0 30px; color: $red; }
.op-ic svg { width: 30px; height: 30px; }
.op-txt { font-size: 13.5px; font-weight: 600; color: $navy; line-height: 1.35; }
.media-arrow { position: absolute; right: -34px; bottom: -36px; pointer-events: none; }

/* ── RIGHT : carte niveau ── */
.level-card { background: #fff; border: 1px solid $line; border-radius: 22px; box-shadow: 0 1px 2px rgba(20, 30, 60, .05); padding: 26px 24px; }
.lc-title { font-size: 27px; font-weight: 800; color: $navy; line-height: 1.18; letter-spacing: -.01em; margin: 0; }
.lc-desc { font-size: 14.5px; color: $muted; line-height: 1.5; margin: 12px 0 20px; }

.lvl-skeletons { display: flex; flex-direction: column; gap: 12px; }
.lvl-skeleton { height: 78px; border-radius: 14px; background: #f1f2f6; animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: .55; } }

.lvl-list { display: flex; flex-direction: column; gap: 14px; }
.lvl-opt { display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; background: #fff; border: 1.5px solid $line; border-radius: 16px; padding: 14px 16px; cursor: pointer; transition: border-color .15s, box-shadow .15s, background .15s; }
.lvl-opt:hover { border-color: #f3b4b9; }
.lvl-opt.selected { border-color: $red; box-shadow: 0 0 0 3px rgba(238, 28, 43, .08); }
.lvl-badge { width: 46px; height: 46px; flex: 0 0 46px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; gap: 1px; color: #fff; }
.lvl-badge .star { width: 13px; height: 13px; }
.lvl-green { background: $green; }
.lvl-amber { background: $amber; }
.lvl-red { background: $red; }
.lvl-txt { display: flex; flex-direction: column; min-width: 0; }
.lvl-name { font-weight: 700; color: $navy; font-size: 15.5px; }
.lvl-sub { font-size: 12.8px; color: $muted; line-height: 1.35; margin-top: 3px; }
.radio { margin-left: auto; width: 20px; height: 20px; flex: 0 0 20px; border-radius: 50%; border: 2px solid #cdd2dc; display: grid; place-items: center; transition: border-color .15s; }
.radio.on { border-color: $red; }
.radio.on::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: $red; }

.cta { margin-top: 22px; width: 100%; border: none; background: $red; color: #fff; font-weight: 700; font-size: 16px; padding: 15px; border-radius: 12px; cursor: pointer; transition: background .15s, transform .15s; }
.cta:hover { background: #d4101f; transform: translateY(-1px); }
.cta:disabled { opacity: .55; cursor: not-allowed; transform: none; }

/* ── RIGHT : confiance ── */
.trust { margin-top: 20px; padding: 0 4px; }
.trust-line { display: flex; align-items: center; gap: 10px; color: $text; font-size: 14.5px; font-weight: 500; }
.tr-shield { width: 22px; height: 22px; color: $muted; flex: 0 0 22px; }
.trust-rating { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.avatars { display: inline-flex; }
.ava { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(20, 30, 60, .15); }
.score { font-weight: 700; color: $navy; font-size: 16px; }
.stars { color: $amber; font-size: 15px; letter-spacing: 1px; }

/* ── BOTTOM : parcours ── */
.journey { background: $bg-alt; border: 1px solid $line; border-radius: 24px; padding: 34px 40px; margin-top: 44px; }
.jr-title { font-size: 22px; font-weight: 800; color: $navy; margin: 0 0 28px; }
.jr-steps { display: flex; align-items: flex-start; gap: 10px; }
.jr-step { display: flex; align-items: flex-start; gap: 16px; flex: 1; }
.jr-ic { width: 56px; height: 56px; flex: 0 0 56px; border-radius: 50%; display: grid; place-items: center; }
.jr-ic svg { width: 25px; height: 25px; }
.st-purple { background: $purple-soft; color: $purple; }
.st-green { background: $green-soft; color: $green; }
.st-red { background: $red-soft; color: $red; }
.st-blue { background: $blue-soft; color: $blue; }
.jr-t { font-weight: 700; color: $navy; font-size: 15.5px; line-height: 1.3; }
.jr-s { font-size: 13.3px; color: $muted; line-height: 1.45; margin-top: 6px; max-width: 215px; }
.jr-arrow { flex: 0 0 26px; margin-top: 18px; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .lw-grid { grid-template-columns: 1fr; }
  .lw-media { max-width: 560px; }
  .media-img { height: 460px; }
  .media-arrow { display: none; }
  .lw-right { max-width: 480px; }
}
@media (max-width: 980px) {
  .jr-steps { flex-wrap: wrap; gap: 26px 18px; }
  .jr-step { flex: 1 1 42%; }
  .jr-arrow { display: none; }
}
@media (max-width: 768px) {
  .lang-level { padding: 80px 16px 40px; }
  .hero-title { font-size: 32px; }
  .benefits { grid-template-columns: 1fr 1fr; gap: 26px 12px; }
  .lw-media { max-width: 100%; }
}
@media (max-width: 560px) {
  .jr-step { flex: 1 1 100%; }
}
</style>
