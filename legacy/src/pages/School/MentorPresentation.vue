<script lang="ts" setup>
import BannerRotator from "@/components/atoms/BannerRotator.vue";
import { useAppStore, useAuthStore, usePaymentStore, useSchoolStore } from "@/stores";
import { computed, onBeforeMount, ref, type ComputedRef, type Ref } from "vue";
import router from "@/router";
import { i18nRoute } from "@/utils";
import SingleOfferItem from "@/components/atoms/SingleOfferItem.vue";
import ButtonGeneral from "@/components/atoms/ButtonGeneral.vue";
import ExperienceItem from "@/components/molecules/ExperienceItem.vue";
import FormationItem from "@/components/molecules/FormationItem.vue";
import { useI18n } from "vue-i18n";
import type { AreaType, MentorType, OfferType, SchoolType } from "@/constants/constant.type";
import Loader from "@/components/molecules/Loader.vue";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const authStore = useAuthStore();
const schoolStore = useSchoolStore();
const paymentStore = usePaymentStore();

const { t } = useI18n();

const activeAccordion: Ref<string | number | null> = ref(1);
const isFetching: Ref<boolean> = ref(false);
const isLoading: Ref<boolean> = ref(false);

const selectedMenuSlug = computed<string | null>(() => appStore.selectedMenuSlug);
const selectedOffer = computed<OfferType | null>(() => schoolStore.selectedOffer);
const selectedMentor = computed<MentorType | null>(() => schoolStore.selectedMentor);
const selectedSchool = computed<SchoolType | null>(() => schoolStore.selectedSchool);

const { token } = storeToRefs(authStore);
const { redirectUrl } = storeToRefs(paymentStore);

const stripePayment = async () => {
  const orderData = {
    offer_id: String(selectedOffer.value?.id),
    service_id: String(selectedOffer.value?.area?.id),
    service_type: "area",
    profile_id: String(selectedMentor.value?.id),
    options: {
      school: selectedSchool.value?.id,
    },
  };

  if (!token.value) {
    paymentStore.setOrderData(orderData);

    return router.push(
      i18nRoute({
        name: "signin",
      }),
    );
  }

  isLoading.value = true;
  const res = await paymentStore.iniPayment(orderData);
  isLoading.value = false;

  if (res) {
    window.location.replace(redirectUrl.value ?? "");
  }

  /*
    if (!userToken.value) {
    return router.push(
      i18nRoute({
        name: "signin",
        query: {
          redirect: router.currentRoute.value.fullPath,
        },
      })
    );
  }

  isLoading.value = true;
  const res = await iniPayment(
    {
      offer_id: String(selectedArea.value?.offer.id),
      service_id: String(selectedArea.value?.id),
      service_type: "area",
      profile_id: String(selectedMentor.value?.id),
    },
    t
  );
  isLoading.value = false;

  if (res) {
    window.location.replace(redirectUrl as string);
  }


  isLoading.value = true;
  const res = await iniPayment(
    {
      offer_id: String(selectedArea.value?.offer.id),
      service_id: String(selectedArea.value?.id), 
      service_type: "area",
      profile_id: String(selectedMentor.value?.id),
    },
    t
  );
  isLoading.value = false;

  if (res) {
    setAmount(Number(selectedArea.value?.offer?.amount));

    return router.push(
      i18nRoute({
        name: "check-order",
      })
    );
  } */
};

const handleGoBack = () => {
  router.push(
    i18nRoute({
      name: "area-mentors",
      params: {
        slug: selectedMenuSlug.value,
        areaslug: selectedOffer.value?.slug,
      },
    }),
  );
};

onBeforeMount(async () => {
  /* if (selectedMentor.value) {
    isFetching.value = true;
    await schoolStore.fetchMentorById(selectedMentor.value?.id);
    isFetching.value = false;
  } */
});
</script>

