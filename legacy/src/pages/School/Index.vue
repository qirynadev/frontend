<script lang="ts" setup>
import defaultImage from "@/assets/images/france.jpeg";
import type { AreaType } from "@/constants/constant.type";
import { useAuthStore, useSchoolStore } from "@/stores";
import { type Ref, ref, computed, onActivated } from "vue";
import FrontPagination from "@/components/molecules/FrontPagination.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { i18nRoute } from "@/utils";
import { storeToRefs } from "pinia";
import { useSeo } from "@/composables/useSeo";
import SchoolLogo from "./_Partials/SchoolLogo.vue";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import mobileIconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import mobileIconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import mobileIconPayment from "@/assets/images/destination-choice-mobile/icon-payment.svg";
import mobileIconSupport from "@/assets/images/destination-choice-mobile/icon-support.svg";
import mobileIconSatisfaction from "@/assets/images/destination-choice-mobile/icon-satisfaction.svg";
import mobileIconStatSchools from "@/assets/images/destination-choice-mobile/icon-stat-schools.svg";
import mobileIconStatStudents from "@/assets/images/destination-choice-mobile/icon-stat-students.svg";
import mobileIconStatRank from "@/assets/images/destination-choice-mobile/icon-stat-rank.svg";
import mobileIconStatNobel from "@/assets/images/destination-choice-mobile/icon-stat-nobel.svg";

const schoolStore = useSchoolStore();
const authStore = useAuthStore();
const router = useRouter();
const { t, tm, rt } = useI18n();

const { areaList, selectedSheet, selectedArea, selectedOffer } = storeToRefs(schoolStore);

useSeo({ title: () => selectedSheet.value?.country?.name });

const isLoading: Ref<boolean> = ref(false);

const countryName = computed(() => selectedSheet.value?.country?.name ?? "");
const countryIso = computed(() => selectedSheet.value?.country?.iso_alpha_2 ?? "");

// Drapeau pays : SVG bundlé en local (public/images/flags/<iso>.svg), pas de CDN
// externe — les emojis ne s'affichent pas sur tous les OS (ils tombent en "FR"/"CN"
// sur Windows), d'où l'image.
const countryFlagSrc = computed(() =>
  countryIso.value ? `/images/flags/${countryIso.value.toLowerCase()}.svg` : "",
);

const onFlagError = (e: Event) => {
  (e.target as HTMLImageElement).style.display = "none";
};

// Stats & atouts éditoriaux par pays (i18n: school.facts.<ISO>) — fixes (fallback du specs).
const facts = computed<Record<string, any>>(() => (tm("school.facts") as Record<string, any>) ?? {});
const hasFacts = computed(() => !!facts.value?.[countryIso.value]);
const stats = computed<any[]>(() => (hasFacts.value ? (tm(`school.facts.${countryIso.value}.stats`) as any[]) : []));

// "5e" → { num:"5", ord:"e" } : sépare le suffixe ordinal pour le rendre en exposant
// (5ᵉ = 5ème). Les valeurs non-ordinales ("73", "3 500+", "443 500") restent intactes.
const ordinalParts = (raw: string) => {
  const m = /^(\d+)(ers?|res?|ères?|èmes?|nds?|rds?|sts?|ths?|ds?|es?)$/i.exec(raw.trim());
  return m ? { num: m[1], ord: m[2] } : { num: raw, ord: "" };
};
const statList = computed(() =>
  stats.value.map((s: any) => {
    const { num, ord } = ordinalParts(String(rt(s.value)));
    return { num, ord, label: String(rt(s.label)) };
  }),
);

const highlights = computed<any[]>(() =>
  hasFacts.value ? (tm(`school.facts.${countryIso.value}.highlights`) as any[]) : [],
);
const trustItems = computed<string[]>(() => (tm("school.trust") as string[]) ?? []);

// Sous-titre éditorial par pays (school.facts.<ISO>.subtitle) avec repli sur le texte global.
const heroSubtitle = computed(() => {
  const f = facts.value?.[countryIso.value];
  return f?.subtitle ? String(rt(f.subtitle)) : t("school.hero-subtitle");
});

// Note de bas des stats (ex. « *Classement QS… »), spécifique au pays.
const statsNote = computed(() => {
  const f = facts.value?.[countryIso.value];
  return f?.statsNote ? String(rt(f.statsNote)) : "";
});

