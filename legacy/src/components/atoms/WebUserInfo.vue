<script lang="ts" setup>
import UserDropdownMenu from "@/components/atoms/UserDropdownMenu.vue";
import { useAuthStore } from "@/stores";
import { computed, type ComputedRef } from "vue";
import Dropdown from "../molecules/Dropdown.vue";
import { i18nRoute } from "@/utils";

const authStore = useAuthStore();
const user = computed<any>(() => authStore.user);
</script>

<template>
  <!-- When user isn't connected -->
  <router-link
    :to="i18nRoute({ name: 'signin' })"
    v-if="!user"
    class="flex items-center h-[26px] w-[26px] p-2 relative justify-center rounded-full bg-[#404040]"
  >
    <img
      src="@/assets/images/account.svg"
      alt="avatar"
      class="w-[20px] absolute -bottom-1 left-[50%] translate-x-[-50%]"
    />
  </router-link>

  <!-- When user is connected -->
  <Dropdown align="right" width="80" v-if="user" contentClasses="mt-3.5 bg-surface dark:bg-gray-700 overflow-hidden">
    <template #trigger>
      <button type="button" class="w-[28px] h-[28px] relative focus:outline-none overflow-hidden mt-1">
        <img :src="user?.avatar" alt="avatar" class="object-cover h-full w-full rounded-full" />
      </button>
    </template>

    <template #content>
      <user-dropdown-menu />
    </template>
  </Dropdown>

  <!-- <el-dropdown v-if="user">
    <img
      :src="user?.profile?.photo"
      alt="avatar"
      class="w-[28px] rounded-full"
    />
    <template #dropdown>
      <div class="dropdown-container px-2">
        <h6 class="dropdown-title mt-[10px]">
          Hello, {{ user?.name ?? "Néant" }}
        </h6>
        <user-dropdown-menu />
      </div>
    </template>
  </el-dropdown> -->
</template>

<style lang="scss" scoped>
.el-dropdown-link {
  &:hover {
    background-color: transparent;
    color: transparent;
    border: none;
  }
}
</style>
