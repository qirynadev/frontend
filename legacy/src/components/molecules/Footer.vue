<script lang="ts" setup>
import { useAppStore } from "@/stores";
import { ArrowLeftBold, ArrowRightBold } from "@element-plus/icons-vue";
import { type ComputedRef, computed, ref } from "vue";
import { Carousel, Navigation, Slide } from "vue3-carousel";
import "vue3-carousel/dist/carousel.css";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute } from "vue-router";
import { i18nRoute } from "@/utils";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/vue/20/solid";
import { ElNotification } from "element-plus";
import { storeToRefs } from "pinia";
import i18n from "@/i18n";

const { t } = useI18n();
const { addToNewsletter } = useAppStore();
const { partnersList, pageList, getSettings } = storeToRefs(useAppStore());

// Pages dont l'écran mobile Figma se termine sur sa propre bottom nav : on masque le footer
// public en dessous de lg pour éviter qu'il s'affiche après.
const CUSTOM_MOBILE_FOOTER_ROUTES = [
  "home",
  "destinations",
  "choose-destination",
  "schools",
  "school-presentation",
  "choose-language",
  "user-messages",
  "profilage-landing",
  "profilage-formulas",
  "living-formulas",
  "user-project",
  "order-success",
  "user-courses-teachers",
  "profilage-project",
  "area-formula",
  "living-choose-destination",
  "user-project-living",
  "courses-formulas",
];
const route = useRoute();
const isHomeRoute = computed(
  () =>
    ["/", "/fr", "/en"].includes(route.path) ||
    CUSTOM_MOBILE_FOOTER_ROUTES.some((r) => String(route.name ?? "").endsWith(`.${r}`)),
);

const settings = getSettings;

const { break320, break768, break1024, break1366, break1600 } = defineProps({
  itemsToShow: {
    type: Number,
    required: false,
    default: 4.2,
  },
  break320: {
    type: Number,
    required: false,
    default: 1,
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
    default: 5,
  },
  break1600: {
    type: Number,
    required: false,
    default: 5,
  },
});

const breakPoints = {
  // 1366 and up
  1600: {
    itemsToShow: break1600,
    snapAlign: "center",
  },
  // 1366 and up
  1366: {
    itemsToShow: break1366,
    snapAlign: "center",
  },
  // 1024 and up
  1024: {
    itemsToShow: break1024,
    snapAlign: "center",
  },
  // 768px and up
  768: {
    itemsToShow: break768,
    snapAlign: "center",
  },

  // 320  and up
  320: {
    itemsToShow: break320,
    snapAlign: "center",
  },
};

const newsletterEmail = ref("");
const saveToNewsletter = async () => {
  if (newsletterEmail.value.length === 0) {
    return;
  }

  if (!newsletterEmail.value.includes("@")) {
    ElNotification({
      type: "error",
      message: "Veuillez entrer une adresse email valide",
    });
    return;
  }

  const response = await addToNewsletter(newsletterEmail.value, t);
  if (response) {
    newsletterEmail.value = "";
  }
};
</script>

