<script lang="ts" setup>
const { nbrLine, size } = defineProps({
  nbrLine: {
    type: Number,
    default: 1,
  },
  size: {
    type: String,
    default: "small",
  },
});
</script>

<template>
  <div class="skeleton flex items-center justify-between">
    <div class="square pulsate" :class="size"></div>
    <div class="skeleton-right">
      <div v-for="(item, index) in nbrLine" :key="index" :data="item" class="block2 pulsate"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skeleton {
  width: 100%;
  background: var(--color-surface);
  border-radius: 5px;
  border: 1px solid #c0c0c0a8;
  padding: 8px;

  .square {
    border-radius: 5px;

    &.small {
      height: 25px;
      width: 25px;
    }

    &.medium {
      height: 80px;
      width: 80px;
    }

    &.large {
      height: 100px;
      width: 120px;
    }
  }
}

.skeleton-right {
  width: calc(100% - 35px);
  margin-left: 10px;
}

.pulsate {
  background: linear-gradient(-45deg, #dddddd, #f0f0f0, #dddddd, #f0f0f0);
  background-size: 400% 400%;
  -webkit-animation: Gradient 2.25s ease infinite;
  -moz-animation: Gradient 2.25s ease infinite;
  animation: Gradient 2.25s ease infinite;
}

.block2 {
  width: 60%;
  height: 8px;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
}

@-webkit-keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@-moz-keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes Gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
