<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  options: { type: Object as PropType<Array<any>>, required: true },
  label: { type: String, required: true },
});

const model = defineModel({ type: String, default: "" });
</script>

<template>
  <div>
    <div class="text-center text-ink text-[25px] font-normal mb-2">
      {{ label }}
    </div>
    <div class="grid grid-cols-1 gap-4">
      <label
        v-for="(option, index) in options"
        :for="'option' + index"
        class="group border border-[#FF6F77] rounded-[5px] text-[#ff3942] p-3 flex items-center gap-3 hover:bg-[#F7333E] hover:text-white cursor-pointer"
        :class="{
          'bg-[#F7333E]! text-white!': model == option.id,
        }"
      >
        <input
          type="radio"
          :id="'option' + index"
          :value="option.id"
          v-model="model"
          class="group-hover:bg-[#FFFFFF] hidden"
        />
        <span
          class="size-5 rounded-full group-hover:bg-[#FFFFFF]"
          :class="`${model == option.id ? 'bg-[#FFFFFF]!' : 'bg-[#D9D9D9]'}`"
        ></span>
        <div class="flex flex-col w-auto">
          <span class="text-[20px]">{{ option.label }}</span>
          <span v-if="option?.caption?.length > 0" class="text-[16px]">({{ option?.caption }})</span>
        </div>
      </label>
    </div>
  </div>
</template>
