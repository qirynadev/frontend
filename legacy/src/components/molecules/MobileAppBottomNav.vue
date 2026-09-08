<script lang="ts" setup>
import { i18nRoute } from "@/utils";
import navHome from "@/assets/images/mobile-nav/nav-home.svg";
import navMessages from "@/assets/images/mobile-nav/nav-messages.svg";
import navOrientation from "@/assets/images/mobile-nav/nav-orientation.svg";
import navProject from "@/assets/images/mobile-nav/nav-project.svg";
import navAccount from "@/assets/images/mobile-nav/nav-account.svg";
import navOrientationLogo from "@/assets/images/home-mobile/nav-orientation-logo.png";

type NavKey = "home" | "messages" | "orientation" | "project" | "account";

withDefaults(defineProps<{ active?: NavKey; specialOrientationIcon?: boolean }>(), {
  active: "home",
  specialOrientationIcon: false,
});

const items: { key: NavKey; icon: string; label: string; route: string }[] = [
  { key: "home", icon: navHome, label: "mobile-nav-home", route: "home" },
  { key: "messages", icon: navMessages, label: "mobile-nav-messages", route: "user-messages" },
  { key: "orientation", icon: navOrientation, label: "mobile-nav-orientation", route: "profilage-landing" },
  { key: "project", icon: navProject, label: "mobile-nav-project", route: "user-project" },
  { key: "account", icon: navAccount, label: "mobile-nav-account", route: "user-settings" },
];
</script>

<template>
  <div class="fixed inset-x-0 bottom-4 z-50 flex justify-center px-[0.9375rem] lg:hidden">
    <div
      class="flex w-full max-w-[23.25rem] items-center justify-center gap-2 rounded-[0.625rem] bg-surface py-[0.625rem] shadow-[0_0_0.21875rem_rgba(0,0,0,0.1)]"
    >
      <RouterLink
        v-for="item in items"
        :key="item.key"
        :to="i18nRoute({ name: item.route })"
        class="flex flex-1 flex-col items-center justify-center gap-[0.3125rem] no-underline"
      >
        <img
          :src="specialOrientationIcon && item.key === 'orientation' ? navOrientationLogo : item.icon"
          class="object-contain"
          :class="specialOrientationIcon && item.key === 'orientation' ? 'h-[2.13rem] w-[2.25rem]' : 'size-6'"
          alt=""
        />
        <span
          class="text-[0.625rem] font-medium"
          :class="item.key === active ? 'text-[#5825fd]' : 'text-ink'"
        >
          {{ $t(item.label) }}
        </span>
      </RouterLink>
    </div>
  </div>
</template>
