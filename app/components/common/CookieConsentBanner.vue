<script setup lang="ts">
/**
 * Bannière de consentement cookies — montée une fois dans `app.vue`.
 *
 * Inspirée de l'ancienne implémentation (`legacy/src/components/atoms/
 * CookieBanner.vue`), avec deux différences volontaires :
 * - le choix est stocké dans un cookie (`useCookieConsent`), pas
 *   `localStorage` — seul stockage client interdit par ce projet, voir
 *   `core/http/session.ts` ;
 * - `QSheet` en mode `persistent` : ni `Échap` ni clic hors panneau ne la
 *   ferme, seul un choix explicite le fait — une fermeture implicite n'a pas
 *   de valeur de consentement.
 *
 * Binaire (accepter/refuser), pas de personnalisation par catégorie : le
 * seul cookie non essentiel du site aujourd'hui est Google Analytics (voir
 * `plugins/analytics.client.ts`) — proposer un choix par catégorie sans
 * deuxième catégorie réelle simulerait une granularité qui n'existe pas.
 */
const { choice, accept, decline } = useCookieConsent()
const localePath = useLocalePath()

/** Ouverte tant qu'aucun choix n'a été fait ; `set` ignore toute tentative de fermeture implicite. */
const open = computed({
  get: () => choice.value === null,
  set: (value) => {
    if (value) return
  },
})
</script>

<template>
  <QSheet
    v-model:open="open"
    side="bottom"
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

    <div class="flex gap-10">
      <QButton variant="outline" tone="neutral" block @click="decline">
        {{ $t('cookieBanner.decline') }}
      </QButton>
      <QButton variant="solid" tone="primary" block @click="accept">
        {{ $t('cookieBanner.accept') }}
      </QButton>
    </div>
  </QSheet>
</template>
