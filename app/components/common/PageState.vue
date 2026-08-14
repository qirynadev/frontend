<script setup lang="ts">
import type { ApiError } from '~/core/http/errors'

/**
 * Aiguillage des quatre états d'une vue.
 *
 * La maquette ne montre que le nominal ; les trois autres sont traités ici,
 * une fois, pour que chaque page les obtienne sans les réécrire.
 *
 * ```vue
 * <PageState :loading="isInitialLoading" :error="apiError" :empty="items.length === 0">
 *   <template #loading><QSkeleton variant="card" /></template>
 *   <template #empty>…</template>
 *   …nominal…
 * </PageState>
 * ```
 */
const props = withDefaults(
  defineProps<{
    loading: boolean
    error?: ApiError | null
    empty?: boolean
    /** Titre de l'état vide. Le slot `empty` l'emporte s'il est fourni. */
    emptyTitle?: string
    emptyDescription?: string
    /** Relance le chargement. Sans elle, l'état d'erreur n'offre pas de bouton. */
    onRetry?: () => void
  }>(),
  { error: null, empty: false, emptyTitle: undefined, emptyDescription: undefined, onRetry: undefined },
)

const { t } = useI18n()

/**
 * Message d'erreur destiné à l'utilisateur.
 *
 * On n'affiche jamais le message brut de l'API : il est technique, souvent en
 * anglais, et parfois révélateur. On traduit la nature de la panne.
 */
const message = computed(() => {
  switch (props.error?.kind) {
    case 'network':
    case 'timeout':
      return t('state.error.network')
    case 'forbidden':
      return t('state.error.forbidden')
    case 'notFound':
      return t('state.error.notFound')
    default:
      return t('state.error.server')
  }
})
</script>

<template>
  <div v-if="loading" aria-busy="true">
    <slot name="loading">
      <div class="flex flex-col gap-16 py-16">
        <QSkeleton variant="row" />
        <QSkeleton variant="row" />
        <QSkeleton variant="row" />
      </div>
    </slot>
  </div>

  <div v-else-if="error" class="py-16">
    <slot name="error">
      <QAlert :tone="error.kind === 'notFound' ? 'warning' : 'danger'" :title="$t('state.error.title')" :message="message" />
      <div v-if="onRetry" class="pt-16">
        <QButton variant="outline" icon-start="arrow-right" @click="onRetry">{{ $t('state.error.retry') }}</QButton>
      </div>
    </slot>
  </div>

  <div v-else-if="empty">
    <slot name="empty">
      <QEmptyState
        :title="emptyTitle ?? $t('state.empty.title')"
        :description="emptyDescription ?? $t('state.empty.description')"
      />
    </slot>
  </div>

  <slot v-else />
</template>
