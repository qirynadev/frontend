<script setup lang="ts">
/**
 * Navbar intégrée à la carte auth (Figma Inscription-V2 `640:22`).
 * Posée au-dessus du split formulaire / hero — pas dans le shell global.
 */
withDefaults(
  defineProps<{ variant?: 'signup' | 'signin' }>(),
  { variant: 'signup' },
)

const localePath = useLocalePath()
const { locale, setLocale } = useI18n()

const flagSrc = computed(() =>
  locale.value === 'fr' ? '/img/desktop/flag-en.png' : '/img/desktop/flag-fr.png',
)

async function toggleLocale() {
  await setLocale(locale.value === 'fr' ? 'en' : 'fr')
}
</script>

<template>
  <!-- Intégrée à la carte — panneau droit hero visible derrière (z-10) -->
  <header
    class="relative z-10 box-border flex h-80 shrink-0 items-center justify-between bg-transparent py-15 pl-[clamp(24px,8.68vw,150px)] pr-55 lg:pr-90"
  >
    <NuxtLink :to="localePath('/')" class="shrink-0 no-underline" :aria-label="$t('nav.home')">
      <img
        src="/img/desktop/logo-nav.png"
        alt="Qiryna"
        width="134"
        height="50"
        class="block h-50 w-134 object-contain"
      >
    </NuxtLink>

    <div class="flex shrink-0 items-center gap-20">
      <template v-if="variant === 'signup'">
        <span class="hidden text-2xl leading-[22.5px] font-medium tracking-[-0.24px] text-[#1f2937] sm:inline">
          {{ $t('desktop.nav.alreadyAccount') }}
        </span>
        <NuxtLink
          :to="localePath('/connexion')"
          class="inline-flex w-126 items-center justify-center rounded-[10px] border border-[#fc1333] bg-[#fdfdfd] px-16 py-10 text-xl leading-20 font-semibold tracking-[-0.154px] text-[#fc1333] no-underline"
        >
          {{ $t('auth.signIn') }}
        </NuxtLink>
      </template>
      <template v-else>
        <NuxtLink
          :to="localePath('/mot-de-passe')"
          class="hidden text-2xl leading-[22.5px] font-medium tracking-[-0.24px] text-[#1f2937] no-underline sm:inline"
        >
          {{ $t('auth.forgotPassword') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/inscription')"
          class="inline-flex min-w-121 items-center justify-center rounded-full bg-desktop-brand px-20 py-10 text-xl leading-20 font-semibold tracking-[-0.154px] text-white no-underline"
        >
          {{ $t('auth.signUp') }}
        </NuxtLink>
      </template>

      <button
        type="button"
        class="flex h-38 w-66 shrink-0 cursor-pointer items-center justify-center gap-10 overflow-visible rounded-[10px] border-0 bg-[#fbfbfd] px-6 py-5 shadow-[0_0_2.5px_rgba(0,0,0,0.04)]"
        :aria-label="$t('desktop.nav.language')"
        @click="toggleLocale"
      >
        <img :src="flagSrc" alt="" width="28" height="28" class="size-28 shrink-0 rounded-full object-cover">
        <svg
          class="block h-7 w-12 shrink-0"
          viewBox="0 0 11.5 6.5"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0.75 0.75L5.75 5.75L10.75 0.75"
            stroke="#000025"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
