<script setup lang="ts">
import { CalendarIcon, ClockIcon } from "@heroicons/vue/24/solid";
const { data, showButton, showDivider, showHeadClock, showTime } = defineProps({
  showTime: {
    type: Boolean,
    required: false,
    default: false,
  },
  showHeadClock: {
    type: Boolean,
    required: false,
    default: false,
  },
  showDivider: {
    type: Boolean,
    required: false,
    default: false,
  },
  showButton: {
    type: Boolean,
    required: false,
    default: false,
  },
  data: {
    type: Object,
    default: {},
  },
});
</script>

<template>
  <div>
    <div class="card card_bsha mb-5 bg-surface">
      <div class="position-relative captionImage">
        <img
          class="card-img-top"
          width="100%"
          height="100%"
          :src="data?.service?.image ?? 'https://picsum.photos/200/300'"
          alt="Card image cap"
        />

        <div v-if="showHeadClock" class="rounded rounded-circle clock-icon d-flex align-items-center p-1">
          <ClockIcon class="icon" />
        </div>
      </div>
      <div class="py-2">
        <h5 class="card-title my-1 mx-1 text-truncate fw-bold mb-2">
          {{ data?.service?.libelle ?? "Card title" }}
        </h5>
        <div class="d-flex align-items-center mx-1 my-1 mb-2">
          <img
            class="rounded rounded-circle"
            width="23"
            height="23"
            :src="data?.mentor?.photo ?? 'https://picsum.photos/200/200'"
            alt=""
          />
          <div class="mx-1"></div>
          <p class="font-light mb-0" style="font-size: 12px">
            {{ data?.mentor?.nom ? `${data?.mentor?.nom} ${data?.mentor?.prenoms}` : "Doe John" }}
          </p>
        </div>
        <div v-if="showDivider" class="h-divider"></div>
        <!-- hour section -->
        <div v-if="showTime" class="d-flex justify-content-between align-items-center mx-1 my-1 pt-2 pb-1">
          <div class="d-flex align-items-center">
            <CalendarIcon class="icon" />
            <span style="font-size: 11px">25/12/2023</span>
          </div>

          <div class="d-flex align-items-center">
            <ClockIcon class="h-6 w-6 icon" />
            <span style="font-size: 11px">15H00 - 16H00</span>
          </div>
        </div>
        <div class="px-1" v-if="showButton">
          <a href="#" class="btn btn-danger" style="width: 100%">Lancer la réunion</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: none !important;
}
.card_bsha {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}
.card_bsha:hover {
  transform: scale(1.1);
}
.captionImage {
  height: 200px;
}

.icon {
  width: 15px;
  height: 15px;
}

.h-divider {
  width: 100%;
  height: 1px;
  background-color: rgb(212, 212, 212);
  margin-top: 5px;
  margin-bottom: 5px;
}

.clock-icon {
  background-color: yellow;
  position: absolute;

  top: 5px;
  right: 5px;
  /* margin-right: 5px;
    margin-top: 5px; */
}
</style>
