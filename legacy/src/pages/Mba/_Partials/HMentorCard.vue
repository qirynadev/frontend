<script lang="ts" setup>
import type { MentorType } from "@/constants/constant.type";
import { useMbaStore } from "@/stores";
import { computed } from "vue";
import { i18nRoute } from "@/utils";

const { mentor, photo } = defineProps<{
  mentor: MentorType;
  photo: string;
}>();

const mbaStore = useMbaStore();

const profile = computed<any>(() => {
  if (mentor && "public_profils" in mentor && mentor.public_profils.length > 0) {
    return mentor.public_profils[0] ?? null;
  }

  return null;
});
</script>

<template>
  <div class="mentor-item-container w-1/2 lg:w-full lg:mt-4 flex justify-between">
    <div
      :class="{
        'order-1 lg:me-[30px]': photo == 'left',
        'order-2 lg:ms-[30px]': photo == 'right',
      }"
      class="mentor-img-container overflow-hidden rounded-[5px] w-full lg:w-[263px] relative flex items-center flex-col justify-end"
    >
      <img :src="mentor?.photo" :alt="mentor?.full_name" class="rounded-[5px] z-0" />

      <div class="bg-gradient h-full w-full absolute top-0 left-0 bottom-0 z-10"></div>

      <div class="flex items-center flex-col justify-end z-20">
        <div class="mentor-logo-container relative flex items-center justify-center mb-2">
          <img :src="profile?.logo" />
        </div>
        <div class="mentor-name-container">
          <h6 class="text-[14px]! mt-[10px] mb-[5px] font-medium">
            {{ mentor?.full_name }}
          </h6>
          <router-link
            :to="
              i18nRoute({
                name: 'mba-mentor-presentation',
                params: {
                  mentorslug: mentor?.slug,
                },
              })
            "
            @click="() => (mbaStore.selectedMentor = mentor)"
            class="text-capitalize text-[16px] text-ink block"
          >
            {{ $t("school.mentor-presentation-title") }}
          </router-link>
        </div>
      </div>
    </div>

    <div
      :class="{
        'order-2': photo == 'left',
        'order-1': photo == 'right',
      }"
      class="mentor-description hidden lg:flex lg:flex-col lg:flex-1"
    >
      <h5 class="font-bold text-[18px] mb-[10px]">
        {{ $t("biography") }}
      </h5>
      <div class="m-0 my-description" v-html="mentor?.biography"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(#00000000, #000000cf);
}
.headline {
  border-bottom: 1px solid #c0c0c091;
  margin: 0px 0 25px;

  p {
    font-size: 18px;
    font-weight: 700;
    display: inline-block;
    width: 100%;
    border-bottom: none !important;
    padding-bottom: 10px !important;
  }
}

.mentor-container {
  width: 100%;

  .mentor-item-container {
    .mentor-img-container {
      position: relative;
      height: 300px;
      border-radius: 5px;
      box-shadow: 1px 1px 12px #5555553b;
      text-align: center;

      img {
        position: absolute !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }

      .mentor-logo-container {
        width: 80px;
        height: 80px;
        border: 2.5px solid red;
        border-radius: 50%;
        background-color: var(--color-surface);

        img {
          width: 60%;
          border-radius: 50%;
        }
      }

      .mentor-name-container {
        h6 {
          color: white;
          font-size: 16px;
        }

        a {
          margin-bottom: 15px;
          padding: 3.5px 22px;
          background-color: var(--color-surface);
          border-radius: 25px;
          text-align: center;
        }
      }
    }
  }
}

.join_btn {
  background-color: #ff3942;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  padding: 9px 20px;
  color: white;
}

.c-button {
  white-space: nowrap;
}

@media only screen and (max-width: 1024px) {
  .mentor-img-container {
    height: 350px !important;
  }
}

@media only screen and (max-width: 425px) {
  .main {
    margin-top: 70px;
    margin-bottom: 10px;
  }

  .mentor-logo-container {
    width: 50px !important;
    height: 50px !important;
  }

  .mentor-img-container {
    height: 250px !important;
  }

  .mentor-name-container {
    h6 {
      color: white;
      font-size: 13px !important;
    }

    a {
      font-size: 13px;
      padding: 4px 10px !important;
      width: fit-content !important;
      margin: 0 auto 10px !important;
    }
  }

  .c-button {
    font-size: 13px !important;
  }
}
</style>
