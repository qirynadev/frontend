<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object as any,
    required: true,
  },
});

const emit = defineEmits(["clicked"]);
</script>

<template>
  <div
    role="button"
    @click="emit('clicked', item)"
    class="flex border border-[#c0c0c0] rounded-md w-full py-2 px-2 mx-1 gx-1 items-center justify-center"
    :class="{
      'bg-[#273c66] text-white': $route.params?.slug == item?.slug,
    }"
  >
    <img
      class="hidden md:block h-[26px] w-[26px] me-1"
      src="/images/team.svg"
      :class="{ invert: $route.params?.slug == item?.slug }"
    />
    <div class="whitespace-nowrap text-[12px] lg:text-[16px] font-medium">
      {{ item?.title }}
    </div>
  </div>
</template>
