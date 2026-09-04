<script setup lang="ts">
/**
 * Footer desktop ← chrome legacy (`Footer.vue`) : courbe, carrousel partenaires,
 * colonnes mentions / contact / newsletter, stores et réseaux.
 */
import { useCatalogStore } from '~/core/stores'

const ASSET = '/img/desktop/legacy'
const VISIBLE = 6
const localePath = useLocalePath()
const catalog = useCatalogStore()

if (!catalog.isReady) await catalog.load()

const email = ref('')
const carouselIndex = ref(0)
const paused = ref(false)

const partners = computed(() =>
  catalog.partners.filter(partner => partner.logo),
)

const maxIndex = computed(() => Math.max(0, partners.value.length - VISIBLE))
const showCarousel = computed(() => partners.value.length > 0)
const showArrows = computed(() => partners.value.length > VISIBLE)
const slidePercent = computed(() => 100 / VISIBLE)

function go(direction: 1 | -1) {
  if (!showArrows.value) return
  const next = carouselIndex.value + direction
  if (next < 0) carouselIndex.value = maxIndex.value
  else if (next > maxIndex.value) carouselIndex.value = 0
  else carouselIndex.value = next
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value) go(1)
  }, 4000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(partners, () => {
  carouselIndex.value = 0
})

const pages = computed(() => catalog.pages)
const settings = computed(() => catalog.settings)

function socialIcon(name: string): string | null {
  const file = name === 'twitter' ? 'x' : name
  const known = ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'x']
  if (!known.includes(file)) return null
  return `${ASSET}/social/${file}-outline.svg`
}

function onNewsletterSubmit(event: Event) {
  event.preventDefault()
}
</script>

