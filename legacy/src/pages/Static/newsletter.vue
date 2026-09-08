<script lang="ts" setup>
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import router from "@/router";
import { useAppStore } from "@/stores";
import { onBeforeMount, ref, type Ref } from "vue";
import { i18nRoute } from "@/utils";
import { CheckCircleIcon } from "@heroicons/vue/20/solid";
import { useI18n } from "vue-i18n";

const appStore = useAppStore();
const { t } = useI18n();

const isLoading: Ref<boolean> = ref(false);

onBeforeMount(async () => {
  let params = new URL(document.location.toString()).searchParams;
  let token = params.get("token");

  isLoading.value = true;
  const res = await appStore.confirmNewsletter(token ?? "", t);
  if (res) {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="global-container h-max flex flex-col justify-center py-10 items-center">
    <template v-if="isLoading">
      <div class="flex flex-col justify-center items-center animate-pulse w-full border rounded-lg p-4 mb-[70px]">
        <div class="h-20 w-20 rounded-full bg-border-default mb-3"></div>
        <div class="h-20 w-2/3 bg-border-default rounded-lg mb-3"></div>
        <div class="h-16 w-52 bg-border-default rounded-lg mb-3"></div>
      </div>
    </template>
    <template v-else>
      <div class="padcontacsty mb-[30px]">
        <div class="clasenvelops flex justify-center items-center success">
          <CheckCircleIcon class="w-32 h-32 text-green-500" />
        </div>
        <p class="thanksmsg success">
          {{ $t("success") }}
        </p>
        <p style="text-align: center; font-size: 16px">
          {{ $t("newsletter-confirmation-text") }}
        </p>
      </div>
      <ButtonGeneral
        :title="$t('back-to-home')"
        @pressed="() => router.push(i18nRoute({ name: 'home' }))"
        class="mx-auto rounded-md uppercasex px-10 py-3 flex items-center justify-center gap-1 text-[15px]"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  margin-top: 120px;
}

.padcontacsty {
  border: 1px solid var(--color-border);
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
    color: #f7333e;
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
    color: #f7333e;
  }
}
</style>
