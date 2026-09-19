<script setup lang="ts">
/**
 * Topbar desktop ← chrome legacy (`NavBar.vue` + `Menu.vue`).
 *
 * Variantes auth inchangées (écrans connexion / mot de passe).
 * Variante app : logo 174×65, menus au hover, pilule Orientation.
 * Le CTA « Se connecter » (et l’avatar si session) est conservé.
 */
import {
  desktopNavEntryHref,
  desktopNavFlag,
  desktopNavSections,
  desktopSchoolCountries,
  type DesktopNavSectionId,
} from '~/config/desktop-navigation'
import { useCatalogStore, useSessionStore } from '~/core/stores'

const props = withDefaults(
  defineProps<{ variant?: 'default' | 'auth' | 'auth-reset' }>(),
  { variant: 'default' },
)

const localePath = useLocalePath()
const { t, locale, setLocale } = useI18n()
const session = useSessionStore()
const catalog = useCatalogStore()

if (!catalog.isReady) await catalog.load()

const flagSrc = computed(() =>
  locale.value === 'fr' ? '/img/desktop/flag-en.png' : '/img/desktop/flag-fr.png',
)

async function toggleLocale() {
  await setLocale(locale.value === 'fr' ? 'en' : 'fr')
}

const isAuthLogin = computed(() => props.variant === 'auth')
const isAuthReset = computed(() => props.variant === 'auth-reset')
const isAuthScreen = computed(() => isAuthLogin.value || isAuthReset.value)

const { openId } = useDesktopNavMenu()

const navItems = computed(() =>
  desktopNavSections.map((section) => {
    const menuSection = catalog.menu?.[section.id]
    const catalogEntries = (menuSection?.entries ?? []).map(entry => ({
      title: entry.title,
      href: desktopNavEntryHref(section.id as DesktopNavSectionId, entry.slug),
      flag: desktopNavFlag(entry.slug),
    }))
    const fallbackEntries = section.id === 'destinations'
      ? desktopSchoolCountries.map(country => ({
          title: t(country.labelKey),
          href: `/destinations/${country.slug}`,
          flag: country.flagSrc,
        }))
      : []
    const items = catalogEntries.length > 0 ? catalogEntries : fallbackEntries
    return {
      id: section.id,
      label: menuSection?.label || t(section.fallbackLabelKey),
      to: section.to,
      items,
    }
  }),
)
</script>

<template>
  <header
    class="sticky top-0 z-50 box-border w-full overflow-visible bg-white"
    :class="isAuthScreen
      ? 'flex h-80 items-stretch border-b border-[#f1f1f3] bg-white/70 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-sm'
      : 'h-80 border-b border-[rgba(229,232,240,0.85)]'"
  >
    <!-- Auth : barre pleine largeur, logo / CTAs dans la colonne boxed (comme l’accueil). -->
    <div v-if="isAuthScreen" class="desktop-boxed flex h-full min-w-0 items-stretch justify-between">
      <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center self-center no-underline" :aria-label="$t('nav.home')">
        <img
          src="/img/desktop/logo-nav.png"
          alt="Qiryna"
          width="174"
          height="65"
          class="block h-65 w-auto max-w-174 object-contain"
        >
      </NuxtLink>
      <div class="flex shrink-0 items-center self-center gap-20">
        <template v-if="isAuthLogin">
          <NuxtLink
            :to="localePath('/mot-de-passe')"
            class="text-2xl leading-[22.5px] font-medium tracking-[-0.24px] text-[#1f2937] no-underline"
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
        <template v-else>
          <span class="text-2xl leading-[22.5px] font-medium tracking-[-0.24px] text-[#1f2937]">
            {{ $t('desktop.nav.alreadyAccount') }}
          </span>
          <NuxtLink
            :to="localePath('/connexion')"
            class="inline-flex w-126 items-center justify-center rounded-[10px] border border-[#fc1333] bg-[#fdfdfd] px-16 py-10 text-xl leading-20 font-semibold tracking-[-0.154px] text-[#fc1333] no-underline"
          >
            {{ $t('auth.signIn') }}
          </NuxtLink>
        </template>
        <button
          type="button"
          class="flex cursor-pointer items-center justify-center border-0 bg-[#fbfbfd] shadow-[0_0_2.5px_rgba(0,0,0,0.04)]"
          :class="isAuthReset
            ? 'h-38 w-66 shrink-0 gap-10 rounded-[10px] px-6 py-5'
            : 'size-38 rounded-full p-5'"
          :aria-label="$t('desktop.nav.language')"
          @click="toggleLocale"
        >
          <img :src="flagSrc" alt="" width="28" height="28" class="size-28 shrink-0 rounded-full object-cover">
        </button>
      </div>
    </div>

    <!-- App : menu centré dans l’espace entre le logo et le CTA Orientation. -->
    <div v-else class="desktop-boxed flex h-full items-center">
      <NuxtLink
        :to="localePath('/')"
        class="relative z-1 flex shrink-0 items-center no-underline"
        :aria-label="$t('nav.home')"
      >
        <img
          src="/img/desktop/logo-nav.png"
          alt="Qiryna"
          width="174"
          height="65"
          class="block h-65 w-auto max-w-174 object-contain"
        >
      </NuxtLink>

      <nav
        class="relative z-1 hidden min-w-0 flex-1 items-center justify-center self-stretch shell:flex"
        :aria-label="$t('desktop.nav.label')"
      >
        <div class="flex h-full items-center gap-18">
          <template v-for="item in navItems" :key="item.id">
            <AppDesktopNavDropdown
              v-if="item.items.length > 0"
              :menu-id="item.id"
              :label="item.label"
              :to="item.to"
              :items="item.items"
              :open="openId === item.id"
            />
            <AppDesktopNavItem v-else :to="item.to">
              {{ item.label }}
            </AppDesktopNavItem>
          </template>
        </div>
      </nav>

      <div class="relative z-1 ml-auto flex h-full shrink-0 items-center gap-20">
        <NuxtLink
          :to="localePath('/orientation')"
          class="flex h-48 items-center justify-center gap-8 rounded-full bg-[#fc1e3d] px-24 text-[16px] font-semibold whitespace-nowrap text-white no-underline transition-colors duration-150 hover:bg-[#e2122f]"
        >
          <img src="/img/desktop/orientation/pin.svg" alt="" width="16" height="16" class="size-16 shrink-0">
          {{ $t('desktop.nav.orientation') }}
        </NuxtLink>

        <button
          type="button"
          class="flex size-26 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          :aria-label="$t('desktop.nav.language')"
          @click="toggleLocale"
        >
          <img :src="flagSrc" alt="" width="26" height="26" class="size-26 shrink-0 rounded-full object-cover">
        </button>

        <AppDesktopAccountMenu v-if="session.isAuthenticated" />
        <NuxtLink
          v-else
          :to="localePath('/connexion')"
          class="inline-flex items-center justify-center rounded-full border border-desktop-brand bg-white px-16 py-10 text-xl leading-20 font-semibold text-desktop-brand no-underline"
        >
          {{ $t('auth.signIn') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
