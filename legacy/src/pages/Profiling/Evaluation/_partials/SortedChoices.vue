<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  options: { type: Object as PropType<Array<any>>, required: true },
  label: { type: String, required: true },
  question_id: { type: String, required: true },
});

const model = defineModel({ type: Object, default: [] });

const selectedArray = ref<any>([]);

const selectGroupKey = (key: number, priority: number) => {
  // check if priority is already selected
  const priorityIndex = selectedArray.value.findIndex((v: any) => v.priority === priority);

  if (priorityIndex !== -1) {
    selectedArray.value.splice(priorityIndex, 1);
  }

  if (selectedArray.value.length >= 3) {
    // remove the first element
    selectedArray.value.shift();
  }

  // find the index of the selected value
  const index = selectedArray.value.findIndex((v: any) => v.value === key);

  if (index !== -1) {
    selectedArray.value[index].priority = priority;
  } else {
    selectedArray.value.push({
      question_id: props.question_id,
      value: key,
      priority: priority,
    });
  }

  // update the model
  model.value = selectedArray.value;
};

const selected = (value: any, priority: number) => {
  return selectedArray.value.find((v: any) => v.value === value && v.priority === priority) != undefined;
};
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <div class="flex items-center justify-between -mb-2">
      <div class="w-1/4 text-ink text-[25px] font-normal pl-5">
        {{ label }}
      </div>
      <div class="text-[20px]" v-for="i in 3">{{ $t("profilage.choice") + " " + i }}</div>
    </div>
    <template v-for="(option, index) in options">
      <div
        class="flex items-center justify-between gap-3 border border-[#FF6F77] bg-[#D9D9D9]/20 rounded-[5px] text-[#ff3942] pl-5 p-1"
      >
        <div class="w-1/4 text-[20px]">{{ option.label }}</div>
        <label
          v-for="priority in 3"
          :for="'option-' + index + '-' + priority"
          class="group cursor-pointer text-[#ff3942] p-3 flex items-center justify-center gap-3"
        >
          <input
            type="radio"
            :id="'option-' + index + '-' + priority"
            :value="{
              question_id: props.question_id,
              value: option.id,
              priority: priority,
            }"
            v-model="model"
            @change="selectGroupKey(option.id, priority)"
            class="hidden"
          />
          <span
            class="h-5 w-5 rounded-full group-hover:bg-[#ff3942]"
            :class="`${selected(option.id, priority) ? 'bg-[#ff3942]!' : 'bg-[#D9D9D9]'}`"
          ></span>
        </label>
      </div>
    </template>
  </div>
</template>
