<script lang="ts" setup>
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import router from "@/router";
import { i18nRoute } from "@/utils";
import { XCircleIcon } from "@heroicons/vue/20/solid";
import { onMounted } from "vue";
import { usePaymentStore, useSettingStore } from "@/stores";
import { storeToRefs } from "pinia";

const { order, orderData, redirectUrl } = storeToRefs(usePaymentStore());
const { setRegisterConfig } = useSettingStore();

onMounted(() => {
  order.value = null;
  orderData.value = null;
  redirectUrl.value = null;

  setRegisterConfig("REGISTER");
});
</script>

<template>
  <div class="global-container h-max flex flex-col justify-center py-10 items-center">
    <div class="padcontacsty mb-[30px]">
      <div class="clasenvelops flex justify-center items-center">
        <XCircleIcon class="w-32 h-32 text-red-500" />
      </div>
      <p class="thanksmsg">
        {{ $t("payment-failed") }}
      </p>
      <p style="text-align: center; font-size: 16px">
        {{ $t("payment-failed-description") }}
      </p>
    </div>
    <ButtonGeneral
      :title="$t('back-to-home')"
      @pressed="() => router.push(i18nRoute({ name: 'home' }))"
      class="mx-auto rounded-md uppercasex px-10 py-3 flex items-center justify-center gap-1 text-[15px]"
    />
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  margin-top: 120px;
}

.padcontacsty {
  border: 1px solid #ccd1d966;
  border-radius: 4px;
  padding: 37px;
}

.clasenvelops {
  text-align: center;
  font-size: 60px;

  &.success {
    color: #7fc50f;
  }

  &.error {
    color: #ff3942;
  }

  img {
    vertical-align: middle;
    border: 0;
  }
}

.thanksmsg {
  text-align: center;
  font-size: 22px;
  font-weight: 600;

  &.success {
    color: #3bb54a;
  }

  &.error {
    color: #ff3942;
  }
}
</style>
