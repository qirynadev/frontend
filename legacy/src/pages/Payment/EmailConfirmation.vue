<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useAuthStore, usePaymentStore } from "@/stores";
import { storeToRefs } from "pinia";
import { i18nRoute } from "@/utils";
import {
  GraduationCap,
  Building2,
  Plane,
  Globe2,
  Users,
  CreditCard,
  Headphones,
  Heart,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-vue-next";

const { t } = useI18n();
const router = useRouter();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const paymentStore = usePaymentStore();
const { order } = storeToRefs(paymentStore);

const userName = computed(() => (user.value?.name ?? "").toUpperCase() || "");
const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() ?? "Q");
const serviceName = computed(() => order.value?.service_name ?? t("order-confirmation.default-service"));
const orderAmount = computed(() => order.value?.amount ?? "—");

const steps = computed(() => [
  { label: t("order-confirmation.step1") },
  { label: t("order-confirmation.step2") },
  { label: t("order-confirmation.step3") },
]);

const goToProfile = () => router.push(i18nRoute({ name: "my-account" }));
const goHome = () => router.push(i18nRoute({ name: "home" }));
</script>

<template>
  <div class="min-h-screen bg-surface-alt py-10 px-4 text-ink">
    <div class="mx-auto max-w-[660px] flex flex-col gap-5">
      <!-- Logo header -->
      <div class="flex items-center justify-center gap-3 text-2xl font-black text-ink mb-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff3347] text-white text-base">◎</div>
        Qiryna
      </div>

      <!-- Hero card -->
      <div class="rounded-4xl bg-surface shadow-xl shadow-slate-100 ring-1 ring-border-default overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <!-- Left: success message -->
          <div class="flex flex-col justify-center p-8 gap-4">
            <!-- Success badge -->
            <div
              class="inline-flex w-fit items-center gap-2 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-black text-green-700 ring-1 ring-green-100"
            >
              <Sparkles :size="12" />
              {{ t("order-confirmation.badge") }}
            </div>

            <div>
              <h1 class="text-2xl font-black leading-snug text-ink">
                {{ t("order-confirmation.title") }}
              </h1>
              <div v-if="userName" class="flex items-center gap-2 mt-2">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff3347] text-white text-sm font-black"
                >
                  {{ userInitial }}
                </div>
                <span class="text-lg font-black text-[#ff3347]">{{ userName }}</span>
              </div>
            </div>

            <p class="text-sm text-ink-muted leading-relaxed">
              {{ t("order-confirmation.subtitle") }}
            </p>

            <div class="flex items-center gap-2 text-green-600">
              <CheckCircle2 :size="18" />
              <span class="text-xs font-semibold">Paiement confirmé</span>
            </div>
          </div>

          <!-- Right: illustration -->
          <div
            class="relative flex items-center justify-center bg-linear-to-br from-red-50 via-white to-amber-50 min-h-[200px] p-6"
          >
            <div
              class="absolute top-4 left-5 flex h-9 w-9 items-center justify-center rounded-2xl bg-surface shadow-md ring-1 ring-border-default"
            >
              <GraduationCap class="text-[#ff3347]" :size="16" />
            </div>
            <div
              class="absolute top-5 right-7 flex h-8 w-8 items-center justify-center rounded-2xl bg-surface shadow-md ring-1 ring-border-default"
            >
              <Building2 class="text-orange-500" :size="13" />
            </div>
            <div
              class="absolute bottom-5 left-7 flex h-8 w-8 items-center justify-center rounded-2xl bg-surface shadow-md ring-1 ring-border-default"
            >
              <Plane class="text-blue-500" :size="13" />
            </div>
            <div
              class="absolute bottom-4 right-5 flex h-9 w-9 items-center justify-center rounded-2xl bg-surface shadow-md ring-1 ring-border-default"
            >
              <Users class="text-green-500" :size="16" />
            </div>
            <div
              class="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow-sm"
            >
              <Globe2 class="text-indigo-400" :size="11" />
            </div>
            <!-- CSS avatar -->
            <div class="flex flex-col items-center gap-2 z-10">
              <div class="w-14 h-14 rounded-full bg-linear-to-br from-amber-300 to-orange-400 shadow-lg"></div>
              <div
                class="w-20 h-28 rounded-3xl bg-linear-to-br from-amber-200 to-orange-300 shadow-lg flex items-center justify-center"
              >
                <div class="w-10 h-14 rounded-2xl bg-white/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Service -->
        <div class="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border-default flex items-start gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <GraduationCap class="text-[#ff3347]" :size="20" />
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">
              {{ t("order-confirmation.service-label") }}
            </p>
            <p class="font-black text-sm leading-snug text-ink">{{ serviceName }}</p>
          </div>
        </div>

        <!-- Amount -->
        <div class="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border-default flex items-start gap-4">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
            <CreditCard class="text-green-600" :size="20" />
          </div>
          <div>
            <p class="text-[10px] font-semibold text-ink-muted uppercase tracking-widest mb-1">
              {{ t("order-confirmation.amount-label") }}
            </p>
            <p class="font-black text-2xl text-ink leading-none">
              {{ orderAmount }}
              <span class="text-sm font-semibold ml-1">€</span>
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="flex flex-col items-center gap-2">
        <button
          @click="goToProfile"
          class="flex items-center gap-3 rounded-xl bg-[#ff3347] px-8 py-4 text-sm font-black text-white shadow-lg shadow-red-100 transition-all hover:bg-red-600 active:scale-[0.98]"
        >
          {{ t("order-confirmation.cta") }}
          <ArrowRight :size="18" />
        </button>
        <p class="text-[11px] text-ink-muted">{{ t("order-confirmation.link-validity") }}</p>
      </div>

      <!-- Next steps -->
      <div class="rounded-4xl bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 p-7 ring-1 ring-emerald-100">
        <h2 class="text-base font-black mb-5 text-ink">{{ t("order-confirmation.next-steps-title") }}</h2>
        <div class="flex flex-col gap-3">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="flex items-start gap-4 bg-white/80 rounded-2xl p-4 ring-1 ring-emerald-100 backdrop-blur"
          >
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-black shadow-sm"
            >
              {{ index + 1 }}
            </div>
            <p class="text-sm font-semibold text-ink leading-relaxed mt-0.5">{{ step.label }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Support -->
        <div class="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-border-default flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <Headphones class="text-blue-500" :size="18" />
          </div>
          <div>
            <p class="font-black text-sm mb-1">{{ t("order-confirmation.support-title") }}</p>
            <p class="text-xs text-ink-muted leading-relaxed">{{ t("order-confirmation.support-text") }}</p>
          </div>
        </div>

        <!-- Team message -->
        <div class="rounded-2xl bg-linear-to-br from-[#1a2d56] to-[#263b6d] p-5 text-white flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Heart class="text-pink-300" :size="18" />
          </div>
          <div>
            <p class="font-black text-sm mb-1">{{ t("order-confirmation.team-title") }}</p>
            <p class="text-xs text-white/70 leading-relaxed">{{ t("order-confirmation.team-text") }}</p>
          </div>
        </div>
      </div>

      <!-- Back home -->
      <div class="flex justify-center">
        <button @click="goHome" class="text-xs text-ink-muted hover:text-[#ff3347] transition-colors font-medium">
          ← {{ t("back-to-home") }}
        </button>
      </div>
    </div>
  </div>
</template>