const recognizedSchools = computed(() => selectedSheet.value?.schools ?? []);
const recognizedSchoolRows = computed(() => {
  const rows: [typeof recognizedSchools.value, typeof recognizedSchools.value] = [[], []];

  recognizedSchools.value.forEach((school, index) => {
    rows[index % 2].push(school);
  });

  return rows.filter((row) => row.length);
});

// 7 domaines (impair) => dernière carte pleine largeur, comme « Architecture » dans le specs
const isWide = (i: number, len: number) => i === len - 1 && len % 2 === 1;

// Icônes SVG (inner markup) reprises à l'identique du specs — viewBox 0 0 24 24, stroke currentColor
const statIcons = [
  '<path d="M22 10 12 5 2 10l10 5 10-5z"></path><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"></path>',
  '<circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.4"></circle><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M15 19c0-2 1.3-3.4 3.5-3.4S22 17 22 19"></path>',
  '<circle cx="12" cy="9" r="6"></circle><path d="M9 14l-2 7 5-3 5 3-2-7"></path>',
  '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"></path>',
];
const statTints = ["t-pink", "t-green", "t-blue", "t-orange"];
// Palette + icônes mobile confirmées via get_design_context (node 437-1077)
const mobileStatTints = [
  { bg: "#e8e1fe", icon: mobileIconStatSchools },
  { bg: "#def5e3", icon: mobileIconStatStudents },
  { bg: "#fdf3e4", icon: mobileIconStatRank },
  { bg: "#fde8eb", icon: mobileIconStatNobel },
];
const whyIcons = [
  '<path d="M3 5h7a3 3 0 0 1 2 .8A3 3 0 0 1 14 5h7v13h-7a3 3 0 0 0-2 .8A3 3 0 0 0 10 18H3z"></path><path d="M12 5.8V19"></path>',
  '<path d="M3 9l9-6 9 6-9 6z"></path><path d="M3 9v6l9 6 9-6V9"></path>',
  '<path d="M9 3h6M10 3v6l-4 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-9V3"></path>',
  '<circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.4"></circle><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M15 19c0-2 1.3-3.4 3.5-3.4S22 17 22 19"></path>',
];
const whyTints = ["t-pink", "t-green", "t-blue", "t-orange"];
const trustIcons = [
  '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"></path><path d="m9 12 2 2 4-4"></path>',
  '<path d="M12 3v18M5 8l-3 6h6zM19 8l-3 6h6z"></path><path d="M5 21h14"></path>',
  '<path d="M4 14v-2a8 8 0 0 1 16 0v2"></path><rect x="2" y="14" width="4" height="6" rx="1.5"></rect><rect x="18" y="14" width="4" height="6" rx="1.5"></rect><path d="M20 20a4 4 0 0 1-4 3h-2"></path>',
  '<circle cx="12" cy="9" r="6"></circle><path d="M9 14l-2 7 5-3 5 3-2-7"></path>',
];

const handleClickArea = (area: AreaType) => {
  selectedArea.value = area;
  selectedOffer.value = area.offer;
  router.push(
    i18nRoute({
      name: "schools",
      params: { slug: selectedSheet.value?.slug, areaslug: area?.slug },
    }),
  );
};

const handleStart = () => {
  if (areaList.value?.[0]) handleClickArea(areaList.value[0]);
};

// Grille 2 colonnes x 3 lignes (comme sur le Figma) — pagination dès qu'on dépasse 6 domaines
const domainsPerPage = 6;
const domainsPage = ref(1);
const paginatedAreaList = computed(() => {
  const start = (domainsPage.value - 1) * domainsPerPage;
  return (areaList.value ?? []).slice(start, start + domainsPerPage);
});
const goToDomainsPage = (page: number) => {
  domainsPage.value = page;
};

// Sous <keep-alive> (AppLayout), revenir sur une fiche déjà visitée RESTAURE
// l'instance en cache sans rejouer onBeforeMount → on (re)charge la fiche du slug
// courant à chaque activation (onActivated se déclenche aussi au 1ᵉʳ montage).
// Garde : on évite un refetch si la fiche affichée correspond déjà au slug.
onActivated(async () => {
  const slug = router.currentRoute.value.params.slug as string;
  if (slug && selectedSheet.value?.slug !== slug) {
    await schoolStore.getSchoolSheetBySlug(slug);
  }
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});
</script>