<template>
  <div class="global-container">
    <div class="container-inner">
      <div class="left-part">
        <div class="flex flex-col justify-betweenx h-full">
          <div class="headline">
            <p>
              {{ $t("school.mentor-presentation-title") }}
            </p>
          </div>

          <div class="mentor-container mt-4 -mb-2">
            <!-- Mentor details -->
            <div class="mentor-item-container flex justify-between">
              <div
                class="mentor-img-container overflow-hidden rounded-[5px] relative flex items-center flex-col justify-end"
              >
                <img :src="selectedMentor?.photo" :alt="selectedMentor?.full_name" class="rounded-[5px] z-0" />

                <div class="bg-gradient h-full w-full absolute top-0 left-0 bottom-0 z-10"></div>

                <div class="flex items-center flex-col justify-end z-20">
                  <div class="mentor-logo-container relative flex items-center justify-center mb-2">
                    <img :src="selectedMentor?.public_profils[0]?.logo" class="w-[60px] h-[60px]" />
                  </div>
                  <div class="mentor-name-container">
                    <h6 class="">
                      {{ selectedMentor?.full_name }}
                    </h6>
                  </div>
                </div>
              </div>

              <div class="mentor-description ms-[30px] hidden md:block">
                <h5 class="font-bold">{{ $t("biography") }}</h5>
                <div class="m-0 my-description" v-html="selectedMentor?.biography"></div>
              </div>
            </div>
            <!-- End Mentor details -->
          </div>

          <div class="mentor-info-container">
            <!-- Accordion list -->

            <el-collapse v-model="activeAccordion" accordion class="accordion my-3 pb-[50px] lg:pb-0">
              <el-collapse-item :title="$t('biography')" :name="0" class="d-block md:hidden">
                <div class="my-description" v-html="selectedMentor?.biography"></div>
              </el-collapse-item>

              <el-collapse-item :title="$t('experiences')" :name="1">
                <ExperienceItem v-for="(item, index) in selectedMentor?.experiences ?? []" :key="index" :data="item" />
              </el-collapse-item>

              <el-collapse-item :title="$t('formations')" :name="2">
                <FormationItem v-for="(item, index) in selectedMentor?.formations ?? []" :key="index" :data="item" />
              </el-collapse-item>

              <el-collapse-item :title="$t('interests')" :name="3">
                <div class="my-description" v-html="selectedMentor?.interests"></div>
              </el-collapse-item>
            </el-collapse>

            <!-- Join section -->
            <div class="join_section mt-2 hidden md:flex justify-between items-center">
              <router-link
                :to="
                  i18nRoute({
                    name: 'area-formula',
                    params: {
                      slug: selectedMenuSlug,
                      areaslug: selectedOffer?.slug,
                    },
                  })
                "
                class="bg-navy text-white px-[20px] py-[9px] rounded-md"
              >
                {{ $t("back-to-mentors") }}
              </router-link>
              <!-- <ButtonGeneral
                class="bg-navy btn-navigationx px-[20px] py-[9px] rounded-md"
                className="left-btn"
                :title="$t('back-to-mentors')"
                @pressed="handleGoBack"
              /> -->

              <ButtonGeneral
                class="btn-navigationx px-[20px] py-[9px] rounded-md"
                :title="!token ? $t('select') : $t('pay')"
                @pressed="stripePayment"
                :isLoading="isLoading"
              />
            </div>

            <button
              @click.prevent="stripePayment"
              type="button"
              class="z-40 rounded-full py-3 text-[14px] w-[95%] flex justify-center self-center whitespace-nowrap text-center bg-black text-white md:hidden fixed left-[50%] bottom-5 translate-x-[-50%]"
            >
              <Loader v-if="isLoading" class="mr-2" />
              {{ $t("select") }}
            </button>
          </div>
        </div>
      </div>

      <div class="right-part hidden lg:block">
        <div class="offer-wrapper">
          <SingleOfferItem
            :offer="selectedOffer as OfferType"
            :withGlobalBgColor="true"
            :withPrice="false"
            :btnText="String(selectedOffer?.amount) + ' €'"
            btn-class-name="h-max"
          />
        </div>

        <div class="mt-[30px]">
          <BannerRotator class="pub" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(#00000000, #000000cf);
}
.headline {
  border-bottom: 1px solid #c0c0c091;
  margin: 0px 0 15px;

  p {
    font-size: 18px;
    font-weight: 700;
    display: inline-block;
    width: 100%;
    border-bottom: none !important;
    padding-bottom: 10px !important;
  }
}

.join_section {
  margin-bottom: 10px !important;
}

.offer-wrapper :deep(ul) {
  max-height: 180px;
  overflow-y: auto;
}

.mentor-container {
  width: 100%;

  .mentor-item-container {
    width: 100%;

    .mentor-img-container {
      position: relative;
      width: 263px;
      height: 300px;
      border-radius: 5px;
      box-shadow: 1px 1px 12px #5555553b;
      text-align: center;

      > img {
        position: absolute;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: top !important;
      }

      .mentor-logo-container {
        width: 80px;
        height: 80px;
        border: 4px solid red;
        border-radius: 50%;
        background-color: var(--color-surface);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        > img {
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          background: radial-gradient(circle at 50% 0px, #ffffff, rgba(255, 255, 255, 0) 58%);
        }
      }

      .mentor-name-container {
        margin-bottom: 40px !important;

        h6 {
          color: white;
          font-size: 14px;
          font-weight: 500;
          margin-top: 10px;
          margin-bottom: 5px;
        }

        p {
          padding: 3.5px 22px;
          background-color: var(--color-surface);
          border-radius: 25px;
          text-align: center;
        }
      }
    }

    .mentor-description {
      flex: 1;
    }
  }
}

@media only screen and (max-width: 768px) {
  .main {
    margin-top: 85px;
    height: calc(100vh - 165px);

    .c-button {
      margin-left: 0 !important;
      padding: 9px 20px !important;
      font-size: 14px !important;
    }
  }

  .mentor-container {
    width: 100%;

    .mentor-item-container {
      width: 100%;

      .mentor-img-container {
        width: 55%;
        margin: auto;
      }
    }
  }

  .super-cont {
    margin: 13px 10px 10px;
  }
  .right-part {
    display: none;
  }
  .titre_main {
    display: none !important;
  }
}

@media only screen and (max-width: 425px) {
  .main {
    margin-top: 75px;
    height: calc(100vh - 155px);
  }

  .mentor-container {
    width: 100%;

    .mentor-item-container {
      width: 100%;

      .mentor-img-container {
        width: 80%;
        margin: auto;
      }
    }
  }

  .mobile-logo {
    display: none;
  }

  .mobile-logo-2 {
    display: block !important;
  }

  .custom_navbar {
    position: relative !important;
  }

  .c-button {
    margin-left: 90% !important;
  }

  .join_btn {
    margin-bottom: 5px;
  }
}
</style>
