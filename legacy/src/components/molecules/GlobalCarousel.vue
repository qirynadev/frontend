<script lang="ts" setup>
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import { Carousel, Navigation } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";

const {
  itemsToShow,
  break320,
  break768,
  break1024,
  break1366,
  break1600,
  autoplay,
  pauseAutoplayOnHover,
  loop,
  wrapAround,
} = defineProps({
  itemsToShow: {
    type: Number,
    required: false,
    default: 1,
  },
  itemsToScroll: {
    type: Number,
    required: false,
    default: 1,
  },
  itemsToShow2: {
    type: Number,
    required: false,
    default: 2,
  },
  break320: {
    type: Number,
    required: false,
    default: 2,
  },
  break768: {
    type: Number,
    required: false,
    default: 3,
  },
  break1024: {
    type: Number,
    required: false,
    default: 4,
  },
  break1366: {
    type: Number,
    required: false,
    default: 4,
  },
  break1600: {
    type: Number,
    required: false,
    default: 4,
  },
  autoplay: {
    type: Number,
    required: false,
    default: 4000,
  },
  autoPlay2: {
    type: Number,
    required: false,
    default: 0,
  },
  pauseAutoplayOnHover: {
    type: Boolean,
    required: false,
    default: true,
  },
  wrapAround: {
    type: Boolean,
    required: false,
    default: true,
  },
  loop: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const breakPoints = {
  // 1600 and up
  1600: {
    itemsToShow: break1600,
    snapAlign: "start",
  },

  // 1366 and up
  1366: {
    itemsToShow: break1366,
    snapAlign: "start",
  },

  // 1024 and up
  1024: {
    itemsToShow: break1024,
    snapAlign: "start",
    spaceBetween: 1,
  },

  // 768px and up
  768: {
    itemsToShow: break768,
    snapAlign: "start",
    spaceBetween: 1,
  },

  // 320  and up
  320: {
    itemsToShow: break320,
    snapAlign: "center",
  },
};
</script>

<template>
  <div class="relative w-full">
    <Carousel
      :itemsToShow="itemsToShow"
      :itemsToScroll="itemsToScroll"
      :mouseDrag="true"
      :breakpoints="breakPoints"
      :wrapAround="wrapAround"
      :transition="500"
      :autoplay="autoplay"
      :loop="loop"
      :pauseAutoplayOnHover="pauseAutoplayOnHover"
      class="global-carousel"
    >
      <slot name="slideContent"></slot>

      <template #addons>
        <Navigation class="hidden! lg:flex!">
          <template #prev>
            <button
              class="flex left-[-48px] rounded-full h-7 w-7 relative items-center justify-center border-2 border-[#9e9e9e] text-[#9e9e9e]"
            >
              <ChevronLeftIcon class="w-full h-full font-bold text-[#9e9e9e]" />
            </button>
          </template>

          <template #next>
            <button
              class="flex right-[-48px] rounded-full h-7 w-7 relative items-center justify-center border-2 border-[#9e9e9e] text-[#9e9e9e]"
            >
              <ChevronRightIcon class="w-full h-full font-bold text-[#9e9e9e]" />
            </button>
          </template>
        </Navigation>
      </template>
    </Carousel>
  </div>
</template>

<style lang="scss" scoped></style>
