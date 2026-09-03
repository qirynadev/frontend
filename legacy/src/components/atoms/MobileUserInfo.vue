<script lang="ts" setup>
import avatarIcon from "@/assets/images/account.svg";
import { useSideBar } from "@/hooks/useSetting";
import { useAuthStore } from "@/stores";
import { i18nRoute } from "@/utils";
import { storeToRefs } from "pinia";
import { ChevronDownIcon } from "@heroicons/vue/24/solid";

const showMenu = defineModel<boolean>("showMenu", { default: false });

const { handleHideSideBar } = useSideBar();
const authStore = useAuthStore();

const { user } = storeToRefs(authStore);
</script>

<template>
  <!-- When user isn't connected -->
  <div class="flex h-[50px] items-center" v-if="!user">
    <router-link
      :to="i18nRoute({ name: 'signin' })"
      class="title mt-1 relative flex items-center gap-2"
      @click.prevent="handleHideSideBar"
    >
      <img src="@/assets/images/account.svg" alt="avatar" class="size-[16px]" />
      {{ $t("my_account") }}
    </router-link>
  </div>

  <!-- When user is connected -->
  <div v-if="user" class="w-full">
    <div class="flex items-center cursor-pointer" @click="showMenu = !showMenu">
      <div class="user-container">
        <img :src="user?.profile?.photo ?? avatarIcon" alt="user" />
      </div>
      <span class="title">{{ user?.name ?? "Néant" }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-container {
  margin-right: 10px;
  width: 20px;
  height: 20px;
  border-radius: 100%;

  img {
    width: 100%;
    height: 100%;
    border-radius: 100%;
  }
}

.title {
  font-weight: 400;
  font-size: 15px;
  color: white;
}
</style>
