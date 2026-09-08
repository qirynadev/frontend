<script lang="ts" setup>
import type { MenuChildType, MenuType } from "@/constants/constant.type";
import { useSideBar } from "@/hooks/useSetting";
import { type ComputedRef, type PropType, computed } from "vue";
import { RouterLink } from "vue-router";
import { useAppStore } from "@/stores";
import { i18nRoute } from "@/utils";

const props = defineProps({
  menu: {
    type: Object as any,
    required: true,
  },
  index: {
    type: String as any,
    required: true,
  },
});
const emit = defineEmits(["clicked"]);

const { handleHideSideBar } = useSideBar();

const appStore = useAppStore();

const selectedIndex: ComputedRef<string | null> = computed(() => appStore.getSelectedMenuIndex);

const handleClick = (item: MenuChildType | null) => {
  emit("clicked", item);
  handleHideSideBar();
};

const hasSubMenus = (item: any) => {
  return item?.sub_menus !== undefined;
};
</script>

<template>
  <li class="sidebar-menu-container" style="cursor: pointer">
    <div class="sidebar-menu-head" @click.prevent="appStore.setSelectedMenuIndex(index)" v-if="hasSubMenus(props.menu)">
      <span class="sidebar-menu-head-icon me-3">
        <img v-if="props.index == 'destinations'" src="@/assets/images/bank-building.png" />
        <img v-else-if="props.index == 'courses'" src="@/assets/images/test.png" />
        <img v-else-if="props.index == 'living'" src="@/assets/images/house.svg" />
        <img v-else-if="props.index == 'mba'" src="@/assets/images/graduate-student-avatar.png" />
        <img v-else-if="props.index == 'profiling'" src="@/assets/images/passport.png" />
        <img v-else src="@/assets/images/document.svg" />
      </span>
      <span>{{ props.menu?.menu }}</span>
    </div>

    <ul class="sidebar-sub-menu-container" :class="{ isActive: selectedIndex == index }">
      <li v-for="submenu in props.menu?.sub_menus" class="sidebar-sub-menu-item">
        <router-link
          :to="
            i18nRoute({
              name: index,
              params: { slug: submenu?.slug ?? '' },
            })
          "
          @click="handleClick(submenu)"
        >
          {{ submenu.title }}
        </router-link>
      </li>
    </ul>
  </li>
</template>

<style lang="scss" scoped>
.sidebar-menu-container {
  padding: 8px 0;
  border-bottom: 1px solid rgb(218, 218, 218);
  .sidebar-menu-head {
    display: flex;
    align-items: center;
    .sidebar-menu-head-icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  .sidebar-sub-menu-container {
    padding: 8px 0 8px 30px;
    height: 0;
    overflow: hidden;
    display: none;
    transition: display 0.3s ease-in-out;

    &.isActive {
      height: auto;
      overflow: visible;
      display: block;
      transition: display 0.3s ease-in-out;
    }

    .sidebar-sub-menu-item {
      cursor: pointer;
      padding: 5px 0;
      a {
        margin-left: 10px;
        font-size: 15px;
      }
    }
  }
}
</style>
