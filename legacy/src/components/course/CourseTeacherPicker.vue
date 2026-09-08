<script lang="ts" setup>
import { useAuthStore, useCourseStore } from "@/stores";
import { computed, onBeforeMount, ref } from "vue";
import type { CourseType, TeacherType } from "@/constants/constant.type";
import TeacherCard from "@/components/atoms/TeacherCard.vue";

// `mode` : contexte d'affichage partagé avec CourseSlotBooking et le conteneur de finalisation.
// Hook consommateur (funnel post-paiement vs repli dashboard) — sert aux libellés/nuances UI
// décidés par la page hôte ; le cœur (grille de profs) reste identique dans les deux modes.
const props = defineProps<{ course: CourseType | null; mode: "funnel" | "dashboard" }>();
const emit = defineEmits<{ (e: "select", teacher: TeacherType): void }>();

const courseStore = useCourseStore();
const authStore = useAuthStore();

const isFetching = ref<boolean>(false);
const currentPage = ref<number>(1);
const perPage = 10;

const teachers = computed(() => courseStore.getTeachers);

const totalPages = computed(() => Math.max(1, Math.ceil(teachers.value.length / perPage)));
const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return teachers.value.slice(start, start + perPage);
});

const sectionTitle = computed(() => props.course?.language ?? "");

// Favoris : seedés depuis is_favorite, persistés au toggle pour les utilisateurs connectés
const favorites = ref<Set<string>>(new Set());
const favCount = computed(() => favorites.value.size);
const seedFavorites = () => {
  favorites.value = new Set(teachers.value.filter((t) => t.is_favorite).map((t) => t.id));
};
const toggleFavorite = async (teacher: TeacherType) => {
  const wasFavorite = favorites.value.has(teacher.id);
  if (wasFavorite) favorites.value.delete(teacher.id);
  else favorites.value.add(teacher.id);
  if (!authStore.token) return;
  const result = await courseStore.toggleFavorite(teacher.id);
  if (result === null) {
    if (wasFavorite) favorites.value.add(teacher.id);
    else favorites.value.delete(teacher.id);
  }
};

const goToPage = (p: number) => {
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
};

const choose = (teacher: TeacherType) => emit("select", teacher);

onBeforeMount(async () => {
  isFetching.value = true;
  currentPage.value = 1;
  await courseStore.fetchTeachersByCourse();
  seedFavorites();
  isFetching.value = false;
});
</script>

