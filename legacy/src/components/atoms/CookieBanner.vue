<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { i18nRoute } from "@/utils";
import { enableAnalytics, denyConsent } from "@/utils/analytics";

const { t } = useI18n();
const router = useRouter();

const STORAGE_KEY = "qiryna_cookie_consent";
const visible = ref(false);

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    visible.value = true;
  }
});

const accept = () => {
  localStorage.setItem(STORAGE_KEY, "accepted");
  visible.value = false;
  // Active GA immédiatement après consentement (sans rechargement)
  enableAnalytics();
};

const decline = () => {
  localStorage.setItem(STORAGE_KEY, "declined");
  visible.value = false;
  // Consent Mode : maintient le stockage analytics refusé
  denyConsent();
};

const goToPolicy = () => {
  router.push(i18nRoute({ name: "cookies" }));
  visible.value = false;
};
</script>

<template>
  <Transition name="cookie-fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Consentement aux cookies"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" />

      <!-- Modal -->
      <div class="relative bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5">
        <!-- Icône -->
        <div class="flex items-center justify-center mx-auto text-5xl select-none">🍪</div>

        <!-- Titre -->
        <div class="text-center">
          <h2 class="text-lg font-semibold text-ink mb-2">{{ $t("cookie-banner.title") }}</h2>
          <p class="text-sm text-ink-muted leading-relaxed">
            {{ $t("cookie-banner.message") }}
            <button type="button" class="underline text-[#ff3942] hover:opacity-75 ml-1" @click="goToPolicy">
              {{ $t("cookie-banner.learn-more") }}
            </button>
          </p>
        </div>

        <!-- Boutons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            @click="decline"
            class="flex-1 text-sm px-4 py-2.5 rounded-xl border border-border-default text-ink-muted hover:bg-surface-alt transition-colors font-medium"
          >
            {{ $t("cookie-banner.decline") }}
          </button>
          <button
            type="button"
            @click="accept"
            class="flex-1 text-sm px-4 py-2.5 rounded-xl bg-[#ff3942] text-white hover:opacity-90 transition-opacity font-medium"
          >
            {{ $t("cookie-banner.accept") }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-fade-enter-active,
.cookie-fade-leave-active {
  transition: opacity 0.25s ease;
}
.cookie-fade-enter-from,
.cookie-fade-leave-to {
  opacity: 0;
}
.cookie-fade-enter-active .relative,
.cookie-fade-leave-active .relative {
  transition: transform 0.25s ease;
}
.cookie-fade-enter-from .relative,
.cookie-fade-leave-to .relative {
  transform: scale(0.95);
}
</style>
