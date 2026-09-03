<script lang="ts" setup>
import { formatDate } from "@/utils";

const { data } = defineProps({
  data: {
    type: Object,
    default: {},
  },
});
</script>

<template>
  <div class="history-item-container d-flex align-items-center justify-content-between px-3 py-2 mb-2">
    <div class="left-items-container d-flex align-items-center">
      <div class="img-container me-2">
        <img src="@/assets/images/check_mark_circle_icon.png" />
      </div>
      <div class="text-container">
        <p class="item-title mb-1 fw-medium">{{ data?.service?.libelle }}</p>
        <span class="fw-light date">{{ formatDate(data?.created_at ?? "") }}</span>
      </div>
    </div>

    <div class="right-items-container">
      <p class="price fw-normal fs-5">{{ data?.montant }} €</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.history-item-container {
  background: var(--color-surface);
  width: 100%;

  .left-items-container {
    .img-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: "cover";
      }
    }

    .date {
      color: rgb(134, 134, 134);
    }
  }
  .right-items-container {
    .price {
      color: rgb(134, 134, 134);
    }
  }
}
</style>
