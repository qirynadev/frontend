<script setup lang="ts">
const model = defineModel();
defineProps({
  label: { type: String, required: true },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <label for="answer" class="text-ink text-[25px] font-normal mb-2 text-center w-full">
      {{ label }}
    </label>
    <input
      id="answer"
      type="text"
      v-model="model"
      class="border border-[#ff6f77] rounded-[5px] text-[#ff3942] focus:border-[#f7333e] focus:outline-none p-3 w-full"
    />
  </div>
</template>