<template>
  <main class="tlist-page">
    <!-- Hero -->
    <section class="list-hero">
      <div class="hero-grid">
        <div>
          <h1 class="hero-title">
            {{ $t("course.tlist-title-1") }}<br />
            {{ $t("course.tlist-title-3") }} <span class="text-red">{{ $t("course.tlist-title-2") }}</span>
          </h1>
          <p class="hero-sub">{{ $t("course.tlist-subtitle") }}</p>
        </div>

        <div class="gift-callout">
          <div class="ic">🎁</div>
          <p v-html="$t('course.tlist-gift')"></p>
        </div>

        <div class="hero-art">
          <svg class="deco curl" width="120" height="60" viewBox="0 0 120 60" fill="none"><path d="M2 40 C 30 5, 70 5, 95 28" stroke="#f4a8ac" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 7" /></svg>
          <div class="hero-blob"></div>
          <div class="hero-photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="9" r="1.8" />
              <path d="M21 15l-5-5L6 20" />
            </svg>
          </div>
          <span class="deco bubble">
            <svg width="58" height="58" viewBox="0 0 58 58" fill="none"><path d="M14 8h26a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H26l-10 8 1-8h-3a8 8 0 0 1-8-8V16a8 8 0 0 1 8-8Z" fill="#7b3ff2" /><circle cx="22" cy="23" r="2.4" fill="#fff" /><circle cx="29" cy="23" r="2.4" fill="#fff" /><circle cx="36" cy="23" r="2.4" fill="#fff" /></svg>
          </span>
          <span class="deco star">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l2.9 6.3L22 9.2l-5 4.8 1.2 7L12 17.8 5.8 21l1.2-7-5-4.8 7.1-.9z" /></svg>
          </span>
          <span class="deco plane">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ee1c2b" stroke-width="1.8" stroke-linejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>
          </span>
        </div>
      </div>

      <!-- Nos professeurs (gauche) + Mes favoris (droite) sur la même ligne, bas du hero -->
      <div class="sec-head">
        <h2 class="sec-title">{{ $t("course.our-teachers") }}<template v-if="sectionTitle"> · {{ sectionTitle }}</template></h2>
        <span class="favs">
          <svg class="heart" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.3 2 4.5 5.6 4.5c2 0 3.4 1.1 4.4 2.4 1-1.3 2.4-2.4 4.4-2.4 3.6 0 5.2 3.8 3.6 7.2C19.5 16.4 12 21 12 21z" /></svg>
          {{ $t("course.my-favorites") }} ({{ favCount }})
        </span>
      </div>
    </section>

    <!-- Grille -->
    <p v-if="!isFetching && teachers.length === 0" class="empty">{{ $t("course.teachers-list-empty") }}</p>
    <div v-else class="teacher-grid">
      <TeacherCard
        v-for="(teacher, i) in paginatedTeachers"
        :key="teacher.id"
        :data="teacher as TeacherType"
        :index="(currentPage - 1) * perPage + i"
        :is-favorite="favorites.has(teacher.id)"
        @clicked="choose"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <!-- Bande de confiance + carte d'aide -->
    <div class="bottom-row">
      <div class="trust-strip four">
        <div class="trust-item"><span class="ic ic-purple">🛡️</span><div><div class="t">{{ $t("course.trust1-t") }}</div><div class="s">{{ $t("course.trust1-s") }}</div></div></div>
        <div class="trust-item"><span class="ic ic-green">🎓</span><div><div class="t">{{ $t("course.trust2-t") }}</div><div class="s">{{ $t("course.trust2-s") }}</div></div></div>
        <div class="trust-item"><span class="ic ic-red">📈</span><div><div class="t">{{ $t("course.trust3-t") }}</div><div class="s">{{ $t("course.trust3-s") }}</div></div></div>
        <div class="trust-item"><span class="ic ic-amber">😊</span><div><div class="t">{{ $t("course.trust4-t") }}</div><div class="s">{{ $t("course.trust4-s") }}</div></div></div>
      </div>

      <div class="help-card">
        <div class="ic">🎧</div>
        <div>
          <div class="t">{{ $t("course.help-title") }}</div>
          <div class="s">{{ $t("course.help-text") }}</div>
          <a class="lnk" href="#">{{ $t("course.help-link") }} →</a>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!isFetching && totalPages > 1" class="pager">
      <button class="arrow" :disabled="currentPage === 1" aria-label="Précédent" @click="goToPage(currentPage - 1)">‹</button>
      <button v-for="p in totalPages" :key="p" :class="{ on: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
      <button class="arrow" :disabled="currentPage === totalPages" aria-label="Suivant" @click="goToPage(currentPage + 1)">›</button>
    </div>
  </main>
</template>

<style lang="scss" scoped>
$red: #ee1c2b;
$red-soft: #fdecec;
$navy: #16213f;
$navy-700: #243155;
$text: #46506b;
$muted: #8a93a8;
$ink: #1b2546;
$line: var(--color-border);
$bg-alt: var(--color-surface-alt);
$purple: #7b3ff2;
$purple-soft: #efe8fd;
$green: #1fa463;
$green-soft: #e6f4ec;
$amber: #f5a623;
$amber-soft: #fdf1da;

.tlist-page { max-width: 1536px; margin: 0 auto; padding: 100px 56px 40px; }
.text-red { color: $red; }

