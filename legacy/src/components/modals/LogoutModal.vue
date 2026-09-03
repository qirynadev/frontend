<script lang="ts" setup>
import { useAuthStore } from "@/stores";
import { type ComputedRef, computed } from "vue";
import Loader from "../molecules/Loader.vue";

const authStore = useAuthStore();

const isVisible: ComputedRef<boolean> = computed(() => authStore.logoutInProgress ?? false);
</script>

<template>
  <el-dialog
    v-model="isVisible"
    width="100px"
    height="100px"
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="rounded-lg shadow-lg flex items-center justify-center"
  >
    <Loader />
  </el-dialog>
</template>

<style lang="scss"></style>
