<script setup lang="ts">
/**
 * Choix de la langue ← `maquette/pwa/pages/langue-apprentissage.html`.
 *
 * | Bloc | Règles reprises de `app.css` |
 * |---|---|
 * | barre supérieure | `.langue-topbar` `padding-bottom: 30px` |
 * | introduction | `.langue-intro` `padding-bottom: 13px` · h1 20px `-0.65px` `line-height: normal` · p 14px/22,75px, `min-height: 31px` |
 * | grille | `.langue-grid` **deux colonnes** en `flex`, `gap: 10px`, chacune en colonne avec `gap: 10px` |
 * | appel à l'action | `.langue-cta` pleine largeur, `padding: 16px 24px`, fond `#4309fc`, flèche 20×20 |
 * | réassurance | `data-trust-bar` |
 *
 * Écart de **donnée** : la maquette montre huit langues (arabe, mandarin,
 * japonais, coréen…), l'API n'en administre que quatre.
 *
 * **Niveau actuel** (2026-09-13) : sous la grille, le client choisit son
 * niveau. Seuls les niveaux que la langue sélectionnée propose réellement
 * (`availableLevels`) sont affichés ; une langue pas encore déclinée par
 * niveau n'affiche pas le bloc, et le parcours reste celui d'avant. Le niveau
 * voyage dans l'URL (`?niveau=`) jusqu'aux offres, qui en dépendent.
 */
import { courseRepo } from '~/core/repositories'
import { orderByMaquette } from '~/config/language-badges'
import { isLanguageLevel, levelsAmong } from '~/config/language-levels'
import type { LanguageLevelKey } from '~/core/contracts'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data, apiError, isInitialLoading, refresh } = await usePageData(
  'courses',
  () => courseRepo.list(locale.value),
  { watch: [locale] },
)

/**
 * Ordre de la maquette, pas celui de l'API.
 *
 * L'API renvoie Français en premier ; la maquette range Anglais, Allemand,
 * Français, puis Espagnol. La grille étant remplie colonne par colonne, suivre
 * l'API changerait la position de chaque carte.
 */
const courses = computed(() => orderByMaquette(data.value ?? []))
const selected = ref<string | null>(null)

// Pré-sélection de la première langue : le bouton « Continuer » n'est jamais
// inerte au premier affichage.
watchEffect(() => {
  if (!selected.value && courses.value.length > 0) selected.value = courses.value[0]!.slug
})

const selectedCourse = computed(() => courses.value.find((course) => course.slug === selected.value) ?? null)
const levelOptions = computed(() => levelsAmong(selectedCourse.value?.availableLevels ?? []))

/** Niveau revenu dans l'URL (retour depuis les objectifs), sinon le premier proposé. */
const selectedLevel = ref<LanguageLevelKey | null>(isLanguageLevel(route.query.niveau) ? route.query.niveau : null)

watchEffect(() => {
  const available = levelOptions.value.map((level) => level.key)
  if (selectedLevel.value === null || !available.includes(selectedLevel.value)) {
    selectedLevel.value = available[0] ?? null
  }
})

const nextStep = computed(() => {
  if (!selected.value) return localePath('/langues')
  const level = levelOptions.value.length > 0 && selectedLevel.value ? `?niveau=${selectedLevel.value}` : ''
  return localePath(`/langues/${selected.value}/objectifs${level}`)
})

/** La maquette range les cartes en deux colonnes, pas en grille. */
const columns = computed(() => {
  const half = Math.ceil(courses.value.length / 2)
  return [courses.value.slice(0, half), courses.value.slice(half)]
})

usePageSeo(() => ({
  title: t('course.list.seoTitle'),
  description: t('course.list.seoDescription'),
}))
</script>

<template>
  <div>
    <AppTopBar back back-to="/" />

    <div class="w-full pb-13">
      <h1 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
        {{ $t('course.list.title') }}
      </h1>
      <p class="m-0 min-h-31 text-xl leading-[22.75px] text-text">
        {{ $t('course.list.subtitle') }}
      </p>
    </div>

    <PageState
      :loading="isInitialLoading"
      :error="apiError"
      :empty="courses.length === 0"
      :empty-title="$t('course.list.emptyTitle')"
      :empty-description="$t('course.list.emptyDescription')"
      :on-retry="() => refresh()"
    >
      <template #loading>
        <div class="flex w-full items-start justify-center gap-10">
          <div v-for="col in 2" :key="col" class="flex flex-1 flex-col gap-10">
            <QSkeleton v-for="index in 2" :key="index" variant="rect" :height="56" />
          </div>
        </div>
      </template>

      <div class="flex w-full items-start justify-center gap-10" role="listbox" :aria-label="$t('course.list.title')">
        <div v-for="(column, index) in columns" :key="index" class="flex min-w-0 flex-1 flex-col gap-10">
          <LanguageCard
            v-for="course in column"
            :key="course.id"
            :course="course"
            :selected="selected === course.slug"
            @select="selected = $event"
          />
        </div>
      </div>

      <!-- Niveau actuel — seulement si la langue est déclinée par niveau -->
      <!-- Titre et sous-titre : mêmes règles que l'introduction de la page
           (taille, couleur, `pb-13` et hauteur minimale du paragraphe), pour un
           écart identique avant les cartes. -->
      <section v-if="levelOptions.length > 0" class="w-full pt-24" :aria-label="$t('course.level.title')">
        <div class="w-full pb-13">
          <h2 class="m-0 text-4xl leading-normal font-semibold tracking-tight text-text">
            {{ $t('course.level.title') }}
          </h2>
          <p class="m-0 min-h-31 text-xl leading-[22.75px] text-text">
            {{ $t('course.level.subtitle') }}
          </p>
        </div>

        <div role="radiogroup" :aria-label="$t('course.level.title')" class="flex w-full gap-10">
          <LevelCard
            v-for="level in levelOptions"
            :key="level.key"
            :level="level"
            :selected="selectedLevel === level.key"
            @select="selectedLevel = $event"
          />
        </div>
      </section>

      <!-- Continuer -->
      <div class="w-full py-20">
        <NuxtLink
          :to="nextStep"
          class="flex w-full items-center justify-center gap-10 rounded-xl bg-primary-cta px-24 py-16 text-xl leading-[22.5px] font-semibold text-white no-underline"
        >
          <span>{{ $t('course.list.continue') }}</span>
          <QIcon name="ic-lang-arrow" :size="20" />
        </NuxtLink>
      </div>

      <TrustStrip />
    </PageState>
  </div>
</template>
