<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useAuthStore, useJourneyStore, usePaymentStore } from "@/stores";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import { i18nRoute } from "@/utils";
import { KeyIcon, ShieldCheckIcon, UserGroupIcon, TruckIcon, DevicePhoneMobileIcon, EyeIcon, ClipboardDocumentCheckIcon } from "@heroicons/vue/24/outline";
import mobileLogo from "@/assets/images/destination-choice-mobile/logo.png";
import iconBack from "@/assets/images/destination-choice-mobile/icon-back.svg";
import iconBell from "@/assets/images/destination-choice-mobile/icon-bell.svg";
import fieldArrivalDate from "@/assets/images/living-project-mobile/field-arrival-date.svg";
import fieldBudget from "@/assets/images/living-project-mobile/field-budget.svg";
import fieldSchool from "@/assets/images/living-project-mobile/field-school.svg";
import fieldCity from "@/assets/images/living-project-mobile/field-city.svg";
import fieldDuration from "@/assets/images/living-project-mobile/field-duration.svg";
import fieldType from "@/assets/images/living-project-mobile/field-type.svg";
import fieldOccupants from "@/assets/images/living-project-mobile/field-occupants.svg";
import fieldPreferences from "@/assets/images/living-project-mobile/field-preferences.svg";
import fieldChevron from "@/assets/images/living-project-mobile/field-chevron.svg";
import submitArrow from "@/assets/images/living-project-mobile/submit-arrow.svg";

const router = useRouter();
const { locale } = useI18n();
const authStore = useAuthStore();
const journeyStore = useJourneyStore();
const paymentStore = usePaymentStore();

const isFetching = ref(false);
const activeTab = ref<"overview" | "formula">("formula");

// Le plus récent achat "Coût de la vie" de l'utilisateur — même valeur de service_type
// que le contrôle déjà fait dans Payment/Success.vue pour ce type de commande.
const livingOrder = computed(() =>
  [...paymentStore.userPaymentList]
    .filter((order) => order.service_type === "App\\Models\\CostOfLiving")
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0] ?? null,
);

const progressPercent = computed(() => Math.round(journeyStore.journeys.living?.percent ?? 0));

const formattedPaidDate = computed(() => {
  if (!livingOrder.value?.created_at) return "";
  const d = dayjs(livingOrder.value.created_at).locale(locale.value === "en" ? "en" : "fr");
  return locale.value === "en" ? d.format("MMMM D, YYYY") : d.format("D MMMM YYYY");
});

// Icônes cycliques pour les inclusions réelles de la formule (order.offer.items) — le Figma
// montre 5 pictos fixes, mais le nombre d'inclusions varie selon la formule achetée.
const featureIcons = [KeyIcon, ShieldCheckIcon, UserGroupIcon, TruckIcon, DevicePhoneMobileIcon];

const goBack = () => router.back();

// Formulaire de préférences logement : pas d'endpoint backend pour l'instant (confirmé) —
// state local uniquement, le bouton ne fait qu'une validation d'UI.
const preferences = ref({
  arrivalDate: "",
  budget: "",
  school: "",
  city: "",
  duration: "",
  housingType: "",
  occupants: "",
  notes: "",
});

const handleSubmitPreferences = () => {
  // TODO backend: aucun endpoint de sauvegarde des préférences logement n'existe encore.
};

onBeforeMount(async () => {
  isFetching.value = true;
  await Promise.all([journeyStore.fetchJourneys(), paymentStore.fetchUserPayment()]);
  isFetching.value = false;
  if (authStore.token) await authStore.fetchUnreadNotificationCount();
});
</script>