.list-hero { position: relative; padding: 30px 0 18px; }
.hero-grid { display: grid; grid-template-columns: 1.05fr .85fr 1.1fr; gap: 28px; align-items: start; }
.hero-title { font-size: 38px; line-height: 1.1; font-weight: 800; color: $navy; letter-spacing: -.02em; margin: 0 0 16px; }
.hero-sub { font-size: 15px; color: $text; max-width: 430px; margin: 0; line-height: 1.5; }
.gift-callout { display: flex; align-items: center; gap: 12px; background: var(--color-surface); border: 1px solid $line; border-radius: 16px; padding: 14px 16px; box-shadow: 0 6px 24px rgba(20,30,60,.06); max-width: 246px; align-self: center; }
.gift-callout .ic { width: 42px; height: 42px; flex: 0 0 42px; border-radius: 50%; background: $red-soft; display: grid; place-items: center; font-size: 20px; }
.gift-callout p { margin: 0; font-size: 13.5px; color: $navy-700; font-weight: 500; line-height: 1.4; }
.hero-art { position: relative; height: 290px; transform: translateX(-110px); }
.hero-blob { position: absolute; right: 30px; top: 0; width: 330px; max-width: 86%; height: 270px; background: #fbe1e0; border-radius: 58% 42% 50% 50% / 55% 50% 50% 45%; }
.hero-photo { position: absolute; right: 50px; top: 18px; width: 290px; max-width: 78%; height: 238px; display: grid; place-items: center; background: linear-gradient(135deg, #f8ece9, #fdf3f1); border: 1.5px dashed #ecc9c3; border-radius: 20px; color: #cdaaa3; }
.hero-photo svg { width: 62px; height: 62px; }
.deco { position: absolute; }
.deco.bubble { right: 6px; top: 2px; }
.deco.star { right: 2px; top: 116px; }
.deco.plane { right: 22px; top: 198px; }
.deco.curl { right: 235px; top: 26px; }
svg.deco { display: block; }

.sec-head { position: absolute; left: 0; right: 0; bottom: 28px; display: flex; align-items: center; justify-content: space-between; margin: 0; }
.sec-title { font-size: 22px; font-weight: 700; color: $navy; margin: 0; position: relative; padding-bottom: 10px; }
.sec-title::after { content: ''; position: absolute; left: 0; bottom: 0; width: 46px; height: 3px; background: $red; border-radius: 3px; }
.favs { display: flex; align-items: center; gap: 9px; color: $text; font-weight: 500; font-size: 16px; }
.favs .heart { color: $red; }

.teacher-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 22px; margin-top: 10px; }
.empty { text-align: center; color: $muted; padding: 40px 0; }

.bottom-row { display: grid; grid-template-columns: 1fr 320px; gap: 22px; margin: 34px 0 18px; }
.trust-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; background: $bg-alt; border: 1px solid $line; border-radius: 20px; padding: 22px 28px; }
.trust-strip.four { grid-template-columns: repeat(4, 1fr); }
.trust-item { display: flex; align-items: center; gap: 13px; }
.trust-item .ic { width: 44px; height: 44px; border-radius: 50%; flex: 0 0 44px; display: grid; place-items: center; font-size: 20px; }
.trust-item .t { font-weight: 600; color: $ink; font-size: 15px; line-height: 1.25; }
.trust-item .s { font-size: 13px; color: $muted; }
.ic-purple { background: $purple-soft; color: $purple; }
.ic-green { background: $green-soft; color: $green; }
.ic-red { background: $red-soft; color: $red; }
.ic-amber { background: $amber-soft; color: $amber; }
.help-card { background: linear-gradient(180deg, #fdeeee, #fdf4f4); border: 1px solid #f6dada; border-radius: 20px; padding: 20px 22px; display: flex; gap: 14px; }
.help-card .ic { width: 44px; height: 44px; flex: 0 0 44px; border-radius: 50%; background: var(--color-surface); display: grid; place-items: center; box-shadow: 0 1px 2px rgba(20,30,60,.05); font-size: 20px; }
.help-card .t { font-weight: 700; color: $navy; font-size: 15.5px; }
.help-card .s { font-size: 13.5px; color: $text; margin: 2px 0 8px; }
.help-card .lnk { color: $red; font-weight: 600; font-size: 14px; }

.pager { display: flex; justify-content: center; align-items: center; gap: 10px; margin: 26px 0 56px; }
.pager button { width: 40px; height: 40px; border-radius: 50%; border: 1px solid $line; background: var(--color-surface); color: $navy; font-weight: 600; font-size: 15px; display: grid; place-items: center; transition: all .15s; cursor: pointer; }
.pager button:hover:not(:disabled) { border-color: $red; color: $red; }
.pager button.on { background: $red; color: #fff; border-color: $red; }
.pager button:disabled { opacity: .4; cursor: default; }
.pager .arrow { color: $muted; }

@media (max-width: 1200px) { .teacher-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 1024px) {
  .hero-grid { grid-template-columns: 1fr 1fr; }
  .hero-art { display: none; }
  .sec-head { position: static; margin: 24px 0 18px; }
  .bottom-row { grid-template-columns: 1fr; }
  .trust-strip.four { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .tlist-page { padding: 80px 16px 30px; }
  .hero-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 34px; }
  .teacher-grid { grid-template-columns: repeat(2, 1fr); }
  .sec-head { flex-direction: column; align-items: flex-start; gap: 10px; }
}
@media (max-width: 480px) { .trust-strip.four { grid-template-columns: 1fr; } }
</style>
