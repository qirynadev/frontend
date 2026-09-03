<script lang="ts" setup>
const { title, description } = defineProps({
  title: {
    type: String,
    required: true,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="flex flex-col mb-2 justify-center items-center header-tilte-container">
    <p class="home-focus-title text-center mb-2">{{ title }}</p>
    <p class="sous-titre text-center">
      {{ description }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.header-tilte-container {
  padding: 0 15px;

  .home-focus-title {
    font-size: 24px;
    color: #555454;
    font-weight: 400;

    &:before,
    &:after {
      content: "";
      display: inline-block;
      vertical-align: middle;
      width: 15rem !important;
      height: 1px;
      background: #ff3942;
      margin: 0 5px;
    }
  }

  .sous-titre {
    font-size: 28px;
    color: #474747;
    font-weight: 500;
  }
}

@media only screen and (max-width: 768px) {
  .sous-titre {
    font-size: 18px !important;
    font-weight: bold !important;
  }
  .header-tilte-container {
    padding: 0 !important;
    align-items: start !important;
  }
  .home-focus-title {
    display: none;
  }
}

@media only screen and (max-width: 1000px) {
  .header-tilte-container {
    .home-focus-title {
      font-size: 18px;

      &:before,
      &:after {
        width: 8rem;
      }
    }

    .sous-titre {
      font-size: 20px;
    }
  }
}

@media only screen and (max-width: 425px) {
  .header-tilte-container {
    .home-focus-title {
      font-size: 14px;

      &:before,
      &:after {
        width: 5rem;
      }
    }

    .sous-titre {
      font-size: 16px;
    }
  }
}

@media only screen and (max-width: 320px) {
  .header-tilte-container {
    .home-focus-title {
      font-size: 12px;

      &:before,
      &:after {
        width: 3rem;
      }
    }

    .sous-titre {
      font-size: 14px;
    }
  }
}
</style>