<template>
  <div class="footer" :class="{ 'hidden lg:block': isHomeRoute }">
    <div class="max-w-full h-auto lg:block hidden">
      <img src="@/assets/images/courbe-footer.png" class="w-full h-full" />
    </div>

    <div class="bg-[#273c66]">
      <div
        :class="{
          'p-5 lg:hidden': ['/', '/fr', '/en'].includes($route.path),
          hidden: !['/', '/fr', '/en'].includes($route.path),
        }"
      >
        <form
          @submit.prevent="saveToNewsletter"
          class="input_container flex justify-between relative items-center lg:mt-[20px]"
        >
          <input
            v-model="newsletterEmail"
            class="placeholder:text-[13px] placeholder:text-[#757575]"
            type="text"
            :placeholder="$t('newsletter-placeholder')"
          />
          <button class="flex items-center justify-center mail_sub" type="submit">
            <img src="@/assets/images/mail_svgrepo_com.png" />
          </button>
        </form>
      </div>

      <div class="global-container mb-0! lg:mb-auto">
        <div
          class="shadow-[1px_1px_12px_#5555553b] max-h-[170px] bg-surface rounded-md hidden lg:block relative px-[40px] py-[30px] lg:pt-[50px] lg:top-[-100px] z-0"
        >
          <Carousel
            :itemsToScroll="1"
            :mouseDrag="true"
            :itemsToShow="6"
            :wrapAround="false"
            :transition="500"
            :autoplay="4000"
            :pauseAutoplayOnHover="true"
            class="footer-carousel"
          >
            <Slide class="test" v-for="(item, index) in partnersList" :key="index">
              <div class="carousel__item">
                <img :src="item.logo" alt="" class="h-[87px]" />
              </div>
            </Slide>
            <!-- <Slide
              v-if="isFetching"
              class="test"
              v-for="(item, index) in 5"
              :key="index"
            >
              <TagLoaderVue :nbrLine="3" size="medium" :data="item" />
            </Slide> -->

            <template #addons>
              <Navigation>
                <template #next>
                  <div class="">
                    <el-button link :icon="ArrowRightBold"></el-button>
                  </div>
                </template>
                <template #prev>
                  <div class="">
                    <el-button :icon="ArrowLeftBold" link></el-button>
                  </div>
                </template>
              </Navigation>
            </template>
          </Carousel>
        </div>

        <div class="hidden lg:block">
          <div class="flex items-start justify-between flex-wrap px-4 mt-[-45px] h-[15Opx] relative">
            <div class="w-full lg:w-1/4 logo-container">
              <router-link :to="i18nRoute({ name: 'home' })" class="flex items-start">
                <img src="@/assets/images/logo-footer.svg" class="h-[73px] w-[169px] mt-[15px]" />
              </router-link>
            </div>
            <div class="w-full lg:w-1/4 mt-[-10px]">
              <h4 class="text-white text-[20px] font-medium my-[10px]">
                {{ $t("mention") }}
              </h4>
              <ul class="footer_links p-0">
                <li v-for="(page, index) in pageList" :key="index" class="mt-[15px]">
                  <router-link
                    :to="
                      i18nRoute({
                        name: page.slug,
                        params: { slug: i18n.global.locale.value },
                      })
                    "
                    class="uppercase text-[15px]"
                  >
                    {{ page.title }}
                  </router-link>
                </li>
              </ul>
            </div>
            <div class="w-full lg:w-1/4 mt-[-10px]">
              <h4 class="text-white text-[20px] font-medium my-[10px]">
                {{ $t("contact-us") }}
              </h4>
              <ul class="footer_links p-0">
                <li>
                  <RouterLink :to="i18nRoute({ name: 'contact' })" class="flex items-center gap-2 text-[15px]">
                    <div class="rounded-full bg-white p-1">
                      <EnvelopeIcon class="h-6 w-6 text-black" />
                    </div>
                    {{ settings?.site?.email }}
                  </RouterLink>
                </li>
                <li class="mt-2 flex items-center gap-2 text-[15px]">
                  <div class="rounded-full bg-white p-1">
                    <PhoneIcon class="h-6 w-6 text-black" />
                  </div>
                  {{ settings?.site?.phone }}
                </li>
              </ul>
            </div>
            <div class="w-full lg:w-1/4 mt-[-10px] ps-[10px]">
              <h4 class="text-white text-[20px] font-medium my-[10px]">
                {{ $t("newsletter") }}
              </h4>
              <form
                @submit.prevent="saveToNewsletter"
                class="input_container flex justify-between relative items-center mt-[20px] mr-[10px]"
              >
                <input
                  v-model="newsletterEmail"
                  class="placeholder:text-[13px] placeholder:text-[#757575]"
                  type="email"
                  required
                  :placeholder="$t('newsletter-placeholder')"
                />
                <button class="flex items-center justify-center mail_sub" type="submit">
                  <EnvelopeIcon class="h-6 w-6 text-white" />
                </button>
              </form>
            </div>
          </div>
          <div class="border-t border-[#c0c0c0] flex justify-between mt-[30px] relative">
            <div class="w-ful lg:w-1/2 blocdroitreserve pt-[20px]">
              <span class="text-white text-[14px]">{{ $t("download") }}</span>
              <ul class="p-0 flex mt-[10px] m-0">
                <li style="margin-right: 10px">
                  <a :href="settings?.site?.appstore ?? '#'">
                    <img src="@/assets/images/AppStore.svg" alt="" class="" />
                  </a>
                </li>
                <li>
                  <a :href="settings?.site?.playstore ?? '#'">
                    <img src="@/assets/images/Googleplay.svg" alt="" class="w-[134px]" />
                  </a>
                </li>
              </ul>
            </div>

            <div class="w-full lg:w-1/2 pe-3 flex justify-end items-center">
              <ul class="flex gap-3 items-center blocfooterlink mb-[8px]">
                <li class="me-3 text-white text-[18px]">
                  {{ $t("follow") }}
                </li>
                <li v-for="(social, index) in settings?.socials" :key="index">
                  <a
                    :href="social.url"
                    target="_blank"
                    class="rounded-full border border border-[#c9c9c9] bg-white flex justify-center items-center"
                  >
                    <img
                      :src="`/images/socials/${String(social.name).toLowerCase()}-outline.svg`"
                      alt=""
                      class="h-[32px] w-[32px] p-[5px]"
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.global-container {
  position: relative;
  /*   top: -139px; */
  max-width: 1100px;
  padding-right: 15px;
  overflow: visible !important;
}

.log_footer {
  width: 36px;
  height: 36px;
  filter: invert(1);
}

.footer_links {
  a {
    color: white;
  }

  li {
    color: white;

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  .icon {
    width: 30px;
  }
}

.input_container {
  background-color: white;
  border-radius: 50px;
  padding: 2px 2px 2px 5px;

  input {
    border: none;
    padding-left: 10px;
    outline: none;
    width: 80%;

    &:focus {
      border: none;
      outline: none;
    }
  }
}

.mail_sub {
  border: none;
  background-color: #ff3942;
  width: 45px;
  height: 38px;
  border-radius: 50px;
  transition: background 0.2s ease-in;

  img {
    width: 20px;
  }

  &:hover {
    background-color: #273c66;
  }
}

.traitfooter {
  border-top: 1px solid silver;
  margin-top: 25px;
  padding: 20px 0;
}

.slider_logo {
  background-color: white;
  height: 170px;
  border-radius: 5px;
  box-shadow: 1px 1px 12px #5555553b;
  margin: auto;
  overflow: hidden;

  &.carousel__prev {
    left: -35px !important;
  }
  &.carousel__next {
    right: -35px !important;
  }
}

.carousel__slide {
  padding: 0px 6px;
}

.carousel__slide--sliding {
  transition: 0.5s;
}

//Responsive

@media only screen and (max-width: 768px) {
  .logo-container {
    img {
      width: 100%;
      height: 100%;
    }
  }
}

@media only screen and (max-width: 430px) {
  .footer-container {
    text-align: center;
  }

  .blocfooterlink {
    justify-content: center;
  }

  .blocdroitreserve {
    text-align: center;

    ul {
      justify-content: center;
    }
  }

  .logo-container {
    width: 200px;
    margin: 0 auto 20px auto;
  }
}
</style>
