<script lang="ts" setup>
import { useSettingStore } from "@/stores";
import { computed } from "vue";

const { place } = defineProps({
  place: {
    type: String,
    required: true,
    default: "none",
  },
});

const settingStore = useSettingStore();
const show = computed(() => settingStore.getAlert.visible && settingStore.getAlert.place == place);
const type = computed(() => settingStore.getAlert.type);
const message = computed(() => settingStore.getAlert.message);
const classNames = computed(() => `alert-${type.value}`);

const handleHideAlert = () => {
  settingStore.setAlertParam({
    visible: false,
    message: "",
    type: "",
    place: "",
  });
};
</script>

<template>
  <div class="alert alert-dismissible mb-3" :class="classNames" role="alert" v-if="show">
    <p class="m-0">{{ message }}</p>
    <button type="button" class="btn-close" @click.prevent="handleHideAlert()"></button>
  </div>
</template>

<style lang="scss" scoped></style>
