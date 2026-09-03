<script lang="ts" setup>
import execIcon from "@/assets/images/exec.png";
import type { OfferType } from "@/constants/constant.type";
import type { PropType } from "vue";
import ButtonGeneral from "../atoms/ButtonGeneral.vue";

const { offer, withHeadBgColor, withLine, btnText, withPrice, withGlobalBgColor, btnClassName } = defineProps({
  offer: {
    type: Object as PropType<OfferType>,
  },
  withGlobalBgColor: {
    type: Boolean,
    default: false,
  },
  withHeadBgColor: {
    type: Boolean,
    default: true,
  },
  withLine: {
    type: Boolean,
    default: true,
  },
  withPrice: {
    type: Boolean,
    default: true,
  },
  btnText: {
    type: String,
    default: "DECOUVRIR",
  },
  btnClassName: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["onPressBtn", "onPressContainer"]);

const onPressBtn = () => {
  emits("onPressBtn", offer);
};
const onPressContainer = () => {
  emits("onPressContainer", offer);
};
</script>

<template>
  <div class="px-[20px] py-[15px] rounded-[5px] bg-[#273c66] relative">
    <div class="w-full rounded-t-md relative">
      <div
        class="my-[10px] pb-[20px] gap-x-2 flex justify-center overflow-hidden items-center w-full border-b border-[#333333]"
      >
        <img :src="offer?.icon ?? execIcon" class="header-img invert w-[32px] hidden lg:block" />
        <div class="whitespace-nowrap text-center text-[23px] text-white font-bold">
          {{ offer?.title }}
        </div>
      </div>
    </div>

    <div class="ms-[5px] my-[45px] flex flex-col justify-between relative">
      <ul class="px-2 pt-2 lg:p-0 h-auto leading-[35px]">
        <li
          class="flex justify-start items-center mb-[15px] w-full min-w-0"
          v-for="(value, index) in offer?.items"
          :key="index"
        >
          <img
            src="@/assets/images/check_mark_circle_icon.png"
            :class="{ 'invert brightness-0': withGlobalBgColor }"
            class="h-[13px] w-[13px] me-2 shrink-0 group-hover:invert group-hover:brightness-0"
          />
          <p
            :class="{ 'text-white': withGlobalBgColor }"
            class="text-[14px] group-hover:text-white min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left"
          >
            {{ value.title }}
          </p>
        </li>
      </ul>

      <button
        type="button"
        class="flex self-center justify-center rounded text-white text-center bg-[#ff3942] text-[23px] font-bold w-[65%] px-[12px] py-[8px] absolute bottom-[-80px]"
      >
        {{ offer?.amount }} €
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
