<script lang="ts" setup>
import defaultImage from "@/assets/images/france.jpeg";
import router from "@/router";
import { useAppStore, useAuthStore, useSchoolStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { stripHtml } from "@/utils/string";
import { computed, onMounted, ref, watch, nextTick, type Ref } from "vue";
import type { OfferType, SchoolType } from "@/constants/constant.type";
import { useRoute } from "vue-router";
import OtherSchoolTag from "@/components/atoms/OtherSchoolTag.vue";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { useI18n } from "vue-i18n";
import { ElNotification } from "element-plus";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import mobileIconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import mobileIconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";

const route = useRoute();
const appStore = useAppStore();
const schoolStore = useSchoolStore();
const authStore = useAuthStore();

const isFetching = ref<boolean>(false);
const activeAccordion: Ref<string | number | null> = ref(0);
const activeSubAccordion: Ref<string | number | null> = ref(0);
const accordionRef = ref<HTMLElement | null>(null);
const imageRef = ref<HTMLElement | null>(null);
const showImage = ref(true);
const selectedMenuSlug = computed<string | null>(
  () => appStore.selectedMenuSlug ?? (route.params.slug as string) ?? null,
);
const selectedSchool = computed<SchoolType | null>(() => schoolStore.selectedSchool);
const selectedOffer = computed<OfferType | null>(() => schoolStore.selectedOffer);
const otherSchoolList = computed<SchoolType[]>(() => schoolStore.schoolList ?? []);

const { t } = useI18n();

// ── Bloc mobile (capture d'écran, cf. handoff) ──────────────────────────
type MobileTab = "presentation" | "formations" | "strengths";
const mobileTab = ref<MobileTab>("presentation");

// Favori : décoratif, pas de fonctionnalité "favoris" en base pour les écoles (même choix
// que sur la liste des écoles).
const isFavorite = ref(false);

const shareSchool = async () => {
  const shareData = { title: selectedSchool.value?.title ?? "Qiryna", url: window.location.href };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // annulé par l'utilisateur : rien à faire
    }
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(shareData.url);
    ElNotification({ type: "success", message: t("link-copied") });
  }
};


// Palette tournante des icônes de formation (violet/rose/vert/orange), confirmée via
// get_design_context (node 440-160) — chaque carte a un cercle de couleur distincte,
// pas une couleur uniforme. Pas de champ "icône" réel par formation (JSON libre
// {title, description}), donc icône fixe + couleur cyclique plutôt qu'une icône par carte.
const formationTints = [
  { bg: "#e8e1fe", fg: "#582cfd" },
  { bg: "#fde8eb", fg: "#f7344e" },
  { bg: "#def5e3", fg: "#16a34a" },
  { bg: "#fdf3e4", fg: "#d97706" },
];

const handleClickBtn = () => {
  router.push(
    i18nRoute({
      name: "area-formula",
      params: {
        areaslug: selectedOffer.value?.slug,
      },
    }),
  );
};

const handleClickOtherSchool = (school: SchoolType) => {
  schoolStore.selectedSchool = school;
};

// Fetch school data based on route params
const fetchSchoolData = async () => {
  const schoolId = selectedSchool.value?.id;
  if (!schoolId || isFetching.value) return;

  isFetching.value = true;
  try {
    await schoolStore.fetchSchoolById(schoolId);
    await schoolStore.fetchOtherSchools();
  } finally {
    isFetching.value = false;
  }
};

// Watch for route changes to reload data
watch(
  () => route.params.schoolslug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      fetchSchoolData();
    }
  },
);

