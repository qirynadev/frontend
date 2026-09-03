<script lang="ts" setup>
import execIcon from "@/assets/images/exec.png";
import type { FormulaType } from "@/constants/constant.type";
import type { PropType } from "vue";
import ButtonGeneral from "../atoms/ButtonGeneral.vue";
const { formula, withLine, btnText, withPrice, withGlobalBgColor, btnClassName } = defineProps({
  formula: {
    type: Object as PropType<FormulaType>,
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
  btnTextClass: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["onPressBtn", "onPressContainer", "onMobilePress"]);

const onPressBtn = () => {
  emits("onPressBtn", formula);
};
const onPressContainer = () => {
  emits("onPressContainer", formula);
};
const onMobilePress = () => {
  emits("onMobilePress", formula);
};
</script>

<template>
  <div
    class="group transition duration-700 px-[15px] md:py-[20px] border broder-[#c9c9c9] shadow-[1px_1px_12px_#5555553b] rounded-md! md:hover:bg-[#273c66] h-[200px] md:h-[335px] flex flex-col justify-between items-end relative"
    :class="{
      'bg-[#273c66]': withGlobalBgColor,
      'bg-surface': !withGlobalBgColor,
    }"
  >
    <div class="h-full w-full">
      <div
        class="w-full md:px-0 rounded-t-md relative"
        :class="{
          'after:absolute after:bottom-0 after:mt-2 after:left-0 after:right-0 after:h-px after:bg-[#333333] group-hover:after:bg-white after:w-full after:mx-auto':
            withLine,
        }"
        @click="onPressContainer"
      >
        <div
          role="button"
          class="my-[10px] md:my-[10px] md:pb-[20px] gap-x-2 flex justify-center overflow-hidden items-center w-full"
        >
          <img
            :src="formula?.icon ?? execIcon"
            :class="{ 'invert brightness-0': withGlobalBgColor }"
            class="header-img group-hover:invert w-[30px] hidden md:block"
          />
          <div
            :class="{ 'text-white': withGlobalBgColor }"
            class="ms-1 md:m-0 whitespace-nowrap text-center text-[16px] md:text-[22px] text-ink group-hover:text-white font-bold"
          >
            {{ formula?.title }}
          </div>
        </div>
      </div>

      <div
        @click="onPressContainer"
        class="group flex flex-col cursor-pointer justify-between relative h-full w-full md:mt-[10px]"
      >
        <ul class="px-2 pt-2 md:p-0 h-full cursor-pointer grow flex flex-col">
          <li
            class="flex justify-start items-center md:mb-2 w-full min-w-0"
            v-for="(value, index) in formula?.items"
            :key="index"
          >
            <img
              src="@/assets/images/check_mark_circle_icon.png"
              :class="{ 'invert brightness-0': withGlobalBgColor }"
              class="h-2 md:h-3 w-2 md:w-3 me-2 shrink-0 group-hover:invert group-hover:brightness-0"
            />
            <p
              :class="{ 'text-white': withGlobalBgColor }"
              class="m-0 text-[13px] md:text-[14px] group-hover:text-white min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left"
            >
              {{ value?.title }}
            </p>
          </li>
        </ul>

        <div
          class="flex flex-col items-center h-[75px] absolute bottom-0 left-1/2 -translate-x-1/2 mb-[10px] md:mb-[50px] text-[18px] md:text-[27px] font-bold group-hover:text-white"
          v-if="withPrice"
        >
          {{ formula?.amount }} €
        </div>
      </div>
    </div>

    <div class="absolute left-[50%] translate-x-[-50%] bottom-0 mt-[30px] h-max">
      <ButtonGeneral
        :className="`${btnClassName} hidden md:flex mb-[-15px]`"
        :title="btnText"
        :textClass="`${btnTextClass} w-full text-center uppercase`"
        @pressed="onPressBtn"
      />

      <ButtonGeneral
        :className="`${btnClassName} md:hidden mb-[-15px]`"
        :title="btnText"
        :textClass="`${btnTextClass} w-full text-[13px] text-center uppercase`"
        @pressed="onMobilePress"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carousel__viewport {
  padding: 10px 0;
}
</style>
