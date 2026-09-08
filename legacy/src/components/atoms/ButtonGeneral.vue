<script lang="ts" setup>
import Loader from "@/components/molecules/Loader.vue";

const { title, className, withIcon, iconURL, iconPosition, isLoading, isDisable } = defineProps({
  title: {
    type: String,
    default: "General Btn",
  },
  className: {
    type: String,
    default: "",
  },
  textClass: {
    type: String,
    default: "",
  },
  onPress: {
    type: Function,
    default: () => null,
  },
  withIcon: {
    type: Boolean,
    default: false,
  },
  iconURL: {
    default: "",
  },
  iconPosition: {
    type: String,
    default: "left",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isDisable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["pressed"]);
const handleClick = () => emit("pressed");
</script>

<template>
  <button
    class="flex items-center justify-center relative bg-[#ff3942] rounded-full text-white"
    :class="{ [className]: !!className }"
    @click.prevent="handleClick"
    :disabled="isDisable || isLoading"
  >
    <Loader v-if="isLoading" />

    <div class="flex items-center gap-1">
      <img v-if="withIcon && iconPosition === 'left' && iconURL" :src="iconURL" class="lg:me-2 w-[22px]" />
      <span :class="textClass">{{ title }}</span>
      <img v-if="withIcon && iconPosition == 'right' && iconURL" :src="iconURL" class="lg:ms-2 w-[22px]" />
    </div>
  </button>
</template>

<style lang="scss" scoped>
/* .c-button {
  background-color: #ff3942;
  padding: 9px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 12px;

  .icon {
    filter: invert(1);
    width: 22px;
  }
}

@media only screen and (max-width: 768px) {
  .c-button {
    display: flex;
    background: red;
    border-radius: 60px;
    padding: 2px 5px;
    margin-top: 7px;
    text-align: center;
    width: auto;

    .icon {
      margin: 0 !important;
    }
  }
} */
</style>
