<script lang="ts" setup>
import type { BannerType } from "@/constants/constant.type";
import { HttpService } from "@/services/httpService";
import { onMounted } from "vue";

const props = defineProps({
  banner: {
    type: Object as () => BannerType,
    default: null,
  },
});

const http = new HttpService(false);

onMounted(() => {
  if (props.banner?.id) {
    http.post(`/banners/${props.banner.id}/view`, {}).catch(() => {});
  }
});

const handleClick = () => {
  if (props.banner?.id) {
    http.post(`/banners/${props.banner.id}/click`, {}).catch(() => {});
  }
};
</script>

<template>
  <div class="pub">
    <p class="text-xs text-ink-muted mb-1">{{ $t("advertisement") }}</p>
    <div class="pub-container rounded-2">
      <a
        v-if="banner?.url"
        :href="banner.url"
        target="_blank"
        rel="noopener noreferrer"
        @click="handleClick"
        class="block"
      >
        <img v-if="banner?.picture" :src="banner.picture" :alt="banner.title" class="w-full rounded-2 object-cover" />
        <img v-else src="/images/pub-qirina.png" class="w-full rounded-2" :alt="banner?.title ?? 'Publicité'" />
      </a>
      <img
        v-else-if="banner?.picture"
        :src="banner.picture"
        :alt="banner.title"
        class="w-full rounded-2 object-cover"
      />
      <img v-else src="/images/pub-qirina.png" class="rounded-2 w-full" alt="Publicité" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
