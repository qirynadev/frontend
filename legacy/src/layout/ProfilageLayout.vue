<script lang="ts" setup>
import NavBar from "@/components/molecules/NavBar.vue";
import { useAuthStore } from "@/stores";
import { i18nRoute } from "@/utils";

const authStore = useAuthStore();
</script>

<template>
  <div class="app">
    <NavBar />
    <div
      v-if="authStore.user"
      class="w-full lg:w-[1000px] xl:w-[1100px] mx-auto px-4 mt-[55px] lg:mt-[85px] mb-[-10px] flex justify-end"
    >
      <router-link
        :to="i18nRoute({ name: 'user-evaluations' })"
        class="text-sm font-medium text-[#273c66] hover:underline flex items-center gap-1"
      >
        <span>{{ $t("etesting.title") }}</span>
        <span class="text-xs">→</span>
      </router-link>
    </div>
    <main
      class="w-full lg:w-[1000px] xl:w-[1100px] xl:pr-[15px] mt-[50px] lg:mt-[80px] h-[calc(100vh-50px)] lg:h-[calc(100vh-80px)] mx-auto"
    >
      <router-view>
        <template #default="{ Component, route }">
          <keep-alive>
            <component :is="Component" :key="route"></component>
          </keep-alive>
        </template>
      </router-view>
    </main>
  </div>
</template>

<style>
.app {
  position: relative;
  width: 100%;
}
</style>
