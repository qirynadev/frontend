<script lang="ts" setup>
import type { ExpenseType } from "@/constants/constant.type";
import { useLivingStore } from "@/stores";
import { type ComputedRef, computed } from "vue";

const { contentAlign, expense, isActive } = defineProps({
  contentAlign: {
    type: String,
    default: "start",
  },
  expense: {
    type: Object as () => ExpenseType,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const classNames: ComputedRef<string> = computed(() => `justify-${contentAlign}`);

const livingStore = useLivingStore();

const emit = defineEmits(["clicked"]);

// change tag
const chooseExpense = async () => {
  emit("clicked", expense);
  livingStore.setSelectedExpense(expense);
};
</script>

<template>
  <div
    class="hover:bg-[#ecececa6] transition-all duration-300 rounded-md ps-10 mb-2 flex items-center h-[35px] cursor-pointer"
    :class="(classNames, { 'bg-[#ecececa6]': isActive })"
    @click.prevent="chooseExpense"
  >
    <div class="img-container relative">
      <img :src="expense.icon" class="h-full w-full object-contain" />
    </div>
    <div class="text-[16px] font-medium">{{ expense.title }}</div>
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
