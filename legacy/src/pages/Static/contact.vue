<script setup lang="ts">
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import Loader from "@/components/molecules/Loader.vue";
import type { PageType } from "@/constants/constant.type";
import { useAppStore } from "@/stores";
import { BuildingLibraryIcon, EnvelopeIcon, PaperAirplaneIcon, PhoneIcon } from "@heroicons/vue/24/outline";
import { type ComputedRef, computed, reactive, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useSeo } from "@/composables/useSeo";

const appStore = useAppStore();
const { t } = useI18n();
const settings: ComputedRef<any> = computed(() => appStore.getSettings);

useSeo({ title: () => t("contact-us") });

const isLoading = ref<boolean>(false);
const initialData = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};
const form = ref<any>(initialData);

const onSubmit = async () => {
  isLoading.value = true;
  const res = await appStore.sendContactForm(unref(form), t);
  if (res) {
    form.value = ref(initialData);
  }
  isLoading.value = false;
};
</script>

<template>
  <div class="global-container">
    <div class="w-full lg:pr-[15px] pt-[70px] lg:pt-[100px]">
      <div class="p-[10px] lg:p-[30px]">
        <form @submit.prevent="onSubmit" class="flex flex-col lg:flex-row items-start gap-4 w-full">
          <div class="w-full lg:w-1/3 grid grid-cols-1 gap-3 order-2 lg:order-1">
            <div class="flex flex-col items-start">
              <div class="flex items-center gap-3 mb-3">
                <div class="bg-surface-alt w-max p-3 lg:p-4 rounded-md flex items-center justify-center">
                  <BuildingLibraryIcon class="h-8 w-8 lg:h-10 lg:w-10 text-blue-950" />
                </div>
                <div class="mt-4">
                  <h3 class="text-[18px] lg:text-[20px] font-bold">
                    {{ $t("contact-page.address.title") }}
                  </h3>
                  <p class="text-ink">
                    {{ $t("contact-page.address.subtitle") }}
                  </p>
                </div>
              </div>
              <div class="italic text-ink">
                <p class="font-semibold">Paris, France</p>
                <p>Rue de la Paix, 75007 Paris</p>
              </div>
              <div class="italic text-ink mt-3">
                <p class="font-semibold">Abidjan, Cote d'Ivoire</p>
                <p>Rosier programme 2, Cocody Palmeraie</p>
              </div>
            </div>
            <div class="mt-5 lg:mt-8 flex flex-col items-start">
              <div class="flex items-center gap-3 mb-3">
                <div class="bg-surface-alt w-max p-3 lg:p-4 rounded-md flex items-center justify-center">
                  <EnvelopeIcon class="h-8 w-8 lg:h-10 lg:w-10 text-blue-950" />
                </div>
                <div>
                  <h3 class="text-[18px] lg:text-[20px] font-bold">
                    {{ $t("contact-page.send-us-message.title") }}
                  </h3>
                </div>
              </div>
              <p class="text-ink-muted text-[14px]">
                {{ $t("contact-page.send-us-message.subtitle") }}
              </p>
              <p class="text-[#FF3942]">contact@qiryna.com</p>
            </div>
            <div class="mt-5 lg:mt-8 flex flex-col items-start">
              <div class="flex items-center gap-3 mb-3">
                <div class="bg-surface-alt w-max p-3 lg:p-4 rounded-md flex items-center justify-center">
                  <PhoneIcon class="h-8 w-8 lg:h-10 lg:w-10 text-blue-950" />
                </div>
                <h3 class="text-[18px] lg:text-[20px] font-bold my-3">
                  {{ $t("contact-page.call-us.title") }}
                </h3>
              </div>
              <p class="text-ink-muted mb-3 text-[14px]">
                {{ $t("contact-page.call-us.subtitle") }}
              </p>
              <p class="text-[#FF3942]">{{ settings?.site?.phone }}</p>
            </div>
          </div>

          <div class="w-full lg:w-2/3 flex flex-col items-end order-1 lg:order-2">
            <div class="mb-[20px] lg:mb-[50px] w-full">
              <h1 class="lg:mb-[10px] text-[1.8em] lg:text-[3em] font-bold text-center">
                {{ $t("contact-page.title") }}
              </h1>
              <p class="text-center text-[13px] lg:text-[20px]">
                {{ $t("contact-page.subtitle") }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
              <div class="input-field">
                <input type="text" v-model="form.first_name" placeholder="" required />
                <label class="">{{ $t("contact-page.form.first_name") }}</label>
              </div>
              <div class="input-field">
                <input type="text" v-model="form.last_name" placeholder="" required />
                <label class="">{{ $t("contact-page.form.last_name") }}</label>
              </div>
              <div class="md:col-span-2 input-field">
                <input type="text" v-model="form.phone" placeholder="" />
                <label class="">{{ $t("contact-page.form.phone") }}</label>
              </div>
              <div class="md:col-span-2 input-field">
                <input type="email" v-model="form.email" placeholder="" required />
                <label class="">{{ $t("contact-page.form.email") }}</label>
              </div>
              <div class="md:col-span-2 input-field">
                <input type="text" v-model="form.subject" placeholder="" required />
                <label class="">{{ $t("contact-page.form.subject") }}</label>
              </div>
              <div class="md:col-span-2 input-field">
                <textarea v-model="form.message" rows="4" placeholder="" required></textarea>
                <label class="">{{ $t("contact-page.form.message") }}</label>
              </div>
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex items-center gap-3 w-max bg-[#FF3942] text-[14px] lg:text-[18px] text-white font-normal px-4 py-2 rounded-md hover:bg-opacity-80"
            >
              <Loader v-if="isLoading" />
              {{ $t("contact-page.form.send") }}
              <PaperAirplaneIcon class="size-5 stroke-2 -rotate-45" />
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-field {
  width: 100%;
  position: relative;

  textarea {
    height: 100px !important;
  }

  input,
  select,
  textarea {
    width: 100%;
    border-radius: 4px;
    font-size: 14px;
    padding: 6px 12px;
    border: 1.5px solid var(--color-border);
    background: transparent;
    color: var(--color-ink);
    /* box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); */
    outline: none;
    height: 45px;
    margin-bottom: 10px;

    &:focus {
      border: 2px solid #ff3942;
    }

    &:focus ~ label {
      color: #ff3942;
    }

    /* &:valid ~ label {
      color: #ff3942;
    } */
  }

  &:has(:required) {
    & label::after {
      content: "*";
      color: #ff3942;
      margin-left: 4px;
    }
  }

  label {
    position: absolute;
    top: -10px;
    left: 15px;
    font-size: 16px;
    padding: 0 2px;
    background: var(--color-surface);
    color: var(--color-ink-muted);
    font-size: 15px;
    pointer-events: none;
    transition: 0.3s;
    font-weight: 600;
  }
}
</style>
