<script lang="ts" setup>
import defaultCoachIMG from "@/assets/images/talk/coach-2.1669457228.png";
import type { MentorType, OfferType } from "@/constants/constant.type";
import { useSchoolStore } from "@/stores";
import { computed, type PropType } from "vue";

const { data } = defineProps({
  data: {
    type: Object as PropType<MentorType>,
    default: {},
  },
});

const selectedOffer = computed<OfferType | null>(() => useSchoolStore().selectedOffer);

const profileToDisplay = computed(() => {
  if (data && "public_profils" in data && data.public_profils.length > 0) {
    const index = data.public_profils.findIndex((item) => selectedOffer.value?.area.id === item.area_id);
    return data.public_profils[index] ?? data.public_profils[0];
  }
});

const emit = defineEmits(["clicked"]);
const handleClick = () => emit("clicked", data);
</script>

<template>
  <div class="mentor-container relative overflow-hidden h-[160px] lg:h-[405px] blocktalkone" @click="handleClick">
    <div class="img-container">
      <img class="coach-img" :src="data?.photo ?? defaultCoachIMG" :alt="data?.full_name ?? `John Doe`" />
      <div class="infos flex flex-col justify-end items-center absolute">
        <div class="logo_school relative overflow-hidden">
          <img :src="profileToDisplay?.logo ?? data.country_flag" class="h-full w-full object-cover rounded-circle" />
        </div>
        <div class="prof_name my-1 lg:mt-3 lg:mb-4">
          <h5 class="text-center text-[14px] text-white my-[10px] font-medium">
            {{ data?.full_name ?? `John Doe` }}
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.blocktalkone {
  box-shadow: 1px 1px 12px #5555553b;
}
.mentor-container {
  background-color: #50a5e8 !important;
  border-radius: 5px;
  box-shadow: 1px 1px 12px #5555553b;

  &:hover {
    box-shadow: 0 0.5rem 0.5rem rgb(0 0 0 / 51%);
    border: 1px solid #fff;
  }

  .img-container {
    width: 100%;
    height: 100%;

    .coach-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
    }

    .infos {
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(0 0 0 / 61%) 100%);
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 100%;
      border-radius: 5px;

      .logo_school {
        width: 80px;
        height: 80px;
        background-color: white;
        border: 4px solid #ff3942;
        border-radius: 50%;

        img {
          width: 100%;
        }
      }
    }
  }
}

@media only screen and (max-width: 768px) {
  .logo_school {
    width: 50px !important;
    height: 50px !important;
  }
  .prof_name h5 {
    font-size: 10px !important;
  }
}
</style>
