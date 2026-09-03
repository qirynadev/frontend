<script setup lang="ts">
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { usePaymentStore } from "@/stores";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import { computed, onBeforeMount, ref } from "vue";
import { useI18n } from "vue-i18n";
import Loader from "@/components/molecules/Loader.vue";

const { t } = useI18n();
const paymentStore = usePaymentStore();

const isFetching = ref(false);
const retryingOrderId = ref<string | null>(null);
const filterValue = ref("");

const filteredOrders = computed(() => {
  return paymentStore.userPaymentList.filter((order) => {
    return (
      order.offer.title.toLowerCase().includes(filterValue.value.toLowerCase()) ||
      order.created_at.includes(filterValue.value.toLowerCase()) ||
      String(order.amount).includes(filterValue.value.toLowerCase())
    );
  });
});

const handleRetryPayment = async (orderId: string) => {
  retryingOrderId.value = orderId;
  const redirectUrl = await paymentStore.retryPayment(orderId);
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
  retryingOrderId.value = null;
};

onBeforeMount(async () => {
  isFetching.value = true;
  await paymentStore.fetchUserPayment();
  isFetching.value = false;
});
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="min-h-[500px] max-h-[750px] overflow-y-auto lg:border lg:rounded-lg">
          <div class="border-b text-[18px] font-bold mb-[15px] p-3">
            {{ $t("order-history") }}
          </div>
          <div class="p-3">
            <div class="relative mb-[20px]">
              <input
                class="bg-surface-alt rounded-md p-3 ps-10 w-full border focus:border-red-500 outline-none focus:ring-2 ring-red-200"
                type="text"
                :placeholder="$t('search-in-history')"
                v-model="filterValue"
              />
              <MagnifyingGlassIcon class="h-5 w-5 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>

            <!-- Loading -->
            <div v-if="isFetching" class="flex justify-center py-10">
              <Loader />
            </div>

            <!-- Empty state -->
            <div v-else-if="filteredOrders.length === 0" class="text-center text-ink-muted py-10">
              {{ $t("no-orders") }}
            </div>

            <!-- Orders list -->
            <ul v-else class="flex flex-col gap-2">
              <li
                v-for="order in filteredOrders"
                :key="order.id"
                class="flex flex-col lg:flex-row lg:items-center justify-between border border-border-default rounded-lg py-3 px-3 hover:bg-surface-alt gap-2"
              >
                <div class="flex items-center flex-1 min-w-0">
                  <div class="w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] p-2 mr-3 rounded-full bg-blue-950 shrink-0">
                    <img :src="order.offer.icon" alt="" class="w-full h-full invert brightness-0 rounded-full" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-[14px] lg:text-[16px] truncate">
                      {{ order.offer.title }}
                    </p>
                    <div class="flex flex-wrap items-center gap-1 lg:gap-2 mt-1">
                      <span class="text-ink-muted text-[12px] lg:text-[13px]">
                        {{ order.created_at }}
                      </span>
                      <span
                        class="text-white text-[10px] lg:text-[11px] px-2 py-0.5 rounded-full"
                        :class="order.status_color"
                      >
                        {{ order.status }}
                      </span>
                      <span
                        class="text-white text-[10px] lg:text-[11px] px-2 py-0.5 rounded-full"
                        :class="order.transaction?.confirmed ? 'bg-green-500' : 'bg-orange-500'"
                      >
                        {{ order.transaction?.confirmed ? $t("paid") : $t("unpaid") }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between lg:justify-end gap-3 shrink-0 pl-[52px] lg:pl-0">
                  <span class="font-bold text-[16px] lg:text-[20px]">{{ order.amount }} €</span>

                  <!-- Bouton relancer le paiement -->
                  <button
                    v-if="order.can_retry_payment"
                    @click.stop="handleRetryPayment(order.id)"
                    :disabled="retryingOrderId === order.id"
                    class="flex items-center gap-1 bg-[#ff3942] text-white text-[12px] lg:text-[13px] px-3 py-1.5 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Loader v-if="retryingOrderId === order.id" class="size-2" />
                    <ArrowPathIcon v-else class="size-4" />
                    {{ $t("retry-payment") }}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="right-part hidden lg:block">
        <BannerRotator class="pub" />
      </div>
    </div>
  </div>
</template>
