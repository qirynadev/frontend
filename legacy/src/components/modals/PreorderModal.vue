<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";

const props = defineProps<{
  visible: boolean;
  serviceType: "profiling" | "foreign-languages";
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const { t } = useI18n();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) emit("close");
  },
});

const serviceTitle = computed(() => {
  return t(`coming-soon.${props.serviceType}.title`);
});

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("close");
};
</script>

<template>
  <el-dialog
    v-model="isVisible"
    width="500px"
    align-center
    :close-on-click-modal="!isLoading"
    :close-on-press-escape="!isLoading"
    :show-close="!isLoading"
    class="rounded-lg shadow-lg preorder-modal"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
          <InformationCircleIcon class="w-6 h-6 text-amber-600" />
        </div>
        <h3 class="text-lg font-semibold text-ink">
          {{ serviceTitle }}
        </h3>
      </div>
    </template>

    <div class="py-4">
      <div class="p-4 mb-4 text-sm text-amber-800 rounded-lg bg-amber-50 border border-amber-200">
        <p class="font-medium mb-2">
          {{ $t("preorder.service-coming-soon") }}
        </p>
        <p class="text-amber-700">
          {{ $t("preorder.can-preorder") }}
        </p>
      </div>

      <p class="text-ink-muted text-sm">
        {{ $t("preorder.preorder-description") }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          @click="handleCancel"
          :disabled="isLoading"
          class="px-4 py-2 text-sm font-medium text-ink bg-surface border border-border-default rounded-md hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-muted disabled:opacity-50"
        >
          {{ $t("preorder.cancel") }}
        </button>
        <ButtonGeneral
          :title="$t('preorder.confirm-preorder')"
          :is-loading="isLoading"
          class="px-4 py-2 bg-[#273c66]! text-white"
          @pressed="handleConfirm"
        />
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.preorder-modal {
  .el-dialog__header {
    padding-bottom: 0;
  }
}
</style>
