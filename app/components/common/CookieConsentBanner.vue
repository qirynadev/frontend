<script setup lang="ts">
/**
 * Bannière de consentement cookies — montée une fois dans `app.vue`.
 *
 * Inspirée de l'ancienne implémentation (`legacy/src/components/atoms/
 * CookieBanner.vue`), avec trois différences volontaires :
 * - le choix est stocké dans un cookie (`useCookieConsent`), pas
 *   `localStorage` — seul stockage client interdit par ce projet, voir
 *   `core/http/session.ts` ;
 * - `QSheet` en mode `persistent` : ni `Échap` ni clic hors panneau ne la
 *   ferme, seul un choix explicite le fait — une fermeture implicite n'a pas
 *   de valeur de consentement ;
 * - `side="bottom-modal"` (2026-09-22, demande du responsable) : panneau bas
 *   sur mobile, modale centrée sur desktop — un bandeau tout en bas d'un
 *   écran 1728px passait facilement inaperçu.
 *
 * Refuser est aussi simple qu'accepter (2026-11-02) : même bouton, un seul clic,
 * au même niveau. « Personnaliser » ouvre les deux catégories, mesure d'audience
 * et marketing, décochées par défaut.
 */
const { choice, accept, decline, choose } = useCookieConsent()
const localePath = useLocalePath()
const route = useRoute()

const customizing = ref(false)
const measure = ref(false)
const marketing = ref(false)

/**
 * Masquée sur `/pages/cookies` : cette page porte son propre formulaire de
 * choix en bas de contenu (voir `pages/[slug].vue`) — la bannière par-dessus
 * ferait doublon et gênerait la lecture de la page qu'elle-même invite à
 * consulter (« En savoir plus »).
 */
const onCookiesPage = computed(() => route.name?.toString().startsWith('pages-slug') && route.params.slug === 'cookies')

/** Ouverte tant qu'aucun choix n'a été fait ; `set` ignore toute tentative de fermeture implicite. */
const open = computed({
  get: () => choice.value === null && !onCookiesPage.value,
  set: (value) => {
    if (value) return
  },
})
</script>

<template>
  <QSheet
    v-model:open="open"
    side="bottom-modal"
    persistent
    hide-title
    :title="$t('cookieBanner.title')"
  >
    <div class="flex items-start gap-12">
      <span class="flex size-44 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft">
        <QIcon name="ic-rml-cookies" :size="24" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="m-0 text-lg leading-20 font-bold text-text">{{ $t('cookieBanner.title') }}</p>
        <p class="m-0 mt-4 text-base leading-[19.5px] font-normal text-muted-2">
          {{ $t('cookieBanner.message') }}
          <NuxtLink :to="localePath('/pages/cookies')" class="font-semibold text-primary-link no-underline">
            {{ $t('cookieBanner.learnMore') }}
          </NuxtLink>
        </p>
      </div>
    </div>

    <div v-if="customizing" class="flex flex-col gap-12">
      <div class="flex items-center gap-12">
        <div class="min-w-0 flex-1">
          <p class="m-0 text-base leading-20 font-semibold text-text">{{ $t('legalCookies.audienceTitle') }}</p>
          <p class="m-0 text-sm leading-16 text-muted-2">{{ $t('legalCookies.audienceDesc') }}</p>
        </div>
        <AppLegalSwitch v-model="measure" :label="$t('legalCookies.audienceTitle')" />
      </div>
      <div class="flex items-center gap-12">
        <div class="min-w-0 flex-1">
          <p class="m-0 text-base leading-20 font-semibold text-text">{{ $t('legalCookies.adsTitle') }}</p>
          <p class="m-0 text-sm leading-16 text-muted-2">{{ $t('legalCookies.adsDesc') }}</p>
        </div>
        <AppLegalSwitch v-model="marketing" :label="$t('legalCookies.adsTitle')" />
      </div>
      <QButton variant="outline" tone="primary" block @click="choose(measure, marketing)">
        {{ $t('cookieBanner.saveChoices') }}
      </QButton>
    </div>

    <div class="flex gap-10">
      <QButton variant="solid" tone="primary" block @click="decline">
        {{ $t('cookieBanner.decline') }}
      </QButton>
      <QButton variant="solid" tone="primary" block @click="accept">
        {{ $t('cookieBanner.accept') }}
      </QButton>
    </div>

    <button
      v-if="!customizing"
      type="button"
      class="cursor-pointer self-center border-0 bg-transparent p-4 text-base leading-20 font-semibold text-primary-link"
      @click="customizing = true"
    >
      {{ $t('cookieBanner.customize') }}
    </button>
  </QSheet>
</template>