watch(activeAccordion, (val) => {
  const isOpen = val !== null && val !== 0 && val !== "" && val !== undefined;
  showImage.value = !isOpen;

  if (isOpen && accordionRef.value) {
    nextTick(() => {
      accordionRef.value!.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});

onMounted(async () => {
  await fetchSchoolData();
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});
</script>

<template>
  <!-- ═══════════════════════════════════════════
       MOBILE — écran "Fiche école" (< lg)
       Corrigé via get_design_context (node Figma 440-160). Le badge nom
       d'école du Figma (texte fixe multi-lignes) est remplacé par le logo
       réel de l'école (données dynamiques) ; "Grade Master | X ans" par
       formation volontairement omis (aucun champ réel équivalent en base).
  ═══════════════════════════════════════════ -->
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26 lg:hidden">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-4">
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

      <!-- Hero -->
      <div class="relative w-full">
        <div class="relative h-[13.125rem] w-full overflow-hidden rounded-[0.625rem]">
          <img :src="selectedSchool?.image ?? defaultImage" class="size-full object-cover" alt="" />
        </div>
        <!-- Badge école : à cheval sur le bord bas-gauche de la photo (cf. Figma, node 440-160) -->
        <div
          v-if="selectedSchool?.logo"
          class="absolute -bottom-6 left-4 max-w-[9rem] rounded-[0.625rem] bg-surface p-3 shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.25)]"
        >
          <img :src="selectedSchool.logo" class="max-h-14 w-full object-contain" alt="" />
        </div>
        <!-- Favoris/Partager : à cheval sur le bord bas-droit de la photo (cf. Figma, node 440-160) -->
        <div class="absolute -bottom-5 right-4 flex gap-2">
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full bg-surface shadow-[0_0.25rem_0.1875rem_rgba(0,0,0,0.1),0_0.125rem_0.125rem_rgba(0,0,0,0.1)]"
            :aria-label="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            @click="isFavorite = !isFavorite"
          >
            <svg viewBox="0 0 24 24" :fill="isFavorite ? '#582cfd' : 'none'" stroke="#582cfd" stroke-width="1.8" class="size-4">
              <path
                d="M12 21s-6.7-4.35-9.3-8.1C1 10.3 1.6 6.9 4.4 5.3c2.2-1.3 4.9-.7 6.4 1.2l1.2 1.5 1.2-1.5c1.5-1.9 4.2-2.5 6.4-1.2 2.8 1.6 3.4 5 1.7 7.6C18.7 16.65 12 21 12 21z"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full bg-surface shadow-[0_0.25rem_0.1875rem_rgba(0,0,0,0.1),0_0.125rem_0.125rem_rgba(0,0,0,0.1)]"
            aria-label="Partager"
            @click="shareSchool"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#191919" stroke-width="1.8" class="size-4">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Title -->
      <div class="w-full pt-8">
        <p class="text-[1.1875rem] font-semibold tracking-[-0.03438rem] text-ink">{{ selectedSchool?.title }}</p>
        <p class="flex items-center gap-1 pt-1 text-sm text-ink">
          <img src="@/assets/images/pin-location.svg" class="size-3.5" alt="" />
          {{ selectedSchool?.city }}<span v-if="selectedSchool?.city && selectedSchool?.country?.name">, </span
          >{{ selectedSchool?.country?.name }}
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex w-full items-center border-b border-[#e6e5f2] pt-4">
        <button
          type="button"
          class="flex-1 pb-3 text-sm font-medium"
          :class="mobileTab === 'presentation' ? 'border-b-2 border-[#582cfd] text-[#582cfd]' : 'text-[#5a6387]'"
          @click="mobileTab = 'presentation'"
        >
          {{ $t("school.presentation") }}
        </button>
        <button
          v-if="(selectedSchool?.formations as any)?.length"
          type="button"
          class="flex-1 pb-3 text-sm font-medium"
          :class="mobileTab === 'formations' ? 'border-b-2 border-[#582cfd] text-[#582cfd]' : 'text-[#5a6387]'"
          @click="mobileTab = 'formations'"
        >
          {{ $t("school.formations") }}
        </button>
        <button
          v-if="selectedSchool?.strengths"
          type="button"
          class="flex-1 pb-3 text-sm font-medium"
          :class="mobileTab === 'strengths' ? 'border-b-2 border-[#582cfd] text-[#582cfd]' : 'text-[#5a6387]'"
          @click="mobileTab = 'strengths'"
        >
          {{ $t("school.strengths") }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="w-full pt-4">
        <div v-if="mobileTab === 'presentation'" class="text-sm leading-6 text-ink" v-html="selectedSchool?.presentation"></div>

        <div v-else-if="mobileTab === 'formations'" class="flex flex-col gap-3">
          <div
            v-for="(formation, index) in selectedSchool?.formations"
            :key="index"
            class="flex items-start gap-3 rounded-[0.625rem] bg-surface p-5 shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
          >
            <span
              class="flex size-10 flex-none items-center justify-center rounded-full"
              :style="{ backgroundColor: formationTints[index % formationTints.length].bg }"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                :stroke="formationTints[index % formationTints.length].fg"
                stroke-width="1.8"
                class="size-5"
              >
                <path d="M22 10 12 5 2 10l10 5 10-5z"></path>
                <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"></path>
              </svg>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-ink">{{ formation.title }}</p>
              <p class="line-clamp-2 pt-1 text-xs text-[#5a6387]">{{ stripHtml(formation.description) }}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="#191919" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 size-4 flex-none">
              <path d="m9 6 6 6-6 6"></path>
            </svg>
          </div>
        </div>

        <div v-else-if="mobileTab === 'strengths'" class="text-sm leading-6 text-ink" v-html="selectedSchool?.strengths"></div>
      </div>

      <!-- CTA -->
      <div class="mt-6 flex w-full items-start gap-3 rounded-[0.625rem] bg-surface-tint p-4">
        <span class="flex size-11 flex-none items-center justify-center rounded-full bg-[#e8e2fd]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#582cfd" stroke-width="1.8" class="size-5">
            <path d="M4 14v-2a8 8 0 0 1 16 0v2"></path>
            <rect x="2" y="14" width="4" height="6" rx="1.5"></rect>
            <rect x="18" y="14" width="4" height="6" rx="1.5"></rect>
          </svg>
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-ink">{{ $t("school.need-help") }}</p>
          <p class="pt-1 text-[0.625rem] leading-4 text-ink">{{ $t("school-mobile-cta-text") }}</p>
        </div>
        <button
          type="button"
          class="mt-1 inline-flex flex-none items-center gap-1 rounded-[0.625rem] border border-[#450ff2] px-3 py-2 text-[0.625rem] font-medium text-[#450ff2]"
          @click="handleClickBtn"
        >
          {{ $t("school-mobile-cta-button") }}
          <svg viewBox="0 0 24 24" fill="none" stroke="#450ff2" stroke-width="2.5" class="size-2.5">
            <path d="M5 12h14M13 6l6 6-6 6"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="orientation" :special-orientation-icon="true" />
  </div>

  <!-- ═══════════════════════════════════════════
       DESKTOP — page existante (≥ lg)
  ═══════════════════════════════════════════ -->
  <div class="global-container hidden lg:block">
    <div class="container-inner">
      <div class="left-part">
        <div class="pb-[80px] lg:pb-0 relative">
          <div
            ref="imageRef"
            v-show="showImage"
            class="relative mb-[15px] lg:mb-[25px] w-full border border-[#c0c0c0] h-[200px] lg:h-[300px] rounded-md overflow-hidden"
          >
            <img
              :src="selectedSchool?.image ?? defaultImage"
              alt=""
              class="absolute object-cover z-10 top-0 left-0 w-full h-full"
            />

            <div class="absolute bottom-0 left-0 w-full h-[80px] lg:h-[100px] z-30 bg-gradient">
              <div class="flex items-center justify-start h-full relative">
                <div
                  class="ms-[10px] lg:ms-[30px] h-[65px] w-[91px] lg:h-[100px] lg:w-[144px] p-[10px] lg:p-[20px] bg-surface rounded-[5px] mb-[10px]"
                >
                  <img :src="selectedSchool?.logo" class="w-full h-full object-contain" />
                </div>

                <div class="ms-[10px] lg:ms-[30px] flex flex-col text-white">
                  <p class="m-0 font-bold text-[14px] lg:text-[17px] line-clamp-1">
                    {{ selectedSchool?.title }}
                  </p>
                  <div class="localisation flex items-center gap-1 lg:gap-2">
                    <img
                      src="@/assets/images/pin-location.svg"
                      class="invert brightness-0 text-white w-[14px] lg:w-auto"
                    />
                    <p class="m-0 text-[13px] lg:text-[16px]">{{ selectedSchool?.city }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Accordion -->
          <div ref="accordionRef" style="scroll-margin-top: 100px">
            <el-collapse v-model="activeAccordion" accordion class="accordion accordion-main mb-[20px]">
              <el-collapse-item
                v-if="String(selectedSchool?.presentation).length > 0"
                as
                :title="$t('school.presentation')"
                :name="1"
              >
                <div
                  :class="showImage ? 'h-[350px]' : 'h-[565px] lg:h-[675px]'"
                  class="overflow-y-auto transition-all duration-300"
                >
                  <div class="my-description" v-html="selectedSchool?.presentation"></div>
                </div>
              </el-collapse-item>

              <el-collapse-item
                v-if="(selectedSchool?.formations as any)?.length > 0"
                :title="$t('school.formations')"
                :name="2"
              >
                <!-- Sub Accordion -->
                <el-collapse v-model="activeSubAccordion" accordion class="accordion accordion-sub ms-5 me-2">
                  <template v-for="(formation, index) in selectedSchool?.formations" :key="index">
                    <el-collapse-item :title="formation.title" :name="index + 1">
                      <div
                        :class="showImage ? 'h-[200px]' : 'h-[415px] lg:h-[525px]'"
                        class="overflow-y-auto transition-all duration-300"
                      >
                        <div class="my-description" v-html="formation.description"></div>
                      </div>
                    </el-collapse-item>
                  </template>
                </el-collapse>
                <!-- End Sub Accordion -->
              </el-collapse-item>

              <el-collapse-item v-for="(item, index) in selectedSchool?.details" :title="item?.title" :name="3 + index">
                <div
                  :class="showImage ? 'h-[200px]' : 'h-[415px] lg:h-[525px]'"
                  class="overflow-y-auto transition-all duration-300"
                >
                  <div class="my-description" v-html="item?.description"></div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- Desktop inline CTA -->
          <div class="hidden lg:flex items-center justify-between gap-3 mt-[85px]">
            <p class="m-0 text-[16px] italic">{{ $t("school.need-help") }}</p>
            <ButtonGeneral
              :title="$t('course.see-packages')"
              className="py-[10px] px-[30px] text-[14px] whitespace-nowrap"
              @pressed="handleClickBtn"
            />
          </div>
          <!-- End Desktop inline CTA -->
        </div>
      </div>

      <!-- Desktop right panel -->
      <div class="right-part hidden lg:block">
        <div class="areas-container flex flex-col h-[300px]">
          <div class="header">
            {{ $t("school.other-schools-label") }}
          </div>
          <div class="overflow-y-auto flex-1 py-[10px]">
            <OtherSchoolTag
              v-for="school in otherSchoolList"
              :key="school.id"
              :data="school"
              :isActive="school.id === selectedSchool?.id"
              @choosed="handleClickOtherSchool"
            />
          </div>
        </div>

        <div class="mt-[30px]">
          <BannerRotator class="pub" />
        </div>
      </div>
      <!-- End Desktop right panel -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(#00000000, #000000cf);
}

// ── Flèche dans un cercle (sections principales uniquement) ──────────
:deep(.accordion-main > .el-collapse-item > .el-collapse-item__header .el-collapse-item__arrow) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  transform: rotate(90deg);
  transition: transform 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
}

:deep(.accordion-main > .el-collapse-item > .el-collapse-item__header.is-active .el-collapse-item__arrow) {
  transform: rotate(0deg) !important;
}

// ── Flèche normale sur le sous-accordéon ──────────────────────────────
:deep(.accordion-sub .el-collapse-item__arrow) {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}

:deep(.accordion-sub .el-collapse-item__header.is-active .el-collapse-item__arrow) {
  transform: rotate(0deg) !important;
}

// ── Sections principales – style "Sitelinks Google" ───────────────────
:deep(.accordion-main.el-collapse) {
  border-top: none;
  border-bottom: none;
  box-shadow: none;
}

:deep(.accordion-main .el-collapse-item),
:deep(.accordion-sub .el-collapse-item) {
  box-shadow: none;
  margin: 0 !important;
}

:deep(.accordion-main .el-collapse-item__header:hover),
:deep(.accordion-sub .el-collapse-item__header:hover) {
  background: transparent;
  box-shadow: none !important;
  border-color: var(--color-border) !important;
}

:deep(.accordion-main .el-collapse-item.is-active),
:deep(.accordion-sub .el-collapse-item.is-active) {
  border: none !important;
  border-radius: 0 !important;
}

:deep(.accordion-main .el-collapse-item.is-active:hover),
:deep(.accordion-sub .el-collapse-item.is-active:hover) {
  box-shadow: none !important;
  border-color: transparent !important;
}

:deep(.accordion-main > .el-collapse-item > .el-collapse-item__header) {
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  color: var(--color-ink);
  background: transparent;
  border-bottom: 1px solid var(--color-border);
  padding: 10px 2px;
  height: auto;
  line-height: 1.4;
}

:deep(.accordion-main > .el-collapse-item > .el-collapse-item__header.is-active) {
  border-bottom-color: #273c66;
}

:deep(.accordion-main > .el-collapse-item > .el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.accordion-main > .el-collapse-item > .el-collapse-item__wrap > .el-collapse-item__content) {
  padding: 10px 2px;
  font-family: inherit;
}

// ── Sous-sections – style "Autres questions Google" ───────────────────
:deep(.accordion-sub.el-collapse) {
  border-top: none;
  border-bottom: none;
  box-shadow: none;
}

:deep(.accordion-sub .el-collapse-item) {
  margin: 0 !important;
}

:deep(.accordion-sub:has(.is-active) .el-collapse-item:not(.is-active)) {
  display: none;
}

:deep(.accordion-sub .el-collapse-item__header) {
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

:deep(.accordion-sub > .el-collapse-item > .el-collapse-item__header) {
  font-size: 14px;
  font-weight: 400;
  font-family: inherit;
  color: var(--color-ink);
  background: transparent;
  border-bottom: 1px solid var(--color-border);
  padding: 8px 2px;
  height: auto;
  line-height: 1.4;
}

:deep(.accordion-sub > .el-collapse-item > .el-collapse-item__header.is-active) {
  color: #273c66;
  border-bottom-color: var(--color-border);
}

:deep(.accordion-sub > .el-collapse-item > .el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.accordion-sub > .el-collapse-item > .el-collapse-item__wrap > .el-collapse-item__content) {
  padding: 8px 2px;
  font-family: inherit;
}
</style>