<template>
  <footer class="w-full">
    <img
      :src="`${ASSET}/courbe-footer.png`"
      alt=""
      width="1360"
      height="89"
      class="block h-auto w-full"
    >

    <div class="bg-[#273c66]">
      <div class="mx-auto max-w-[1100px] px-16 pb-32">
        <!-- Carrousel partenaires -->
        <div
          v-if="showCarousel"
          class="relative z-0 top-[-100px] rounded-md bg-white px-56 pt-50 pb-30 shadow-[1px_1px_12px_#5555553b]"
          @mouseenter="paused = true"
          @mouseleave="paused = false"
        >
          <div class="overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-out"
              :style="{ transform: `translateX(-${carouselIndex * slidePercent}%)` }"
            >
              <div
                v-for="partner in partners"
                :key="partner.id"
                class="flex h-87 shrink-0 items-center justify-center px-6"
                :style="{ width: `${slidePercent}%` }"
              >
                <a
                  v-if="partner.url"
                  :href="partner.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex h-full items-center justify-center"
                >
                  <img :src="partner.logo!" :alt="partner.name" class="max-h-87 max-w-full object-contain">
                </a>
                <img
                  v-else
                  :src="partner.logo!"
                  :alt="partner.name"
                  class="max-h-87 max-w-full object-contain"
                >
              </div>
            </div>
          </div>
          <button
            v-if="showArrows"
            type="button"
            class="absolute top-1/2 left-12 flex size-36 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e5e7eb] bg-white p-0 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            :aria-label="$t('ds.pager.previous')"
            @click="go(-1)"
          >
            <span class="size-20 overflow-clip">
              <img src="/img/desktop/domaines/nav-prev.svg" alt="" width="20" height="20" class="block size-full">
            </span>
          </button>
          <button
            v-if="showArrows"
            type="button"
            class="absolute top-1/2 right-12 flex size-36 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e5e7eb] bg-white p-0 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            :aria-label="$t('ds.pager.next')"
            @click="go(1)"
          >
            <span class="size-20 overflow-clip">
              <img src="/img/desktop/domaines/nav-next.svg" alt="" width="20" height="20" class="block size-full">
            </span>
          </button>
        </div>

        <div :class="showCarousel ? 'mt-[-45px]' : 'pt-48'">
          <div class="relative flex flex-wrap items-start justify-between px-4">
            <div class="w-full lg:w-1/4">
              <NuxtLink :to="localePath('/')" class="inline-flex items-start no-underline" :aria-label="$t('nav.home')">
                <img
                  src="/img/desktop/logo-nav.png"
                  alt="Qiryna"
                  width="174"
                  height="65"
                  class="mt-15 h-65 w-174 object-contain object-left"
                >
              </NuxtLink>
            </div>

            <div class="mt-[-10px] w-full lg:w-1/4">
              <h3 class="my-10 text-[20px] font-medium text-white">{{ $t('desktop.footer.mention') }}</h3>
              <ul class="m-0 flex list-none flex-col p-0">
                <li v-for="page in pages" :key="page.id" class="mt-15">
                  <NuxtLink
                    :to="localePath(`/pages/${page.slug}`)"
                    class="text-[15px] uppercase text-white no-underline"
                  >
                    {{ page.title }}
                  </NuxtLink>
                </li>
                <template v-if="pages.length === 0">
                  <li class="mt-15">
                    <NuxtLink :to="localePath('/reglages/mentions')" class="text-[15px] uppercase text-white no-underline">
                      {{ $t('desktop.footer.legalNotice') }}
                    </NuxtLink>
                  </li>
                  <li class="mt-15">
                    <NuxtLink :to="localePath('/reglages/mentions')" class="text-[15px] uppercase text-white no-underline">
                      {{ $t('desktop.footer.privacy') }}
                    </NuxtLink>
                  </li>
                </template>
              </ul>
            </div>

            <div class="mt-[-10px] w-full lg:w-1/4">
              <h3 class="my-10 text-[20px] font-medium text-white">{{ $t('desktop.footer.contactUs') }}</h3>
              <ul class="m-0 flex list-none flex-col gap-12 p-0">
                <li v-if="settings?.email">
                  <a
                    :href="`mailto:${settings.email}`"
                    class="flex items-center gap-8 text-[15px] text-white no-underline"
                  >
                    <span class="flex size-32 shrink-0 items-center justify-center overflow-clip rounded-full bg-white">
                      <img src="/img/icons/reglages-profil/ic-rp-email-tile.svg" alt="" width="32" height="32" class="block size-32">
                    </span>
                    {{ settings.email }}
                  </a>
                </li>
                <li v-if="settings?.phone">
                  <a
                    :href="`tel:${settings.phone}`"
                    class="flex items-center gap-8 text-[15px] text-white no-underline"
                  >
                    <span class="flex size-32 shrink-0 items-center justify-center overflow-clip rounded-full bg-white">
                      <img src="/img/icons/reglages-profil/ic-rp-phone-tile.svg" alt="" width="32" height="32" class="block size-32">
                    </span>
                    {{ settings.phone }}
                  </a>
                </li>
              </ul>
            </div>

            <div class="mt-[-10px] w-full ps-10 lg:w-1/4">
              <h3 class="my-10 text-[20px] font-medium text-white">{{ $t('desktop.footer.newsletter') }}</h3>
              <form
                class="mt-20 mr-10 flex items-center justify-between rounded-full bg-white py-2 pr-2 pl-5"
                @submit="onNewsletterSubmit"
              >
                <label class="sr-only" for="desktop-newsletter-email">{{ $t('desktop.footer.emailPlaceholderLegacy') }}</label>
                <input
                  id="desktop-newsletter-email"
                  v-model="email"
                  type="email"
                  required
                  :placeholder="$t('desktop.footer.emailPlaceholderLegacy')"
                  class="min-w-0 flex-1 border-0 bg-transparent py-8 pl-10 text-[13px] text-[#273c66] outline-none placeholder:text-[#757575]"
                >
                <button
                  type="submit"
                  class="flex size-38 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#ff3942] p-0 transition-colors hover:bg-[#273c66]"
                  :aria-label="$t('desktop.footer.subscribe')"
                >
                  <img :src="`${ASSET}/mail.png`" alt="" width="20" height="20" class="size-20 object-contain">
                </button>
              </form>
            </div>
          </div>

          <div class="relative mt-30 flex justify-between border-t border-[#c0c0c0] pt-20">
            <div class="w-full lg:w-1/2">
              <span class="text-[14px] text-white">{{ $t('desktop.footer.download') }}</span>
              <ul class="mt-10 mb-0 flex list-none gap-10 p-0">
                <li>
                  <img :src="`${ASSET}/app-store.svg`" alt="App Store" width="120" height="40" class="h-40 w-auto">
                </li>
                <li>
                  <img :src="`${ASSET}/google-play.svg`" alt="Google Play" width="134" height="40" class="h-40 w-134 object-contain">
                </li>
              </ul>
            </div>
            <div class="flex w-full items-center justify-end pe-3 lg:w-1/2">
              <ul class="mb-8 flex list-none items-center gap-12 p-0">
                <li class="me-12 text-[18px] text-white">{{ $t('desktop.footer.follow') }}</li>
                <li v-for="social in settings?.socials ?? []" :key="social.name">
                  <a
                    v-if="socialIcon(social.name)"
                    :href="social.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex size-32 items-center justify-center rounded-full border border-[#c9c9c9] bg-white"
                    :aria-label="social.name"
                  >
                    <img
                      :src="socialIcon(social.name)!"
                      alt=""
                      width="22"
                      height="22"
                      class="size-22 p-5"
                    >
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
