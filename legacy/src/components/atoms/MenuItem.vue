<script setup lang="ts">
import { useAppStore } from "@/stores";
import type { PropType } from "vue";
import { RouterLink } from "vue-router";
import type { MenuChildType } from "@/constants/constant.type";

const appStore = useAppStore();
const handleSelectMenu = (item: any) => {
  appStore.setSelectedMenuSlug(item.slug);
};

const { item } = defineProps({
  item: {
    type: Object as PropType<MenuChildType>,
    required: true,
  },
  link: {
    type: Object as PropType<any>,
    required: false,
  },
  className: {
    type: String,
    required: false,
    default: "",
  },
});
const emit = defineEmits(["clicked"]);

const handleClick = () => {
  emit("clicked", item);
};
</script>

<template>
  <li :class="className">
    <RouterLink :to="link" @click="handleClick">
      {{ item?.menu }}
    </RouterLink>
  </li>
</template>

<style lang="scss" scoped>
.submenu-item {
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 200px;

  a {
    padding: 9px 20px;
    display: block;
    outline-style: none !important;
    box-shadow: none !important;
    border-color: transparent !important;
    text-transform: none;
    letter-spacing: normal;
    transition: 0.5s 0s;
    color: var(--color-ink) !important;
    font-size: 14px;

    &:hover {
      background: var(--color-surface-alt);
      width: 160px;
      padding-left: 40px;
      font-weight: 700;
    }
  }
}
</style>
