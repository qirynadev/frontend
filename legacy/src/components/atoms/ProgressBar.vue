<script lang="ts" setup>
const { percentage } = defineProps({
  percentage: {
    type: Number,
    default: 50,
    required: true,
  },
});
</script>

<template>
  <el-progress :text-inside="true" :stroke-width="20" :percentage="percentage" status="exception" class="p-0 m-0" />
</template>

<style lang="scss" scoped></style>
