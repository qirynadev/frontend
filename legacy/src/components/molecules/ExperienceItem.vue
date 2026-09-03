<script lang="ts" setup>
import type { PropType } from "vue";

type Item = {
  logo: string;
  title: string;
  actual: number | boolean;
  company: string;
  start_at: string;
  end_at: string;
  description: string;
  duration: string;
  period: string;
};

const { data } = defineProps({
  data: {
    type: Object as PropType<Item>,
    default: {},
  },
});
</script>

<template>
  <div class="experience-container flex items-center justify-between">
    <div class="logo-container p-6">
      <img :src="data?.logo ?? '@/assets/images/logo_money/jumia-logo.png'" />
    </div>
    <div class="description-container" style="line-height: 2">
      <h6 class="text-[15px] text-ink font-bold">{{ `${data?.title}` }}</h6>
      <span class="text-[14px] text-gray-700">{{ `${data?.company} - ${data.period}` }}</span>
      <!-- <div
        class="my-description leading-5 my-[10px]"
        v-html="data?.description"
      ></div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.experience-container {
  .logo-container {
    width: 15%;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .description-container {
    width: 84%;

    .title {
      color: #273c66;
      font-size: 15px;
    }

    .date-exp {
      color: silver;
    }
  }

  &:not(:last-child) {
    margin-bottom: 20px;
  }
}
@media only screen and (max-width: 768px) {
  .experience-container {
    .logo-container {
      width: 30%;
    }
  }
}
</style>
