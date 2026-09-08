<script setup lang="ts">
import type { MessageType, UserType } from "@/constants/constant.type";
import { PaperClipIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  message: {
    type: Object as () => MessageType,
    required: true,
  },
  counterpart: {
    type: Object as () => UserType | null,
    default: null,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "selected", message: MessageType): void;
}>();
</script>

<template>
  <div
    @click="emit('selected', message)"
    class="flex items-center justify-between border-bx border-border-default py-2 hover:bg-gray-100 px-2 cursor-pointer"
    :class="{ 'bg-gray-100': active }"
  >
    <div class="flex flex-1 items-center gap-1">
      <div class="size-14! relative block rounded-full">
        <img
          :src="counterpart?.avatar"
          :alt="counterpart?.name"
          class="h-full w-full rounded-full object-cover"
        />
        <span
          v-if="counterpart?.is_online"
          class="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white bg-[#22c55e]"
        ></span>
      </div>
      <div class="w-[75%]">
        <p class="font-semibold text-[16px]">
          {{ counterpart?.name }}
        </p>
        <p class="text-ink-muted text-[14px] line-clamp-1">
          {{ message.text }}
        </p>
      </div>
    </div>
    <div class="flex flex-col gap-1 items-end">
      <PaperClipIcon v-if="message.image || message.attachment" class="size-4 opacity-50" />
      <span class="font-bold text-[13px]">
        {{ message.created_time }}
      </span>
    </div>
  </div>
</template>
