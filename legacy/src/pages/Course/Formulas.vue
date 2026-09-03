<script lang="ts" setup>
import type { CourseType, FormulaType } from "@/constants/constant.type";
import { useAuthStore, useCourseStore, usePaymentStore } from "@/stores";
import { type ComputedRef, type Ref, computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { i18nRoute } from "@/utils";
import { useI18n } from "vue-i18n";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import iconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import iconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import iconPaymentBadge from "@/assets/images/destination-choice-mobile/icon-payment.svg";
import iconSupportBadge from "@/assets/images/destination-choice-mobile/icon-support.svg";
import iconSatisfactionBadge from "@/assets/images/destination-choice-mobile/icon-satisfaction.svg";
import planIconGreen from "@/assets/images/course-formulas-mobile/plan-icon-green.svg";
import planIconPurple from "@/assets/images/course-formulas-mobile/plan-icon-purple.svg";
import planIconRed from "@/assets/images/course-formulas-mobile/plan-icon-red.svg";
import trustVideo from "@/assets/images/course-formulas-mobile/trust-video.svg";
import trustTeachers from "@/assets/images/course-formulas-mobile/trust-teachers.svg";
import trustPersonalized from "@/assets/images/course-formulas-mobile/trust-personalized.svg";
import { accentFor as accentForFormula } from "@/utils/formulaAccent";

// Repli positionnel (formules pas encore migrées vers un accent explicite en back-office).
const DEFAULT_ACCENT_ORDER = ["green", "purple", "red"];
const DEFAULT_ICONS = [planIconGreen, planIconPurple, planIconRed];

const accentFor = (formula: FormulaType, index: number) => accentForFormula(formula, index, DEFAULT_ACCENT_ORDER);
const iconFor = (formula: FormulaType, index: number) => formula.icon || DEFAULT_ICONS[index % DEFAULT_ICONS.length];
const isFeatured = (formula: FormulaType) => formula.badge === "featured";

const { t } = useI18n();
const router = useRouter();
const courseStore = useCourseStore();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();

const isFetching: Ref<boolean> = ref(false);
const isPaying: Ref<boolean> = ref(false);
const compareOn = ref(false);

const formulaList: ComputedRef<FormulaType[]> = computed(() => courseStore.getFormulaList);
const selectedCourse: ComputedRef<CourseType | null> = computed(() => courseStore.getSelectedCourse);

const language = computed(() => selectedCourse.value?.language ?? selectedCourse.value?.title ?? "");
const levels = computed(() => selectedCourse.value?.levels ?? []);
const activeLevel = computed(() => courseStore.getSelectedLevel ?? levels.value[0] ?? null);
const activeLevelIndex = computed(() => {
  const i = levels.value.findIndex((l) => l.name === activeLevel.value?.name);
  return i >= 0 ? i : 0;
});

const tints = ["red", "purple", "green"];
const levelBadges = ["b-beg", "b-int", "b-adv"];

// Sous-titre / pastille / description courts par niveau (la description backend est du HTML riche)
const stripHtml = (html?: string) => (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const truncate = (s: string, n = 80) => (s.length > n ? s.slice(0, n).trim() + "…" : s);
const levelSubtitle = (index: number, level: { description?: string }) =>
  index < 3 ? t(`course.level-sub-${index + 1}`) : truncate(stripHtml(level?.description), 80);
const levelPill = (index: number) => (index < 3 ? t(`course.level-pill-${index + 1}`) : "");
const levelDesc = (index: number) =>
  index < 3 ? t(`course.level-desc-${index + 1}`) : truncate(stripHtml(activeLevel.value?.description), 160);

const itemLabel = (item: any): string => (typeof item === "string" ? item : item?.title ?? "");

// Comparatif : union des fonctionnalités de toutes les formules
const allFeatures = computed(() => {
  const seen = new Set<string>();
  for (const f of formulaList.value) for (const it of f.items ?? []) {
    const l = itemLabel(it);
    if (l) seen.add(l);
  }
  return [...seen];
});
const formulaHas = (formula: FormulaType, label: string): boolean =>
  (formula.items ?? []).some((it: any) => itemLabel(it) === label);

onMounted(async () => {
  isFetching.value = true;
  await courseStore.fetchFormulas();
  isFetching.value = false;
});

const handleClick = async (formula: FormulaType) => {
  courseStore.setSelectedFormula(formula);

  const orderData = {
    offer_id: String(formula.id),
    service_id: String(selectedCourse.value?.id),
    service_type: "course",
    options: {
      language: selectedCourse.value?.language,
      level: courseStore.getSelectedLevel?.name,
    },
  };

  if (!authStore.token) {
    paymentStore.setOrderData(orderData);
    return router.push(i18nRoute({ name: "signin" }));
  }

  isPaying.value = true;
  const ok = await paymentStore.iniPayment(orderData);
  isPaying.value = false;

  if (ok) window.location.replace(paymentStore.redirectUrl ?? "");
};

const selectLevel = (level: { name: string; description: string }) => {
  courseStore.setSelectedLevel(level);
};
</script>

<template>
  <!-- ═══════════════════════════════════════════
       MOBILE — Figma "Choisissez votre formule" (< lg)
  ═══════════════════════════════════════════ -->
  <div class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="router.back()">
          <img :src="iconBack" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
          v-if="authStore.token"
          :to="i18nRoute({ name: 'user-notifications' })"
          class="relative flex size-[3.0625rem] flex-col items-center justify-center no-underline"
        >
          <img :src="iconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="authStore.unreadNotificationCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ authStore.unreadNotificationCount }}
          </span>
        </RouterLink>
        <div v-else class="size-[3.0625rem]"></div>
      </div>

      <!-- Title -->
      <div class="w-full pb-[1.875rem]">
        <p class="text-xl font-semibold tracking-[-0.040625rem] text-ink">
          {{ $t("profilage-formulas-grid-hero-title") }}
        </p>
        <p class="pt-1 text-sm leading-[1.421875rem] text-ink">{{ $t("profilage-formulas-grid-hero-text") }}</p>
      </div>

      <!-- Formulas -->
      <div v-if="isFetching" class="flex w-full items-stretch gap-[0.3125rem]">
        <div v-for="i in 3" :key="i" class="h-[20.75rem] flex-1 animate-pulse rounded-[0.625rem] bg-surface-alt"></div>
      </div>
      <div v-else-if="formulaList.length" class="flex w-full items-stretch gap-[0.3125rem]">
        <div
          v-for="(formula, index) in formulaList"
          :key="formula.id"
          class="flex flex-1 flex-col items-center rounded-[0.625rem] border-[0.5px] border-border-default bg-surface px-[0.59375rem] pb-6 pt-[0.78125rem]"
        >
          <img :src="iconFor(formula, index)" class="size-[1.875rem]" alt="" />
          <p class="pt-1 text-center text-[0.8125rem] font-semibold" :style="{ color: accentFor(formula, index).titleColor }">
            {{ formula.title }}
          </p>
          <p class="pt-1 text-center text-[0.5625rem] leading-normal text-ink">{{ formula.description }}</p>
          <div class="mt-2.5 w-full border-t border-border-default"></div>

          <div class="mt-2.5 flex w-full flex-1 flex-col gap-1.5">
            <div v-for="(item, itemIndex) in formula.items" :key="itemIndex" class="flex items-start gap-1">
              <svg
                class="mt-0.5 size-[0.4375rem] shrink-0"
                :style="{ color: accentFor(formula, index).titleColor }"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="min-w-0 flex-1 text-[0.4375rem] leading-normal text-ink">{{ itemLabel(item) }}</p>
            </div>
            <div v-if="formula.nbr_hours" class="flex items-start gap-1">
              <svg
                class="mt-0.5 size-[0.4375rem] shrink-0"
                :style="{ color: accentFor(formula, index).titleColor }"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="min-w-0 flex-1 text-[0.4375rem] leading-normal text-ink">
                {{ formula.nbr_hours }} {{ $t("course.sessions-per-month") }}
              </p>
            </div>
          </div>

          <div class="w-full pt-1.5 text-center">
            <p class="text-xl font-semibold" :style="{ color: accentFor(formula, index).priceColor }">
              {{ formula.amount }} €
            </p>
            <p class="text-[0.4375rem] text-ink-muted">{{ formula.interval_label || $t("course.per-month") }}</p>
            <button
              type="button"
              class="mt-1.5 flex w-full items-center justify-center rounded-md border py-2.5"
              :style="
                isFeatured(formula)
                  ? { borderColor: accentFor(formula, index).titleColor, backgroundColor: accentFor(formula, index).titleColor }
                  : { borderColor: accentFor(formula, index).titleColor, backgroundColor: 'transparent' }
              "
              :disabled="isPaying"
              @click="handleClick(formula)"
            >
              <span class="text-[0.5625rem] font-semibold" :style="{ color: isFeatured(formula) ? '#ffffff' : accentFor(formula, index).titleColor }">
                {{ $t("course.choose-this-formula") }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bandeau confiance (visio / professeurs / personnalisation) -->
      <div class="mt-5 flex w-full items-center justify-center gap-3 rounded-[0.625rem] bg-surface px-[0.6875rem] py-[0.8125rem] shadow-[0px_0px_3.5px_rgba(0,0,0,0.1)]">
        <div class="flex flex-1 flex-col items-center gap-1 text-center">
          <img :src="trustVideo" class="size-6" alt="" />
          <p class="text-[0.5625rem] font-medium leading-tight text-ink">{{ $t("course-formulas-mobile-trust-video-title") }}</p>
          <p class="text-[0.5rem] leading-tight text-ink">{{ $t("course-formulas-mobile-trust-video-text") }}</p>
        </div>
        <div class="flex flex-1 flex-col items-center gap-1 text-center">
          <img :src="trustTeachers" class="size-6" alt="" />
          <p class="text-[0.5625rem] font-medium leading-tight text-ink">{{ $t("course-formulas-mobile-trust-teachers-title") }}</p>
          <p class="text-[0.5rem] leading-tight text-ink">{{ $t("course-formulas-mobile-trust-teachers-text") }}</p>
        </div>
        <div class="flex flex-1 flex-col items-center gap-1 text-center">
          <img :src="trustPersonalized" class="size-6" alt="" />
          <p class="text-[0.5625rem] font-medium leading-tight text-ink">{{ $t("course-formulas-mobile-trust-personalized-title") }}</p>
          <p class="text-[0.5rem] leading-tight text-ink">{{ $t("course-formulas-mobile-trust-personalized-text") }}</p>
        </div>
      </div>

      <!-- Trust badges -->
      <div class="mt-5 flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border-default bg-surface-alt py-[0.6875rem]">
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconPaymentBadge" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-payment") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-border-default"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconSupportBadge" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-support") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-border-default"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="iconSatisfactionBadge" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-satisfaction") }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>

  <!-- ═══════════════════════════════════════════
       DESKTOP — page existante (≥ lg)
  ═══════════════════════════════════════════ -->
  <main class="formules-page hidden lg:block">
    <div class="main-grid">
      <!-- LEFT -->
      <div>
        <!-- Stepper : ① done, ② active — colonne gauche uniquement -->
        <div class="stepper">
          <div class="step done"><span class="n">1</span><span class="lbl">{{ $t("course.step-level") }}</span></div>
          <span class="step-sep">→</span>
          <div class="step active"><span class="n">2</span><span class="lbl">{{ $t("course.step-formula") }}</span></div>
          <span class="step-sep">→</span>
          <div class="step"><span class="n">3</span><span class="lbl">{{ $t("course.step-payment") }}</span></div>
          <span class="step-sep">→</span>
          <div class="step"><span class="n">4</span><span class="lbl">{{ $t("course.step-planning") }}</span></div>
        </div>

        <div class="lvl-hero">
          <div class="hero-left">
            <div>
              <h1 class="lvl-title">
                {{ language }} – {{ $t("course.level-label") }}
                <span v-if="activeLevel" class="text-red">{{ activeLevel.name }}</span>
                <span v-if="activeLevel && levelPill(activeLevelIndex)" class="lvl-pill">{{ levelPill(activeLevelIndex) }}</span>
              </h1>
              <p class="lvl-desc">{{ levelDesc(activeLevelIndex) }}</p>
            </div>

            <div class="mini-feats">
              <div class="mfeat"><span class="ic ic-purple">💬</span><div><div class="t">{{ $t("course.fp-feat1-t") }}</div><div class="s">{{ $t("course.fp-feat1-s") }}</div></div></div>
              <div class="mfeat"><span class="ic ic-green">👤</span><div><div class="t">{{ $t("course.fp-feat2-t") }}</div><div class="s">{{ $t("course.fp-feat2-s") }}</div></div></div>
              <div class="mfeat"><span class="ic ic-red">🎯</span><div><div class="t">{{ $t("course.fp-feat3-t") }}</div><div class="s">{{ $t("course.fp-feat3-s") }}</div></div></div>
              <div class="mfeat"><span class="ic ic-purple">📅</span><div><div class="t">{{ $t("course.fp-feat4-t") }}</div><div class="s">{{ $t("course.fp-feat4-s") }}</div></div></div>
            </div>
          </div>
          <div class="lvl-img"></div>
        </div>

        <div class="formula-head">
          <h2>{{ $t("course.choose-formula-title") }}
            <svg class="arrow-doodle" width="60" height="30" viewBox="0 0 60 30" fill="none"><path d="M2 6 C 22 2, 44 8, 54 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 6"/><path d="M48 20 l7 3 -2 -8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
          </h2>
          <label class="compare">{{ $t("course.compare-formulas") }}
            <span class="toggle" :class="{ off: !compareOn }" @click="compareOn = !compareOn"></span>
          </label>
        </div>

        <div v-if="isFetching" class="plans">
          <div v-for="i in 3" :key="i" class="plan skeleton"></div>
        </div>

        <!-- Comparatif -->
        <div v-else-if="compareOn" class="compare-table" :style="{ '--cols': formulaList.length }">
          <div class="ct-row ct-head">
            <div class="ct-feat"></div>
            <div v-for="(formula, index) in formulaList" :key="formula.id" class="ct-col" :class="{ featured: index === 0 }">
              <span v-if="index === 0" class="ct-badge">★ {{ $t("course.popular") }}</span>
              <span class="ct-ic" :class="`ic-${tints[index % 3]}`">🏔️</span>
              <div class="ct-name">{{ formula.title }}</div>
            </div>
          </div>
          <div class="ct-row">
            <div class="ct-feat">{{ $t("course.sessions-per-month") }}</div>
            <div v-for="formula in formulaList" :key="formula.id + '-h'" class="ct-col ct-strong">{{ formula.nbr_hours || "—" }}</div>
          </div>
          <div v-for="feature in allFeatures" :key="feature" class="ct-row">
            <div class="ct-feat">{{ feature }}</div>
            <div v-for="formula in formulaList" :key="formula.id + feature" class="ct-col">
              <span v-if="formulaHas(formula, feature)" class="ct-yes">✓</span><span v-else class="ct-no">—</span>
            </div>
          </div>
          <div class="ct-row ct-price-row">
            <div class="ct-feat">{{ $t("course.per-month") }}</div>
            <div v-for="formula in formulaList" :key="formula.id + '-p'" class="ct-col ct-price">{{ formula.amount }} €</div>
          </div>
          <div class="ct-row ct-cta-row">
            <div class="ct-feat"></div>
            <div v-for="(formula, index) in formulaList" :key="formula.id + '-cta'" class="ct-col">
              <button class="plan-cta" :class="`cta-${tints[index % 3]}`" :disabled="isPaying" @click="handleClick(formula)">{{ $t("course.choose-this-formula") }}</button>
            </div>
          </div>
        </div>

        <!-- Cartes formules -->
        <div v-else class="plans">
          <div v-for="(formula, index) in formulaList" :key="formula.id" class="plan" :class="{ featured: index === 0 }">
            <span v-if="index === 0" class="plan-badge">★ {{ $t("course.popular") }}</span>
            <div class="plan-top">
              <span class="plan-ic" :class="`ic-${tints[index % 3]}`">🏔️</span>
              <div>
                <div class="plan-name">{{ formula.title }}</div>
                <div class="plan-tag">{{ formula.description }}</div>
              </div>
            </div>
            <ul class="plan-list">
              <li v-for="(item, i) in formula.items ?? []" :key="i">
                <span class="ck" :class="`ck-${tints[index % 3]}`">✓</span> {{ itemLabel(item) }}
              </li>
              <li v-if="formula.nbr_hours">
                <span class="ck" :class="`ck-${tints[index % 3]}`">✓</span> {{ formula.nbr_hours }} {{ $t("course.sessions-per-month") }}
              </li>
            </ul>
            <div class="plan-price"><span class="amt">{{ formula.amount }} €</span><div class="per">{{ $t("course.per-month") }}</div></div>
            <button class="plan-cta" :class="`cta-${tints[index % 3]}`" :disabled="isPaying" @click="handleClick(formula)">{{ $t("course.choose-this-formula") }}</button>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <aside class="side">
        <div class="side-card">
          <h3>{{ $t("course.current-level") }}</h3>
          <div
            v-for="(level, index) in levels"
            :key="level.name"
            class="lvl-opt"
            :class="{ on: activeLevel?.name === level.name }"
            @click="selectLevel(level)"
          >
            <span class="badge" :class="levelBadges[index % 3]">{{ "★".repeat(index + 1) }}</span>
            <div><div class="o-t">{{ level.name }}</div><div class="o-s">{{ levelSubtitle(index, level) }}</div></div>
            <span class="radio"></span>
          </div>
        </div>

        <div class="guarantee">
          <span class="ic">🛡️</span>
          <div>
            <div class="t">{{ $t("course.guarantee-t") }}</div>
            <div class="s">{{ $t("course.guarantee-s") }}</div>
          </div>
        </div>

        <div class="side-card trust-mini">
          <h3>{{ $t("course.trust-them") }}</h3>
          <div class="avs">
            <span class="av" v-for="i in 4" :key="i"></span>
            <span class="score">4.9/5</span><span class="stars">★★★★★</span>
          </div>
          <div class="count">{{ $t("course.students-count") }}</div>
        </div>
      </aside>
    </div>

    <div class="foot-strip">
      <span class="fitem">🔒 {{ $t("course.secure-payment") }}</span>
      <span class="fitem">⚡ {{ $t("course.immediate-access") }}</span>
      <span class="fitem">🔄 {{ $t("course.flexible-cancel") }}</span>
    </div>
  </main>
