<script lang="ts" setup>
import type { SchoolType } from "@/constants/constant.type";
import { computed, ref, type PropType } from "vue";

const props = defineProps({
  school: {
    type: Object as PropType<SchoolType>,
    required: true,
    default: () => ({}),
  },
});

// Logo de l'école si disponible, sinon repli sur le nom stylisé (comme les logos textuels du specs).
const failed = ref(false);
const src = computed(() => props.school?.logo || props.school?.image || "");
const showImage = computed(() => !!src.value && !failed.value);
</script>

<template>
  <div class="q-school" :title="school?.title" :data-name="'Logo école'">
    <img v-if="showImage" :src="src" :alt="school?.title" @error="failed = true" />
    <span v-else>{{ school?.title }}</span>
  </div>
</template>