<template>
  <!-- ═══════════════════════════════════════════
       MOBILE — écran "Choix du domaine d'étude" (< lg)
       Corrigé via get_design_context (node Figma 437-1077).
  ═══════════════════════════════════════════ -->
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="router.back()">
          <img :src="mobileIconBack" class="size-full" alt="" />
        </button>
        <div class="relative h-[2.8125rem] w-[9.0625rem] overflow-hidden">
          <img
            :src="mobileLogo"
            alt="Qiryna"
            class="absolute left-[-4.88%] top-[-63.5%] h-[251.38%] w-[117.84%] max-w-none"
          />
        </div>
        <RouterLink
          :to="i18nRoute({ name: 'user-notifications' })"
          class="relative flex size-[3.0625rem] flex-col items-center justify-center no-underline"
        >
          <img :src="mobileIconBell" class="size-[1.5625rem]" alt="" />
          <span
            v-if="authStore.unreadNotificationCount > 0"
            class="absolute left-[1.5rem] top-[0.25rem] flex items-center justify-center rounded-full bg-[#ee163e] px-[0.375rem] py-[0.0625rem] text-xs font-medium text-white"
          >
            {{ authStore.unreadNotificationCount }}
          </span>
        </RouterLink>
      </div>

      <!-- Country excellence banner -->
      <div v-if="statList.length" class="w-full rounded-[0.625rem] bg-surface-tint p-4">
        <p class="text-sm font-semibold text-ink">{{ $t("school-mobile-title", { country: countryName }) }}</p>
        <div class="grid grid-cols-4 gap-2 pt-4">
          <div v-for="(stat, i) in statList" :key="i" class="flex flex-col items-center gap-2 text-center">
            <span
              class="flex size-9 items-center justify-center rounded-full"
              :style="{ backgroundColor: mobileStatTints[i % mobileStatTints.length].bg }"
            >
              <img :src="mobileStatTints[i % mobileStatTints.length].icon" alt="" class="size-[1.125rem]" />
            </span>
            <div class="text-sm font-bold text-ink">
              {{ stat.num }}<sup v-if="stat.ord">{{ stat.ord }}</sup>
            </div>
            <div class="text-[0.625rem] leading-[0.8203125rem] text-[#5a6387]">{{ stat.label }}</div>
          </div>
        </div>
        <p v-if="statsNote" class="pt-4 text-[0.625rem] text-ink-muted">{{ statsNote }}</p>
      </div>

      <!-- Domain of study grid -->
      <div class="w-full pt-6">
        <p class="pb-3 text-sm font-semibold tracking-[0.0375rem] text-ink">
          {{ $t("school-mobile-domain-heading") }}
        </p>
        <div v-if="isLoading" class="grid grid-cols-2 gap-3">
          <div v-for="i in 6" :key="i" class="h-[3.875rem] animate-pulse rounded-[0.625rem] bg-surface-alt"></div>
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <button
            v-for="area in paginatedAreaList"
            :key="area.id"
            type="button"
            class="flex items-center justify-between gap-2 rounded-[0.625rem] border border-[#e6e5f2] bg-surface px-[0.6875rem] py-[1.0625rem] text-left shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
            @click="handleClickArea(area)"
          >
            <div class="flex min-w-0 items-center gap-2">
              <img v-if="area.icon" :src="area.icon" :alt="area.title" class="size-9 flex-none rounded-full" />
              <span class="min-w-0">
                <p class="truncate text-xs font-semibold text-ink">{{ area.title }}</p>
                <p class="text-[0.625rem] text-[#94a3b8]">{{ area.nbr_schools }} {{ $t("school-mobile-schools-suffix") }}</p>
              </span>
            </div>
            <span
              class="flex size-6 flex-none items-center justify-center rounded-full bg-surface shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#5e22f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3">
                <path d="M12.75 15.5 16.5 12l-3.75-3.5M16.5 12h-9"></path>
              </svg>
            </span>
          </button>
        </div>
        <FrontPagination
          v-if="!isLoading && areaList.length > domainsPerPage"
          :total="Math.ceil(areaList.length / domainsPerPage)"
          :per-page="domainsPerPage"
          :current="domainsPage"
          @go-to-page="goToDomainsPage"
        />
      </div>

      <!-- Trust badges -->
      <div
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border-default bg-surface-alt py-[0.6875rem]"
      >
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="mobileIconPayment" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-payment") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-[#e4e7f0]"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="mobileIconSupport" class="size-10" alt="" />
          <p class="text-center text-[0.6875rem] font-semibold leading-[0.8203125rem] text-ink">
            {{ $t("trust-support") }}
          </p>
        </div>
        <div class="h-[3.25rem] w-px bg-[#e4e7f0]"></div>
        <div class="flex flex-col items-center gap-[0.375rem] px-1">
          <img :src="mobileIconSatisfaction" class="size-10" alt="" />
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
  <main class="study-page hidden lg:block">
    <section class="study-hero" :style="{ backgroundImage: `url('${selectedSheet?.picture ?? defaultImage}')` }">
      <div class="study-shell study-hero__layout">
        <div class="study-hero__copy">
          <span class="q-badge">{{ $t("school.destination-badge") }}</span>
          <h1 class="q-title">
            {{ $t("school.hero-prefix") }}
            <br />
            <span class="accent">{{ countryName }}</span>
            <img v-if="countryFlagSrc" class="flag" :src="countryFlagSrc" :alt="countryName" @error="onFlagError" />
          </h1>
          <p class="q-subtitle">{{ heroSubtitle }}</p>
          <button class="q-explorer" @click="handleStart">
            {{ $t("school.explore-programs") }}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"></path>
            </svg>
          </button>
        </div>

        <aside class="q-domains">
          <h2 class="q-domains__title">{{ $t("school.domain-question") }}</h2>
          <p class="q-domains__sub">{{ $t("school.domain-desc") }}</p>

          <div v-if="isLoading" class="q-domains__grid">
            <div v-for="i in 6" :key="i" class="q-domain-skel" />
          </div>

          <div v-else-if="areaList?.length" class="q-domains__grid">
            <button
              v-for="(area, i) in areaList"
              :key="area.id"
              class="q-domain"
              :class="{ wide: isWide(i, areaList.length) }"
              type="button"
              @click="handleClickArea(area)"
            >
              <span class="q-domain__ico">
                <img v-if="area.icon" :src="area.icon" :alt="area.title" />
              </span>
              <span class="q-domain__label">{{ area.title }}</span>
              <svg class="q-domain__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </section>

    <section class="study-shell study-body">
      <div class="study-main">
        <div v-if="statList.length" class="q-stats">
          <div v-for="(stat, i) in statList" :key="i" class="q-stat">
            <span class="q-stat__ico" :class="statTints[i % statTints.length]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                v-html="statIcons[i % statIcons.length]"
              ></svg>
            </span>
            <div>
              <div class="q-stat__num">{{ stat.num }}<sup v-if="stat.ord" class="q-stat__ord">{{ stat.ord }}</sup></div>
              <div class="q-stat__lbl">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <p v-if="statsNote" class="q-stats-note" style="margin-top: 10px; font-size: 12px; color: #9aa0ad">
          {{ statsNote }}
        </p>

        <template v-if="highlights.length">
          <h2 class="q-why-h">{{ $t("school.why-title", { country: countryName }) }}</h2>
          <div class="q-why">
            <article v-for="(h, i) in highlights" :key="i" class="q-why-card">
              <span class="q-why-card__ico" :class="whyTints[i % whyTints.length]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  v-html="whyIcons[i % whyIcons.length]"
                ></svg>
              </span>
              <p class="q-why-card__title">{{ rt(h.title) }}</p>
              <p class="q-why-card__text">{{ rt(h.text) }}</p>
            </article>
          </div>
        </template>

        <div v-if="trustItems.length" class="q-trust">
          <div v-for="(item, i) in trustItems" :key="i" class="q-trust-item">
            <span class="q-trust-item__ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                v-html="trustIcons[i % trustIcons.length]"
              ></svg>
            </span>
            <p>{{ item }}</p>
          </div>
        </div>
      </div>

      <aside class="study-side">
        <section v-if="recognizedSchools.length" class="q-schools-card">
          <h2 class="q-schools-h">{{ $t("school.schools-title", { country: countryName }) }}</h2>
          <div class="q-schools">
            <div v-for="(row, rowIndex) in recognizedSchoolRows" :key="rowIndex" class="q-schools-row">
              <SchoolLogo v-for="s in row" :key="s.id" :school="s" />
            </div>
          </div>
        </section>

        <div class="q-cta">
          <span class="q-cta__globe">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"></path>
            </svg>
          </span>
          <div class="q-cta__txt">
            <b>{{ $t("school.cta-title") }}</b>
            <span>{{ $t("school.cta-desc") }}</span>
          </div>
          <button class="q-ecommencer" @click="handleStart">
            {{ $t("school.cta-button") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M5 12h14M13 6l6 6-6 6"></path>
            </svg>
          </button>
        </div>
      </aside>
    </section>
  </main>
</template>
