<script setup lang="ts">
/**
 * Page d'erreur globale — absente jusqu'ici (relevé par l'audit SEO du 4
 * septembre 2026) : une 404 renvoyait la page par défaut de Nuxt, en
 * anglais, sans charte ni navigation Qiryna.
 *
 * Nuxt rend ce composant **à la place de** `app.vue` (pas dedans) pour toute
 * erreur non rattrapée — 404 (`createError({ statusCode: 404, fatal: true })`,
 * les fiches détail en émettent) comme 500. `props.error` porte le code réel.
 * D'où le `<QIconSprite />` répété ici : celui d'`app.vue` n'est jamais
 * monté sur cette page, `AppTopBar` s'appuie dessus pour son icône de
 * cloche.
 */
import { homeCategories } from '~/config/home-categories'

const props = defineProps<{ error: { statusCode: number, statusMessage?: string } }>()

const { t } = useI18n()
const localePath = useLocalePath()

const is404 = computed(() => props.error.statusCode === 404)
const title = computed(() => (is404.value ? t('errorPage.title404') : t('errorPage.title500')))
const description = computed(() => (is404.value ? t('errorPage.description404') : t('errorPage.description500')))

function backHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-shell flex-col px-gutter">
    <QIconSprite />
    <AppTopBar :gap="30" />

    <div class="flex flex-1 flex-col items-center justify-center gap-24 py-40 text-center">
      <QEmptyState :title="title" :description="description" icon="alert-triangle" tone="danger">
        <template #action>
          <button
            type="button"
            class="rounded-xl bg-primary px-20 py-12 text-sm font-semibold text-white"
            @click="backHome"
          >
            {{ t('errorPage.backHome') }}
          </button>
        </template>
      </QEmptyState>

      <div v-if="is404" class="flex w-full flex-col gap-12">
        <h2 class="m-0 text-lg font-semibold text-text">{{ t('errorPage.exploreTitle') }}</h2>
        <div class="flex w-full items-stretch gap-12 max-3xs:flex-wrap">
          <HomeCategoryCard v-for="category in homeCategories" :key="category.id" :category="category" />
        </div>
      </div>
    </div>
  </div>
</template>
