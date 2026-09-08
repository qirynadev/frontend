<script setup lang="ts">
/**
 * Page éditoriale — CGU, cookies, FAQ, confidentialité.
 *
 * **Aucune maquette ne décrit cet écran.** Il est né d'un besoin concret : la
 * case à cocher de l'inscription renvoie aux conditions générales et à la
 * politique de confidentialité. Un consentement qui pointe vers une 404 n'est
 * pas un consentement.
 *
 * Il n'invente donc rien : barre supérieure et bandeau de réassurance déjà
 * portés, titre de la page, et le HTML éditorial du back-office rendu par
 * `RichText` — donc **déjà assaini par l'adapter**, jamais un `v-html` nu.
 *
 * Les quatre slugs administrés en recette : `cgu`, `cookies`, `faq`, `privacy`.
 * Tout autre slug lève un vrai 404 : ces pages sont indexables, une inexistante
 * ne doit pas répondre 200.
 */
import { pageRepo } from '~/core/repositories'

const route = useRoute()
const { t, locale } = useI18n()

const slug = computed(() => String(route.params.slug ?? ''))

/**
 * Formulaire de choix cookies, en bas de contenu — seulement sur cette page
 * (`CookieConsentBanner` s'y masque, voir son docblock) et seulement tant
 * qu'aucun choix n'a été fait : redondant sinon.
 */
const { choice, accept, decline } = useCookieConsent()
const showCookieChoice = computed(() => slug.value === 'cookies' && choice.value === null)

const { data: page, apiError, isInitialLoading, refresh } = await usePageData(
  `page-${slug.value}`,
  () => pageRepo.bySlug(slug.value, locale.value),
  { watch: [slug, locale] },
)

if (page.value === null && !apiError.value) {
  throw createError({ statusCode: 404, statusMessage: t('page.notFound'), fatal: true })
}

useContractSeo(() => page.value?.seo, page.value?.title ?? t('page.fallbackTitle'))
</script>

<template>
  <div>
    <AppTopBar back back-to="/" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-16">
          <QSkeleton variant="text" :lines="2" />
          <QSkeleton variant="text" :lines="8" />
        </div>
      </template>

      <template v-if="page">
        <h1 class="m-0 pb-16 text-4xl leading-normal font-semibold tracking-tight text-text">
          {{ page.title }}
        </h1>

        <RichText :content="page.content" />

        <div v-if="showCookieChoice" class="mt-24 rounded-xl bg-surface-2 p-16">
          <p class="m-0 text-lg leading-20 font-bold text-text">{{ $t('cookieBanner.pageFormTitle') }}</p>
          <p class="m-0 mt-4 text-base leading-[19.5px] font-normal text-muted-2">
            {{ $t('cookieBanner.message') }}
          </p>
          <div class="mt-16 flex gap-10">
            <QButton variant="outline" tone="neutral" block @click="decline">
              {{ $t('cookieBanner.decline') }}
            </QButton>
            <QButton variant="solid" tone="primary" block @click="accept">
              {{ $t('cookieBanner.accept') }}
            </QButton>
          </div>
        </div>
      </template>

      <div class="pt-20">
        <TrustStrip />
      </div>
    </PageState>
  </div>
</template>
