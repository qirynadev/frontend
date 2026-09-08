<script lang="ts" setup>
import execIcon from "@/assets/images/exec.png";
import type { OfferType } from "@/constants/constant.type";
import type { PropType } from "vue";
import ButtonGeneral from "../atoms/ButtonGeneral.vue";
const { offer, withHeadBgColor, withLine, btnText, withPrice, withGlobalBgColor, withHover, btnClassName } =
  defineProps({
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
    withHover: {
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
  <div
    :class="[
      'transition duration-700 lg:px-1.5 rounded-md! h-[230px] lg:h-[405px] flex justify-between items-end flex-col relative',
      withHover ? 'group lg:hover:bg-[#273c66]' : '',
      withGlobalBgColor ? 'bg-[#273c66]' : 'bg-surface',
    ]"
  >
    <div
      class="w-full lg:px-0 rounded-t-md relative"
      :class="{
        'after:absolute after:bottom-0 after:mt-2 after:left-0 after:right-0 after:h-px after:bg-white after:w-full after:mx-auto':
          withLine,
      }"
    >
      <div
        role="button"
        class="h-[40px] lg:h-[70px] gap-x-2 flex justify-center overflow-hidden items-center w-full"
        :class="{ 'bg-[#273c66] rounded-t-md': withHeadBgColor }"
        @click="onPressContainer"
      >
        <img :src="offer?.icon ?? execIcon" class="header-img invert w-[32px] hidden lg:block" />
        <div
          class="ms-1 lg:m-0 whitespace-nowrap text-center text-[12px] md:text-[16px] lg:text-[24px] text-white font-bold"
        >
          {{ offer?.title }}
        </div>
      </div>
    </div>

    <div
      role="button"
      :class="[
        'shadow-md flex flex-col justify-between relative rounded-b-md transition duration-500 ease-in-out h-full w-full lg:px-[30px] lg:py-[40px]',
        withHover ? 'group group-hover:bg-[#273c66]' : '',
        withGlobalBgColor ? 'bg-[#273c66]' : 'bg-surface',
      ]"
      @click="onPressContainer"
    >
      <ul class="hidden lg:block px-2 pt-2 lg:p-0 h-auto">
        <li
          class="flex justify-start items-center lg:mb-2 w-full min-w-0"
          v-for="(value, index) in offer?.items"
          :key="index"
        >
          <img
            src="@/assets/images/check_mark_circle_icon.png"
            :class="{ 'invert brightness-0': withGlobalBgColor }"
            class="h-2 lg:h-3 w-2 lg:w-3 me-2 shrink-0 group-hover:invert group-hover:brightness-0"
          />
          <p
            :class="{ 'text-white': withGlobalBgColor }"
            class="m-0 text-[10px] lg:text-[14px] group-hover:text-white min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left"
          >
            {{ value.title }}
          </p>
        </li>
      </ul>

      <div class="lg:flex flex-col items-center justify-end relative h-max">
        <div class="hidden lg:block absolute bottom-0 left-[50%] translate-x-[-50%]">
          <p class="text-[27px] mb-[-30px] font-bold group-hover:text-white hidden lg:block">{{ offer?.amount }} €</p>
          <ButtonGeneral
            :className="`${btnClassName} uppercase`"
            :title="btnText"
            text-class="text-[14px] text-center"
            @pressed="onPressBtn"
          />
        </div>
        <div class="relative lg:hidden mt-[10px] flex flex-col justify-center items-center">
          <img :src="offer?.icon ?? execIcon" class="h-[75px] p-[10px] mb-[30px]" />
          <button
            type="button"
            class="mb-3 rounded text-white text-center bg-[#ff3942] text-[14px] font-bold w-[80px] h-[28px]"
          >
            {{ offer?.amount }} €
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
