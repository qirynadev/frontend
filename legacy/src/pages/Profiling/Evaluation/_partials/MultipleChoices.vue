<script setup lang="ts">
import { watch, type PropType } from "vue";

const props = defineProps({
  options: { type: Object as PropType<Array<any>>, required: true },
  label: { type: String, required: true },
  total: { type: Number, required: true },
});

const model = defineModel({ type: Array, default: () => [] });

watch(
  () => model.value,
  (newVal) => {
    if (model.value.length > props.total) model.value.pop();
  },
);
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <label
      v-for="(option, index) in options"
      :for="'option' + index"
      class="group border border-[#FF6F77] rounded-[5px] text-[#ff3942] p-3 flex items-center gap-3 hover:bg-[#F7333E] hover:text-white cursor-pointer"
      :class="{
        'bg-[#F7333E]! text-white!': model == option.id,
      }"
    >
      <input type="checkbox" :id="'option' + index" :value="option.id" v-model="model" class="hidden" />
      <span
        class="h-5 w-5 rounded-full group-hover:bg-[#ff3942]"
        :class="`${model.includes(option.id) ? 'bg-[#ff3942]!' : 'bg-[#D9D9D9]'}`"
      ></span>
      <span class="text-[20px]">{{ option.label }}</span>
    </label>
  </div>
</template>
