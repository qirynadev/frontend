<script setup lang="ts">
/**
 * Page Réglages — portage direct de `maquette/pwa/pages/reglages.html`.
 *
 * Fonctionnalités :
 * - Gestion des informations personnelles et coordonnées ;
 * - Modification du mot de passe et paramètres de sécurité ;
 * - Sélecteur de langue d'application (Intégré dynamiquement avec @nuxtjs/i18n) ;
 * - Paramètres de notifications et préférences de thème.
 */
import { useSessionStore } from '~/core/stores/session.store'

const { t, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const sessionStore = useSessionStore()

const currentLanguageLabel = computed(() => (locale.value === 'fr' ? 'Français' : 'English'))

function toggleLanguage() {
  const target = locale.value === 'fr' ? 'en' : 'fr'
  setLocale(target)
}

useHead({
  title: 'Réglages — Qiryna',
  meta: [
    { name: 'description', content: 'Gérez votre compte Qiryna, vos préférences de langue et la sécurité de vos données.' },
  ],
})
</script>

<template>
  <div class="flex flex-col gap-24 pb-24">
    <AppTopBar back back-to="/" />

    <div class="flex flex-col gap-4">
      <h1 class="m-0 text-xl font-bold tracking-tight text-navy">Réglages</h1>
      <p class="m-0 text-xs sm:text-sm font-medium text-slate-500">
        Gérez votre compte et vos préférences
      </p>
    </div>

    <!-- Section Compte -->
    <div class="flex flex-col gap-12">
      <h2 class="m-0 text-sm sm:text-base font-bold text-navy">Compte</h2>

      <div class="flex flex-col rounded-xl border border-slate-100 bg-white shadow-card divide-y divide-slate-100">
        <NuxtLink :to="localePath('/mon-projet')" class="flex items-center justify-between p-14 no-underline hover:bg-slate-50 transition-colors">
          <div class="flex items-center gap-12">
            <div class="flex size-40 items-center justify-center rounded-full bg-[#f5f3ff]">
              <QIcon name="user" :size="20" class="text-primary" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs sm:text-sm font-bold text-navy">Informations personnelles</span>
              <span class="text-3xs sm:text-xs text-slate-400">Modifiez vos informations personnelles</span>
            </div>
          </div>
          <QIcon name="chevron-right" :size="18" class="text-slate-400" />
        </NuxtLink>

        <NuxtLink :to="localePath('/mon-projet')" class="flex items-center justify-between p-14 no-underline hover:bg-slate-50 transition-colors">
          <div class="flex items-center gap-12">
            <div class="flex size-40 items-center justify-center rounded-full bg-[#f5f3ff]">
              <QIcon name="mail" :size="20" class="text-primary" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs sm:text-sm font-bold text-navy">Email et téléphone</span>
              <span class="text-3xs sm:text-xs text-slate-400">Mettez à jour vos coordonnées</span>
            </div>
          </div>
          <QIcon name="chevron-right" :size="18" class="text-slate-400" />
        </NuxtLink>

        <NuxtLink :to="localePath('/mot-de-passe-oublie')" class="flex items-center justify-between p-14 no-underline hover:bg-slate-50 transition-colors">
          <div class="flex items-center gap-12">
            <div class="flex size-40 items-center justify-center rounded-full bg-[#f5f3ff]">
              <QIcon name="lock" :size="20" class="text-primary" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs sm:text-sm font-bold text-navy">Mot de passe</span>
              <span class="text-3xs sm:text-xs text-slate-400">Changez votre mot de passe</span>
            </div>
          </div>
          <QIcon name="chevron-right" :size="18" class="text-slate-400" />
        </NuxtLink>
      </div>
    </div>

    <!-- Section Préférences -->
    <div class="flex flex-col gap-12">
      <h2 class="m-0 text-sm sm:text-base font-bold text-navy">Préférences</h2>

      <div class="flex flex-col rounded-xl border border-slate-100 bg-white shadow-card divide-y divide-slate-100">
        <button type="button" class="flex items-center justify-between p-14 text-left border-none bg-transparent hover:bg-slate-50 cursor-pointer transition-colors" @click="toggleLanguage">
          <div class="flex items-center gap-12">
            <div class="flex size-40 items-center justify-center rounded-full bg-[#def5e3]">
              <QIcon name="globe" :size="20" class="text-success" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs sm:text-sm font-bold text-navy">Langue de l'application</span>
              <span class="text-3xs sm:text-xs text-slate-400">Actuellement : {{ currentLanguageLabel }}</span>
            </div>
          </div>
          <span class="rounded-full bg-slate-100 px-10 py-4 text-2xs font-semibold text-navy">
            {{ currentLanguageLabel }}
          </span>
        </button>
      </div>
    </div>

    <TrustStrip />
  </div>
</template>