<template>
  <div class="flex w-full flex-col items-center overflow-x-hidden bg-surface pb-26">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="goBack">
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

      <!-- Progression -->
      <div class="w-full rounded-[0.625rem] border border-border-default p-[1.0625rem]">
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1 pr-2">
            <p class="text-base font-semibold text-ink">{{ $t("living-project-progress-title") }}</p>
            <p class="pt-1 text-xs text-ink">{{ $t("living-project-progress-text") }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-base font-bold text-[#ff1f47]">{{ progressPercent }}%</p>
            <p class="pt-1.5 text-[0.6875rem] text-ink">{{ $t("living-project-progress-done-label") }}</p>
          </div>
        </div>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
          <div class="h-full rounded-full bg-[#ff1f47] transition-all" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-4 flex h-[2.5625rem] w-full items-stretch overflow-hidden rounded-md border border-border-default bg-surface-alt p-px">
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded"
          :class="activeTab === 'overview' ? 'border-b-2 border-[#2d00fc] text-[#2d00fc]' : 'text-ink'"
          @click="activeTab = 'overview'"
        >
          <EyeIcon class="size-3.5" />
          <span class="text-[0.6875rem] font-medium">{{ $t("living-project-tab-overview") }}</span>
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded"
          :class="activeTab === 'formula' ? 'border-b-2 border-[#2d00fc] text-[#2d00fc]' : 'text-ink'"
          @click="activeTab = 'formula'"
        >
          <ClipboardDocumentCheckIcon class="size-3.5" />
          <span class="text-[0.6875rem] font-medium">{{ $t("living-project-tab-formula") }}</span>
        </button>
      </div>

      <!-- Onglet Aperçu -->
      <div v-if="activeTab === 'overview'" class="w-full pt-4 text-sm leading-6 text-ink">
        {{ $t("living-project-overview-placeholder") }}
      </div>

      <!-- Onglet Formule achetée -->
      <div v-else class="w-full pt-4">
        <div v-if="livingOrder" class="w-full rounded-[0.625rem] border border-border-default p-[1.0625rem]">
          <div class="flex items-start gap-3">
            <div class="size-20 shrink-0 overflow-hidden rounded-2xl border border-border-default bg-surface-alt">
              <img v-if="livingOrder.offer?.icon" :src="livingOrder.offer.icon" class="size-full object-cover" alt="" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-lg font-extrabold text-ink">{{ livingOrder.offer?.title }}</p>
              <p v-if="livingOrder.offer?.description" class="max-w-[10rem] pt-1 text-[0.53rem] text-ink-muted">
                {{ livingOrder.offer.description }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-[1.375rem] font-extrabold text-[#4c12ee]">{{ livingOrder.amount }} €</p>
              <p class="pt-1 text-[0.6875rem] text-ink-muted">{{ $t("living-project-payment-once") }}</p>
              <span class="mt-1.5 inline-block rounded-md bg-[#eafaec] px-2.5 py-1 text-[0.59375rem] text-[#059669]">
                {{ $t("living-project-paid-on", { date: formattedPaidDate }) }}
              </span>
            </div>
          </div>

          <div v-if="livingOrder.offer?.items?.length" class="mt-4 grid grid-cols-5 gap-1 border-t border-border-default pt-[0.5625rem]">
            <div v-for="(item, index) in livingOrder.offer.items" :key="index" class="flex flex-col items-center gap-1 p-1 text-center">
              <div class="flex size-8 items-center justify-center rounded-xl bg-[#f7f6fe]">
                <component :is="featureIcons[index % featureIcons.length]" class="size-3.5 text-[#4f18f6]" />
              </div>
              <p class="text-[0.5625rem] leading-tight text-ink-muted">{{ item.title }}</p>
            </div>
          </div>
        </div>
        <p v-else-if="!isFetching" class="text-sm text-ink-muted">{{ $t("living-project-no-order") }}</p>
      </div>

      <!-- Formulaire de préférences -->
      <div class="w-full pt-6">
        <p class="text-sm font-bold text-ink">{{ $t("living-project-form-title") }}</p>
        <p class="pt-0.5 text-xs text-ink">{{ $t("living-project-form-text") }}</p>
      </div>

      <div class="flex w-full flex-col gap-2.5 pt-2.5">
        <div class="flex gap-1.5">
          <label class="flex flex-1 items-center gap-2.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
            <img :src="fieldArrivalDate" class="size-7 shrink-0" alt="" />
            <span class="min-w-0 flex-1">
              <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-arrival") }}</span>
              <input
                v-model="preferences.arrivalDate"
                type="text"
                :placeholder="$t('living-project-field-arrival-placeholder')"
                class="w-full border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
              />
            </span>
            <img :src="fieldChevron" class="size-1.5 shrink-0 rotate-90" alt="" />
          </label>
          <label class="flex flex-1 items-center gap-2.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
            <img :src="fieldBudget" class="size-7 shrink-0" alt="" />
            <span class="min-w-0 flex-1">
              <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-budget") }}</span>
              <input
                v-model="preferences.budget"
                type="text"
                :placeholder="$t('living-project-field-budget-placeholder')"
                class="w-full border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
              />
            </span>
          </label>
        </div>

        <div class="flex gap-1.5">
          <label class="flex flex-1 items-center gap-2.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
            <img :src="fieldSchool" class="size-7 shrink-0" alt="" />
            <span class="min-w-0 flex-1">
              <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-school") }}</span>
              <input
                v-model="preferences.school"
                type="text"
                :placeholder="$t('living-project-field-school-placeholder')"
                class="w-full border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
              />
            </span>
            <img :src="fieldChevron" class="size-1.5 shrink-0 rotate-90" alt="" />
          </label>
          <label class="flex flex-1 items-center gap-2.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
            <img :src="fieldCity" class="size-7 shrink-0" alt="" />
            <span class="min-w-0 flex-1">
              <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-city") }}</span>
              <input
                v-model="preferences.city"
                type="text"
                :placeholder="$t('living-project-field-city-placeholder')"
                class="w-full border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
              />
            </span>
            <img :src="fieldChevron" class="size-1.5 shrink-0 rotate-90" alt="" />
          </label>
        </div>

        <div class="flex gap-1.5">
          <label class="flex flex-1 items-center gap-2.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
            <img :src="fieldDuration" class="size-7 shrink-0" alt="" />
            <span class="min-w-0 flex-1">
              <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-duration") }}</span>
              <input
                v-model="preferences.duration"
                type="text"
                :placeholder="$t('living-project-field-duration-placeholder')"
                class="w-full border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
              />
            </span>
            <img :src="fieldChevron" class="size-1.5 shrink-0 rotate-90" alt="" />
          </label>
          <label class="flex flex-1 items-center gap-2.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
            <img :src="fieldType" class="size-7 shrink-0" alt="" />
            <span class="min-w-0 flex-1">
              <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-type") }}</span>
              <input
                v-model="preferences.housingType"
                type="text"
                :placeholder="$t('living-project-field-type-placeholder')"
                class="w-full border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
              />
            </span>
            <img :src="fieldChevron" class="size-1.5 shrink-0 rotate-90" alt="" />
          </label>
        </div>

        <label class="flex w-full items-center gap-2.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
          <img :src="fieldOccupants" class="size-7 shrink-0" alt="" />
          <span class="min-w-0 flex-1">
            <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-occupants") }}</span>
            <input
              v-model="preferences.occupants"
              type="text"
              :placeholder="$t('living-project-field-occupants-placeholder')"
              class="w-full border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
            />
          </span>
          <img :src="fieldChevron" class="size-1.5 shrink-0 rotate-90" alt="" />
        </label>

        <label class="flex w-full flex-col gap-1.5 rounded-[0.625rem] border border-border-default px-2.5 py-3">
          <span class="flex items-start gap-2.5">
            <img :src="fieldPreferences" class="size-7 shrink-0" alt="" />
            <span class="block text-[0.5rem] font-medium text-ink">{{ $t("living-project-field-notes") }}</span>
          </span>
          <textarea
            v-model="preferences.notes"
            maxlength="300"
            rows="3"
            :placeholder="$t('living-project-field-notes-placeholder')"
            class="w-full resize-none border-0 p-0 text-[0.5rem] text-ink outline-none placeholder:text-ink-muted"
          ></textarea>
          <span class="self-end text-[0.5rem] text-ink-muted">{{ preferences.notes.length }}/300</span>
        </label>
      </div>

      <!-- CTA -->
      <div class="w-full pt-5">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2.5 rounded-[0.625rem] bg-gradient-to-r from-[#3f0cfe] to-[#d20c9c] px-6 py-4"
          @click="handleSubmitPreferences"
        >
          <span class="text-sm font-semibold text-white">{{ $t("living-project-submit") }}</span>
          <img :src="submitArrow" class="size-5" alt="" />
        </button>
      </div>
    </div>

    <!-- Bottom tab bar -->
    <MobileAppBottomNav active="project" />
  </div>
</template>
