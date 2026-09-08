<script lang="ts" setup>
import type { SchoolType } from "@/constants/constant.type";
import { useAppStore } from "@/stores";
import { type ComputedRef, type PropType, computed } from "vue";

const { contentAlign, data, isActive } = defineProps({
  contentAlign: {
    type: String,
    default: "start",
  },
  data: {
    type: Object as PropType<SchoolType>,
    required: true,
    default: {},
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const classNames: ComputedRef<string> = computed(() => `justify-${contentAlign}`);

const emit = defineEmits(["choosed"]);

const appStore = useAppStore();

// change tag
const schoolChoosed = async (data: SchoolType) => {
  emit("choosed", data);
  appStore.setSelectedSchool(data);
};

// limiter le nombre de caractères
const limitText = (text: string | null | undefined) => {
  if (!text) return "";
  if (text.length > 25) {
    return text.substring(0, 25) + "...";
  }
  return text;
};
</script>

<template>
  <div
    class="overflow-hidden hover:bg-[#ecececa6] transition-all duration-300 rounded-md ps-6 mb-2 flex items-center h-[35px] cursor-pointer"
    :class="(classNames, { active: isActive })"
    @click.prevent="schoolChoosed(data)"
  >
    <div class="img-container relative">
      <img src="/images/check_mark_circle_icon.png" class="w-[20px] h-[20px]" />
    </div>
    <p class="text-[16px] font-medium">{{ limitText(data?.title) }}</p>
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

.active {
  background-color: #273c66;
  color: white;
  .img {
    filter: invert(1) !important;
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
