<script lang="ts" setup>
import { computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
import { storeToRefs } from "pinia";
import { useSeo } from "@/composables/useSeo";
import { useI18n } from "vue-i18n";
import { i18nRoute } from "@/utils";
import MobileAppBottomNav from "@/components/molecules/MobileAppBottomNav.vue";
import backArrowIcon from "@/assets/images/profilage-landing-mobile/back-arrow.svg";
import iconNotifications from "@/assets/images/settings-mobile/icon-notifications.svg";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
useSeo({ title: () => t("notifications-page-title") });

const { notifications, unreadNotificationCount } = storeToRefs(authStore);

const goBack = () => router.back();

const sortedNotifications = computed(() => [...notifications.value].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));

const onSelect = async (notification: any) => {
  if (!notification.read) {
    await authStore.markNotificationRead(notification.id);
  }
  if (notification.url) {
    router.push(notification.url);
  }
};

onBeforeMount(async () => {
  await authStore.fetchNotifications();
  await authStore.fetchUnreadNotificationCount();
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-[26.875rem] flex-col items-center overflow-x-hidden bg-surface pb-26 lg:max-w-2xl lg:pb-10">
    <div class="flex w-full flex-col items-center px-4 pb-6 pt-4">
      <!-- Top bar -->
      <div class="flex w-full items-center justify-between pb-[1.875rem]">
        <button type="button" class="flex size-6 items-center justify-center" aria-label="Retour" @click="goBack">
          <img :src="backArrowIcon" class="size-full" alt="" />
        </button>
        <p class="text-lg font-semibold text-ink">{{ $t("notifications-page-title") }}</p>
        <button
          v-if="unreadNotificationCount > 0"
          type="button"
          class="text-xs font-medium text-[#5825fd]"
          @click="authStore.markAllNotificationsRead()"
        >
          {{ $t("notifications-mark-all-read") }}
        </button>
        <span v-else class="size-6"></span>
      </div>

      <!-- Liste -->
      <div v-if="sortedNotifications.length" class="flex w-full flex-col gap-3">
        <button
          v-for="notification in sortedNotifications"
          :key="notification.id"
          type="button"
          class="flex w-full items-start gap-3 rounded-[0.625rem] border px-4 py-3 text-left transition-colors"
          :class="notification.read ? 'border-border-default bg-surface' : 'border-[#e6e0fe] bg-surface-tint'"
          @click="onSelect(notification)"
        >
          <span
            class="mt-1.5 size-2 flex-none rounded-full"
            :class="notification.read ? 'bg-transparent' : 'bg-[#5825fd]'"
          ></span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-ink">{{ notification.title }}</p>
            <p v-if="notification.body" class="mt-1 line-clamp-2 text-xs leading-5 text-ink-muted">
              {{ notification.body }}
            </p>
          </div>
        </button>
      </div>

      <!-- État vide -->
      <div v-else class="flex w-full flex-col items-center pt-16 text-center">
        <img :src="iconNotifications" class="mb-6 size-16" alt="" />
        <p class="text-xl font-semibold text-ink">{{ $t("notifications-empty-title") }}</p>
        <p class="mt-3 text-sm leading-6 text-ink-muted">{{ $t("notifications-empty-description") }}</p>
      </div>
    </div>

    <MobileAppBottomNav active="account" class="lg:hidden" />
  </div>
</template>
