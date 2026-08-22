<script setup lang="ts">
/**
 * Objectif d'apprentissage ← `maquette/pwa/pages/objectifs.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `.objectifs-topbar` `padding-bottom: 30px` |
 * | introduction | h1 20px `-0.65px` `line-height: normal` · p 14px/22,75px |
 * | liste | `.objectifs-list` `gap: 12px`, `max-width: 366px`, centrée, `padding-top: 20px` |
 * | carte | `padding: 17px`, `gap: 12px`, bord `#f3f3f7`, rayon 10 — sélectionnée `#440af6` |
 * | pastille | 48×48 ronde, teinte propre à l'objectif, icône 20×20 |
 * | titre | 14px / 20,625px, `font-weight: 600` · étiquette 11px / 16,5px `font-weight: 700` |
 * | description | 12,5px / 17,188px |
 * | bouton radio | 18×18, bord `#cbd5e1` — coché `#4f18f6`, coche 11×11 |
 * | encart d'aide | hauteur fixe 86px, fond `#f5f3ff`, pastille `#e8e2fd` |
 * | appel à l'action | pleine largeur, `padding: 16px 24px`, fond `#4309fc` |
 * | sous 400px | liste pleine largeur · carte `padding: 14px 12px`, `gap: 10px`, alignée en haut · pastille 42×42, icône 18×18 · titre 13px/18px · description 12px/16px · aide `min-height: 86px`, `padding: 12px 9px`, enroulable |
 *
 * Les six objectifs sont **éditoriaux** : aucun endpoint ne les décrit. Ils
 * viennent de `config/language-goals.ts`.
 *
 * L'objectif choisi voyage dans l'URL de l'étape suivante : le tunnel reste
 * partageable et rechargeable, ce que la maquette perd.
 */
import { courseRepo } from '~/core/repositories'
import { languageGoals } from '~/config/language-goals'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => String(route.params.slug ?? ''))

const { data: course, apiError, isInitialLoading, refresh } = await usePageData(
  `course-${slug.value}`,
  () => courseRepo.bySlug(slug.value, locale.value),
  { watch: [slug, locale] },
)

if (course.value === null && !apiError.value) {
  throw createError({ statusCode: 404, statusMessage: t('course.notFound'), fatal: true })
}

/** Le premier objectif est présélectionné, comme dans la maquette. */
const selected = ref(languageGoals[0]!.id)

usePageSeo(() => ({
  title: t('goal.seoTitle', { language: course.value?.name ?? '' }),
  description: t('goal.seoDescription'),
  // Étape intermédiaire d'un tunnel : sans intérêt dans un index.
  noindex: true,
}))
</script>

<template>
  <div>
    <AppTopBar back back-to="/langues" />

    <PageState :loading="isInitialLoading" :error="apiError" :on-retry="() => refresh()">
      <template #loading>
        <div class="flex flex-col gap-12">
          <QSkeleton variant="text" :lines="2" />
          <QSkeleton v-for="index in 4" :key="index" variant="rect" :height="82" />
        </div>
      </template>

      <div class="w-full">
        <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
          {{ $t('goal.title') }}
        </h1>
        <p class="m-0 text-xl leading-[22.75px] whitespace-pre-line text-text">
          {{ $t('goal.subtitle') }}
        </p>
      </div>

      <div
        class="mx-auto flex w-full max-w-366 flex-col gap-12 pt-20 max-xs:max-w-none"
        role="listbox"
        :aria-label="$t('goal.title')"
      >
        <button
          v-for="goal in languageGoals"
          :key="goal.id"
          type="button"
          role="option"
          :aria-selected="selected === goal.id"
          :class="[
            'flex w-full cursor-pointer items-center gap-12 rounded-xl border bg-white p-17 text-left',
            'max-xs:items-start max-xs:gap-10 max-xs:px-12 max-xs:py-14',
            selected === goal.id ? 'border-goal-selected' : 'border-goal-border',
          ]"
          @click="selected = goal.id"
        >
          <span class="flex min-w-0 flex-1 items-center gap-14 max-xs:gap-10">
            <span :class="['flex size-48 shrink-0 items-center justify-center rounded-full max-xs:size-42', goal.tint]">
              <!-- 20×20, ramené à 18×18 sous 400px. -->
              <QIcon :name="goal.icon" :size="20" class="max-xs:size-18" />
            </span>

            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="flex flex-wrap items-center gap-5">
                <span class="text-xl leading-[20.625px] font-semibold text-navy-2 max-xs:text-lg max-xs:leading-18">{{ $t(goal.labelKey) }}</span>
                <span
                  v-if="goal.badgeKey"
                  class="inline-flex rounded-md bg-primary-bg px-8 py-2 text-md leading-[16.5px] font-bold whitespace-nowrap text-goal-check"
                >{{ $t(goal.badgeKey) }}</span>
              </span>
              <!-- 12,5px : valeur de la maquette, sans équivalent dans l'échelle. -->
              <span class="pt-2 pr-8 text-[12.5px] leading-[17.188px] text-black max-xs:pr-0 max-xs:text-base max-xs:leading-16">
                {{ $t(goal.descriptionKey) }}
              </span>
            </span>
          </span>

          <span
            aria-hidden="true"
            :class="[
              'flex size-18 shrink-0 items-center justify-center rounded-full',
              'max-xs:mt-2',
              selected === goal.id
                ? 'border-2 border-goal-check bg-goal-check p-2'
                : 'border border-goal-radio bg-white',
            ]"
          >
            <QIcon v-if="selected === goal.id" name="ic-lang-check" :size="11" />
          </span>
        </button>
      </div>

      <!-- Commencer -->
      <div class="w-full py-20">
        <NuxtLink
          :to="localePath(`/offres/${slug}?objectif=${selected}`)"
          class="mt-8 flex w-full items-center justify-center gap-10 rounded-xl bg-primary-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white no-underline"
        >
          <span>{{ $t('goal.cta') }}</span>
          <QIcon name="ic-obj-check" :size="20" />
        </NuxtLink>
      </div>

      <TrustStrip />
    </PageState>
  </div>
</template>