</template>

<style lang="scss" scoped>
$red: #ee1c2b;
$red-600: #e2122a;
$red-tint: #fff5f5;
$navy: #16213f;
$text: #46506b;
$muted: #8a93a8;
$line: #ecedf2;
$bg-alt: #f9fafb;
$green: #1fa463;
$green-600: #168a52;
$green-soft: #e6f4ec;
$green-tint: #f1f9f4;
$purple: #7b3ff2;
$purple-soft: #efe8fd;
$amber: #f5a623;

.formules-page { max-width: 1536px; margin: 0 auto; padding: 100px 56px 60px; }
.text-red { color: $red; }

.stepper { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: center; background: $bg-alt; border: 1px solid $line; border-radius: 20px; padding: 16px 26px; margin: 0 0 22px; }
.step { display: flex; align-items: center; gap: 12px; justify-content: center; }
.step .n { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 14px; flex: 0 0 30px; background: #e6e8ee; color: $muted; }
.step .lbl { font-weight: 600; font-size: 15px; color: $muted; }
.step.active .n { background: $red; color: #fff; }
.step.active .lbl { color: $red; }
.step.done .n { background: $navy; color: #fff; }
.step.done .lbl { color: $navy; }
.step-sep { color: #c8ccd6; padding: 0 14px; text-align: center; }

.main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 26px; align-items: start; }

.lvl-hero { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: stretch; margin-bottom: 34px; }
.hero-left { display: flex; flex-direction: column; }
.lvl-title { font-size: 40px; font-weight: 800; color: $navy; margin: 0 0 16px; letter-spacing: -.02em; line-height: 1.12; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.lvl-pill { font-size: 16px; font-weight: 600; color: $green-600; background: $green-soft; padding: 6px 16px; border-radius: 999px; }
.lvl-desc { font-size: 17px; color: $text; line-height: 1.6; margin: 0; max-width: 480px; }
.lvl-img { width: 100%; height: 100%; min-height: 250px; background: linear-gradient(135deg, #fdeef0, #fff, #eef4fd); border: 1px solid $line; border-radius: 18px; }

.mini-feats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: $bg-alt; border: 1px solid $line; border-radius: 20px; padding: 16px 16px; margin: 22px 0 0; }
.mfeat { display: flex; gap: 8px; align-items: flex-start; }
.mfeat .ic { width: 32px; height: 32px; flex: 0 0 32px; border-radius: 50%; display: grid; place-items: center; font-size: 15px; }
.mfeat .t { font-weight: 600; color: $navy; font-size: 12px; line-height: 1.2; }
.mfeat .s { font-size: 10.5px; color: $muted; margin-top: 2px; line-height: 1.25; }

.formula-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.formula-head h2 { font-size: 25px; font-weight: 700; color: $navy; margin: 0; display: flex; align-items: center; gap: 12px; }
.arrow-doodle { color: #c8ccd6; flex: 0 0 auto; }
.compare { display: inline-flex; align-items: center; gap: 12px; color: $text; font-size: 14.5px; font-weight: 500; cursor: pointer; }
.toggle { width: 46px; height: 26px; border-radius: 999px; background: $red; position: relative; cursor: pointer; transition: background .15s; flex: 0 0 46px; }
.toggle::after { content: ''; position: absolute; top: 3px; left: 23px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left .15s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.toggle.off { background: #d4d7de; }
.toggle.off::after { left: 3px; }

.plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.plan { background: #fff; border: 1.5px solid $line; border-radius: 20px; padding: 24px 22px 22px; position: relative; box-shadow: 0 1px 2px rgba(20,30,60,.05); transition: box-shadow .18s, transform .18s; display: flex; flex-direction: column; }
.plan:hover { box-shadow: 0 12px 38px rgba(20,30,60,.09); transform: translateY(-3px); }
.plan.featured { border-color: #f3b3b8; box-shadow: 0 14px 40px rgba(238,28,43,.12); }
.plan.skeleton { height: 360px; background: #f4f5f8; animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: .55; } }
.plan-badge { position: absolute; top: 18px; right: 18px; background: $red; color: #fff; font-size: 12.5px; font-weight: 600; padding: 5px 12px; border-radius: 999px; }
.plan-top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.plan-ic { width: 56px; height: 56px; flex: 0 0 56px; border-radius: 50%; display: grid; place-items: center; font-size: 26px; }
.plan-name { font-size: 21px; font-weight: 700; color: $navy; }
.plan-tag { font-size: 13.5px; color: $muted; line-height: 1.35; margin-top: 2px; }
.plan-list { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-direction: column; gap: 13px; flex: 1 0 auto; }
.plan-list li { display: flex; align-items: center; gap: 10px; color: $text; font-size: 14.5px; }
.plan-list li .ck { flex: 0 0 auto; border-radius: 50%; width: 20px; height: 20px; display: grid; place-items: center; color: #fff; font-size: 11px; }
.ck-red { background: $red; }
.ck-purple { background: $purple; }
.ck-green { background: $green; }
.plan-price { text-align: center; margin-bottom: 18px; }
.plan-price .amt { font-size: 34px; font-weight: 800; color: $navy; }
.plan-price .per { font-size: 13.5px; color: $muted; }
.plan-cta { display: block; width: 100%; text-align: center; padding: 13px; border-radius: 10px; font-weight: 600; font-size: 15px; border: 1.5px solid transparent; transition: all .15s; cursor: pointer; }
.cta-red { background: $red; color: #fff; box-shadow: 0 8px 18px rgba(238,28,43,.22); }
.cta-red:hover { background: $red-600; }
.cta-purple { background: #fff; color: $purple; border-color: #d9c9fb; }
.cta-purple:hover { background: $purple-soft; }
.cta-green { background: #fff; color: $green-600; border-color: #bfe4cf; }
.cta-green:hover { background: $green-tint; }

.ic-purple { background: $purple-soft; color: $purple; }
.ic-green { background: $green-soft; color: $green; }
.ic-red { background: #fdecec; color: $red; }

/* Comparatif table */
.compare-table { background: #fff; border: 1px solid $line; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 2px rgba(20,30,60,.05); }
.ct-row { display: grid; grid-template-columns: 1.4fr repeat(var(--cols, 3), 1fr); align-items: center; border-bottom: 1px solid $line; }
.ct-row:last-child { border-bottom: none; }
.ct-feat { padding: 14px 20px; font-size: 14px; color: $text; font-weight: 500; }
.ct-col { padding: 14px 12px; text-align: center; font-size: 14px; color: $navy; border-left: 1px solid $line; position: relative; }
.ct-col.featured { background: $red-tint; }
.ct-head { background: $bg-alt; }
.ct-head .ct-col { padding: 22px 12px 16px; }
.ct-ic { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; font-size: 22px; margin-bottom: 6px; }
.ct-name { font-weight: 700; font-size: 16px; color: $navy; }
.ct-badge { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); background: $red; color: #fff; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
.ct-strong { font-weight: 700; color: $navy; }
.ct-yes { color: $green; font-weight: 700; font-size: 16px; }
.ct-no { color: #c8ccd6; }
.ct-price-row { background: $bg-alt; }
.ct-price { font-weight: 800; font-size: 18px; color: $navy; }
.ct-cta-row .ct-col { padding: 18px 12px; }
.ct-cta-row .plan-cta { font-size: 13.5px; padding: 10px; }

.side { display: flex; flex-direction: column; gap: 20px; }
.side-card { background: #fff; border: 1px solid $line; border-radius: 20px; box-shadow: 0 1px 2px rgba(20,30,60,.05); padding: 22px; }
.side-card h3 { font-size: 18px; font-weight: 700; color: $navy; margin: 0 0 16px; }
.lvl-opt { display: flex; align-items: center; gap: 14px; border: 1.5px solid $line; border-radius: 14px; padding: 14px 16px; margin-bottom: 12px; cursor: pointer; transition: border-color .15s, background .15s; }
.lvl-opt:last-child { margin-bottom: 0; }
.lvl-opt.on { border-color: $red; background: $red-tint; }
.lvl-opt .badge { width: 42px; height: 42px; flex: 0 0 42px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-size: 13px; letter-spacing: -1px; }
.b-beg { background: $green; }
.b-int { background: $amber; }
.b-adv { background: $red; }
.lvl-opt .o-t { font-weight: 700; color: $navy; font-size: 15.5px; }
.lvl-opt .radio { margin-left: auto; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #cdd2dc; flex: 0 0 20px; display: grid; place-items: center; }
.lvl-opt.on .radio { border-color: $red; }
.lvl-opt.on .radio::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: $red; }

.guarantee { background: linear-gradient(180deg,#fdeeee,#fdf5f5); border: 1px solid #f6dada; border-radius: 20px; padding: 18px 20px; display: flex; gap: 13px; }
.guarantee .ic { width: 42px; height: 42px; flex: 0 0 42px; border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 1px 2px rgba(20,30,60,.05); font-size: 18px; }
.guarantee .t { font-weight: 700; color: $navy; font-size: 15px; }
.guarantee .s { font-size: 13px; color: $text; margin-top: 3px; line-height: 1.4; }

.trust-mini .avs { display: flex; align-items: center; margin: 4px 0 14px; }
.trust-mini .avs .av { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #fff; margin-left: -10px; }
.trust-mini .avs .av:first-child { margin-left: 0; }
.trust-mini .avs .av:nth-child(1) { background: linear-gradient(135deg, #fcd34d, #f97316); }
.trust-mini .avs .av:nth-child(2) { background: linear-gradient(135deg, #93c5fd, #2563eb); }
.trust-mini .avs .av:nth-child(3) { background: linear-gradient(135deg, #fca5a5, #dc2626); }
.trust-mini .avs .av:nth-child(4) { background: linear-gradient(135deg, #86efac, #16a34a); }
.trust-mini .avs .score { font-weight: 700; color: $navy; font-size: 16px; margin-left: 14px; }
.trust-mini .stars { color: $amber; margin-left: 8px; font-size: 15px; letter-spacing: 1px; }
.trust-mini .count { font-size: 14px; color: $text; font-weight: 500; }

.foot-strip { display: flex; justify-content: center; gap: 56px; background: $bg-alt; border: 1px solid $line; border-radius: 20px; padding: 18px; margin: 32px 0 0; flex-wrap: wrap; }
.foot-strip .fitem { display: inline-flex; align-items: center; gap: 11px; color: $text; font-size: 15px; font-weight: 500; }

@media (max-width: 1024px) {
  .main-grid { grid-template-columns: 1fr; }
  .lvl-hero { grid-template-columns: 1fr; }
  .lvl-img { width: 100%; }
}
@media (max-width: 768px) {
  .formules-page { padding: 80px 16px 40px; }
  .stepper { grid-template-columns: 1fr; gap: 8px; }
  .step-sep { display: none; }
  .mini-feats { grid-template-columns: 1fr 1fr; }
  .plans { grid-template-columns: 1fr; }
  .lvl-title { font-size: 30px; }
  .foot-strip { gap: 20px; }
}
</style>
