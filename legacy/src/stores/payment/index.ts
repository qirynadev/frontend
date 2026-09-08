import { HttpService } from "@/services/httpService";
import { defineStore } from "pinia";
import { ElNotification } from "element-plus";
import i18n from "@/i18n";
import { ref } from "vue";
import type { OrderType } from "@/constants/constant.type";

const http = new HttpService();

export type PaymentType = {
  title: string;
  description: string;
  status: "FAIL" | "SUCCESS";
};

export const usePaymentStore = defineStore(
  "paymentStore",
  () => {
    const order = ref(null as any);
    const orderData = ref(null as any);
    const amount = ref(0);
    const redirectUrl = ref(null as any);
    const paymentState = ref({
      title: i18n.global.t("error-occured"),
      description: i18n.global.t("error-occured-description"),
      status: "FAIL",
    });
    const userPaymentList = ref<OrderType[]>([]);

    const setPaymentState = (state: PaymentType) => {
      paymentState.value = state;
    };

    const setOrderData = (data: any) => {
      orderData.value = data;
    };

    async function iniPayment(formData: any): Promise<boolean> {
      const { data, success, message } = await http.post(`payment/init`, formData);
      if (!success) {
        ElNotification({
          type: "error",
          message,
        });

        return false;
      }

      order.value = data.order;
      redirectUrl.value = data.redirectUrl;

      return true;
    }

    async function doPayment(formData: any): Promise<{ confirmed: boolean; failed: boolean } | false> {
      const response = await http.post(`/payment/validate`, formData);
      const { data, success, message } = response;

      orderData.value = null;
      redirectUrl.value = null;

      if (!success) {
        ElNotification({
          type: "error",
          message,
        });

        return false;
      }

      // Mettre à jour l'objet order avec les données de la commande si elles sont disponibles
      if (data.order) {
        order.value = data.order;
      }

      ElNotification({
        type: data.confirmed ? "success" : data.failed ? "error" : "warning",
        message,
      });

      return {
        confirmed: data.confirmed ?? false,
        failed: data.failed ?? false,
      };
    }

    async function fetchUserPayment(): Promise<any> {
      const { data } = await http.get(`/payment/list`);
      return (userPaymentList.value = data.orders);
    }

    async function retryPayment(orderId: string): Promise<string | false> {
      const { data, success, message } = await http.post(`/payment/retry`, { order_id: orderId });

      if (!success) {
        ElNotification({
          type: "error",
          message,
        });
        return false;
      }

      // Sauvegarder la commande pour que Success.vue puisse la retrouver après redirection Stripe
      order.value = data.order;

      return data.redirectUrl;
    }

    async function checkDataCollectionStatus(orderId: string): Promise<{
      requiresDataCollection: boolean;
      serviceType: string;
      isComplete: boolean;
      prefill: {
        preferred_country?: string;
        city?: string;
        diplomas?: string[];
        areas_of_interest?: string[];
        biography?: string;
        user_language?: string;
        order_context?: {
          service_name?: string;
          school_name?: string;
          school_country?: string;
        };
      };
    }> {
      const { data, success } = await http.get(`/client-data/check-status?order_id=${orderId}`);
      if (!success) {
        return { requiresDataCollection: false, serviceType: "", isComplete: true, prefill: {} };
      }
      return {
        requiresDataCollection: data.requires_data_collection,
        serviceType: data.service_type,
        isComplete: data.is_complete,
        prefill: data.prefill || {},
      };
    }

    return {
      order,
      orderData,
      amount,
      redirectUrl,
      paymentState,
      userPaymentList,
      iniPayment,
      doPayment,
      fetchUserPayment,
      retryPayment,
      setPaymentState,
      setOrderData,
      checkDataCollectionStatus,
    };
  },
  {
    persist: true,
  },
);
