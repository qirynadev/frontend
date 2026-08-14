<script setup lang="ts">
import type { AnyIconName, Tone } from './types'

/**
 * État **erreur** (et succès / avertissement / information). Absent de la
 * maquette. `role="alert"` en tonalité `danger` : le message est annoncé
 * immédiatement ; `role="status"` sinon, pour ne pas interrompre la lecture.
 */

const props = withDefaults(
  defineProps<{
    tone?: Tone
    title?: string
    /** Le message peut aussi passer par le slot par défaut. */
    message?: string
    dismissible?: boolean
    dismissLabel?: string
    /** Remplace l'icône déduite de la tonalité. */
    icon?: AnyIconName
  }>(),
  {
    tone: 'danger',
    title: undefined,
    message: undefined,
    dismissible: false,
    dismissLabel: undefined,
    icon: undefined,
  },
)

const emit = defineEmits<{ dismiss: [] }>()

const defaultIcon: Record<Tone, AnyIconName> = {
  primary: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
  info: 'info',
  neutral: 'info',
}

const surface: Record<Tone, string> = {
  primary: 'bg-surface-2 text-text',
  success: 'bg-success-bg text-text',
  warning: 'bg-warning-bg text-text',
  danger: 'bg-danger-bg text-text',
  info: 'bg-info-bg text-text',
  neutral: 'bg-surface text-text',
}

const accent: Record<Tone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-neutral',
}

const resolvedIcon = computed(() => props.icon ?? defaultIcon[props.tone])
</script>

<template>
  <div
    :role="tone === 'danger' ? 'alert' : 'status'"
    :aria-live="tone === 'danger' ? 'assertive' : 'polite'"
    :class="['flex w-full items-start gap-12 rounded-xl px-16 py-14', surface[tone]]"
  >
    <QIcon :name="resolvedIcon" :size="20" :class="['mt-1', accent[tone]]" />

    <div class="min-w-0 flex-1">
      <p v-if="title" class="m-0 text-base font-bold">{{ title }}</p>
      <p v-if="message || $slots.default" :class="['m-0 text-sm', title ? 'pt-2' : '']">
        <slot>{{ message }}</slot>
      </p>
      <!-- Un message peut appeler une décision (« rattacher ce compte ? ») :
           les boutons appartiennent alors à l'encart, pas à ce qui l'entoure. -->
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-8 pt-10">
        <slot name="actions" />
      </div>
    </div>

    <QIconButton
      v-if="dismissible"
      icon="close"
      size="sm"
      :label="dismissLabel ?? $t('ds.alert.dismiss')"
      @click="emit('dismiss')"
    />
  </div>
</template>
