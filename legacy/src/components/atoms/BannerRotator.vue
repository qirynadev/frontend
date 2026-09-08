<script lang="ts" setup>
import { useAppStore } from "@/stores";
import { computed, onMounted, onUnmounted, ref } from "vue";
import AdvertisementItem from "@/components/atoms/AdvertisementItem.vue";
import { useI18n } from "vue-i18n";

const appStore = useAppStore();
const { locale } = useI18n();

const banners = computed(() => appStore.getBannerList.filter((b) => !b.lang || b.lang === locale.value));

const currentIndex = ref(0);
const currentBanner = computed(() => banners.value[currentIndex.value] ?? null);

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  if (banners.value.length > 1) {
    timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % banners.value.length;
    }, 7000);
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div v-if="currentBanner">
    <AdvertisementItem :banner="currentBanner" />
  </div>
</template>
