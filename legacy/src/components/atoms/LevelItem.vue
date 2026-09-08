<script lang="ts" setup>
import { useCourseStore } from "@/stores";
import { slugify } from "@/utils/string";
import { type ComputedRef, type PropType, computed } from "vue";

const { contentAlign, level, isActive } = defineProps({
  contentAlign: {
    type: String,
    default: "start",
  },
  level: {
    type: Object as PropType<{ name: string; description: string }>,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const classNames: ComputedRef<string> = computed(() => `justify-${contentAlign}`);

const courseStore = useCourseStore();

const emit = defineEmits(["clicked"]);

// change tag
const chooseLevel = async () => {
  emit("clicked", level);
  courseStore.setSelectedLevel(level);
};
</script>

<template>
  <div
    class="hover:bg-[#ecececa6] transition-all duration-300 rounded-md ps-10 mb-2 flex items-center h-[35px] cursor-pointer"
    :class="(classNames, { 'bg-[#ecececa6]': isActive })"
    @click.prevent="chooseLevel"
  >
    <div class="img-container relative">
      <img :src="`/images/${slugify(level?.name)}.png`" class="h-full w-full object-contain" />
    </div>
    <div class="text-[16px] font-medium">{{ level.name }}</div>
  </div>
</template>

<style lang="scss" scoped>
.img-container {
  width: 41.2px;
  height: 35px;
  text-align: center;
  padding: 5px;
  border-radius: 6px;
  margin-right: 10px;
}

.item_categorie {
  transition: all 300ms ease;
  border-radius: 5px;
  cursor: pointer;

  p {
    font-size: 16px;
    font-weight: 600;
  }
  &:hover {
    background-color: rgb(239, 238, 238);
  }
  &.active {
    background-color: #273c66;
    color: white;
    .img {
      filter: invert(1) !important;
    }
  }
}

@media only screen and (max-width: 768px) {
  .item_categorie {
    max-width: 200px;
  }
  .img {
    display: none;
  }
  .item_categorie {
    justify-content: center !important;
    padding-left: 0 !important;

    p {
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
